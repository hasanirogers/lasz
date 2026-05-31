import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import userStore, { type IUserStore } from '../../stores/user';
import alertStore, { type IAlertStore } from '../../stores/alert';
import { usStates } from '../../shared/data';
import styles from './addresses.css?inline';

const API_URL = import.meta.env.PUBLIC_API_URL;

@customElement('lasz-account-addresses')
export class LaszAccountAddresses extends LitElement {
  static styles = [unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
    user: IUserStore['user'],
    addresses: IUserStore['addresses'],
  }, {
    updateAddresses: IUserStore['updateAddresses'],
  }>;

  private alertController: ZustandController<IAlertStore, {
    config: IAlertStore['config'],
  }, {
    setConfig: IAlertStore['setConfig'],
  }>;

  @query('form[action*=billing]')
  billingForm!: HTMLFormElement;

  @query('form[action*=shipping]')
  shippingForm!: HTMLFormElement;

  @state()
  private isEditingBilling = false;

  @state()
  private isEditingShipping = false;

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        user: state.user,
        addresses: state.addresses,
      }),
      (state) => ({
        updateAddresses: state.updateAddresses,
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
    const addresses = this.userController.data?.addresses || { billing: {}, shipping: {} };

    return html`
      <h2>Addresses</h2>
      <section>
        <div>
          <h3>Billing Address</h3>
          ${this.isEditingBilling ? this.makeBillingForm(addresses.billing) : this.makeAddressDisplay(addresses.billing, 'billing')}
        </div>
        <div>
          <h3>Shipping Address</h3>
          ${this.isEditingShipping ? this.makeShippingForm(addresses.shipping) : this.makeAddressDisplay(addresses.shipping, 'shipping')}
        </div>
      </section>
    `;
  }

  makeAddressDisplay(address: any, type: 'billing' | 'shipping') {
    const hasAddress = address.first_name || address.last_name || address.address_1;

    if (!hasAddress) {
      return html`
        <p class="no-address">No ${type} address set.</p>
        <kemet-button @click=${() => type === 'billing' ? this.isEditingBilling = true : this.isEditingShipping = true}>
          Add ${type === 'billing' ? 'Billing' : 'Shipping'} Address
        </kemet-button>
      `;
    }

    return html`
      <address>
        <p><strong>${address.first_name} ${address.last_name}</strong></p>
        ${address.company ? html`<p>${address.company}</p>` : ''}
        <p>${address.address_1}</p>
        ${address.address_2 ? html`<p>${address.address_2}</p>` : ''}
        <p>${address.city}, ${address.state} ${address.postcode}</p>
        ${type === 'billing' ? html`
          ${address.email ? html`<p>${address.email}</p>` : ''}
          ${address.phone ? html`<p>${address.phone}</p>` : ''}
        ` : ''}
      </address>
      <kemet-button rounded="lg" @click=${() => type === 'billing' ? this.isEditingBilling = true : this.isEditingShipping = true}>
        Edit ${type === 'billing' ? 'Billing' : 'Shipping'} Address
      </kemet-button>
    `;
  }

  makeBillingForm(address: any) {
    return html`
      <form method="post" action="wc/v3/customers" @submit=${(event: SubmitEvent) => this.updateBillingAddress(event)}>
        <fieldset>
          <legend>Edit Billing Address</legend>
          <div class="columns two">
            <kemet-field label="First Name">
              <kemet-input slot="input" name="billing_first_name" rounded value=${address.first_name || ''}></kemet-input>
            </kemet-field>
            <kemet-field label="Last Name">
              <kemet-input slot="input" name="billing_last_name" rounded value=${address.last_name || ''}></kemet-input>
            </kemet-field>
          </div>
          <kemet-field label="Company">
            <kemet-input slot="input" name="billing_company" rounded value=${address.company || ''}></kemet-input>
          </kemet-field>
          <kemet-field label="Address">
            <kemet-input slot="input" name="billing_address_1" rounded value=${address.address_1 || ''}></kemet-input>
          </kemet-field>
          <kemet-field label="Address Line 2">
            <kemet-input slot="input" name="billing_address_2" rounded value=${address.address_2 || ''}></kemet-input>
          </kemet-field>
          <div class="columns three">
            <kemet-field label="City">
              <kemet-input slot="input" name="billing_city" rounded value=${address.city || ''}></kemet-input>
            </kemet-field>
            <kemet-field label="State">
              <kemet-select slot="input" name="billing_state" rounded>
                ${usStates.map(state => html`
                  <kemet-option value=${state.value} label=${state.label} ?selected=${address.state === state.value}></kemet-option>
                `)}
              </kemet-select>
            </kemet-field>
            <kemet-field label="Zipcode">
              <kemet-input slot="input" name="billing_postcode" rounded value=${address.postcode || ''}></kemet-input>
            </kemet-field>
          </div>
          <kemet-field label="Country">
            <kemet-input slot="input" name="billing_country" rounded value=${address.country || 'US'}></kemet-input>
          </kemet-field>
          <kemet-field label="Email">
            <kemet-input slot="input" name="billing_email" rounded value=${address.email || ''}></kemet-input>
          </kemet-field>
          <kemet-field label="Phone">
            <kemet-input slot="input" name="billing_phone" rounded value=${address.phone || ''}></kemet-input>
          </kemet-field>
          <br /><hr /><br />
          <div class="form-actions">
            <kemet-button type="submit">
              Save Billing Address <kemet-icon slot="right" icon="check"></kemet-icon>
            </kemet-button>
            <kemet-button @click=${() => this.isEditingBilling = false} variant="outline">
              Cancel
            </kemet-button>
          </div>
        </fieldset>
      </form>
    `;
  }

  makeShippingForm(address: any) {
    return html`
      <form method="post" action="wc/v3/customers" @submit=${(event: SubmitEvent) => this.updateShippingAddress(event)}>
        <fieldset>
          <legend>Edit Shipping Address</legend>
          <div class="columns two">
            <kemet-field label="First Name">
              <kemet-input slot="input" name="shipping_first_name" rounded value=${address.first_name || ''}></kemet-input>
            </kemet-field>
            <kemet-field label="Last Name">
              <kemet-input slot="input" name="shipping_last_name" rounded value=${address.last_name || ''}></kemet-input>
            </kemet-field>
          </div>
          <kemet-field label="Company">
            <kemet-input slot="input" name="shipping_company" rounded value=${address.company || ''}></kemet-input>
          </kemet-field>
          <kemet-field label="Address">
            <kemet-input slot="input" name="shipping_address_1" rounded value=${address.address_1 || ''}></kemet-input>
          </kemet-field>
          <kemet-field label="Address Line 2">
            <kemet-input slot="input" name="shipping_address_2" rounded value=${address.address_2 || ''}></kemet-input>
          </kemet-field>
          <div class="columns three">
            <kemet-field label="City">
              <kemet-input slot="input" name="shipping_city" rounded value=${address.city || ''}></kemet-input>
            </kemet-field>
            <kemet-field label="State">
              <kemet-select slot="input" name="shipping_state" rounded>
                ${usStates.map(state => html`
                  <kemet-option value=${state.value} label=${state.label} ?selected=${address.state === state.value}></kemet-option>
                `)}
              </kemet-select>
            </kemet-field>
            <kemet-field label="Zipcode">
              <kemet-input slot="input" name="shipping_postcode" rounded value=${address.postcode || ''}></kemet-input>
            </kemet-field>
          </div>
          <kemet-field label="Country">
            <kemet-input slot="input" name="shipping_country" rounded value=${address.country || 'US'}></kemet-input>
          </kemet-field>
          <br /><hr /><br />
          <div class="form-actions">
            <kemet-button type="submit">
              Save Shipping Address <kemet-icon slot="right" icon="check"></kemet-icon>
            </kemet-button>
            <kemet-button @click=${() => this.isEditingShipping = false} variant="outline">
              Cancel
            </kemet-button>
          </div>
        </fieldset>
      </form>
    `;
  }

  async updateBillingAddress(event: SubmitEvent) {
    event.preventDefault();

    if (!this.userController.data.user.user_id) {
      return;
    }

    const formData = new FormData(this.billingForm) as any;
    const billingData = Object.fromEntries(formData);

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userController.data.user.token}`
      },
      body: JSON.stringify({
        billing: {
          first_name: billingData.billing_first_name,
          last_name: billingData.billing_last_name,
          company: billingData.billing_company,
          address_1: billingData.billing_address_1,
          address_2: billingData.billing_address_2,
          city: billingData.billing_city,
          state: billingData.billing_state,
          postcode: billingData.billing_postcode,
          country: billingData.billing_country,
          email: billingData.billing_email,
          phone: billingData.billing_phone
        }
      })
    };

    try {
      const response = await fetch(`/api/customer/${this.userController.data.user.user_id.toString()}`, options);
      const result = await response.json();

      if (response.ok) {
        this.userController.actions?.updateAddresses({
          ...this.userController.data.addresses,
          billing: result.billing
        });
        this.isEditingBilling = false;
        this.alertController.actions?.setConfig({
          status: 'success',
          message: 'Billing address updated successfully',
          opened: true,
          icon: 'check-circle',
        });
      } else {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: result.message || 'Failed to update billing address',
          opened: true,
          icon: 'exclamation-circle',
        });
      }
    } catch (error) {
      console.error('Error updating billing address:', error);
      this.alertController.actions?.setConfig({
        status: 'error',
        message: 'An error occurred while updating the billing address',
        opened: true,
        icon: 'exclamation-circle',
      });
    }
  }

  async updateShippingAddress(event: SubmitEvent) {
    event.preventDefault();

    if (!this.userController.data.user.user_id) {
      return;
    }

    const formData = new FormData(this.shippingForm) as any;
    const shippingData = Object.fromEntries(formData);

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userController.data.user.token}`
      },
      body: JSON.stringify({
        shipping: {
          first_name: shippingData.shipping_first_name,
          last_name: shippingData.shipping_last_name,
          company: shippingData.shipping_company,
          address_1: shippingData.shipping_address_1,
          address_2: shippingData.shipping_address_2,
          city: shippingData.shipping_city,
          state: shippingData.shipping_state,
          postcode: shippingData.shipping_postcode,
          country: shippingData.shipping_country
        }
      })
    };

    try {
      const response = await fetch(`/api/customer/${this.userController.data.user.user_id.toString()}`, options);
      const result = await response.json();

      if (response.ok) {
        this.userController.actions?.updateAddresses({
          ...this.userController.data.addresses,
          shipping: result.shipping
        });
        this.isEditingShipping = false;
        this.alertController.actions?.setConfig({
          status: 'success',
          message: 'Shipping address updated successfully',
          opened: true,
          icon: 'check-circle',
        });
      } else {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: result.message || 'Failed to update shipping address',
          opened: true,
          icon: 'exclamation-circle',
        });
      }
    } catch (error) {
      console.error('Error updating shipping address:', error);
      this.alertController.actions?.setConfig({
        status: 'error',
        message: 'An error occurred while updating the shipping address',
        opened: true,
        icon: 'exclamation-circle',
      });
    }
  }
}
