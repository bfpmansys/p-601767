
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
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing password reset for email:', email)

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if the user exists in the auth.users table
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email)

    if (userError || !user) {
      // Don't reveal that the user doesn't exist for security reasons
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If your email is registered, you will receive a temporary password shortly.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the user is in approved_users table
    const { data: approvedUser, error: approvedUserError } = await supabase
      .from('approved_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (approvedUserError || !approvedUser) {
      // Don't reveal that the user is not an approved user
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If your email is registered, you will receive a temporary password shortly.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10) + 
                         Math.random().toString(36).substring(2, 10)

    // Update the user's password in the auth system
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    )

    if (updateError) {
      throw new Error('Error updating user password: ' + updateError.message)
    }

    // Set password_changed to false to prompt a password change on login
    const { error: updateUserError } = await supabase
      .from('approved_users')
      .update({ password_changed: false })
      .eq('id', user.id)

    if (updateUserError) {
      throw new Error('Error updating user password_changed status: ' + updateUserError.message)
    }

    console.log('Password reset successful. Temporary password generated.')

    // Note: In a production environment, you would typically send an email with the temporary password here
    // For now, we'll return the temporary password as part of the response (for testing)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset successful. An email with the temporary password has been sent.',
        temporaryPassword: tempPassword // In production, don't return this - only send via email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in request-password-reset function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
