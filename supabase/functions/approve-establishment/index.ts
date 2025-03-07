
// Follow this setup guide to integrate the Deno runtime and toolkit with your project:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Starting approval process for userId:', userId)

    // 1. Get the pending user data
    const { data: pendingUser, error: pendingUserError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (pendingUserError) {
      console.error('Pending user fetch error:', pendingUserError)
      return new Response(
        JSON.stringify({ error: 'Error fetching pending user: ' + pendingUserError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!pendingUser) {
      return new Response(
        JSON.stringify({ error: 'Pending user not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 2. Get business details for the pending user
    const { data: pendingBusinesses, error: pendingBusinessesError } = await supabase
      .from('pending_businesses')
      .select('*')
      .eq('pending_user_id', userId)

    if (pendingBusinessesError) {
      console.error('Error retrieving pending businesses:', pendingBusinessesError)
      return new Response(
        JSON.stringify({ error: 'Error retrieving pending businesses: ' + pendingBusinessesError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Approving user:', pendingUser.email)

    // Check if user's password is available
    if (!pendingUser.password) {
      console.error('User password not found in pending registration')
      return new Response(
        JSON.stringify({ error: 'User password not found in pending registration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 3. Check if user already exists in auth
    const { data: existingUsers, error: existingUsersError } = await supabase.auth.admin.listUsers({
      filter: {
        email: pendingUser.email
      }
    })

    if (existingUsersError) {
      console.error('Error checking existing users:', existingUsersError)
      return new Response(
        JSON.stringify({ error: 'Error checking existing users: ' + existingUsersError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    let authUser;

    // If user exists, we'll use the existing user
    if (existingUsers?.users && existingUsers.users.length > 0) {
      console.log('User already exists in auth, using existing user')
      authUser = existingUsers.users[0]
    } else {
      // If user doesn't exist, create them
      console.log('Creating new auth user')
      try {
        const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
          email: pendingUser.email,
          password: pendingUser.password,
          email_confirm: true,
        })

        if (createUserError) {
          console.error('Error creating user in Auth:', createUserError)
          return new Response(
            JSON.stringify({ error: 'Error creating user in Auth: ' + createUserError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        if (!newUser || !newUser.user) {
          console.error('New user creation failed, no user returned')
          return new Response(
            JSON.stringify({ error: 'New user creation failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        authUser = newUser.user
        console.log('Created new auth user:', authUser.id)
      } catch (createError) {
        console.error('Exception during user creation:', createError)
        return new Response(
          JSON.stringify({ error: 'Exception during user creation: ' + String(createError) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    if (!authUser) {
      console.error('Auth user is undefined after creation/lookup')
      return new Response(
        JSON.stringify({ error: 'Auth user is undefined after creation/lookup' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Auth user id:', authUser.id)

    // 4. Add the user to the approved_users table - check first if they already exist
    const { data: existingApprovedUser } = await supabase
      .from('approved_users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (existingApprovedUser) {
      console.log('User already exists in approved_users, skipping insert')
    } else {
      // Insert into approved_users
      const { error: approvedUserError } = await supabase
        .from('approved_users')
        .insert({
          id: authUser.id,
          first_name: pendingUser.first_name,
          middle_name: pendingUser.middle_name,
          last_name: pendingUser.last_name,
          status: 'active',
          password_changed: true,
        })

      if (approvedUserError) {
        console.error('Error creating approved user:', approvedUserError)
        return new Response(
          JSON.stringify({ error: 'Error creating approved user: ' + approvedUserError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log('Added user to approved_users table:', authUser.id)
    }

    // 5. Check if user role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('role', 'establishment')
      .single()

    if (existingRole) {
      console.log('User role already exists, skipping insert')
    } else {
      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.id,
          role: 'establishment'
        })

      if (roleError) {
        console.error('Error adding user role:', roleError)
        return new Response(
          JSON.stringify({ error: 'Error adding user role: ' + roleError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log('Added establishment role for user:', authUser.id)
    }

    // 6. Add businesses
    for (const business of pendingBusinesses || []) {
      // Check if business already exists
      const { data: existingBusiness } = await supabase
        .from('approved_businesses')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('business_name', business.business_name)
        .single()

      if (existingBusiness) {
        console.log('Business already exists, skipping:', business.business_name)
        continue
      }

      const { error: businessError } = await supabase
        .from('approved_businesses')
        .insert({
          user_id: authUser.id,
          business_name: business.business_name,
          dti_certificate_no: business.dti_certificate_no,
          registration_status: 'unregistered'
        })

      if (businessError) {
        console.error('Error creating approved business:', businessError)
        return new Response(
          JSON.stringify({ error: 'Error creating approved business: ' + businessError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      
      console.log('Added business for user:', authUser.id, business.business_name)
    }

    // 7. Update pending_user status
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({ status: 'approved' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating pending user status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error updating pending user status: ' + updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Successfully completed approval process')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved successfully',
        user: {
          id: authUser.id,
          email: pendingUser.email
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unhandled error in approve-establishment function:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
