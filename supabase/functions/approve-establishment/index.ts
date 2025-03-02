
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { generate } from "https://deno.land/std@0.167.0/uuid/mod.ts";

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
    
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("Missing userId in request body");
    }
    
    // Get the pending user data
    const { data: pendingUser, error: fetchError } = await supabaseClient
      .from('pending_users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!pendingUser) {
      throw new Error("Pending user not found");
    }
    
    // Get the associated businesses
    const { data: pendingBusinesses, error: businessError } = await supabaseClient
      .from('pending_businesses')
      .select('*')
      .eq('pending_user_id', userId);
      
    if (businessError) throw businessError;
    
    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword();
    
    // Create the user in Supabase Auth
    const { data: authUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email: pendingUser.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: pendingUser.first_name,
        middle_name: pendingUser.middle_name,
        last_name: pendingUser.last_name,
      }
    });
    
    if (createError) throw createError;
    
    // Add user to approved_users table
    const { error: approvedUserError } = await supabaseClient
      .from('approved_users')
      .insert({
        id: authUser.user.id,
        first_name: pendingUser.first_name,
        middle_name: pendingUser.middle_name,
        last_name: pendingUser.last_name,
        password_changed: false,
      });
      
    if (approvedUserError) throw approvedUserError;
    
    // Add user role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'establishment',
      });
      
    if (roleError) throw roleError;
    
    // Add approved businesses
    if (pendingBusinesses && pendingBusinesses.length > 0) {
      const approvedBusinesses = pendingBusinesses.map(business => ({
        user_id: authUser.user.id,
        business_name: business.business_name,
        dti_certificate_no: business.dti_certificate_no,
      }));
      
      const { error: approvedBusinessError } = await supabaseClient
        .from('approved_businesses')
        .insert(approvedBusinesses);
        
      if (approvedBusinessError) throw approvedBusinessError;
    }
    
    // Update pending user status
    const { error: updateError } = await supabaseClient
      .from('pending_users')
      .update({ status: 'approved' })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Send email with credentials (mock for now, would use an email service)
    console.log(`Email would be sent to ${pendingUser.email} with password: ${temporaryPassword}`);
    
    // Ideally, send an actual email here with the temporary password
    // TODO: Implement email sending logic when email service is set up
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "User approved successfully",
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in approve-establishment function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400,
      }
    );
  }
});
