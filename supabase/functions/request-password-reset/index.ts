
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Generate a random password
function generateTemporaryPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabaseClient.auth.admin
      .getUserByEmail(email);
      
    if (userError || !user) {
      // Don't reveal if the user exists or not for security reasons
      return new Response(
        JSON.stringify({
          success: true,
          message: "If the email exists, a password reset email will be sent",
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200,
        }
      );
    }
    
    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword();
    
    // Update the user's password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      { password: temporaryPassword }
    );
    
    if (updateError) throw updateError;
    
    // Set password_changed to false in approved_users
    const { error: dbError } = await supabaseClient
      .from('approved_users')
      .update({ password_changed: false })
      .eq('id', user.id);
      
    if (dbError) throw dbError;
    
    // Send email with temporary password (mock for now)
    console.log(`Email would be sent to ${email} with temporary password: ${temporaryPassword}`);
    
    // TODO: Implement actual email sending
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "If the email exists, a password reset email will be sent",
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in request-password-reset function:", error);
    
    // For security reasons, don't reveal specific errors
    return new Response(
      JSON.stringify({
        success: true,
        message: "If the email exists, a password reset email will be sent",
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );
  }
});
