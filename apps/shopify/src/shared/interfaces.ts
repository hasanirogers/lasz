export interface CartResponse {
  cartCreate?: {
    cart: { id: string; checkoutUrl: string };
  };
  cartLinesAdd?: {
    cart: { id: string };
    userErrors: Array<{ message: string }>;
  };
}
