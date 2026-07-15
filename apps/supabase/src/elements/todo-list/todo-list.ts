import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import todoStore, { type ITodoItem } from '../../stores/todo';
import profileStore from '../../stores/profile';
import styles from './todo-list.css?inline';
import { fetchTodos, saveTodos } from '../../shared/crud';

@customElement('todo-list')
export class TodoList extends LitElement {
  static styles = [unsafeCSS(styles)];

  // use zustand controller to automate subcribe/unsubscribe which prevents memory leaks
  @state()
  private todoState = new ZustandController(
    this,
    todoStore,
    (state) => ({ list: state.todoList }),
    (state) => ({
      remove: state.removeTodo,
      toggle: state.todoToggle,
      addAll: state.addTodoAll
     })
  );

  @state()
  private profileState = new ZustandController(
    this,
    profileStore,
    (state) => ({ id: state.profile.id, isLoggedIn: state.isLoggedIn })
  );

  firstUpdated() {
    this.profileState.data.isLoggedIn && fetchTodos(this.profileState.data.id);
  }

  render() {
    return this.makeTodos();
  }

  makeTodos() {
    if (this.todoState.data.list && this.todoState.data.list.length > 0) {
      const todoList = this.todoState.data.list.map((todo: ITodoItem, index: number) => html`
        <li>
          <button class="todo ${todo.checked ? 'checked' : ''}" @click=${() => this.handleChecked(index)}>${todo.value}</button>
          <button class="close" @click=${() => this.handleRemoveTodo(index)}>&times;</button>
        </li>
      `);
      return html`<ul>${todoList}</ul>`;
    }
    return html`<p>You haven't added any items yet.</p>`;
  }

  handleRemoveTodo(index: number) {
    this.todoState.actions && this.todoState.actions.remove(index);
    this.profileState.data.isLoggedIn && saveTodos({
      id: this.profileState.data.id,
      todos: this.todoState.data.list,
    });
    this.requestUpdate(); // state has been modified by lodash, so re-render
  }

  handleChecked(index: number) {
    this.todoState.actions && this.todoState.actions.toggle(index);
    this.profileState.data.isLoggedIn && saveTodos({
      id: this.profileState.data.id,
      todos: this.todoState.data.list,
    });
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-list': TodoList
  }
}
