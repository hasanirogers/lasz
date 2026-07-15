import type { APIRoute } from "astro";
import 'dotenv/config';
import { supabase, supabaseAdmin } from "../../../shared/database";

export const prerender = false;

export const GET: APIRoute = async () => {
  if (!supabase) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, message: "You are not logged in." }),
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('uuid', session.user.id)
      .single();

    if (profile) {
      const data = { ...profile };
      return new Response(
        JSON.stringify(data),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Failed to get profile.", errors: { profileError } }),
      { status: 400 }
    );
  } catch(error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
      { status: 500 })
  }
}

export const DELETE: APIRoute = async () => {
  if (!supabase || !supabaseAdmin) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (!session) {
      console.log(sessionError);
      return new Response(
        JSON.stringify({ success: false, message: "You are not logged in.", error: sessionError }),
        { status: 401 }
      )
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(session.user.id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ success: false, message: deleteError.message, error: deleteError }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      { status: 200 }
    );
  } catch(error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
      { status: 500 })
  }
}
