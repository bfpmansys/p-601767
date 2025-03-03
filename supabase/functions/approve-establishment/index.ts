
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

    // 3. Generate a random temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10) + 
                        Math.random().toString(36).substring(2, 10)

    // 4. Create a new user in Supabase Auth
    const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: pendingUser.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (createUserError || !authUser.user) {
      throw new Error('Error creating user in Auth: ' + (createUserError?.message || ''))
    }

    console.log('Created auth user:', authUser.user.id)

    // 5. Add the user to the approved_users table
    const { error: approvedUserError } = await supabase
      .from('approved_users')
      .insert({
        id: authUser.user.id,
        first_name: pendingUser.first_name,
        middle_name: pendingUser.middle_name,
        last_name: pendingUser.last_name,
        password_changed: false
      })

    if (approvedUserError) {
      throw new Error('Error creating approved user: ' + approvedUserError.message)
    }

    // 6. Add the user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'establishment'
      })

    if (roleError) {
      throw new Error('Error adding user role: ' + roleError.message)
    }

    // 7. Add businesses to approved_businesses
    const approvedBusinesses = pendingBusinesses.map(business => ({
      user_id: authUser.user.id,
      business_name: business.business_name,
      dti_certificate_no: business.dti_certificate_no
    }))

    const { error: approvedBusinessesError } = await supabase
      .from('approved_businesses')
      .insert(approvedBusinesses)

    if (approvedBusinessesError) {
      throw new Error('Error creating approved businesses: ' + approvedBusinessesError.message)
    }

    // 8. Update pending_user status to approved
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({ status: 'approved' })
      .eq('id', userId)

    if (updateError) {
      throw new Error('Error updating pending user status: ' + updateError.message)
    }

    console.log('User approval process completed successfully')

    // Note: In a production environment, you would typically send an email with the temporary password here
    // For now, we'll return the temporary password as part of the response (for testing)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved successfully',
        user: {
          id: authUser.user.id,
          email: pendingUser.email,
          temporaryPassword: tempPassword // In production, don't return this - only send via email
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
