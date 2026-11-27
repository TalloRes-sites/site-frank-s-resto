import type { Lang, RestaurantData } from './types';

export const WIDGET_BASE = 'https://widget.tallores.com/form/';

export interface WidgetParams {
  lang?: Lang;
  /** Hide the widget's own header (name + language button). Needs widget change R2. */
  hideHeader?: boolean;
  /** Theme per URL, hex. Needs widget change R2. */
  primary?: string;
  secondary?: string;
  /** Prefill, already supported by the widget. */
  visitDate?: string;
  visitTime?: string;
}

/** Widget URL for embedding. Parameters the widget does not support yet are ignored by it, so this is safe to ship now. */
export function widgetUrl(r: Pick<RestaurantData, 'widgetFormId'>, p: WidgetParams = {}): string {
  const q = new URLSearchParams({ iframe: 'true' });
  if (p.lang) q.set('lang', p.lang);
  if (p.hideHeader) q.set('header', '0');
  if (p.primary) q.set('primary', p.primary.replace('#', ''));
  if (p.secondary) q.set('secondary', p.secondary.replace('#', ''));
  if (p.visitDate) q.set('visitDate', p.visitDate);
  if (p.visitTime) q.set('visitTime', p.visitTime);
  return `${WIDGET_BASE}${encodeURIComponent(r.widgetFormId)}?${q.toString()}`;
}

/**
 * Message the widget should post to its parent on load and on every step change (widget change R1):
 *   window.parent.postMessage({ type: 'tallores:resize', height: document.documentElement.scrollHeight }, '*')
 * The site listens and sets the iframe height. Until then the iframe keeps a min-height.
 */
export const RESIZE_MESSAGE = 'tallores:resize';
