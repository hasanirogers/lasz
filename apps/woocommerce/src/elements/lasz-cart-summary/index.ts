import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import styles from './styles.css?inline';
import cartStore, { type CartStore } from '../../stores/cart';
import { ZustandController } from '../../controllers/zustand';

@customElement('lasz-cart-summary')
export class LaszCartSummary extends LitElement {
  static styles = [unsafeCSS(styles)];

  private cartController: ZustandController<CartStore, {
  }, {
    getCurrencySymbol: CartStore['getCurrencySymbol'],
    getSubtotal: CartStore['getSubtotal'],
    getShippingCost: CartStore['getShippingCost'],
    getTaxCost: CartStore['getTaxCost'],
    getTotal: CartStore['getTotal']
  }>

  constructor() {
    super();
    this.cartController = new ZustandController(
      this,
      cartStore,
      (state) => ({}),
      (state) => ({
        getCurrencySymbol: state.getCurrencySymbol,
        getSubtotal: state.getSubtotal,
        getShippingCost: state.getShippingCost,
        getTaxCost: state.getTaxCost,
        getTotal: state.getTotal
      })
    );
  }

  render() {
    return html`
        <h2>Order Summary</h2>
        <div class="row">
          <span>Subtotal:</span>
          <span>${this.cartController.actions?.getCurrencySymbol()}${this.cartController.actions?.getSubtotal()}</span>
        </div>
        <div class="row">
          <span>Shipping:</span>
          <span>${this.cartController.actions?.getCurrencySymbol()}${this.cartController.actions?.getShippingCost()}</span>
        </div>
        <div class="row">
          <span>Tax:</span>
          <span>${this.cartController.actions?.getCurrencySymbol()}${this.cartController.actions?.getTaxCost()}</span>
        </div>
        <div class="row total">
          <span>Total:</span>
          <span>${this.cartController.actions?.getCurrencySymbol()}${this.cartController.actions?.getTotal()}</span>
        </div>
        <div class="actions">
          <kemet-button link="/checkout" rounded="lg">
            Proceed to Checkout
          </kemet-button>
        </div>
      </div>
    `;
  }
}
