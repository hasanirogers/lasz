import { html, unsafeCSS, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './styles.css?inline';
import sharedStyles from '../../shared/styles.css?inline';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('lasz-product')
export class LaszProduct extends LitElement {
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)]

  @property({ type: String })
  data: string = '';

  @property({ type: Object })
  product: any = {};

  firstUpdated() {
    this.product = JSON.parse(this.data);
    console.log('Product Data after parse:', this.product);
  }

  render() {
    return html`
      ${this.product.on_sale ? html`<kemet-badge rounded="lg">Sale</kemet-badge>` : null}
      ${this.product.images?.length > 0
        ? html`<a href=${`/product/${this.product.slug}`}><img src=${this.product.images[0].src} alt=${this.product.name} /></a>`
        : null
      }
      <h3>${unsafeHTML(this.product.name)}</h3>
      <p>${unsafeHTML(this.product.price_html)}</p>
      <kemet-button rounded="lg" link=${`/product/${this.product.slug}`}>View Product</kemet-button>
    `;
  }
}
