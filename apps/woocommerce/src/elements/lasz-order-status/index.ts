import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import styles from './styles.css?inline';

@customElement('lasz-order-status')
export class LaszOrderStatus extends LitElement {
  static styles = [unsafeCSS(styles)];

  @state()
  private status: string | null = null;

  @state()
  private message: string | null = null;

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <kemet-field slug="order_id" label="Please enter an order ID below">
          <kemet-input
            required
            slot="input"
            name="order_id"
            validate-on-blur
            status
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
    const orderId = formData.get('order_id') as string;

    if (!orderId) {
      console.error('Order ID is missing.');
      this.message = 'Order ID is required.';
      return;
    }

    try {
      const orderResponse = await fetch(`/api/orders/${orderId}`);

      if (!orderResponse.ok) {
        this.message = 'Order not found.';
        return;
      }

      const orderData = await orderResponse.json();
      this.status = orderData.status;
      this.message = `Order ${orderId} is ${orderData.status}.`;
    } catch (error) {
      console.error(error);
      this.message = 'Error fetching order status';
    }

  }
}
