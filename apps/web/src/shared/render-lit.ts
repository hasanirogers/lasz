import { render } from '@lit-labs/ssr';
import type { TemplateResult } from 'lit';

export function renderLit(template: TemplateResult): string {
  // render lit template to DSD
  let html = '';
  for (const chunk of render(template)) {
    html += chunk;
  }
  return html;
}
