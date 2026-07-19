import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import appStore, { type AppStore } from '../../stores/app';
import { ZustandController } from '../../controllers/zustand';

import type HTMLKemetInputElement from 'kemet-ui/elements/input.d.ts';
import type HTMLKemetDrawerElement from 'kemet-ui/elements/drawer.d.ts';

import styles from './styles.css?inline';

import '../lasz-hamburger';

@customElement('lasz-nav-top')
export default class LaszNavTop extends LitElement {
  static styles = [unsafeCSS(styles)];

  private appController: ZustandController<AppStore, {
    isMobile: AppStore['isMobile'];
  }, {}>;

  @property({ type: String })
  home?: String;

  @property()
  logo?: String;

  @property()
  name?: String;

  @property()
  logout?: String;

  @property({ type: Boolean, reflect: true, attribute: 'logged-in' })
  logged?: Boolean;

  @query('kemet-input')
  input?: HTMLKemetInputElement;

 constructor() {
    super();
    this.appController = new ZustandController(
      this,
      appStore,
      (state) => ({ isMobile: state.isMobile }),
    );
  }

	render() {
    console.log(this.appController.data.isMobile);
		return html`
      ${this.makeButton()}
      <div>
        <slot></slot>
        <form>
          <kemet-input type="search" filled placeholder="Search for products!" @keypress=${(event: any) => this.handleKeyPress(event)}>
            <kemet-icon-bootstrap icon="search" slot="left"></kemet-icon-bootstrap>
          </kemet-input>
          <kemet-button variant="outlined" @click=${(event: any) => this.handleSearch(event)}>
            Go
            <kemet-icon-bootstrap slot="right" icon="chevron-right"></kemet-icon-bootstrap>
          </kemet-button>
        </form>
      </div>
    `;
	}

  handleSearch(event: any) {
    event.preventDefault();
    window.location.href = `${window.location.origin}/search?query=${encodeURI(this.input?.value || '')}`;
  }

  handleKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.handleSearch(event);
    }
  }

  makeButton() {
    if (this.appController.data.isMobile) {
      return html`<lasz-hamburger></lasz-hamburger>`;
    }
  }

  toggleDrawer() {
    const drawer = document.querySelector('kemet-drawer') as HTMLKemetDrawerElement;
    drawer.opened = !drawer.opened;
  }
}
