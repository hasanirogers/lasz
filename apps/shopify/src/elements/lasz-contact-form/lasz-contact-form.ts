// src/components/contact-form.ts
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { actions } from 'astro:actions';
import styles from './lasz-contact-forrm.css?inline'

@customElement('lasz-contact-form')
export class LaszContactForm extends LitElement {
  @state() private status: string = '';

  static styles = [unsafeCSS(styles)];

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <div class="field-hidden" aria-hidden="true">
          <input type="text" name="fax_number" tabindex="-1" autocomplete="off" />
        </div>

        <input name="name" placeholder="Your Name" required />
        <input name="email" type="email" placeholder="Email Address" required />
        <textarea name="message" placeholder="Message" required></textarea>

        <button type="submit">Send</button>
        <p>${this.status}</p>
      </form>
    `;
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    const { error } = await actions.sendContactForm(data as any);

    if (error) {
      this.status = 'Submission failed. Please try again.';
    } else {
      this.status = 'Thank you! We received your message.';
      (event.target as HTMLFormElement).reset();
    }
  }
}
