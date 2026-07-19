import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './styles.css?inline';

@customElement('lasz-stack')
export default class LaszStack extends LitElement {
  static styles = [unsafeCSS(styles)];

  @property()
  selected: number = 0;

  render() {
    return html`
      <button ?selected=${this.selected === 0} @click=${() => (this.selected = 0)}><span>L</span>it</button>
      <button ?selected=${this.selected === 1} @click=${() => (this.selected = 1)}><span>A</span>stro</button>
      <button ?selected=${this.selected === 2} @click=${() => (this.selected = 2)}><span>S</span>ystem</button>
      <button ?selected=${this.selected === 3} @click=${() => (this.selected = 3)}><span>Z</span>ustand</button>
      <div>
        ${this.makeDescription()}
      </div>
    `;
  }

  makeDescription() {
    const descriptions = [
      'Lit is a simple library for building fast, scalable UI elements.',
      'Astro is an meta framework for building fast, scalable apps and websites.',
      'LASZ can integrate with popular backend systems like Supabase or WooCommerce.',
      'Zustand is a state management solution that can work with Lit elements.'
    ];

    return html`
      <lasz-description>
        <p>
          <img src=${this.makeImageLogo()} alt="Lasz Logo" width="148" height="148" />
        </p>
        ${descriptions[this.selected]}
      </lasz-description>
    `;
  }

  makeImageLogo() {
    const logos = [
      '/logos/lit.svg',
      '/logos/astro.svg',
      '/logos/system.png',
      '/logos/zustand.svg'
    ];
    return logos[this.selected];
  }
}
