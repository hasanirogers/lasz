import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import modalsStore from '../../stores/modals';
import styles from './todo-modals.css?inline';

// only load these design system elements here
import 'kemet-ui/elements/modal';
import 'kemet-ui/elements/modal-close';

// this element is only needed here
import '../todo-login-form/todo-login-form';

@customElement('todo-modals')
export class TodoModals extends LitElement {
  static styles = [unsafeCSS(styles)];

  @state()
  private modalsState = new ZustandController(
    this,
    modalsStore,
    (state) => ({ signInOpened: state.signInOpened })
  )

  render() {
    // the ? in front of opened is a boolean attribute binding,
    // it will only render the attribute if the value is true
    return html`
      <kemet-modal ?opened=${this.modalsState.data.signInOpened} rounded="xl" close-on-click>
        <kemet-modal-close tabindex="0" role="button" aria-label="Close Button">
          <kemet-icon-bootstrap icon="x-lg" size="24"></kemet-icon-bootstrap>
        </kemet-modal-close>
        <section>
          <h2>Login</h2>
          <p>If you login your todos will be saved your profile!</p>
          <todo-login-form></todo-login-form>
        </section>
      </kemet-modal>
    `;
  }
}
