import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import styles from './styles.css?inline';

@customElement('lasz-order-status')
export class LaszOrderStatus extends LitElement {
  static styles = [unsafeCSS(styles)];

  @property()
  private order: string = '';

  @state()
  private status: string | null = null;

  @state()
  private message: string | null = null;

  @query('kemet-button')
  private button!: HTMLElement;

  firstUpdated() {
    if (this.order) {
      setTimeout(() => {
        this.button.click();
      }, 100);
    }
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <kemet-field slug="order" label="Please enter an order ID below">
          <kemet-input
            required
            slot="input"
            name="order"
            validate-on-blur
            status
            .value=${this.order}
          ></kemet-input>
        </kemet-field>
        <kemet-button type="submit">Get Order Status</kemet-button>
        ${this.message ? html`<p>${this.message}</p>` : ''}
      </form>
    `;
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const order = formData.get('order') as string;

    if (!order) {
      console.error('Order ID is missing.');
      this.message = 'Order ID is required.';
      return;
    }

    try {
      const orderResponse = await fetch(`/api/orders/${order}`);

      if (!orderResponse.ok) {
        this.message = 'Order not found.';
        return;
      }

      const orderData = await orderResponse.json();
      this.status = orderData.status;
      this.message = `Order ${order} is ${orderData.status}.`;
    } catch (error) {
      console.error(error);
      this.message = 'Error fetching order status';
    }

  }
}
