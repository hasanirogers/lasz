import { defineAction } from 'astro:actions';
import { z } from 'zod';

console.log("🚀 ACTIONS FILE LOADED BY SERVER");

export const server = {
  sendContactForm: defineAction({
    input: z.object({
      name: z.string(),
      email: z.string().email(),
      message: z.string(),
      fax_number: z.string().optional(), // Honeypot field
    }),
    handler: async (input) => {
      try {
        const domain = import.meta.env.PUBLIC_SHOPIFY_DOMAIN;
        const accessToken = import.meta.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

        const response = await fetch(`https://${domain}/admin/api/2026-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify({
            query: `
              mutation CreateContactMessage($handle: String!, $fields: [MetaobjectFieldInput!]!) {
                metaobjectCreate(metaobject: { type: "contact_message", handle: $handle, fields: $fields }) {
                  metaobject { id }
                  userErrors { field message code }
                }
              }
            `,
            variables: {
              handle: `msg-${Date.now()}`,
              fields: [
                { key: "name", value: input.name },
                { key: "email", value: input.email },
                { key: "message", value: input.message }
              ]
            },
          }),
        });

        const result = await response.json();

        // 🛑 DEBUG: Log the actual Shopify response to the terminal
        console.log("Shopify RAW response:", JSON.stringify(result, null, 2));

        if (result.errors) {
          return { success: false, error: result.errors[0].message };
        }

        const userErrors = result.data?.metaobjectCreate?.userErrors;
        if (userErrors && userErrors.length > 0) {
          return { success: false, error: userErrors[0].message };
        }

        return { success: true };
      } catch (err: any) {
        // 🛑 This prevents the 500 by returning the error as data
        console.error("CRITICAL ACTION ERROR:", err.message);
        return { success: false, error: err.message };
      }
    }
  }),
};
