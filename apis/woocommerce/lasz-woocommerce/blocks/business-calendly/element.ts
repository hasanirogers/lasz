import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import styles from './element.css?inline';

@customElement('business-calendly')
class BusinessCalendly extends LitElement {
  static styles = [unsafeCSS(styles)];

  static properties = {
    url: { type: String },
    height: { type: String },
    minWidth: { type: String, attribute: 'min-width' },
    mode: { type: String }
  };

  url: string | null = null;
  height: string | null = null;
  minWidth: string | null = null;
  mode: 'edit' | 'save' = 'save';

  connectedCallback() {
    super.connectedCallback();

    if (!this.url) return;

    if (!document.querySelector(`script[src="https://assets.calendly.com/assets/external/widget.js"]`)) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  createRenderRoot() {
    if (this.mode === 'edit') {
      // if in edit use shadow DOM like normal
      return super.createRenderRoot();
    }

    // the calendly widget requires html rendered in the light DOM
    return this;
  }

  render() {
    if (this.mode === 'edit') {
      return html`
        <p>Business Calendly in editor mode.</p>
      `;
    }

    return html`<div class="calendly-inline-widget" data-url="${this.url}" style="min-width:${this.minWidth}; height:${this.height};"></div>`;
  }
}

export default BusinessCalendly;
