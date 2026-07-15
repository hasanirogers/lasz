import type { APIRoute } from "astro";
import 'dotenv/config';
import { supabase } from "../../../shared/database";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const origin = url.origin;
  const data = await request.json();
  const { identifier } = data;

  if (!supabase) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: identifier,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/callbacks/email`,
      }
    });

    if (error) {
      console.log(error);
      return new Response(
        JSON.stringify({ success: false, message: error.message, error }),
        { status: error.status || 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Success!', user: data.user, session: data.session }),
      { status: 200 }
    );
  } catch(error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
      { status: 500 })
  }
}
