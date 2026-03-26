(function() {
  'use strict';

  // ===== THEME TOGGLE SYSTEM =====
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Check for saved theme preference or system preference
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme
  function setTheme(theme) {
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }

  // Initialize theme
  setTheme(getPreferredTheme());

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('backTop');
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 80);
    backTop.classList.toggle('visible', scrollY > 600);
    ticking = false;
  }

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavbar();

  // ===== MOBILE MENU =====
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu.querySelectorAll('.nav__mobile-link');
  let scrollPos = 0;

  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      scrollPos = window.scrollY;
      document.body.classList.add('menu-open');
      document.body.style.top = '-' + scrollPos + 'px';
    } else {
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollPos);
    }
  }

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu();
    }
  });

  burger.addEventListener('click', toggleMenu);

  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (mobileMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
  });

  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });

  // ===== COUNTER ANIMATION WITH CIRCULAR PROGRESS =====
  const trustBarItems = document.querySelectorAll('.trust-bar__item');
  const circumference = 2 * Math.PI * 45; // radius = 45

  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const item = entry.target;
        const circle = item.querySelector('.trust-bar__circle');
        const progressCircle = item.querySelector('.trust-bar__circle-progress');
        const numberEl = item.querySelector('.trust-bar__number');

        if (!circle || !progressCircle || !numberEl) return;

        const value = parseInt(circle.getAttribute('data-value'), 10) || 0;
        const max = parseInt(circle.getAttribute('data-max'), 10) || 100;
        const target = parseInt(numberEl.getAttribute('data-count'), 10) || 0;

        // Animate the circular progress
        const progress = value / max;
        const offset = circumference - (progress * circumference);

        setTimeout(function() {
          progressCircle.style.strokeDashoffset = offset;
        }, 100);

        // Animate the counter
        const duration = 2000;
        let startTime = null;

        function animateCount(timestamp) {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);

          numberEl.textContent = current.toLocaleString('ru-RU') + (target >= 100 ? '+' : '');

          if (progress < 1) {
            requestAnimationFrame(animateCount);
          } else {
            numberEl.textContent = target.toLocaleString('ru-RU') + (target >= 100 ? '+' : '');
          }
        }

        requestAnimationFrame(animateCount);
        counterObserver.unobserve(item);
      }
    });
  }, { threshold: 0.5 });

  trustBarItems.forEach(function(item) {
    counterObserver.observe(item);
  });

  // ===== FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item__question');

  faqItems.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all FAQ items
      document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked item (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== BACK TO TOP =====
  backTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        // Close mobile menu if open
        if (mobileMenu.classList.contains('open')) {
          toggleMenu();
        }

        const offset = navbar.offsetHeight + 20;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== DESTINATION FILTER =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const destCards = document.querySelectorAll('.dest-card');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Update active button
      filterBtns.forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');

      destCards.forEach(function(card) {
        const categories = card.getAttribute('data-category') || '';

        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = '';
          card.style.animation = 'scaleIn 0.5s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ===== 3D TILT EFFECT =====
  const tiltElements = document.querySelectorAll('.tilt-effect');

  tiltElements.forEach(function(el) {
    el.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
    });

    el.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  // ===== PARALLAX EFFECT ON HERO PARTICLES =====
  const heroParticles = document.querySelectorAll('.hero__particle');

  if (heroParticles.length > 0) {
    let rafId = null;

    function updateParallax() {
      const scrollY = window.scrollY;

      heroParticles.forEach(function(particle, index) {
        const speed = 0.1 + (index * 0.05);
        const yPos = scrollY * speed;
        particle.style.transform = 'translateY(' + yPos + 'px)';
      });
    }

    window.addEventListener('scroll', function() {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateParallax);
    }, { passive: true });
  }

  // ===== SERVICES HORIZONTAL SCROLL INDICATORS =====
  const servicesScroll = document.querySelector('.services__scroll');
  const scrollDots = document.querySelectorAll('.services__scroll-dot');

  if (servicesScroll && scrollDots.length > 0) {
    function updateScrollIndicator() {
      const scrollLeft = servicesScroll.scrollLeft;
      const maxScroll = servicesScroll.scrollWidth - servicesScroll.clientWidth;
      const scrollPercentage = scrollLeft / maxScroll;
      const dotIndex = Math.round(scrollPercentage * (scrollDots.length - 1));

      scrollDots.forEach(function(dot, index) {
        dot.classList.toggle('active', index === dotIndex);
      });
    }

    servicesScroll.addEventListener('scroll', updateScrollIndicator, { passive: true });

    // Click on dots to scroll
    scrollDots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        const maxScroll = servicesScroll.scrollWidth - servicesScroll.clientWidth;
        const targetScroll = (index / (scrollDots.length - 1)) * maxScroll;
        servicesScroll.scrollTo({ left: targetScroll, behavior: 'smooth' });
      });
    });
  }

  // ===== MAGNETIC BUTTON EFFECT =====
  const magneticBtns = document.querySelectorAll('.btn--primary, .nav__cta');

  magneticBtns.forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      this.style.transform = 'translate(' + (x * 0.1) + 'px, ' + (y * 0.1) + 'px) scale(1.02)';
    });

    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0) scale(1)';
    });
  });

  // ===== FLOATING CARDS PARALLAX =====
  const floatingCards = document.querySelectorAll('.hero__floating-card');

  if (floatingCards.length > 0) {
    document.addEventListener('mousemove', function(e) {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      floatingCards.forEach(function(card, index) {
        const speed = 20 + (index * 10);
        const x = mouseX * speed;
        const y = mouseY * speed;
        card.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px)';
      });
    });
  }

  // ===== SCROLL PROGRESS INDICATOR =====
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // Update meta theme color based on scroll for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (scrollTop > 80) {
        metaThemeColor.setAttribute('content', html.getAttribute('data-theme') === 'dark' ? '#1a1a2e' : '#f0f4f8');
      } else {
        metaThemeColor.setAttribute('content', '#667eea');
      }
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ===== LAZY LOAD IMAGES =====
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ===== STAGGER ANIMATION FOR CHILDREN =====
  const staggerContainers = document.querySelectorAll('.stagger-children');

  const staggerObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.reveal');
        children.forEach(function(child, index) {
          child.style.transitionDelay = (index * 0.1) + 's';
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  staggerContainers.forEach(function(container) {
    staggerObserver.observe(container);
  });

  // ===== GALLERY ITEM HOVER SOUND (SUBTLE VISUAL FEEDBACK) =====
  const galleryItems = document.querySelectorAll('.gallery__item');

  galleryItems.forEach(function(item) {
    item.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });

    item.addEventListener('mouseleave', function() {
      this.style.zIndex = '';
    });
  });

  // ===== TESTIMONIALS CAROUSEL AUTO-SCROLL (OPTIONAL) =====
  const testimonialTrack = document.querySelector('.testimonials__track');

  if (testimonialTrack) {
    let isAutoScrolling = true;
    let autoScrollInterval = null;

    function startAutoScroll() {
      autoScrollInterval = setInterval(function() {
        if (isAutoScrolling) {
          const maxScroll = testimonialTrack.scrollWidth - testimonialTrack.clientWidth;
          const currentScroll = testimonialTrack.scrollLeft;

          if (currentScroll >= maxScroll - 10) {
            testimonialTrack.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            testimonialTrack.scrollBy({ left: 340, behavior: 'smooth' });
          }
        }
      }, 5000);
    }

    // Pause auto-scroll on hover
    testimonialTrack.addEventListener('mouseenter', function() {
      isAutoScrolling = false;
    });

    testimonialTrack.addEventListener('mouseleave', function() {
      isAutoScrolling = true;
    });

    // Pause on touch
    testimonialTrack.addEventListener('touchstart', function() {
      isAutoScrolling = false;
    });

    testimonialTrack.addEventListener('touchend', function() {
      setTimeout(function() {
        isAutoScrolling = true;
      }, 3000);
    });

    // Start auto-scroll after page load
    setTimeout(startAutoScroll, 3000);
  }

  // ===== KEYBOARD NAVIGATION ENHANCEMENTS =====
  document.addEventListener('keydown', function(e) {
    // Focus visible outline enhancement
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
  });

  // ===== PERFORMANCE: REDUCE MOTION PREFERENCE =====
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    // Disable complex animations
    document.body.classList.add('reduce-motion');

    // Remove floating animations
    heroParticles.forEach(function(particle) {
      particle.style.animation = 'none';
    });

    floatingCards.forEach(function(card) {
      card.style.animation = 'none';
    });
  }

  // ===== CONSOLE GREETING =====
  console.log(
    '%c✈️ MAGIC VOYAGE %c Семейный туризм мечты',
    'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 16px;',
    'color: #667eea; font-size: 14px; padding: 10px;'
  );

})();
