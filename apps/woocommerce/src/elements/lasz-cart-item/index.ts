import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './styles.css?inline';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import cartStore, { centsToDollars, type CartStore } from '../../stores/cart';
import { ZustandController } from '../../controllers/zustand';

@customElement('lasz-cart-item')
export class LaszCartItem extends LitElement {
  static styles = [unsafeCSS(styles)];

  private cartController: ZustandController<CartStore, {
  }, {
    updateQuantity: CartStore['updateQuantity'],
    removeFromCart: CartStore['removeFromCart']
  }>

  constructor() {
    super();
    this.cartController = new ZustandController(
      this,
      cartStore,
      (state) => ({}),
      (state) => ({
        updateQuantity: state.updateQuantity,
        removeFromCart: state.removeFromCart
      })
    );
  }

  @property()
  item: any;

  render() {
    return html`
      <div class="image">
        <img src=${this.item.images[0].thumbnail} alt=${this.item.name} />
      </div>
      <div class="details">
        <h3 class="item-name">${unsafeHTML(this.item.name)}</h3>
        <div class="item-price">${centsToDollars(this.item.prices.price)}</div>
      </div>
      <div class="quantity">
        <label for="quantity-${this.item.key}">Quantity:</label>
        <input
            type="number"
            id="quantity-${this.item.key}"
            min="1"
            value="${this.item.quantity}"
            data-key="${this.item.key}"
            @change="${this.handleQuantityChange}"
        />
      </div>
      <div class="subtotal">
        ${centsToDollars((parseInt(this.item.prices.price) * this.item.quantity).toString())}
      </div>
      <div class="actions">
        <button class="remove-btn" data-key="${this.item.key}" @click="${this.handleRemoveItem}">
            Remove
        </button>
      </div>
    `;
  }

  handleQuantityChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const key = target.dataset.key ?? '1';
    const newQuantity = parseInt(target.value);

    if (newQuantity < 1) {
      target.value = '1';
      return;
    }

    try {
      this.cartController.actions?.updateQuantity(key, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      target.value = target.defaultValue; // Reset to original value
    }
  }

  handleRemoveItem(event: Event) {
    const target = event.target as HTMLButtonElement;
    const key = target.dataset.key ?? '';

    try {
      this.cartController.actions?.removeFromCart(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }
}
