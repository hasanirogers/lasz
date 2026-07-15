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
    const userId = params.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError ) {
      console.log({ errors: { profileError } });
      return new Response(
        JSON.stringify({ success: false, message: "Failed to get profile.", error: profileError }),
        { status: 500 }
      );
    }

    const { data: books, error: booksError } = await supabase
      .from('Books')
      .select('*')
      .in('id', profile.book_ids);

    if (booksError ) {
      console.log({ errors: { booksError } });
      return new Response(
        JSON.stringify({ success: false, message: "Failed to get profile.", error: booksError }),
        { status: 500 }
      );
    }

    const { data: quotes, error: quotesError, count: quotesCount } = await supabase
      .from('Quotes')
      .select('*', { count: 'exact'})
      .eq('user_id', userId);

    if (quotesError ) {
      console.log({ errors: { quotesError } });
      return new Response(
        JSON.stringify({ success: false, message: "Failed to get profile.", error: quotesError }),
      { status: 500 }
      );
    }

    const { data: followers, error: followersError } = await supabase
      .from('profiles')
      .select('*')
      .filter('following', 'cs', parseInt(userId as string));

    if (followersError ) {
      console.log({ errors: { followersError } });
      return new Response(
        JSON.stringify({ success: false, message: "Failed to get profile.", error: followersError }),
      { status: 500 }
      );
    }

    const followerCount = followers?.length ?? 0;

    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(profile.avatar);

    const data = {
      ...profile,
      books,
      counts: { quotes: quotesCount, followers: followerCount, following: profile.following?.length || 0 },
      avatar: profile.avatar ? publicUrl : null
    };

    return new Response(
      JSON.stringify(data),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
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

    delete body.filepond;

    const { error } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', userId)

    if (error) {
      console.log(error);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to update profile.", error }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Profile updated successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred."}),
      { status: 500 })
  }
}
