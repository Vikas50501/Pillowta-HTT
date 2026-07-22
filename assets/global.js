document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

/**
 * Global scroll-reveal observer. Sections opt an element in with
 * `data-scroll-reveal`; toggled off site-wide via Theme Settings
 * (settings.animations_scroll_reveal → data-animations-disabled on <body>).
 */
(function initScrollReveal() {
  if (document.body.hasAttribute('data-animations-disabled')) return;
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-scroll-reveal]').forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  document.querySelectorAll('[data-scroll-reveal]').forEach((el) => observer.observe(el));
})();

/**
 * Shared drawer/dialog helper — sections/snippets (cart drawer, mobile menu,
 * quick-view) can extend this instead of re-implementing open/close logic.
 */
class ThemeDrawer extends HTMLElement {
  connectedCallback() {
    this.openButtons = document.querySelectorAll(`[data-drawer-open="${this.id}"]`);
    this.closeButtons = this.querySelectorAll('[data-drawer-close]');
    this.openButtons.forEach((btn) => btn.addEventListener('click', () => this.open(btn)));
    this.closeButtons.forEach((btn) => btn.addEventListener('click', () => this.close()));
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(triggeredBy) {
    this.triggeredBy = triggeredBy;
    this.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    this.dispatchEvent(new CustomEvent('theme:drawer:open', { bubbles: true }));
    const focusTarget = this.querySelector('[autofocus]') || this;
    focusTarget.focus({ preventScroll: true });
  }

  close() {
    this.removeAttribute('open');
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('theme:drawer:close', { bubbles: true }));
    if (this.triggeredBy) this.triggeredBy.focus({ preventScroll: true });
  }
}

if (!customElements.get('theme-drawer')) {
  customElements.define('theme-drawer', ThemeDrawer);
}

/**
 * Shared swipeable carousel (native scroll-snap, no external slider library)
 * used by featured-content's product rail and featured-products. Matches the
 * source site's Swiper breakpoints: 1.2 slides at 0px, 2.3 at 540px, 2.7 at
 * 720px, 4 at 960px — set via --slides-per-view on the host element / media
 * queries in the consuming section's own {% stylesheet %}.
 */
class ProductCarousel extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-carousel-track]');
    this.prevButton = this.querySelector('[data-carousel-prev]');
    this.nextButton = this.querySelector('[data-carousel-next]');
    this.dots = this.querySelectorAll('[data-carousel-dot]');
    if (!this.track) return;

    this.prevButton?.addEventListener('click', () => this.scrollBySlide(-1));
    this.nextButton?.addEventListener('click', () => this.scrollBySlide(1));
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.scrollToIndex(index));
    });

    this.track.addEventListener('scroll', () => this.updateDots(), { passive: true });
  }

  scrollBySlide(direction) {
    const slide = this.track.querySelector('[data-carousel-slide]');
    if (!slide) return;
    this.track.scrollBy({ left: slide.offsetWidth * direction, behavior: 'smooth' });
  }

  scrollToIndex(index) {
    const slide = this.track.querySelectorAll('[data-carousel-slide]')[index];
    if (slide) this.track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  }

  updateDots() {
    const slides = Array.from(this.track.querySelectorAll('[data-carousel-slide]'));
    const current = slides.findIndex((slide) => slide.offsetLeft >= this.track.scrollLeft - 10);
    this.dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
  }
}

if (!customElements.get('product-carousel')) {
  customElements.define('product-carousel', ProductCarousel);
}
