import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import cartStore, { type CartStore } from '../../stores/cart';
import userStore, { type IUserStore } from '../../stores/user';
import alertStore, { type IAlertStore } from '../../stores/alert';
import { usStates } from '../../shared/data';
import styles from './styles.css?inline';

import 'kemet-ui/elements/tabs';
import 'kemet-ui/elements/tab';
import 'kemet-ui/elements/tab-panel';
import type { ICredentials } from '../lasz-login';


interface CheckoutForm {
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address_1: string;
  billing_address_2: string;
  billing_city: string;
  billing_state: string;
  billing_postcode: string;
  billing_country: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_1: string;
  shipping_address_2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postcode: string;
  shipping_country: string;
  customer_note: string;
  payment_method: string;
  create_account: boolean;
  user_pass: string;
  ship_to_different_address: boolean;
  card_number: string;
  card_expiry: string;
  card_cvc: string;
  card_name: string;
  account_holder_name: string;
  routing_number: string;
  account_number: string;
  payment_details: string;
}

const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL || 'https://woocommerce.deificarts.com';

@customElement('lasz-checkout')
export class LaszCheckout extends LitElement {
  static styles = [unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
    addresses: IUserStore['addresses'],
    isLoggedIn: IUserStore['isLoggedIn'],
    user: IUserStore['user'],
  }, {
    updateProfile: IUserStore['updateProfile'],
    login: IUserStore['login'],
  }>;

  private cartController: ZustandController<CartStore, {
    items: CartStore['items'];
    isLoading: CartStore['isLoading'];
    error: CartStore['error'];
    total: CartStore['total'];
    totals: CartStore['totals'];
  }, {
    fetchCart: CartStore['fetchCart'],
    getTotal: CartStore['getTotal'],
    getSubtotal: CartStore['getSubtotal'],
    getShippingCost: CartStore['getShippingCost'],
    getTaxCost: CartStore['getTaxCost'],
    getCurrencySymbol: CartStore['getCurrencySymbol'],
    clearCart: CartStore['clearCart']
  }>;

  private alertController: ZustandController<IAlertStore, {
    config: IAlertStore['config'],
  }, {
    setConfig: IAlertStore['setConfig'],
  }>

  @state()
  private formData: CheckoutForm = {
    billing_first_name: '',
    billing_last_name: '',
    billing_email: '',
    billing_phone: '',
    billing_address_1: '',
    billing_address_2: '',
    billing_city: '',
    billing_state: '',
    billing_postcode: '',
    billing_country: 'US',
    shipping_first_name: '',
    shipping_last_name: '',
    shipping_address_1: '',
    shipping_address_2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postcode: '',
    shipping_country: 'US',
    customer_note: '',
    payment_method: 'stripe',
    create_account: false,
    user_pass: '',
    ship_to_different_address: false,
    card_number: '',
    card_expiry: '',
    card_cvc: '',
    card_name: '',
    account_holder_name: '',
    routing_number: '',
    account_number: '',
    payment_details: ''
  };

  @state()
  private isProcessing = false;

  @state()
  private checkoutError = '';

  @state()
  private paymentMethods: any[] = [];

  @state()
  private paymentMethodsError = '';

  @state()
  private stripe: any = null;

  @state()
  private stripeElements: any = null;

  @state()
  private cardElement: any = null;

  @query('[action="api/checkout"]')
  private checkoutForm!: HTMLFormElement;

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        addresses: state.addresses,
        isLoggedIn: state.isLoggedIn,
        user: state.user
      }),
      (state) => ({
        updateProfile: state.updateProfile,
        login: state.login
      })
    );

    this.cartController = new ZustandController(
      this,
      cartStore,
      (state) => ({
        items: state.items,
        isLoading: state.isLoading,
        error: state.error,
        total: state.total,
        totals: state.totals
      }),
      (state) => ({
        fetchCart: state.fetchCart,
        getTotal: state.getTotal,
        getSubtotal: state.getSubtotal,
        getShippingCost: state.getShippingCost,
        getTaxCost: state.getTaxCost,
        getCurrencySymbol: state.getCurrencySymbol,
        clearCart: state.clearCart
      })
    );

    this.alertController = new ZustandController(
      this,
      alertStore,
      (state) => ({
        config: state.config
      }),
      (state) => ({
        setConfig: state.setConfig
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadPaymentMethods();
  }

  updated(changedProperties: Map<string, any>) {
    // Re-render when form data changes to update shipping/tax calculations
    if (changedProperties.has('formData')) {
      this.requestUpdate();
    }

    // Mount Stripe Element after DOM updates
    if (this.cardElement) {
      this.mountStripeElement();
    }
  }

  firstUpdated() {
    this.cartController.actions?.fetchCart();
    this.initializeStripe();
    this.loadPaymentMethods();
    this.initializeBillingData();
  }

  render() {
    const { items, isLoading, error } = this.cartController.data;

    if (isLoading) {
      return html`
        <lasz-checkout-container>
          <div class="loading">
            <p>Loading checkout...</p>
          </div>
        </lasz-checkout-container>
      `;
    }

    if (error) {
      return html`
        <lasz-checkout-container>
          <div class="error">
            <p>Error: ${error}</p>
          </div>
        </lasz-checkout-container>
      `;
    }

    if (items.length === 0) {
      return html`
        <lasz-checkout-container>
          <div class="empty-cart">
            <p>Your cart is empty.</p>
            <a href="/products">Continue Shopping</a>
          </div>
        </lasz-checkout-container>
      `;
    }

    return html`
      <lasz-checkout-container>
        <form method="post" action="api/checkout" @submit=${this.handleSubmit}>
          <section>
            ${this.makeDetails()}
            ${this.makeSummary()}
          </section>
        </form>
      </lasz-checkout-container>
    `;
  }

  private initializeBillingData() {
    this.formData = {
      ...this.formData,
      billing_first_name: this.userController.data.addresses.billing.first_name || '',
      billing_last_name: this.userController.data.addresses.billing.last_name || '',
      billing_email: this.userController.data.addresses.billing.email || '',
      billing_phone: this.userController.data.addresses.billing.phone || '',
      billing_address_1: this.userController.data.addresses.billing.address_1 || '',
      billing_address_2: this.userController.data.addresses.billing.address_2 || '',
      billing_city: this.userController.data.addresses.billing.city || '',
      billing_state: this.userController.data.addresses.billing.state || '',
      billing_postcode: this.userController.data.addresses.billing.postcode || '',
      billing_country: this.userController.data.addresses.billing.country || 'US',
      shipping_first_name: this.userController.data.addresses.shipping.first_name || '',
      shipping_last_name: this.userController.data.addresses.shipping.last_name || '',
      shipping_address_1: this.userController.data.addresses.shipping.address_1 || '',
      shipping_address_2: this.userController.data.addresses.shipping.address_2 || '',
      shipping_city: this.userController.data.addresses.shipping.city || '',
      shipping_state: this.userController.data.addresses.shipping.state || '',
      shipping_postcode: this.userController.data.addresses.shipping.postcode || '',
      shipping_country: this.userController.data.addresses.shipping.country || 'US',
    };
  }

  private initializeStripe() {
    // Initialize Stripe with your publishable key
    const publishableKey = import.meta.env.PUBLIC_STRIPE_KEY;

    if (typeof window !== 'undefined') {
      if ((window as any).Stripe) {
        // Stripe script is loaded, initialize it
        this.stripe = (window as any).Stripe(publishableKey);
        this.stripeElements = this.stripe.elements();

        // Create the card element
        this.cardElement = this.stripeElements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        });

        console.log('Stripe initialized with Elements:', publishableKey.substring(0, 10) + '...');
      } else {
        // Stripe script not loaded yet, wait and retry
        console.warn('Stripe script not loaded yet, waiting and retrying...');
        setTimeout(() => {
          this.initializeStripe();
        }, 1000);
      }
    } else {
      console.warn('Stripe not initialized - missing or invalid publishable key');
      console.warn('Please set PUBLIC_STRIPE_KEY environment variable with a real Stripe publishable key');
    }
  }

  async loadPaymentMethods() {
    try {
      const response = await fetch('/api/payment-gateways');
      if (response.ok) {
        const data = await response.json();
        this.paymentMethods = data;
      } else {
        const errorData = await response.json();
        this.paymentMethodsError = errorData.message || 'Failed to load payment methods';
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      this.paymentMethodsError = 'Unable to connect to payment service. Please try again later.';
    }
  }

  private handleInputChange(event: Event | CustomEvent) {
    const element = (event as CustomEvent).detail?.element ?? (event as Event).target;
    const isCheckbox = element?.tagName === 'KEMET-CHECKBOX';
    const { name, value } = element as any;

    if (isCheckbox) {
      this.formData = {
        ...this.formData,
        [name]: (element as any).checked
      };
    } else {
     this.formData = {
        ...this.formData,
        [name]: value
      };
    }

    console.log('Form data updated:', this.formData);
  }

  async handleLogin(credentials: ICredentials) {
    const options = {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' }
    };

    const tokenResponse = await fetch(`${PUBLIC_API_URL}/wp-json/jwt-auth/v1/token`, options);
    const tokenResponseData = await tokenResponse.json();

    // bad access
    if (tokenResponseData.data?.status === 403) {
      console.log('bad access');
      this.alertController.actions?.setConfig({
        status: 'error',
        message: tokenResponseData.message,
        opened: true,
        icon: 'exclamation-circle'
      });
    }

    // success
    if (tokenResponseData.token) {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponseData.token}`
        }
      };
      const userProfile = await fetch(`${PUBLIC_API_URL}/wp-json/wp/v2/users/${tokenResponseData.user_id.toString()}?context=edit`, options).then((response) => response.json());
      this.userController.actions?.updateProfile(userProfile);
      this.userController.actions?.login(tokenResponseData);
    }
  }

  async handleRegistration() {
    const formData = new FormData(this.checkoutForm);
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_name: formData.get('billing_email'),
        user_first_name: formData.get('billing_first_name'),
        user_last_name: formData.get('billing_last_name'),
        user_pass: formData.get('user_pass'),
        user_email: formData.get('billing_email')
      })
    };

    const registerResponse = await fetch(`${PUBLIC_API_URL}/wp-json/lasz-woocommerce/v1/register`, options);
    const responseData = await registerResponse.json();

    if (!registerResponse.ok) {
      this.alertController.actions?.setConfig({
        status: 'error',
        message: 'An error was encountered while registering.',
        opened: true,
        icon: 'exclamation-circle'
      });
    }

    if (responseData.status === 'error') {
      if (responseData.data.errors.existing_user_login) {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'That username is already taken!',
          opened: true,
          icon: 'exclamation-circle'
        });
      }

      if (responseData.data.errors.existing_user_email) {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'Email is registered with another user!',
          opened: true,
          icon: 'exclamation-circle'
        });
      }
    }

    if (responseData.status === 'ok') {
      this.handleLogin({
        username: responseData.data['user_name'],
        password: responseData.data['user_pass'],
      });
    }
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    this.isProcessing = true;
    this.checkoutError = '';

    try {
      const cartState = this.cartController.data;
      const cartStoreState = cartStore.getState();

      // Get cart token from store or fetch it if missing
      let cartToken = cartStoreState.cartToken;

      if (!cartToken) {
        // Try to get cart token from localStorage as fallback
        const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('lasz-cart-token') : null;
        cartToken = storedToken;
        console.log('Checkout - Fallback cart token from localStorage:', cartToken ? `${cartToken.substring(0, 8)}...` : null);
      }

      // If still no cart token, try to fetch cart first
      if (!cartToken && !cartState.isLoading) {
        console.log('Checkout - No cart token, fetching cart...');
        await this.cartController.actions?.fetchCart();

        // Try again after fetch
        const updatedStoreState = cartStore.getState();
        cartToken = updatedStoreState.cartToken;
        console.log('Checkout - Cart token after fetch:', cartToken ? `${cartToken.substring(0, 8)}...` : null);
      }

      // Validate cart token exists
      if (!cartToken) {
        this.checkoutError = 'Cart session is missing. Please add items to your cart and try again.';
        this.isProcessing = false;
        return;
      }

      // Validate card details for Stripe payments
      console.log('Validating card details for payment method:', this.formData.payment_method);
      console.log('Card details:', {
        hasCardElement: !!this.cardElement,
        card_name: !!this.formData.card_name
      });

      if (this.formData.payment_method === 'stripe') {
        if (!this.cardElement || !this.formData.card_name) {
          console.log('Card validation failed - missing Stripe Element or cardholder name');
          this.checkoutError = 'Please enter cardholder name and ensure card details are complete for Stripe payment.';
          this.isProcessing = false;
          return;
        }
        console.log('Card validation passed');
      }

      const stripePMId = await this.createStripePaymentMethod();

      if (this.formData.payment_method === 'stripe' && !stripePMId) {
          this.checkoutError = 'Could not initialize Stripe payment.';
          this.isProcessing = false;
          return;
      }

      // handle regisration
      if (this.formData.create_account) {
        await this.handleRegistration();
      }

      const checkoutData = {
        cart_token: cartToken,
        billing_address: {
          first_name: this.formData.billing_first_name,
          last_name: this.formData.billing_last_name,
          company: '', // Add empty company field
          address_1: this.formData.billing_address_1,
          address_2: this.formData.billing_address_2,
          city: this.formData.billing_city,
          state: this.formData.billing_state,
          postcode: this.formData.billing_postcode,
          country: this.formData.billing_country,
          email: this.formData.billing_email,
          phone: this.formData.billing_phone
        },
        shipping_address: this.formData.ship_to_different_address ? {
          first_name: this.formData.shipping_first_name,
          last_name: this.formData.shipping_last_name,
          company: '', // Add empty company field
          address_1: this.formData.shipping_address_1,
          address_2: this.formData.shipping_address_2,
          city: this.formData.shipping_city,
          state: this.formData.shipping_state,
          postcode: this.formData.shipping_postcode,
          country: this.formData.shipping_country
        } : {
          first_name: this.formData.billing_first_name,
          last_name: this.formData.billing_last_name,
          company: '', // Add empty company field
          address_1: this.formData.billing_address_1,
          address_2: this.formData.billing_address_2,
          city: this.formData.billing_city,
          state: this.formData.billing_state,
          postcode: this.formData.billing_postcode,
          country: this.formData.billing_country
        },
        customer_note: this.formData.customer_note,
        // Hardcode payment method to stripe for now
        payment_method: 'stripe',
        payment_data: await this.getPaymentData(),
        // Send this specifically for your Astro route to catch
        payment_method_id: stripePMId,
        // Include JWT token if user is logged in
        user_token: this.userController.data.isLoggedIn ? this.userController.data.user?.token : null
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      const result = await response.json();

      if (response.ok && result.order_id) {
        this.cartController.actions?.clearCart();
        setTimeout(() => {
          window.location.href = `/orders/received/${result.order_id}`;
        }, 1);
      } else {
        this.checkoutError = result.message || 'Checkout failed. Please try again.';
      }
    } catch (error) {
      this.checkoutError = 'An error occurred during checkout. Please try again.';
      console.error('Checkout error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async getPaymentData() {
    const paymentData = [
      // This tells the gateway WHICH Stripe flow to use
      { key: 'wc-stripe-payment-type', value: 'card' },
      { key: 'wc-stripe-new-payment-method', value: 'true' },
      { key: 'billing_email', value: this.formData.billing_email }
    ];

    if (this.formData.payment_method === 'stripe') {
      const stripePaymentMethodId = await this.createStripePaymentMethod();

      if (stripePaymentMethodId) {
        // THE KEY: Use 'payment_method' as the key name if 'wc-stripe-payment-method' fails
        paymentData.push({ key: 'payment_method', value: stripePaymentMethodId });
        paymentData.push({ key: 'wc-stripe-payment-method', value: stripePaymentMethodId });
      } else {
        throw new Error('Could not initialize Stripe payment.');
      }
    }

    return paymentData;
  }

  private async createStripePaymentMethod() {
    if (!this.stripe || !this.cardElement) return null;

    try {
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: this.formData.card_name,
          email: this.formData.billing_email,
          address: {
            line1: this.formData.billing_address_1,
            city: this.formData.billing_city,
            state: this.formData.billing_state,
            postal_code: this.formData.billing_postcode,
            country: this.formData.billing_country,
          }
        }
      });

      if (error) {
        this.checkoutError = error.message;
        return null;
      }

      return paymentMethod.id; // Returns 'pm_...'
    } catch (err) {
      console.error('Stripe PM Error:', err);
      return null;
    }
  }


  private makePaymentDetails(paymentMethod: string) {
    console.log('Rendering payment details for:', paymentMethod);

    if (paymentMethod === 'stripe') {
      return html`
        <kemet-field label="Name on Card *" slug="card_name">
          <kemet-input
            slot="input"
            name="card_name"
            .value=${this.formData.card_name}
            placeholder="John Doe"
            @input=${this.handleInputChange}
            required
          ></kemet-input>
        </kemet-field>
        <br />
        <slot name="stripe-element-container"></slot>
        <slot name="stripe-errors-container"></slot>
      `;
    }

    return html``;
  }

  private mountStripeElement() {
    // Look in the main document (Light DOM) because it's slotted
    const mountPoint = document.getElementById('card-element');

    if (mountPoint && this.cardElement) {
      // Check if it's already mounted to avoid Stripe errors
      if (mountPoint.children.length === 0) {
        this.cardElement.mount(mountPoint);
        console.log('Stripe Element mounted to Light DOM slot');
      }
    }
  }

  private makeShipping() {
    return html`
      <lasz-checkout-shipping>
        <h3>Shipping Address</h3>
        <div class="columns two">
          <kemet-field label="First Name *" slug="shipping_first_name">
            <kemet-input
              required
              validate-on-blur
              slot="input"
              name="shipping_first_name"
              rounded="md"
              .value=${this.formData.shipping_first_name}
              @kemet-input=${this.handleInputChange}
            ></kemet-input>
          </kemet-field>
          <kemet-field label="Last Name *" slug="shipping_last_name">
            <kemet-input
              required
              validate-on-blur
              slot="input"
              name="shipping_last_name"
              rounded="md"
              .value=${this.formData.shipping_last_name}
              @kemet-input=${this.handleInputChange}
            ></kemet-input>
          </kemet-field>
        </div>

        <div>
          <kemet-field label="Address *" slug="shipping_address_1">
            <kemet-input
              required
              validate-on-blur
              slot="input"
              name="shipping_address_1"
              rounded="md"
              .value=${this.formData.shipping_address_1}
              @kemet-input=${this.handleInputChange}
            ></kemet-input>
          </kemet-field>
        </div>

        <div>
          <kemet-field label="Address Line 2 *" slug="shipping_address_2">
            <kemet-input
              slot="input"
              name="shipping_address_2"
              rounded="md"
              .value=${this.formData.shipping_address_2}
              @kemet-input=${this.handleInputChange}
            ></kemet-input>
          </kemet-field>
        </div>

        <div class="columns three">
          <kemet-field label="City *" slug="shipping_city">
            <kemet-input
              required
              validate-on-blur
              slot="input"
              name="shipping_city"
              rounded="md"
              .value=${this.formData.shipping_city}
              @kemet-input=${this.handleInputChange}
            ></kemet-input>
          </kemet-field>
          <kemet-field label="State *" slug="shipping_state">
            <kemet-select
              required
              validate-on-blur
              slot="input"
              name="shipping_state"
              rounded="md"
              .value=${this.formData.shipping_state}
              @kemet-change=${this.handleInputChange}
            >
              ${usStates.map(state => html`
                <kemet-option value=${state.value} label=${state.label}></kemet-option>
              `)}
            </kemet-select>
          </kemet-field>
          <kemet-field label="Zipcode *" slug="shipping_postcode">
            <kemet-input
              required
              validate-on-blur
              slot="input"
              name="shipping_postcode"
              rounded="md"
              .value=${this.formData.shipping_postcode}
              @kemet-input=${this.handleInputChange}
            ></kemet-input>
          </kemet-field>
        </div>
      </lasz-checkout-shipping>
    `;
  }

  private makeDetails() {
    return html`
      <lasz-checkout-details>
        ${this.makeBilling()}
        ${this.userController.data.isLoggedIn
          ? ''
          : html`<kemet-checkbox label="Use billing details to save an account?" name="create_account" .checked=${this.formData.create_account} @kemet-change=${this.handleInputChange}></kemet-checkbox><br />`
        }
        ${this.formData.create_account ? this.makePassword() : ''}
        <kemet-checkbox label="Ship to a different address?" name="ship_to_different_address" .checked=${this.formData.ship_to_different_address} @kemet-change=${this.handleInputChange}></kemet-checkbox>
        ${this.formData.ship_to_different_address ? this.makeShipping() : ''}
        ${this.makePaymentMethod()}
      </lasz-checkout-details>
    `;
  }

  private makePassword() {
    return html`
      <p>
        <kemet-field label="Please create a password *" slug="user_pass">
          <kemet-input
            slot="input"
            ?required=${this.formData.create_account}
            type="password"
            name="user_pass"
            rounded="md"
            .value=${this.formData.user_pass}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
          <kemet-password slot="component"></kemet-password>
        </kemet-field>
      </p>
    `;
  }

  private makeBilling() {
    return html`
      <h2>Billing Details</h2>
      <div class="columns two">
        <kemet-field label="First Name *" slug="billing_first_name">
          <kemet-input
            required
            validate-on-blur
            slot="input"
            name="billing_first_name"
            rounded="md"
            .value=${this.formData.billing_first_name}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
        <kemet-field label="Last Name *" slug="billing_last_name">
          <kemet-input
            required
            validate-on-blur
            slot="input"
            name="billing_last_name"
            rounded="md"
            .value=${this.formData.billing_last_name}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
      </div>

      <div>
          <kemet-field label="Email *" slug="billing_email">
          <kemet-input
            required
            validate-on-blur
            slot="input"
            name="billing_email"
            rounded="md"
            .value=${this.formData.billing_email}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
      </div>

      <div>
        <kemet-field label="Phone *" slug="billing_phone">
          <kemet-input
            slot="input"
            name="billing_phone"
            rounded="md"
            .value=${this.formData.billing_phone}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
      </div>

      <div class="form-group">
        <kemet-field label="Address *" slug="billing_address_1">
          <kemet-input
            required
            validate-on-blur
            slot="input"
            name="billing_address_1"
            rounded="md"
            .value=${this.formData.billing_address_1}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
      </div>

      <div>
        <kemet-field label="Address Line 2 *" slug="billing_address_2">
          <kemet-input
            slot="input"
            name="billing_address_2"
            rounded="md"
            .value=${this.formData.billing_address_2}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
      </div>

      <div class="columns three">
        <kemet-field label="City *" slug="billing_city">
          <kemet-input
            required
            validate-on-blur
            slot="input"
            name="billing_city"
            rounded="md"
            .value=${this.formData.billing_city}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
        <kemet-field label="State *" slug="billing_state">
          <kemet-select
            required
            validate-on-blur
            slot="input"
            name="billing_state"
            rounded="md"
            .value=${this.formData.billing_state}
            @kemet-change=${this.handleInputChange}
          >
            ${usStates.map(state => html`
              <kemet-option value=${state.value} label=${state.label}></kemet-option>
            `)}
          </kemet-select>
        </kemet-field>
        <kemet-field label="Zipcode *" slug="billing_postcode">
          <kemet-input
            required
            validate-on-blur
            slot="input"
            name="billing_postcode"
            rounded="md"
            .value=${this.formData.billing_postcode}
            @kemet-input=${this.handleInputChange}
          ></kemet-input>
        </kemet-field>
      </div>
    `;
  }

  private makeSummary() {
    const { items } = this.cartController.data;
    const subtotal = this.cartController.actions?.getSubtotal() || '0.00';
    const shippingCost = this.cartController.actions?.getShippingCost(false) || '0.00';
    const taxCost = this.cartController.actions?.getTaxCost(false, '') || '0.00';
    const currencySymbol = this.cartController.actions?.getCurrencySymbol() || '$';
    const grandTotal = (parseFloat(subtotal) + parseFloat(shippingCost) + parseFloat(taxCost)).toFixed(2);

    return html`
      <lasz-checkout-summary>
        <h2>Order Summary</h2>
        <lasz-checkout-items>
          ${items.map(item => html`
            <lasz-checkout-item>
              <div class="info">
                <div class="name">${item.name}</div>
                <div class="quantity">Qty: ${item.quantity}</div>
              </div>
              <div class="total">${currencySymbol}${(parseFloat(item.prices.price) * item.quantity * 0.01).toFixed(2)}</div>
            </lasz-checkout-item>
          `)}
        </lasz-checkout-items>
        <lasz-checkout-totals>
          <div class="row">
            <span>Subtotal:</span>
            <span>${currencySymbol}${subtotal}</span>
          </div>
          <div class="row">
            <span>Shipping:</span>
            <span>${currencySymbol}${shippingCost}</span>
          </div>
          <div class="row">
            <span>Tax:</span>
            <span>${currencySymbol}${taxCost}</span>
          </div>
          <div class="row grand">
            <span>Total:</span>
            <span>${currencySymbol}${grandTotal}</span>
          </div>
        </lasz-checkout-totals>
      </lasz-checkout-summary>
    </lasz-checkout-columns>
    `;
  }

  private makePaymentMethod() {
    if (this.paymentMethodsError) {
      return html`
        <div class="payment-methods-error">
          <p>${this.paymentMethodsError}</p>
        </div>
      `;
    }

    return html`
      <lasz-checkout-payment>
        <h3>Payment Method</h3>
        <kemet-tabs divider>
          ${this.paymentMethods.map(method => html`<kemet-tab slot="tab">${method.title}</kemet-tab>`)}
          ${this.paymentMethods.map(method => html`<kemet-tab-panel slot="panel">${this.makePaymentDetails(method.id)}</kemet-tab-panel>`)}
        </kemet-tabs>

        <br /><br />

        <kemet-field label="Order Notes (Optional)" slug="customer_note">
          <kemet-textarea
            slot="input"
            name="customer_note"
            .value=${this.formData.customer_note}
            @input=${this.handleInputChange}
            rows="3"
          ></kemet-textarea>
        </kemet-field>

        ${this.checkoutError
          ? html`<div class="checkout-error"><p>${this.checkoutError}</p></div>`
          : ''
        }

        <br />
        <kemet-button type="submit" rounded="lg" ?disabled=${this.isProcessing}>
          ${this.isProcessing ? 'Processing...' : 'Place Order'}
        </kemet-button>
        <br />&nbsp;
      </lasz-checkout-payment>
    `;
  }
}
