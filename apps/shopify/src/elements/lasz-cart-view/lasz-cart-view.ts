import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { shopifyQuery, GET_CART_QUERY } from '../../shared/shopify';
import styles from './lasz-cart-view.css?inline';
import { getCookie } from '../../shared/utilities';

@customElement('lasz-cart-view')
export class LaszCartView extends LitElement {
  static styles = [unsafeCSS(styles)];

  @state()
  private cart: any = null;

  @state()
  private loading: boolean = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchCart();
  }

  async fetchCart() {
    const cartId = getCookie('shopify_cart_id');
    if (!cartId) {
      this.loading = false;
      return;
    }
    const data = await shopifyQuery<any>(GET_CART_QUERY, { cartId });
    this.cart = data.cart;
    this.loading = false;
  }

  render() {
    if (this.loading) return html`<p>Loading your cart...</p>`;

    if (!this.cart || this.cart.lines.nodes.length === 0) {
      return html`<p>Your cart is empty. <a href="/products">Shop now</a></p>`;
    }

    return html`
      <div class="cart-items">
        ${this.cart.lines.nodes.map((line: any) => html`
          <div class="cart-line">
            <img src="${line.merchandise.image.url}" width="100" />
            <div>
              <h3>${line.merchandise.product.title}</h3>
              <p>${line.merchandise.title}</p>
              <p>Qty: ${line.quantity}</p>
              <p>${line.merchandise.price.amount} ${line.merchandise.price.currencyCode}</p>
            </div>
          </div>
        `)}
      </div>

      <div class="cart-summary">
        <h2>Total: ${this.cart.estimatedCost.totalAmount.amount} ${this.cart.estimatedCost.totalAmount.currencyCode}</h2>
        <a href="${this.cart.checkoutUrl}" class="checkout-button">Proceed to Checkout</a>
      </div>
    `;
  }
}
