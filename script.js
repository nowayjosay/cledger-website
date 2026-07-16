(function () {
  'use strict';

  /* ── Hamburger menu ── */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Scroll-reveal ── */
  var revealTargets = document.querySelectorAll('[data-animate], .feature-card');

  if ('IntersectionObserver' in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* Fallback: show everything immediately */
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── Stagger feature cards ── */
  document.querySelectorAll('.feature-card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 80) + 'ms';
  });

  /* ── Privacy policy accordion ── */
  var privBtn = document.getElementById('privAccordionBtn');
  var privPanel = document.getElementById('privAccordionPanel');

  if (privBtn && privPanel) {
    privBtn.addEventListener('click', function () {
      var expanded = privBtn.getAttribute('aria-expanded') === 'true';
      privBtn.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
      privBtn.querySelector('.priv-accordion-label').textContent = expanded
        ? 'View Full Privacy Policy'
        : 'Hide Full Privacy Policy';
      if (expanded) {
        privPanel.hidden = true;
      } else {
        privPanel.hidden = false;
      }
      privBtn.closest('.priv-accordion').classList.toggle('is-open', !expanded);
    });
  }

})();
