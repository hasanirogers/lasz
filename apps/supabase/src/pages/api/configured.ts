import type { APIRoute } from "astro";
import 'dotenv/config';
import { supabase } from "../../shared/database";

export const prerender = false;

export const GET: APIRoute = async () => {
  if (supabase) {
    return new Response(
      JSON.stringify(true),
      { status: 200 }
    );
  }

  return new Response(
    JSON.stringify(false),
    { status: 200 }
  );
}
