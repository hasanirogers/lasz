import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, queryAll, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import styles from './styles.css?inline';
import sharedStyles from '../../shared/styles.css?inline';
import { ZustandController } from '../../controllers/zustand';
import cartStore, { type CartStore } from '../../stores/cart';


@customElement('lasz-product-view')
export default class LaszProductView extends LitElement {
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  @property({ type: String })
  data: string = '';

  @property({ type: Object })
  product: any = null;

  @state()
  selectedVariations: Record<string, string> = {};

  @state()
  isAddingToCart: boolean = false;

  @state()
  fieldStatus: Map<string, string> = new Map();

  @queryAll('kemet-select')
  requiredFields?: NodeListOf<HTMLElement>;

  private cartController: ZustandController<CartStore, {
    items: CartStore['items'];
    isLoading: CartStore['isLoading'];
    error: CartStore['error']
  }, {
    addToCart: CartStore['addToCart'],
    fetchCart: CartStore['fetchCart']
  }>;

  constructor() {
    super();
    this.cartController = new ZustandController(
      this,
      cartStore,
      (state) => ({
        items: state.items,
        isLoading: state.isLoading,
        error: state.error
      }),
      (state) => ({
        addToCart: state.addToCart,
        fetchCart: state.fetchCart
      })
    );
  }

  firstUpdated() {
    if (!this.product && this.data) {
      this.product = JSON.parse(this.data);
      console.log('Product data:', this.product);
    }

    // Initialize cart to get nonce
    this.cartController?.actions?.fetchCart?.();
  }

  render() {
    if (this.product) {
      return html`
        <div>
          ${this.product.images?.length > 0 ? html`<img src=${this.product.images[0].src} alt=${this.product.name} />` : null}
        </div>
        <div>
          <h2>${this.product.name}</h2>
          <h3>${unsafeHTML(this.product.price_html)}</h3>
          <p>${unsafeHTML(this.product.short_description)}</p>
          ${this.makeVariations()}
          <small>SKU: ${this.product.sku}</small>
          <div style="margin-top: 1rem;">
            ${this.makeAddToCartButton()}
            ${this.cartController?.data?.error ? html`<div style="color: red; margin-top: 0.5rem;">${this.cartController.data.error}</div>` : ''}
          </div>
        </div>
      `;
    }
    return html`<div>Loading...</div>`;
  }

  makeVariations() {
    if (this.product.variations && this.product.variations.length > 0) {
      const allAttributeNames = [...new Set(this.product.variations.flatMap((variation: any) => variation.attributes?.map((attr: any) => attr.name) || []))] as string[];
      const variationSets: Map<string, any> = new Map();

      allAttributeNames.forEach((name) => {
        const variations = this.product.variations.filter((variation: any) => variation.attributes?.some((attr: any) => attr.name === name));
        variationSets.set(name, variations);
      });

      return Array.from(variationSets.entries().map(([name, variations]) => {
        const variationLabels = variations.map((variation: any) => variation.attributes.map((attr: any) => attr.value)[0]);
        return html`
          <div>
            <kemet-field label="${name}">
              <kemet-select
                slot="input"
                name="${name.toLowerCase().replace(' ', '-')}"
                required
                @kemet-change=${(event: Event) => this.handleVariationChange(name, (event.target as HTMLSelectElement).value)}
                @kemet-status-change=${(event: CustomEvent) => this.handleVariationStatusChange(event)}
              >
                <kemet-option label="Choose ${name}"></kemet-option>
                ${variationLabels.map((label: any) => html`
                  <kemet-option
                    label="${label}"
                    value="${label.toLowerCase().replace(' ', '-')}"
                    ?selected="${this.selectedVariations[name] === label.toLowerCase().replace(' ', '-')}"
                  ></kemet-option>
                `)}
              </kemet-select>
            </kemet-field>
            <br />
          </div>
        `;
      }))
    }
    return null;
  }

  handleVariationChange(attributeName: string, value: string) {
    this.selectedVariations = {
      ...this.selectedVariations,
      [attributeName]: value
    };
  }

  handleVariationStatusChange(event: CustomEvent) {
    this.fieldStatus.set(event.detail.element.name, event.detail.status);
  }

  makeAddToCartButton() {
    const isLoading = this.cartController?.data?.isLoading || false;
    const hasVariations = this.product.variations && this.product.variations.length > 0;
    const allVariationsSelected = hasVariations &&
      Object.keys(this.selectedVariations).length === [...new Set(this.product.variations.flatMap((v: any) => v.attributes?.map((a: any) => a.name) || []))].length;

    const hasErrors = Array.from(this.fieldStatus.values()).some(status => status === 'error');
    const canAddToCart = !hasVariations || (allVariationsSelected && !hasErrors);

    return html`
      <kemet-button ?disabled=${!canAddToCart || isLoading} @click=${() => this.handleAddToCart()} rounded="lg">
        ${isLoading ? 'Adding...' : 'Add to Cart'}
      </kemet-button>
    `;
  }

  async handleAddToCart() {
    if (!this.product) return;

    this.isAddingToCart = true;

    try {
      let variationId: number | undefined;
      let variation: Array<{attribute: string, value: string}> | undefined;

      if (this.product.variations && this.product.variations.length > 0) {
        console.log('Product variations:', this.product.variations);
        console.log('Selected variations:', this.selectedVariations);

        const matchingVariation = this.findMatchingVariation();
        if (matchingVariation) {
          variationId = matchingVariation.id;
          // Use the variation attributes from the matching variation to ensure exact case match
          if (matchingVariation.attributes) {
            variation = matchingVariation.attributes.map((attr: any) => ({
              attribute: attr.name || attr.option,
              value: attr.option || attr.value
            }));
          }
          console.log('Matching variation:', matchingVariation);
          console.log('Formatted variation:', variation);
        }
      }

      await this.cartController?.actions?.addToCart(
        this.product.id,
        1,
        variationId,
        variation
      );

      // Log cart contents after adding
      if (this.cartController?.data) {
        console.log('Cart after adding item:', this.cartController.data.items);
        console.log('Cart total:', this.cartController.data.items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0));
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      this.isAddingToCart = false;
    }
  }

  findMatchingVariation() {
    if (!this.product.variations || !this.selectedVariations) return null;

    return this.product.variations.find((variation: any) => {
      if (!variation.attributes) return false;

      return variation.attributes.every((attr: any) => {
        const attributeName = attr.name;
        const attributeValue = attr.value.toLowerCase().replace(' ', '-');
        return this.selectedVariations[attributeName] === attributeValue;
      });
    });
  }
}
