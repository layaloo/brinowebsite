/* ==========================================================================
   BRINO MARKETING AGENCY - JAVASCRIPT CONTROLLERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Sticky Navigation Header ---
  const header = document.querySelector('header');
  const scrollThreshold = 20;

  function handleScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll);
  // Run once on load in case page is refreshed while scrolled
  handleScroll();


  // --- 2. Mobile Navigation Menu Toggle ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });

    // Close menu when clicking any nav link (important for transitions / jumping)
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinksContainer.classList.remove('active');
      });
    });
  }


  // --- 3. Active Page Navigation Link Highlighting ---
  const currentPath = window.location.pathname;
  // Get filename, e.g. "about.html"
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === pageName || (pageName === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });


  // --- 4. Intersection Observer for Scroll Fade-In/Slide-Up (Reveal) ---
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, no need to track it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // trigger when 10% of the element is visible
      rootMargin: '0px 0px -50px 0px' // offset to trigger slightly before/after scroll entry
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }


});
