import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import userStore, { type IUserStore } from '../../stores/user';
import alertStore, { type IAlertStore } from '../../stores/alert';
import styles from './payments.css?inline';

declare global {
  interface Window {
    Stripe: any;
  }
}

const API_URL = import.meta.env.PUBLIC_API_URL;

@customElement('lasz-account-payments')
export class LaszAccountPayments extends LitElement {
  static styles = [unsafeCSS(styles)];

  // Disable Shadow DOM to allow Stripe Elements to mount cleanly
  createRenderRoot() {
    return this;
  }

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

  @state()
  private isAdding = false;

  @state()
  private showAddForm = false;

  private stripeElements: any = null;
  private cardElement: any = null;
  private stripe: any = null;

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

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (changedProperties.has('showAddForm')) {
      if (this.showAddForm) {
        this.initializeStripeElements();
      } else {
        this.cleanupStripeElements();
      }
    }
  }

  async initializeStripeElements() {
    try {
      if (!window.Stripe) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // 1. Grab public Stripe key from WooCommerce REST API v3 payment gateways
      const paymentGatewaysResponse = await fetch(`${API_URL}/wp-json/wc/v3/payment_gateways`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userController.data.user.token}`
        }
      });
      const paymentGatewaysData = await paymentGatewaysResponse.json();
      const stripeGateway = paymentGatewaysData.find((gw: any) => gw.id === 'stripe');
      const stripePublishableKey = stripeGateway?.settings?.publishable_key?.value || stripeGateway?.settings?.test_publishable_key?.value;

      if (!stripePublishableKey) {
        console.error('Stripe publishable key not configured');
        return;
      }

      this.stripe = window.Stripe(stripePublishableKey);
      this.stripeElements = this.stripe.elements();

      this.cardElement = this.stripeElements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });

      await this.updateComplete;
      const cardElementContainer = this.querySelector('#stripe-card-element');
      if (cardElementContainer) {
        this.cardElement.mount(cardElementContainer);
      }
    } catch (error) {
      console.error('Error initializing Stripe Elements:', error);
    }
  }

  cleanupStripeElements() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.stripeElements = null;

    const lightDomContainer = this.querySelector('#stripe-card-element-light');
    if (lightDomContainer) {
      lightDomContainer.remove();
    }
  }

  render() {
    const paymentMethods = Array.isArray(this.userController.data?.paymentMethods) ? this.userController.data.paymentMethods : [];

    return html`
      <h2>Payment Methods</h2>
      <section>
        ${this.isLoading ? html`
          <p class="loading">Loading payment methods...</p>
        ` : html`
          ${this.showAddForm ? this.makeAddPaymentForm() : html`
            ${paymentMethods.length === 0 ? html`
              <p class="no-payment-methods">No payment methods saved.</p>
              <kemet-button @click=${() => this.showAddForm = true}>
                Add Payment Method
              </kemet-button>
            ` : html`
              <div class="payment-methods-list">
                ${paymentMethods.map((method: any) => this.makePaymentMethodCard(method))}
              </div>
              <kemet-button @click=${() => this.showAddForm = true}>
                Add Payment Method
              </kemet-button>
            `}
          `}
        `}
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
      <div class="payment-method-card ${isDefault ? 'default' : ''}">
        <div class="card-header">
          <div class="card-info">
            <span class="card-type">${cardType}</span>
            ${lastFour ? html`<span class="card-number">•••• ${lastFour}</span>` : ''}
          </div>
          ${isDefault ? html`<span class="default-badge">Default</span>` : ''}
        </div>
        <div class="card-details">
          <p><strong>Expires:</strong> ${expiry}</p>
        </div>
        <div class="card-actions">
          ${!isDefault ? html`
            <kemet-button
              size="sm"
              variant="outline"
              @click=${() => this.setDefaultPaymentMethod(method)}
              ?disabled=${this.isDeleting}
            >
              Set as Default
            </kemet-button>
          ` : ''}
          <kemet-button
            size="sm"
            variant="danger"
            @click=${() => this.deletePaymentMethod(method)}
            ?disabled=${this.isDeleting}
          >
            Delete
          </kemet-button>
        </div>
      </div>
    `;
  }

  makeAddPaymentForm() {
    return html`
      <div class="add-payment-form">
        <form @submit=${(event: SubmitEvent) => this.addPaymentMethod(event)}>
          <fieldset>
            <legend>Add New Payment Method</legend>
            <label for="stripe-card-element">Card Details</label>
            <div id="stripe-card-element" class="stripe-card-element" slot="stripe-element"></div>
            <br /><hr /><br />
            <div class="form-actions">
              <kemet-button type="submit" ?disabled=${this.isAdding}>
                ${this.isAdding ? 'Adding...' : 'Add Payment Method'}
              </kemet-button>
              <kemet-button @click=${() => this.showAddForm = false} variant="outline" type="button">
                Cancel
              </kemet-button>
            </div>
          </fieldset>
        </form>
      </div>
    `;
  }

  async addPaymentMethod(event: SubmitEvent) {
    event.preventDefault();

    console.log(event);

    if (!this.userController.data.user.user_id) {
      return;
    }

    this.isAdding = true;

    try {
      await this.tokenizeAndAddPaymentMethod();
    } catch (error) {
      console.error('Error adding payment method:', error);
      this.alertController.actions?.setConfig({
        status: 'error',
        message: 'An error occurred while adding the payment method',
        opened: true,
        icon: 'exclamation-circle',
      });
      this.isAdding = false;
    }
  }

  async tokenizeAndAddPaymentMethod() {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      // 2. Create a Payment Method with Stripe directly
      const { paymentMethod, error: stripeError } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: this.userController.data.user.display_name || '',
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 3. Save the payment method using WooCommerce REST API v3
      const saveResponse = await fetch(`${API_URL}/wp-json/wc/v3/customers/${this.userController.data.user.user_id.toString()}/payment_methods/${paymentMethod.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userController.data.user.token}`
        }
      });

      if (saveResponse.ok) {
        await this.fetchPaymentMethods();
        this.showAddForm = false;
        this.alertController.actions?.setConfig({
          status: 'success',
          message: 'Payment method added successfully',
          opened: true,
          icon: 'check-circle',
        });
      } else {
        const result = await saveResponse.json();
        this.alertController.actions?.setConfig({
          status: 'error',
          message: result.message || 'Failed to save payment method',
          opened: true,
          icon: 'exclamation-circle',
        });
      }
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      this.alertController.actions?.setConfig({
        status: 'error',
        message: error.message || 'Failed to add payment method',
        opened: true,
        icon: 'exclamation-circle',
      });
    } finally {
      this.isAdding = false;
    }
  }

  async setDefaultPaymentMethod(method: any) {
    if (!this.userController.data.user.user_id || !method.id) {
      return;
    }

    this.isDeleting = true;

    const options = {
      method: 'POST',
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
          method: 'PUT',
          body: JSON.stringify({ set_default: true })
        }
      );

      if (response.ok) {
        await this.fetchPaymentMethods();
        this.alertController.actions?.setConfig({
          status: 'success',
          message: 'Payment method set as default',
          opened: true,
          icon: 'check-circle',
        });
      } else {
        const result = await response.json();
        this.alertController.actions?.setConfig({
          status: 'error',
          message: result.message || 'Failed to set default payment method',
          opened: true,
          icon: 'exclamation-circle',
        });
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      this.alertController.actions?.setConfig({
        status: 'error',
        message: 'An error occurred while setting the default payment method',
        opened: true,
        icon: 'exclamation-circle',
      });
    } finally {
      this.isDeleting = false;
    }
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
