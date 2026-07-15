(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const year = document.querySelector('[data-year]');
  const lang = document.documentElement.lang || 'de';

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const closeMenu = () => {
    mobileNav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  menuToggle?.addEventListener('click', () => {
    const open = mobileNav?.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
    document.body.classList.toggle('no-scroll', Boolean(open));
  });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) closeMenu(); });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox__image');
  const lightboxCaption = lightbox?.querySelector('.lightbox__caption');
  const lightboxClose = lightbox?.querySelector('.lightbox__close');
  let lastFocused = null;

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lastFocused?.focus();
  };
  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lastFocused = button;
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.dataset.alt || '';
      if (lightboxCaption) lightboxCaption.textContent = button.dataset.caption || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      lightboxClose?.focus();
    });
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeLightbox(); closeMenu(); } });

  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');
  const submitButton = form?.querySelector('button[type="submit"]');
  const strings = {
    de: {
      sending: 'Nachricht wird gesendet …',
      success: 'Vielen Dank. Ihre Nachricht wurde erfolgreich übermittelt.',
      unavailable: 'Der E-Mail-Versand ist noch nicht konfiguriert. Bitte nutzen Sie vorerst das Investoren-Exposé.',
      error: 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.',
      submit: 'Anfrage senden'
    },
    en: {
      sending: 'Sending your message …',
      success: 'Thank you. Your message has been sent successfully.',
      unavailable: 'Email delivery is not configured yet. Please use the investor exposé for now.',
      error: 'Your message could not be sent. Please try again later.',
      submit: 'Send enquiry'
    }
  }[lang] || null;

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!strings || !status || !submitButton) return;
    const payload = Object.fromEntries(new FormData(form).entries());
    status.className = 'form-status';
    status.textContent = strings.sending;
    submitButton.disabled = true;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(response.status === 503 ? 'unavailable' : data.error || 'error');
      }
      status.classList.add('is-success');
      status.textContent = strings.success;
      form.reset();
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error.message === 'unavailable' ? strings.unavailable : strings.error;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = strings.submit;
    }
  });
})();

// Remember the user's explicit language choice for future visits to the root URL.
document.querySelectorAll('.lang-switch a').forEach(link => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('wao-language', link.textContent.trim().toLowerCase()); } catch (_) {}
  });
});
