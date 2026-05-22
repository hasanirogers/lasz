const domain = import.meta.env.PUBLIC_SHOPIFY_DOMAIN;
const storefrontToken = import.meta.env.PUBLIC_SHOPIFY_HEADLESS_ACCESS_TOKEN;

export async function shopifyQuery<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Switch back to X-Shopify-Storefront-Access-Token
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(`Shopify GraphQL Error: ${json.errors[0].message}`);
  }

  return json.data;
}

export const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      estimatedCost {
        totalAmount { amount currencyCode }
      }
      lines(first: 10) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product { title }
              image { url altText }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;

export const ALL_PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
          width
          height
        }
        variants(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
`;
