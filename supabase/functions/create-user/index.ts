import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Configuration CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  // ✅ Répond aux requêtes OPTIONS (pré-vol)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nom, password, role } = await req.json();

    if (!nom || !password || !role) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fakeEmail = `${nom.replace(/\s+/g, "").toLowerCase()}@app.local`;

    const { data, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true,
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const userId = data.user?.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      nom,
      role,
    });

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
