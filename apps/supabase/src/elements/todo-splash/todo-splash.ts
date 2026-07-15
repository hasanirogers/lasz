import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './todo-splash.css?inline';

@customElement('todo-splash')
export class TodoSplash extends LitElement {
  static styles = [unsafeCSS(styles)]

  @property({ type: Boolean, reflect: true })
  show: boolean = true;

  firstUpdated() {
    setTimeout(() => {
      this.show = false;
    }, 1200);
  }

  render() {
    return html`
      <img src="/logo.webp" width="512" height="545" alt="LASZ stack logo" fetchpriority="high" preload="auto" />
      <div>A LASZ stack app</div>
    `;
  }
}
