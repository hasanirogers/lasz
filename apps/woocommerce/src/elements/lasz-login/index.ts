import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ZustandController } from '../../controllers/zustand';
import type HTMLKemetInputElement from 'kemet-ui/elements/input.d.ts';
import userStore, { type IUserStore } from '../../stores/user';
import alertStore, { type IAlertStore } from '../../stores/alert';

import 'kemet-ui/elements/tabs';
import 'kemet-ui/elements/tab';
import 'kemet-ui/elements/tab-panel';

import styles from './styles.css?inline';


export interface ICredentials {
  username: string;
  password: string;
}

const API_URL = import.meta.env.PUBLIC_API_URL;

@customElement('lasz-login')
export class LaszLogin extends LitElement {
  static styles = [unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
   //
  }, {
    updateProfile: IUserStore['updateProfile'],
    login: IUserStore['login'],
  }>

  private alertController: ZustandController<IAlertStore, {
    config: IAlertStore['config'],
  }, {
    setConfig: IAlertStore['setConfig'],
  }>

  @state()
  forgotStatus: string = '';

  @state()
  resetEmail: string = '';

  @state()
  resetPassword: string = '';

  @query('form#login')
  loginForm!: HTMLFormElement;

  @query('form#register')
  registerForm!: HTMLFormElement;

  @query('form#resetpass')
  resetForm!: HTMLFormElement;

  @query('form#setpass')
  setPasswordForm!: HTMLFormElement;

  @query('[name=username]')
  loginUsername!: HTMLKemetInputElement;

  @query('[name=password]')
  loginPassword!: HTMLKemetInputElement;

  @query('form[action*=jwt-auth] kemet-button')
  loginButton!: HTMLElement;

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        //
      }),
      (state) => ({
        updateProfile: state.updateProfile,
        login: state.login
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

  render() {
    return html`
      <kemet-card>
        <kemet-tabs placement="bottom" divider>
          <kemet-tab slot="tab">Login</kemet-tab>
          <kemet-tab slot="tab">Register</kemet-tab>
          <kemet-tab slot="tab">Forgot Password</kemet-tab>
          <kemet-tab-panel slot="panel">
            <form id="login" @submit=${(event: SubmitEvent) => this.handleLogin(event)} novalidate>
              <p>
                <kemet-field label="Username">
                  <kemet-input required slot="input" name="username" rounded validate-on-blur></kemet-input>
                </kemet-field>
              </p>
              <p>
                <kemet-field label="Password">
                  <kemet-input required slot="input" type="password" name="password" validate-on-blur></kemet-input>
                </kemet-field>
              </p>
              <br />
              <kemet-button>
               Login <kemet-icon slot="right" icon="chevron-right"></kemet-icon>
              </kemet-button>
            </form>
          </kemet-tab-panel>
          <kemet-tab-panel slot="panel">
            <form id="register" @submit=${(event: SubmitEvent) => this.handleRegistration(event)} novalidate>
              <kemet-field slug="user_email" label="Email" message="A valid email is required">
                <kemet-input required slot="input" name="user_email" type="email" validate-on-blur></kemet-input>
              </kemet-field>
              <br />
              <kemet-field slug="user_pass" label="New Password" status="standard">
                <kemet-input slot="input" type="password" name="user_pass" status="standard"></kemet-input>
                <kemet-password slot="component" message="Please make sure you meet all the requirements."></kemet-password>
              </kemet-field>
              <br />
              <kemet-button>
                Register <kemet-icon slot="right" icon="chevron-right"></kemet-icon>
              </kemet-button>
            </form>
          </kemet-tab-panel>
          <kemet-tab-panel slot="panel">
            ${this.makeForgotPassword()}
          </kemet-tab-panel>
        </kemet-tabs>
      </kemet-card>
    `
  }

  handleLogin(event: SubmitEvent) {
    event.preventDefault();

    const credentials = {
      username: this.loginUsername.value,
      password: this.loginPassword.value,
    };

    this.fetchLogin(credentials);
  }

  fetchLogin(credentials: ICredentials) {
    const options = {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' }
    };

    fetch(`/api/user/token`, options)
      .then(response => response.json())
      .then(async response => {
        // bad access
        if (response.data?.status === 403) {
          console.log('bad access');
          this.alertController.actions?.setConfig({
            status: 'error',
            message: response.message,
            opened: true,
            icon: 'exclamation-circle'
          });
        }

        // success
        if (response.token) {
          const options = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${response.token}`
            }
          };
          const userProfile = await fetch(`/api/user/${response.user_id.toString()}`, options).then((response) => response.json());
          this.userController.actions?.updateProfile(userProfile);
          this.userController.actions?.login(response);
          window.location.href = '/account';
        }

        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'There was a problem logging you in. Check your credentials and try again.',
          opened: true,
          icon: 'exclamation-circle'
        });
      })
      .catch(() => {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'There was an unknown problem while logging you in.',
          opened: true,
          icon: 'exclamation-circle'
        });
      });
  }

  handleRegistration(event: SubmitEvent) {
    event.preventDefault();

    const formData = new FormData(this.registerForm) as any;
    formData.append('user_name', formData.get('user_email'));

    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
    };

    fetch(`/api/user/register`, options)
      .then(response => response.json())
      .then((responseData) => {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'An error was encountered while registering.',
          opened: true,
          icon: 'exclamation-circle'
        });

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
          const credentials = {
            username: responseData.data['user_name'],
            password: responseData.data['user_pass'],
          }

          this.fetchLogin(credentials);
        }
      })
      .catch(() => {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'There was an unknown problem while registering.',
          opened: true,
          icon: 'exclamation-circle'
        });
      });
  }

  handleResetPassword(event: SubmitEvent) {
    event.preventDefault();

    const formData = new FormData(this.resetForm) as any;
    this.resetEmail = formData.get('email');

    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
    };

    fetch(`/api/user/resetpass`, options)
      .then(response => response.json())
      .then((responseData) => {
        if (responseData.data.status === 200) {
          this.forgotStatus = 'enter-code';
        } else {
          this.alertController.actions?.setConfig({
            status: 'error',
            message: unsafeHTML(responseData.message) || 'An unknown problem has occurred.',
            opened: true,
            icon: 'exclamation-circle'
          });
        }
      })
      .catch(() => {
        this.alertController.actions?.setConfig({
          status: 'error',
          message: 'There was an unknown problem while resetting your password.',
          opened: true,
          icon: 'exclamation-circle'
        });
      });
  }

  handleSetPassword(event: SubmitEvent) {
    event.preventDefault();

    const formData = new FormData(this.setPasswordForm) as any;
    this.resetPassword = formData.get('password');

    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
    };


    fetch(`/api/user/setpass`, options)
      .then(response => response.json())
      .then((responseData) => {
        if (responseData.data?.status === 200) {
          const credentials = {
            username: this.resetEmail,
            password: this.resetPassword
          }
          console.log('credentails', credentials);

          this.alertController.actions?.setConfig({
            status: 'success',
            message: responseData.message,
            opened: true,
            icon: 'check-circle'
          });

          setTimeout(() => this.fetchLogin(credentials), 1000 * 3);
        } else {
          this.alertController.actions?.setConfig({
            status: 'error',
            message: responseData.message || 'An unknown problem has occurred.',
            opened: true,
            icon: 'exclamation-circle'
          });

          if (responseData.message.indexOf('You must request a new code.') > -1) {
            this.forgotStatus = 'resend';
          }
        }
      });
  }

  makeForgotPassword() {
    if (this.forgotStatus === 'enter-code') {
      return html`
        <form id="setpass" @submit=${(event: SubmitEvent) => this.handleSetPassword(event)} novalidate>
          <kemet-input name="email" type="hidden" value=${this.resetEmail}></kemet-input>
          <br />
          <kemet-field slug="code" label="Enter the code your received via email" message="A code is required">
            <kemet-input required slot="input" name="code" type="password" validate-on-blur></kemet-input>
          </kemet-field>
          <br />
          <kemet-field slug="password" label="New Password">
            <kemet-input slot="input" type="password" name="password"></kemet-input>
            <kemet-password slot="component" message="Please make sure you meet all the requirements."></kemet-password>
          </kemet-field>
          <br />
          <kemet-button>
            Set Password <kemet-icon slot="right" icon="chevron-right"></kemet-icon>
          </kemet-button>
        </form>
      `;
    }

    if (this.forgotStatus === 'success') {
      return html`
        <p>You've successfully reset your password!</p>
      `;
    }

    return html`
      <form id="resetpass" @submit=${(event: SubmitEvent) => this.handleResetPassword(event)}>
        <kemet-field slug="email" label="Email" message="A valid email is required">
          <kemet-input required slot="input" name="email" type="email"></kemet-input>
        </kemet-field>
        <br />
        <kemet-button>
          Reset Password <kemet-icon slot="right" icon="chevron-right"></kemet-icon>
        </kemet-button>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lasz-login': LaszLogin
  }
}
