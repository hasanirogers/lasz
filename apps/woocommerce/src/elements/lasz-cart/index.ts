import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import cartStore, { type CartStore } from '../../stores/cart';
import styles from './styles.css?inline';

import '../lasz-cart-item';
import '../lasz-cart-summary';


@customElement('lasz-cart')
export class LaszCart extends LitElement {
  static styles = [unsafeCSS(styles)];

  private cartController: ZustandController<CartStore, {
    items: CartStore['items'];
    isLoading: CartStore['isLoading'];
    error: CartStore['error']
  }, {
    addToCart: CartStore['addToCart'],
    fetchCart: CartStore['fetchCart'],
    restoreCart: CartStore['restoreCart'],
    getSubtotal: CartStore['getSubtotal'],
    getShippingCost: CartStore['getShippingCost'],
    getTaxCost: CartStore['getTaxCost'],
    getCurrencySymbol: CartStore['getCurrencySymbol'],
    getTotal: CartStore['getTotal'],
    updateQuantity: CartStore['updateQuantity'],
    removeFromCart: CartStore['removeFromCart']
  }>

  constructor() {
    super();
    this.cartController = new ZustandController(
      this,
      cartStore,
      (state) => ({
        items: state.items,
        isLoading: state.isLoading,
        error: state.error
      }),
      (state) => ({
        addToCart: state.addToCart,
        fetchCart: state.fetchCart,
        restoreCart: state.restoreCart,
        getSubtotal: state.getSubtotal,
        getShippingCost: state.getShippingCost,
        getTaxCost: state.getTaxCost,
        getCurrencySymbol: state.getCurrencySymbol,
        getTotal: state.getTotal,
        updateQuantity: state.updateQuantity,
        removeFromCart: state.removeFromCart
      })
    );
  }

  firstUpdated() {
    this.cartController.actions?.restoreCart(); // read from local storage
    this.cartController.actions?.fetchCart(); // sync with latest data from server
  }

  render() {
    const { items } = this.cartController.data;
    return html`
      <lasz-cart-container>
        <header>
          <h1>Shopping Cart</h1>
          <p class="item-count">${items.length} ${items.length === 1 ? 'item' : 'items'}</p>
        </header>
        ${this.makeCartBody()}
      </lasz-cart-container>
    `;
  }

  makeVariations(item: CartStore['items'][0]) {
    if (!item.variation || Object.keys(item.variation).length === 0) {
      return '';
    }
    return html`
      <div class="item-variations">
        ${Object.values(item.variation).map((value) => html`
          <span class="variation">${value.attribute}: ${value.value}</span>
        `)}
      </div>
    `;
  }

  makeCartBody() {
    const { isLoading, error, items } = this.cartController.data;
    if (isLoading) {
      return html`
        <lasz-cart-loading>
          <!-- TODO: make spinner have an api as custom element -->
          <lasz-cart-spinner></lasz-cart-spinner>
          <p>Loading your cart...</p>
        </lasz-cart-loading>
      `;
    }

    if (error) {
      return html`
        <lasz-cart-error>
          <p>Error loading cart${error}</p>
          <kemet-button link="/cart" rounded="lg">Clickt to Retry</kemet-button>
        </lasz-cart-error>
      `;
    }

    if (items.length === 0) {
      return html`
        <lasz-cart-empty>
          <div>Looks like your cart is empty. Time to shop!</div>
        </lasz-cart-empty>
      `;
    }

    return html`
      <lasz-cart-content>
        <lasz-cart-items>
          ${items.map((item) => html`<lasz-cart-item .item=${item}></lasz-cart-item>`)}
        </lasz-cart-items>
        <lasz-cart-summary></lasz-cart-summary>
      </lasz-cart-content>
    `;
  }
}
