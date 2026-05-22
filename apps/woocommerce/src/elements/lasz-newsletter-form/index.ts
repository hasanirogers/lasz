import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './style.css?inline';

@customElement('lasz-newsletter-form')
export default class LaszNewsletterForm extends LitElement {
  static styles = [unsafeCSS(styles)];

  @property({ type: String, reflect: true })
  status: 'success' | 'error' | '' = '';

  @state()
  private message: string = '';

  render() {
    return html`
      <form method="POST" @submit=${this.handleSubmit} novalidate>
        <kemet-field slug="email" label="Your Email">
          <kemet-input
            slot="input"
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            validate-on-blur
          />
        </kemet-field>
        <kemet-field slug="firstname" label="Your First Name">
          <kemet-input
            slot="input"
            type="text"
            name="firstname"
            placeholder="Enter your first name"
            required
            validate-on-blur
          />
        </kemet-field>
        <kemet-button type="submit" rounded="lg">
          Subscribe
        </kemet-button>
        <div>${this.message}</div>
      </form>
    `;
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email');
    const firstname = formData.get('firstname');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstname: firstname || undefined,
        })
      });

      const result = await response.json();

      if (result.success) {
        this.message = 'Successfully subscribed!';
        this.status = 'success';
        form.reset();
      } else {
        this.message = result.errors?.join(', ') || 'Subscription failed';
        this.status = 'error';
      }
    } catch (error) {
      this.message = 'Network error. Please try again.';
      this.status = 'error';
    }
  }
}
