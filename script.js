(function() {
  'use strict';

  // === NAVBAR SCROLL ===
  var navbar = document.getElementById('navbar');
  var backTop = document.getElementById('backTop');

  function onScroll() {
    var scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 80);
    backTop.classList.toggle('visible', scrollY > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // === MOBILE MENU ===
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileLinks = mobileMenu.querySelectorAll('.nav__mobile-link');

  var scrollPos = 0;

  function toggleMenu() {
    var isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      scrollPos = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollPos + 'px';
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPos);
    }
  }

  burger.addEventListener('click', toggleMenu);

  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (mobileMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // === SCROLL REVEAL ===
  var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });

  // === COUNTER ANIMATION ===
  var counters = document.querySelectorAll('[data-count]');

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var duration = 2000;
        var startTime = null;

        function animateCount(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * target);
          el.textContent = current.toLocaleString('ru-RU') + (target >= 100 ? '+' : '');
          if (progress < 1) {
            requestAnimationFrame(animateCount);
          } else {
            el.textContent = target.toLocaleString('ru-RU') + (target >= 100 ? '+' : '');
          }
        }

        requestAnimationFrame(animateCount);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(c) {
    counterObserver.observe(c);
  });

  // === TESTIMONIALS (card grid — no JS needed) ===

  // === FAQ ACCORDION ===
  var faqItems = document.querySelectorAll('.faq-item__question');

  faqItems.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // === CONTACT FORM (removed) ===

  // === BACK TO TOP ===
  backTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // === SMOOTH SCROLL FOR ANCHOR LINKS ===
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = navbar.offsetHeight + 10;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

})();
