import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import todoStore from '../../stores/todo';
import profileStore from '../../stores/profile';
import styles from './todo-input.css?inline';
import { saveTodos } from '../../shared/crud';

@customElement('todo-input')
export class TodoInput extends LitElement {
  static styles = [unsafeCSS(styles)];

  @state()
  private todoState = new ZustandController(
    this,
    todoStore,
    (state) => ({ list: state.todoList }), // only select what you use
    (state) => ({ add: state.addTodo }) // addToto becomes "add" in actions via the reactive controller
  );

  @state()
  private profileState = new ZustandController(
    this,
    profileStore,
    (state) => ({ id: state.profile.id, isLoggedIn: state.isLoggedIn }), // only select what you use
  );

  @property()
  label: string = 'Add';

  @query('input')
  todoInput!: HTMLInputElement;

  render() {
    return html`
      <label>
        Enter a todo below
        <div>
          <input name="todo" />
          <button @click=${() => this.handleClick()}>${this.label}</button>
        </div>
      </label>
    `;
  }

  private handleClick() {
    this.todoState.actions &&
      this.todoState.actions.add({
        value: this.todoInput.value,
        checked: false,
      });

    this.profileState.data.isLoggedIn && saveTodos({
      id: this.profileState.data.id,
      todos: this.todoState.data.list,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-input': TodoInput;
  }
}
