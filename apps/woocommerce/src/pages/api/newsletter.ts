import type { APIRoute } from 'astro';

export const prerender = false;

interface Subscriber {
  email: string;
  firstname: string;
  lastname?: string;
  groups?: string[];
  phone?: string;
  trigger_automation?: boolean;
}

interface Response {
  success: boolean;
  data?: any;
  errors?: string[];
  message?: string;
}

async function subscribeToNewsletter(subscriberData: Subscriber): Promise<Response> {
  const SENDER_API_KEY = import.meta.env.SENDER_API_KEY;

  if (!SENDER_API_KEY) {
    console.error('API key not configured');
    return {
      success: false,
      errors: ['Server configuration error: Credentials not configured']
    };
  }

  const url = `https://api.sender.net/v2/subscribers`;
  console.log('Attempting subscription to:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDER_API_KEY}`,
      },
      body: JSON.stringify(subscriberData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);

      // Parse error response for better error messages
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map((e: any) => e.message || e.error).join(', ');
        }
      } catch {
        errorMessage = `HTTP error! status: ${response.status} - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Subscription successful:', result);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}


export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, firstname } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, errors: ['Email is required'] }),
        { status: 400 }
      );
    }

    if (!firstname) {
      return new Response(
        JSON.stringify({ success: false, errors: ['First name is required'] }),
        { status: 400 }
      );
    }

    const result = await subscribeToNewsletter({
      email: email,
      firstname: firstname,
      trigger_automation: false
    });

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }),
      { status: 500 }
    );
  }
};
