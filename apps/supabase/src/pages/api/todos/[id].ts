import type { APIRoute } from "astro";
import 'dotenv/config';
import { supabase } from "../../../shared/database";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!supabase) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const userId = Number(params.id);
    const { data, error } = await supabase
      .from('todos')
      .select('data')
      .eq('id', userId)
      .single();

    if (error) {
      console.log(error);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to get todos.", error }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred."}),
      { status: 500 })
  }
}

export const PUT: APIRoute = async ({ params, request }) => {
  if (!supabase) {
    return new Response(
      JSON.stringify({ success: false, message: "Supabase is not configured." }),
      { status: 500 }
    );
  }

  try {
    const userId = Number(params.id);
    const body = await request.json();

    const { data, error } = await supabase
      .from('todos')
      .upsert({
        id: userId,
        data: body
      }, { onConflict: 'id' })
      .select();

    if (error) {
      console.log(error);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to update todos.", error }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Todos updated successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred."}),
      { status: 500 })
  }
}

