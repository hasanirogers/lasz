import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './style.css?inline';
import { ZustandController } from '../../controllers/zustand';
import userStore, { type IUserStore } from '../../stores/user';

@customElement('lasz-newsletter-form')
export default class LaszNewsletterForm extends LitElement {
  static styles = [unsafeCSS(styles)];

  private userController: ZustandController<IUserStore, {
    profile: IUserStore['profile'],
  }, {}>;

  @property({ type: String, reflect: true })
  status: 'success' | 'error' | '' = '';

  @state()
  private message: string = '';

  constructor() {
    super();

    this.userController = new ZustandController(
      this,
      userStore,
      (state) => ({
        profile: state.profile,
      })
    );
  }

  render() {
    return html`
      <form method="POST" @submit=${this.handleSubmit} novalidate>
        <kemet-field slug="email" label="Your Email">
          <kemet-input
            slot="input"
            type="email"
            name="email"
            rounded="lg"
            placeholder="Enter your email"
            filled
            required
            .value=${this.userController.data.profile?.email || ''}
          />
        </kemet-field>
        <kemet-field slug="firstname" label="Your First Name">
          <kemet-input
            slot="input"
            type="text"
            name="firstname"
            rounded="lg"
            placeholder="Enter your first name"
            filled
            required
            .value=${this.userController.data.profile?.first_name || ''}
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
