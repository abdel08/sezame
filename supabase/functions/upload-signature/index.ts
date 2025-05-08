import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { file, path } = await req.json();

  if (!file || !path) {
    return new Response(JSON.stringify({ error: 'file and path are required' }), { status: 400 });
  }

  const buffer = Uint8Array.from(atob(file.split(',')[1]), c => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, buffer, {
      upsert: true,
      contentType: 'image/png'
    });

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
