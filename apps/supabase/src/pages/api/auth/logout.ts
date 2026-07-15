import type { APIRoute } from "astro";
import 'dotenv/config';
import { supabase } from "../../../shared/database";

export const prerender = false;

export const GET: APIRoute = async () => {
  if (!supabase) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message, error }),
        { status: error.status || 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Success!' }),
      { status: 200 }
    );
  } catch(error) {
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
      { status: 500 })
  }
}
