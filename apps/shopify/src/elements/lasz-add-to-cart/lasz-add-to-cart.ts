import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { shopifyQuery } from '../../shared/shopify';
import type { CartResponse } from '../../shared/interfaces';
import styles from './lasz-add-to-cart.css?inline';
import { getCookie, setCookie } from '../../shared/utilities';

@customElement('lasz-add-to-cart')
export class LaszAddToCart extends LitElement {
  @property({ type: String, attribute: 'variant-id' })
  variantId: string = '';

  @state()
  private loading: boolean = false;

  static styles = [unsafeCSS(styles)];

  render() {
    return html`
      <button
        @click=${this.handleAddToCart}
        ?disabled=${this.loading || !this.variantId}
      >
        ${this.loading ? 'Adding...' : 'Add to Cart'}
      </button>
    `;
  }

  private async handleAddToCart() {
    if (!this.variantId) return;

    this.loading = true;
    const cartId = getCookie('shopify_cart_id');

    try {
      if (!cartId) {
        // CREATE NEW CART
        const mutation = `
          mutation cartCreate($input: CartInput) {
            cartCreate(input: $input) {
              cart { id checkoutUrl }
            }
          }
        `;
        const data = await shopifyQuery<CartResponse>(mutation, {
          input: { lines: [{ quantity: 1, merchandiseId: this.variantId }] }
        });

        if (data.cartCreate?.cart.id) {
          setCookie('shopify_cart_id', data.cartCreate.cart.id);
        }
      } else {
        // ADD TO EXISTING CART
        const mutation = `
          mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart { id }
              userErrors { message }
            }
          }
        `;
        const data = await shopifyQuery<CartResponse>(mutation, {
          cartId,
          lines: [{ quantity: 1, merchandiseId: this.variantId }]
        });

        if (data.cartLinesAdd?.userErrors.length) {
          throw new Error(data.cartLinesAdd.userErrors[0].message);
        }
      }

      // Notify other components (like a cart drawer)
      this.dispatchEvent(new CustomEvent('cart-updated', {
        bubbles: true,
        composed: true,
        detail: { variantId: this.variantId }
      }));

    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      this.loading = false;
    }
  }
}

// Add Type Support for JSX/Templates
declare global {
  interface HTMLElementTagNameMap {
    'lasz-add-to-cart': LaszAddToCart;
  }
}
