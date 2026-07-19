import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ZustandController } from '../../controllers/zustand';
import appStore, { type AppStore } from '../../stores/app';

import styles from './style.css?inline';
import sharedStyles from '../../styles/shared.css?inline';

@customElement('lasz-hamburger')
export default class LaszHamburger extends LitElement {
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  private appController: ZustandController<AppStore, {
    drawerOpened: AppStore['drawerOpened'];
  }, {
    setDrawerOpened: AppStore['setDrawerOpened'],
  }>

  constructor() {
    super();
    this.appController = new ZustandController(
      this,
      appStore,
      (state) => ({ drawerOpened: state.drawerOpened }),
      (state) => ({ setDrawerOpened: state.setDrawerOpened })
    );
  }

  render() {
    return html`
      <button @click=${() => this.handleClick()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
        </svg>
      </button>
    `;
  }

  private handleClick() {
    this.appController.actions?.setDrawerOpened(!this.appController.data?.drawerOpened);
  }
}
