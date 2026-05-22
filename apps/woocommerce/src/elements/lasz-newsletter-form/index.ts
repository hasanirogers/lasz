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
            name="firstName"
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
    const firstName = formData.get('firstName');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName || undefined,
          lists: [1] // Replace with actual MailPoet list ID
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
