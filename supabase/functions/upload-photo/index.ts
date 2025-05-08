import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  const { fileName, fileContentBase64, path } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const buffer = new Uint8Array(atob(fileContentBase64).split("").map(c => c.charCodeAt(0)));

  const { error } = await supabase.storage
    .from("photos")
    .upload(`${path}/${fileName}`, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 400 });
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(`${path}/${fileName}`);

  return new Response(JSON.stringify({ url: data.publicUrl }), { status: 200 });
});
