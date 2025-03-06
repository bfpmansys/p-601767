
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

  // Get the request body
  const { userId } = await req.json()

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get the pending user data
    const { data: pendingUser, error: pendingUserError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (pendingUserError || !pendingUser) {
      throw new Error('Pending user not found: ' + (pendingUserError?.message || ''))
    }

    // 2. Get business details for the pending user
    const { data: pendingBusinesses, error: pendingBusinessesError } = await supabase
      .from('pending_businesses')
      .select('*')
      .eq('pending_user_id', userId)

    if (pendingBusinessesError) {
      throw new Error('Error retrieving pending businesses: ' + pendingBusinessesError.message)
    }

    console.log('Approving user:', pendingUser.email)

    // Check if user's password is available
    if (!pendingUser.password) {
      throw new Error('User password not found in pending registration')
    }

    // 3. Check if user already exists in auth
    const { data: existingUsers, error: existingUsersError } = await supabase.auth.admin.listUsers({
      filter: {
        email: pendingUser.email
      }
    })

    if (existingUsersError) {
      throw new Error('Error checking existing users: ' + existingUsersError.message)
    }

    let authUser;

    // If user exists, we'll use the existing user
    if (existingUsers?.users && existingUsers.users.length > 0) {
      console.log('User already exists in auth, using existing user')
      authUser = existingUsers.users[0]
    } else {
      // 4. Create a new user in Supabase Auth with the provided password
      const { data, error: createUserError } = await supabase.auth.admin.createUser({
        email: pendingUser.email,
        password: pendingUser.password,
        email_confirm: true,
      })

      if (createUserError || !data.user) {
        throw new Error('Error creating user in Auth: ' + (createUserError?.message || ''))
      }

      authUser = data.user
      console.log('Created auth user:', authUser.id)
    }

    // 5. Check if user already exists in approved_users
    const { data: existingApprovedUser, error: existingApprovedUserError } = await supabase
      .from('approved_users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existingApprovedUserError && existingApprovedUserError.code !== 'PGRST116') {
      throw new Error('Error checking existing approved user: ' + existingApprovedUserError.message)
    }

    // Only insert if not already exists
    if (!existingApprovedUser) {
      // 6. Add the user to the approved_users table
      const { error: approvedUserError } = await supabase
        .from('approved_users')
        .insert({
          id: authUser.id,
          first_name: pendingUser.first_name,
          middle_name: pendingUser.middle_name,
          last_name: pendingUser.last_name,
          password_changed: true // Set to true since we're using their provided password
        })

      if (approvedUserError) {
        // If error is about duplicate key, we can ignore it
        if (!approvedUserError.message.includes('duplicate key')) {
          throw new Error('Error creating approved user: ' + approvedUserError.message)
        }
      }
      
      console.log('Added user to approved_users table:', authUser.id)
    } else {
      console.log('User already exists in approved_users table:', authUser.id)
    }

    // 7. Check if user role already exists
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('role', 'establishment')
      .maybeSingle()

    if (existingRoleError && existingRoleError.code !== 'PGRST116') {
      throw new Error('Error checking existing role: ' + existingRoleError.message)
    }

    // Only insert role if not already exists
    if (!existingRole) {
      // 8. Add the user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.id,
          role: 'establishment'
        })

      if (roleError) {
        // If error is about duplicate key, we can ignore it
        if (!roleError.message.includes('duplicate key')) {
          throw new Error('Error adding user role: ' + roleError.message)
        }
      }
      
      console.log('Added establishment role for user:', authUser.id)
    } else {
      console.log('User already has establishment role:', authUser.id)
    }

    // 9. Check for each business if it already exists
    for (const business of pendingBusinesses) {
      const { data: existingBusiness, error: existingBusinessError } = await supabase
        .from('approved_businesses')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('business_name', business.business_name)
        .eq('dti_certificate_no', business.dti_certificate_no)
        .maybeSingle()

      if (existingBusinessError && existingBusinessError.code !== 'PGRST116') {
        throw new Error('Error checking existing business: ' + existingBusinessError.message)
      }

      // Only insert if business doesn't already exist
      if (!existingBusiness) {
        const { error: approvedBusinessError } = await supabase
          .from('approved_businesses')
          .insert({
            user_id: authUser.id,
            business_name: business.business_name,
            dti_certificate_no: business.dti_certificate_no
          })

        if (approvedBusinessError) {
          // If error is about duplicate key, we can ignore it
          if (!approvedBusinessError.message.includes('duplicate key')) {
            throw new Error('Error creating approved business: ' + approvedBusinessError.message)
          }
        }
        
        console.log('Added business for user:', authUser.id, business.business_name)
      } else {
        console.log('Business already exists for user:', authUser.id, business.business_name)
      }
    }

    // 10. Update pending_user status to approved
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({ status: 'approved' })
      .eq('id', userId)

    if (updateError) {
      throw new Error('Error updating pending user status: ' + updateError.message)
    }

    console.log('User approval process completed successfully')

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
    console.error('Error in approve-establishment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
