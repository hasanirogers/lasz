import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import profileStore from '../../stores/profile';
import modalsStore from '../../stores/modals';
import appStore from '../../stores/app';

@customElement('todo-login-button')
export class TodoLoginButton extends LitElement {
  @state()
  private appState = new ZustandController(
    this,
    appStore,
    (state) => ({ supabaseConfigured: state.supabaseConfigured })
  );

  @state()
  private loginState = new ZustandController(
    this,
    profileStore,
    (state) => ({ isLoggedIn: state.isLoggedIn }),
    (state) => ({ logout: state.logout })
  );

  @state()
  private modalState = new ZustandController(
    this,
    modalsStore,
    (state) => ({ signInOpened: state.signInOpened }),
    (state) => ({ setSignInOpened: state.setSignInOpened })
  );

  render() {
    return this.appState.data.supabaseConfigured
      ? html`
        <kemet-fab pill @click=${() =>this.handleClick()} tabindex="0" role="button">
          <kemet-icon-bootstrap slot="icon" icon="door-open-fill"></kemet-icon-bootstrap>
          ${this.loginState.data.isLoggedIn ? 'Logout' : 'Login'}
        </kemet-fab>`
      : null;
  }

  private handleClick() {
    if (this.loginState.data.isLoggedIn) {
      this.loginState.actions && this.loginState.actions.logout();
    } else {
      this.showModal();
    }
  }

  showModal() {
    this.modalState.actions && this.modalState.actions.setSignInOpened(!this.modalState.data.signInOpened);
  }
}
