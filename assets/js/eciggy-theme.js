/* Presentation-only behaviours for Eciggy UK flavour theme demo. */
(() => {
  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const themeClasses = [
    'theme--lemon',
    'theme--strawberry',
    'theme--blueberry',
    'theme--grape',
    'theme--blackcurrant'
  ];

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  const handleMotionChange = (event) => {
    reduceMotion = event.matches;
  };
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(handleMotionChange);
  }

  doc.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupScrollPolish();
    setupThemeSwitcher();
    setupRippleEffect();
    setupModalTrap();
  });

  function setupNav() {
    const nav = doc.querySelector('.nav');
    const menu = nav?.querySelector('.menu');
    const toggle = doc.querySelector('[data-nav-toggle]');
    if (!nav || !menu) {
      return;
    }

    const menuId = menu.id || 'nav-menu';
    if (!menu.id) {
      menu.id = menuId;
    }

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', menuId);
      toggle.setAttribute('aria-label', toggle.getAttribute('aria-label') || 'Toggle navigation');
      nav.classList.add('is-collapsed');
      menu.setAttribute('aria-hidden', 'true');

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggleNav(!expanded);
      });

      const toggleNav = (shouldExpand) => {
        toggle.setAttribute('aria-expanded', String(shouldExpand));
        nav.classList.toggle('is-expanded', shouldExpand);
        nav.classList.toggle('is-collapsed', !shouldExpand);
        menu.classList.toggle('is-open', shouldExpand);
        if (shouldExpand) {
          menu.setAttribute('aria-hidden', 'false');
          menu.querySelector('a, button')?.focus({ preventScroll: true });
        } else {
          menu.setAttribute('aria-hidden', 'true');
          toggle.focus({ preventScroll: true });
        }
      };

      window.addEventListener('resize', () => {
        if (window.innerWidth > 720 && toggle.getAttribute('aria-expanded') === 'false') {
          menu.classList.remove('is-open');
          nav.classList.remove('is-expanded');
          nav.classList.add('is-collapsed');
          menu.removeAttribute('aria-hidden');
        }
      });

      doc.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          toggleNav(false);
        }
      });
    } else {
      nav.classList.remove('is-collapsed');
    }
  }

  function setupScrollPolish() {
    const nav = doc.querySelector('.nav');
    if (!nav) {
      return;
    }
    const threshold = 24;
    const apply = () => {
      if (window.scrollY > threshold) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    };
    apply();
    window.addEventListener('scroll', apply, { passive: true });
  }

  function setupThemeSwitcher() {
    const flavourControls = doc.querySelectorAll('[data-flavour]');
    if (!flavourControls.length) {
      return;
    }

    const hostElements = [root, body];

    const setTheme = (flavour) => {
      hostElements.forEach((el) => {
        themeClasses.forEach((themeClass) => el.classList.remove(themeClass));
        if (flavour) {
          el.classList.add(`theme--${flavour}`);
        }
      });
    };

    flavourControls.forEach((control) => {
      control.addEventListener('click', (event) => {
        event.preventDefault();
        const flavour = control.getAttribute('data-flavour');
        if (!flavour) {
          return;
        }
        setTheme(flavour);
        if (control instanceof HTMLElement) {
          control.setAttribute('aria-pressed', 'true');
          flavourControls.forEach((btn) => {
            if (btn !== control && btn instanceof HTMLElement) {
              btn.setAttribute('aria-pressed', 'false');
            }
          });
        }
      });
    });
  }

  function setupRippleEffect() {
    doc.addEventListener('pointerdown', (event) => {
      const target = event.target instanceof Element ? event.target.closest('.btn') : null;
      if (!target || reduceMotion) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const ripple = doc.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      const style = window.getComputedStyle(target);
      const accent = style.getPropertyValue('--color-accent').trim();
      if (accent) {
        ripple.style.background = `color-mix(in srgb, ${accent} 70%, white 10%)`;
      }

      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    }, { passive: true });
  }

  function setupModalTrap() {
    const modalSelectors = '[data-modal]';
    const triggerAttr = 'data-modal-open';
    const closeAttr = 'data-modal-close';
    const openModals = new Map();

    const getFocusable = (container) => {
      const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      return Array.from(container.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('aria-hidden'));
    };

    const showModal = (modal, trigger) => {
      if (openModals.has(modal)) {
        return;
      }
      const previousFocus = trigger instanceof HTMLElement ? trigger : doc.activeElement;
      modal.classList.add('is-active');
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      modal.dataset.open = 'true';
      const focusable = getFocusable(modal);
      const first = focusable[0] || modal;
      const last = focusable[focusable.length - 1] || modal;
      openModals.set(modal, { trigger: previousFocus, first, last });
      (first instanceof HTMLElement ? first : modal).focus({ preventScroll: true });
    };

    const hideModal = (modal) => {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      modal.dataset.open = 'false';
      const state = openModals.get(modal);
      openModals.delete(modal);
      if (state?.trigger instanceof HTMLElement) {
        state.trigger.focus({ preventScroll: true });
      }
    };

    doc.querySelectorAll(`[${triggerAttr}]`).forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const selector = trigger.getAttribute(triggerAttr);
        if (!selector) {
          return;
        }
        const modal = doc.querySelector(selector);
        if (modal) {
          showModal(modal, trigger);
        }
      });
    });

    doc.querySelectorAll(`[${closeAttr}]`).forEach((closer) => {
      closer.addEventListener('click', (event) => {
        event.preventDefault();
        const modal = closer.closest(modalSelectors);
        if (modal) {
          hideModal(modal);
        }
      });
    });

    doc.addEventListener('keydown', (event) => {
      const activeModal = Array.from(openModals.keys()).slice(-1)[0];
      if (!activeModal) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        hideModal(activeModal);
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const state = openModals.get(activeModal);
      if (!state) {
        return;
      }
      const { first, last } = state;
      if (event.shiftKey) {
        if (doc.activeElement === first) {
          event.preventDefault();
          (last instanceof HTMLElement ? last : activeModal).focus({ preventScroll: true });
        }
      } else if (doc.activeElement === last) {
        event.preventDefault();
        (first instanceof HTMLElement ? first : activeModal).focus({ preventScroll: true });
      }
    });

    doc.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) {
        return;
      }
      const activeModal = Array.from(openModals.keys()).slice(-1)[0];
      if (!activeModal) {
        return;
      }
      if (target.matches('[data-modal-overlay]') || (!activeModal.contains(target) && !target.closest('[data-modal]'))) {
        hideModal(activeModal);
      }
    });
  }
})();
