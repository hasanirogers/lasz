import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ZustandController } from '../../controllers/zustand';
import userStore, { type IUserStore } from '../../stores/user';

import sharedStyles from '../../styles/elements.css?inline';
import styles from './orders.css?inline';


const API_URL = import.meta.env.PUBLIC_API_URL;

@customElement('lasz-account-orders')
export class LaszAccountOrders extends LitElement {
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
    user: IUserStore['user'],
    orders: IUserStore['orders'],
  }, {
    updateOrders: IUserStore['updateOrders'],
  }>;

  @state()
  private isLoading = false;

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        user: state.user,
        orders: state.orders,
      }),
      (state) => ({
        updateOrders: state.updateOrders,
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchOrders();
  }

  render() {
    const orders = Array.isArray(this.userController.data?.orders) ? this.userController.data.orders : [];

    return html`
      <h2>Orders</h2>
      <section>
        ${this.isLoading ? html`<p class="loading">Loading orders...</p>` : ''}
        ${orders.length === 0
          ? html`<p>No orders found.</p>`
          : orders.map((order: any) => this.makeOrderCard(order))
        }
      </section>
    `;
  }

  makeOrderCard(order: any) {
    const orderNumber = order.number || order.id;
    const status = order.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown';
    const date = order.date_created ? new Date(order.date_created).toLocaleDateString() : 'N/A';
    const total = order.currency_symbol + (order.total || '0.00');

    return html`
      <lasz-orders-card>
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">Order #${orderNumber}</span>
            <span class="order-date">${date}</span>
          </div>
          <span class="order-status status-${order.status}">${status}</span>
        </div>
        <div class="order-details">
          <div class="order-total">
            <strong>Total:</strong> ${total}
          </div>
        </div>
      </lasz-orders-card>
    `;
  }

  async fetchOrders() {
    if (!this.userController.data.user.user_id) {
      return;
    }

    this.isLoading = true;

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userController.data.user.token}`
      }
    };

    try {
      const response = await fetch(
        `/api/customer/orders`,
        options
      );

      if (response.ok) {
        const ordersData = await response.json();
        this.userController.actions?.updateOrders(ordersData.orders || []);
      } else {
        console.warn('Orders endpoint not available.');
        this.userController.actions?.updateOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
