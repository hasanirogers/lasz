import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import todoStore from '../../stores/todo';
import profileStore from '../../stores/profile';

import styles from './todo-footer.css?inline';
import { saveTodos } from '../../shared/crud';


@customElement('todo-footer')
export class TodoFooter extends LitElement {
  static styles = [unsafeCSS(styles)];

  // use zustand controller to automate subcribe/unsubscribe which prevents memory leaks
  @state()
  private todoState = new ZustandController(
    this,
    todoStore,
    (state) => ({ list: state.todoList }),
    (state) => ({ removeAll: state.removeTodoAll }) // addToto becomes "add" in actions via the reactive controller
  );

  @state()
  private profileState = new ZustandController(
    this,
    profileStore,
    (state) => ({
      email: state.profile.email,
      id: state.profile.id,
      isLoggedIn: state.isLoggedIn
    })
  );

  @property()
  label: string = 'Add';

  @query('input')
  todoInput!: HTMLInputElement;

  render() {
    return html`
      ${this.makeSignedInText()}
      <footer>
        <span>Total Todos: <strong>${this.todoState.data.list.length}</strong></span>
        <kemet-button rounded @click=${() => this.handleClearAll()}>Clear All</kemet-button>
      </footer>
    `
  }

  private handleClearAll() {
    this.todoState.actions && this.todoState.actions.removeAll();
    this.profileState.data.isLoggedIn && saveTodos({
      id: this.profileState.data.id,
      todos: this.todoState.data.list,
    });
  }

  private makeSignedInText() {
    if (!this.profileState.data.email) {
      return null;
    }
    return html`Signed in as <strong>${this.profileState.data.email}</strong>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-footer': TodoFooter
  }
}
