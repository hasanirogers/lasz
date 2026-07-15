import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import alertStore from '../../stores/alert';
import styles from './todo-login-form.css?inline';
import sharedStyles from '../../shared/styles.css?inline';
import type KemetInput from 'kemet-ui/elements/input.mjs';

import 'kemet-ui/elements/input';
import 'kemet-ui/elements/field';
import { ZustandController } from '../../controllers/zustand';

@customElement('todo-login-form')
export default class TodoLoginForm extends LitElement {
  static styles = [unsafeCSS(styles), unsafeCSS(sharedStyles)];

  @state()
  success: boolean | null = null;

  @state()
  disabled: boolean = false;

  @state()
  alertState = new ZustandController(
    this,
    alertStore,
    () => ({}),
    (state) => ({ setConfig: state.setConfig })
  );

  @query('form[action*=auth]')
  loginForm!: HTMLFormElement;

  @query('[name=identifier]')
  loginIdentifier!: KemetInput;

  render() {
    return html`
      <section>
        ${this.success ? html`
          <kemet-alert opened filled status="success">
            <kemet-icon-bootstrap icon="check-lg" size="32"></kemet-icon-bootstrap>
            <h3>Check your email for a magic link to login.</h3>
          </kemet-alert>
        ` : null}
        <form method="post" action="api/auth/login" @submit=${(event: SubmitEvent) => this.handleLogin(event)} novalidate>
          <kemet-field label="Enter your email">
            <kemet-input required slot="input" name="identifier" ?disabled=${this.disabled} rounded filled></kemet-input>
          </kemet-field>
          <div>
            <kemet-button rounded ?disabled=${this.disabled}>
              Get login link via email <kemet-icon-bootstrap slot="right" icon="chevron-right"></kemet-icon-bootstrap>
            </kemet-button>
          </div>
        </form>
      </section>
    `
  }

  handleLogin(event: SubmitEvent) {
    event.preventDefault();
    this.disabled = true;
    this.fetchLogin(this.loginIdentifier.value);
  }

  fetchLogin(identifier: string) {
    const options = {
      method: this.loginForm.getAttribute('method')?.toUpperCase(),
      body: JSON.stringify({ identifier }),
      headers: { 'Content-Type': 'application/json' }
    };

    const endpoint = this.loginForm.getAttribute('action');

    fetch(`/${endpoint}`, options)
      .then(response => response.json())
      .then(async response => {
        // bad access
        if (response.error) {
          this.alertState.actions && this.alertState.actions.setConfig({
            status: 'error',
            message: response.message,
            opened: true,
            icon: 'exclamation-circle'
          });
          this.disabled = false;
          return;
        }

        // success
        this.success = true;
      });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-login-form': TodoLoginForm
  }
}
