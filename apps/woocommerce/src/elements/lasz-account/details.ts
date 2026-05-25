import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import userStore, { type IUserStore } from '../../stores/user';
import alertStore, { type IAlertStore } from '../../stores/alert';
import styles from './details.css?inline';

import type HTMLKemetInputElement from 'kemet-ui/elements/input.d.ts';

const API_URL = import.meta.env.PUBLIC_API_URL;

@customElement('lasz-account-details')
export class LaszAccountDetails extends LitElement {
  static styles = [unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
    user: IUserStore['user'],
    profile: IUserStore['profile'],
  }, {
    updateProfile: IUserStore['updateProfile'],
  }>;

  private alertController: ZustandController<IAlertStore, {
    config: IAlertStore['config'],
  }, {
    setConfig: IAlertStore['setConfig'],
  }>;

  @query('form[action*=user]')
  userForm!: HTMLFormElement;

  @query('form[action*=change-password]')
  changePasswordForm!: HTMLFormElement;

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        user: state.user,
        profile: state.profile,
      }),
      (state) => ({
        updateProfile: state.updateProfile,
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
    return html`
      <h2>Account Details</h2>
      <section>
        <form method="post" action="wp-json/wp/v2/users" @submit=${(event: SubmitEvent) => this.updateProfile(event)}>
          <fieldset>
            <legend>Your Profile</legend>
            <div>
              <p>
                <kemet-field label="First Name">
                  <kemet-input slot="input" name="first_name" rounded value=${this.userController.data?.profile?.first_name}></kemet-input>
                </kemet-field>
              </p>
              <p>
                <kemet-field label="Last Name">
                  <kemet-input slot="input" name="last_name" rounded value=${this.userController.data?.profile?.last_name}></kemet-input>
                </kemet-field>
              </p>
              <p>
                <kemet-field label="Email">
                  <kemet-input slot="input" name="email" rounded value=${this.userController.data?.profile?.email}></kemet-input>
                </kemet-field>
              </p>
            </div>
            <br /><hr /><br />
            <kemet-button rounded="lg">
              Update Profile <kemet-icon slot="right" icon="chevron-right"></kemet-icon>
            </kemet-button>
          </fieldset>
        </form>

        <form method="post" action="wp-json/bob/v1/change-password" @submit=${(event: SubmitEvent) => this.changePassword(event)}>
          <fieldset>
            <legend>Change Password</legend>
            <p>
              <kemet-field label="Current Password">
                <kemet-input required slot="input" type="password" name="current_password" validate-on-blur></kemet-input>
              </kemet-field>
            </p>
            <p>
              <kemet-field slug="new_password" label="New Password">
                <kemet-input slot="input" type="password" name="new_password" required validate-on-blur></kemet-input>
                <kemet-password slot="component" message="Please make sure you meet all the requirements."></kemet-password>
              </kemet-field>
            </p>
            <p>
              <kemet-field label="Confirm Password">
                <kemet-input required slot="input" type="password" name="confirm_password" validate-on-blur></kemet-input>
              </kemet-field>
            </p>
            <br /><hr /><br />
            <kemet-button rounded="lg">
              Change Password <kemet-icon slot="right" icon="chevron-right"></kemet-icon>
            </kemet-button>
          </fieldset>
        </form>
      </section>
    `;
  }

  async updateProfile(event: SubmitEvent) {
    event.preventDefault();

    if (!this.userController.data.user.user_id) {
      return;
    }

    const formData = new FormData(this.userForm) as any;

    const options = {
      method: this.userForm.getAttribute('method')?.toUpperCase() || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userController.data.user.token}`
      },
      body: JSON.stringify(Object.fromEntries(formData))
    };

    const endpoint = this.userForm.getAttribute('action');

    const profile = await fetch(`${API_URL}/${endpoint}/${this.userController.data.user.user_id.toString()}?context=edit`, options)
      .then((response) => response.json())
      .catch((error) => console.error(error));

    this.userController.actions?.updateProfile({
      ...profile,
      ...Object.fromEntries(formData)
    });
  }

  changePassword(event: SubmitEvent) {
    event.preventDefault();

    setTimeout(async () => {
      const fields = this.changePasswordForm.querySelectorAll('kemet-input');
      const hasErrors = Array.from(fields).some((field) => field.status === 'error');

      const currentPasswordInput = this.changePasswordForm.querySelector('[name="current_password"]') as HTMLKemetInputElement;
      const newPasswordInput = this.changePasswordForm.querySelector('[name="new_password"]') as HTMLKemetInputElement;
      const confirmPasswordInput = this.changePasswordForm.querySelector('[name="confirm_password"]') as HTMLKemetInputElement;

      if (hasErrors) {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'Please correct any errors in the fields.',
          opened: true,
          icon: 'exclamation-circle',
        });
        return;
      }

      if (newPasswordInput.value !== confirmPasswordInput.value) {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'Your passwords do not match.',
          opened: true,
          icon: 'exclamation-circle',
        });
        return;
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userController.data.user.token}`
        },
        body: JSON.stringify({
          user_id: this.userController.data.user.user_id,
          current_password: currentPasswordInput.value,
          new_password: newPasswordInput.value,
        })
      }

      await fetch(`${API_URL}/wp-json/lasz-woocommerce/v1/change-password`, options)
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.status === 'error') {
            this.alertController.actions?.setConfig({
              status: responseData.status,
              message: responseData.message,
              icon: 'exclamation-circle',
              opened: true
            });
          } else {
            this.alertController.actions?.setConfig({
              status: responseData.status,
              message: responseData.message,
              icon: 'check-circle',
              opened: true
            });
          }
        })
        .catch((error) => console.error(error));
    }, 1);
  }
}
