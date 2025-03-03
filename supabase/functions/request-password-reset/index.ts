
// Follow this setup guide to integrate the Deno runtime and toolkit with your project:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, linting, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from 'npm:resend@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

const resend = new Resend(resendApiKey);

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

    // Check if the user is in approved_users table and update password_changed flag if needed
    const { data: approvedUser, error: approvedUserError } = await supabase
      .from('approved_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!approvedUserError && approvedUser) {
      // Set password_changed to false to prompt a password change on login
      const { error: updateUserError } = await supabase
        .from('approved_users')
        .update({ password_changed: false })
        .eq('id', user.id)

      if (updateUserError) {
        console.error('Error updating user password_changed status:', updateUserError.message)
        // We'll continue anyway, as the password has been reset
      }
    }

    console.log('Password reset successful. Sending email with temporary password.')

    // Send email with temporary password using Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'Password Reset <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Temporary Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #F00; text-align: center;">PASSWORD RESET</h1>
            <p>Your password has been reset as requested. Please use the following temporary password to log in:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 18px; letter-spacing: 1px;">
              ${tempPassword}
            </div>
            <p>For security reasons, you will be required to change your password after logging in.</p>
            <p>If you didn't request a password reset, please contact support immediately.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="http://localhost:8080/establishment-login" style="background-color: #F00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                GO TO LOGIN
              </a>
            </div>
          </div>
        `,
      });
      
      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Still return success even if email fails, for security reasons
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset successful. An email with the temporary password has been sent.'
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
