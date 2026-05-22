import type { APIRoute } from 'astro';

export const prerender = false;

interface MailchimpSubscriber {
  email_address: string;
  status: 'subscribed' | 'pending' | 'unsubscribed';
  merge_fields?: {
    FNAME?: string;
    LNAME?: string;
  };
}

interface MailchimpResponse {
  success: boolean;
  data?: any;
  errors?: string[];
}

async function subscribeToNewsletter(subscriberData: MailchimpSubscriber): Promise<MailchimpResponse> {
  const MAILCHIMP_API_KEY = import.meta.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_AUDIENCE_ID = import.meta.env.MAILCHIMP_AUDIENCE_ID;
  const MAILCHIMP_DC = MAILCHIMP_API_KEY?.split('-')[1]; // Extract data center from API key

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    console.error('Mailchimp API key or Audience ID not configured');
    return {
      success: false,
      errors: ['Server configuration error: Mailchimp credentials not configured']
    };
  }

  if (!MAILCHIMP_DC) {
    console.error('Invalid Mailchimp API key format');
    return {
      success: false,
      errors: ['Server configuration error: Invalid Mailchimp API key']
    };
  }

  const fullUrl = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;
  console.log('Attempting Mailchimp subscription to:', fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
      },
      body: JSON.stringify(subscriberData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mailchimp API error: ${response.status} - ${errorText}`);

      // Parse Mailchimp error response for better error messages
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
    console.log('Mailchimp subscription successful:', result);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Mailchimp subscription error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

// async function getMailPoetLists(): Promise<any[]> {
//   const API_URL = import.meta.env.PUBLIC_API_URL;

//   try {
//     const response = await fetch(`${API_URL}/wp-json/mailpoet/v3/lists`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('MailPoet lists error:', error);
//     return [];
//   }
// }

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, firstname, lists } = body;

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
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstname || '',
        LNAME: '' // You can add last_name field if needed
      }
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
