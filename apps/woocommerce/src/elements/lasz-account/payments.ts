import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import userStore, { type IUserStore } from '../../stores/user';
import alertStore, { type IAlertStore } from '../../stores/alert';

import sharedStyles from '../../styles/elements.css?inline';
import styles from './payments.css?inline';

declare global {
  interface Window {
    Stripe: any;
  }
}

const API_URL = import.meta.env.PUBLIC_API_URL;

@customElement('lasz-account-payments')
export class LaszAccountPayments extends LitElement {
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
    user: IUserStore['user'],
    paymentMethods: IUserStore['paymentMethods'],
  }, {
    updatePaymentMethods: IUserStore['updatePaymentMethods'],
  }>;

  private alertController: ZustandController<IAlertStore, {
    config: IAlertStore['config'],
  }, {
    setConfig: IAlertStore['setConfig'],
  }>;

  @state()
  private isLoading = false;

  @state()
  private isDeleting = false;

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        user: state.user,
        paymentMethods: state.paymentMethods,
      }),
      (state) => ({
        updatePaymentMethods: state.updatePaymentMethods,
      })
    );

    this.alertController = new ZustandController(
      this,
      alertStore,
      (state) => ({
        config: state.config,
      }),
      (state) => ({
        setConfig: state.setConfig,
      })
    );
  }

  render() {
    const paymentMethods = Array.isArray(this.userController.data?.paymentMethods) ? this.userController.data.paymentMethods : [];

    return html`
      <h2>Payment Methods</h2>
      <section>
        ${this.isLoading ? html`<p class="loading">Loading payment methods...</p>` : ''}
        ${paymentMethods.length === 0
          ? html`<p>No payment methods saved.</p>`
          : paymentMethods.map((method: any) => this.makePaymentMethodCard(method))
        }
      </section>
    `;
  }

  makePaymentMethodCard(method: any) {
    const isDefault = method.default;
    const cardType = method.card_type || method.display_name || 'Card';
    const lastFour = method.last4 || '';
    const expiryMonth = method.expiry_month || '';
    const expiryYear = method.expiry_year || '';
    const expiry = expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : 'N/A';

    return html`
      <lasz-payments-card ?default=${isDefault}>
        <div class="details">
          <strong class="type">${cardType}&nbsp;</strong>${lastFour ? html`<span class="number">•••• ${lastFour}</span>` : ''}
          <br />
          <strong>Expires:</strong> ${expiry}
        </div>
        <div class="actions">
          <button @click=${() => this.deletePaymentMethod(method)} ?disabled=${this.isDeleting}>
            Delete
          </button>
        </div>
      </lasz-payments-card>
    `;
  }

  async deletePaymentMethod(method: any) {
    if (!this.userController.data.user.user_id || !method.id) {
      return;
    }

    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    this.isDeleting = true;

    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userController.data.user.token}`
      }
    };

    try {
      const response = await fetch(
        `${API_URL}/wp-json/wc/v3/customers/${this.userController.data.user.user_id.toString()}/payment_methods/${method.id}`,
        {
          ...options,
          method: 'DELETE'
        }
      );

      if (response.ok) {
        await this.fetchPaymentMethods();
        this.alertController.actions?.setConfig({
          status: 'success',
          message: 'Payment method deleted successfully',
          opened: true,
          icon: 'check-circle',
        });
      } else {
        const result = await response.json();
        this.alertController.actions?.setConfig({
          status: 'error',
          message: result.message || 'Failed to delete payment method',
          opened: true,
          icon: 'exclamation-circle',
        });
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      this.alertController.actions?.setConfig({
        status: 'error',
        message: 'An error occurred while deleting the payment method',
        opened: true,
        icon: 'exclamation-circle',
      });
    } finally {
      this.isDeleting = false;
    }
  }

  async fetchPaymentMethods() {
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
        `${API_URL}/wp-json/wc/v3/customers/${this.userController.data.user.user_id.toString()}`,
        options
      );

      if (response.ok) {
        const customerData = await response.json();
        const paymentMethods = customerData.payment_methods || [];
        this.userController.actions?.updatePaymentMethods(paymentMethods);
      } else {
        console.warn('Payment methods endpoint not available.');
        this.userController.actions?.updatePaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
