import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import cartStore, { type CartStore } from '../../stores/cart';
import styles from './styles.css?inline';


@customElement('lasz-header')
export default class LaszHeader extends LitElement {
  static styles = [unsafeCSS(styles)];

  @property()
  logo?: String;

  @property()
  name?: String;

  @property({ type: Boolean, reflect: true, attribute: 'logged-in' })
  logged?: Boolean;

  private cartController: ZustandController<CartStore, { items: CartStore['items']; }, { getSubtotal: () => string }>

  constructor() {
    super();
    this.cartController = new ZustandController(
      this,
      cartStore,
      (state) => ({
        items: state.items,
      }),
      (state  ) => ({
        getSubtotal: state.getSubtotal ?? (() => '0.00'),
      })
    );
  }

	render() {
		return html`
      <header>
        <div>
          <a class="logo" href="/">
            ${this.logo ? html`<img src="${this.logo}" alt="${this.name} Logo" />` : null}
            ${this.name ? html`<h2>${this.name}</h2>` : null}
          </a>
          <div>
            <strong>$${this.cartController.actions?.getSubtotal()}</strong>&nbsp;in your cart.
          </div>
        </div>
        <div>
          <slot></slot>
          <a href="/cart">
            <kemet-avatar circle>
              <kemet-icon-bootstrap size="24" icon="cart3"></kemet-icon-bootstrap>
              <span>${this.cartController.data.items.length}</span>
            </kemet-avatar>
          </a>
        </div>
      </header>
    `;
	}
}
