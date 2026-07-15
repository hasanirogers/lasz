import type { APIRoute } from "astro";
import 'dotenv/config';
import { supabase } from "../../../shared/database";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { accessToken, refreshToken } = body;

  if (!supabase) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });


    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message, error }),
        { status: error.status || 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OK', data }),
      { status: 200 }
    );
  } catch(error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
      { status: 500 })
  }
}
