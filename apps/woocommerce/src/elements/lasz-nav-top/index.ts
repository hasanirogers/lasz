import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type HTMLKemetInputElement from 'kemet-ui/elements/input.d.ts';
import type HTMLKemetDrawerElement from 'kemet-ui/elements/drawer.d.ts';
import styles from './styles.css?inline';

@customElement('lasz-nav-top')
export default class LaszNavTop extends LitElement {
  static styles = [unsafeCSS(styles)];

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

	render() {
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
    window.location.href = `${window.location.origin}/?s=${encodeURI(this.input?.value || '')}&post_type=product`;
  }

  handleKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.handleSearch(event);
    }
  }

  makeButton() {
    if (window.matchMedia('screen and (max-width: 767px)').matches) {
      return html`
        <button @click="${() => this.toggleDrawer()}">
          <kemet-icon-bootstrap icon="list" size="32"></kemet-icon-bootstrap>
        </button>
      `;
    }
  }

  toggleDrawer() {
    const drawer = document.querySelector('kemet-drawer') as HTMLKemetDrawerElement;
    drawer.opened = !drawer.opened;
  }
}
