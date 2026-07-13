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


  // --- 5. Testimonial Slider Controller ---
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  let currentSlideIndex = 0;
  let slideInterval;

  if (testimonialSlides.length > 0 && testimonialDots.length > 0) {
    function showTestimonial(index) {
      testimonialSlides.forEach(slide => slide.classList.remove('active'));
      testimonialDots.forEach(dot => dot.classList.remove('active'));

      testimonialSlides[index].classList.add('active');
      testimonialDots[index].classList.add('active');
      currentSlideIndex = index;
    }

    function nextTestimonial() {
      let nextIndex = currentSlideIndex + 1;
      if (nextIndex >= testimonialSlides.length) {
        nextIndex = 0;
      }
      showTestimonial(nextIndex);
    }

    // Set click handlers for dot indicators
    testimonialDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showTestimonial(idx);
        resetSlideTimer();
      });
    });

    function startSlideTimer() {
      slideInterval = setInterval(nextTestimonial, 6000); // cycle every 6 seconds
    }

    function resetSlideTimer() {
      clearInterval(slideInterval);
      startSlideTimer();
    }

    // Initialize testimonial slider
    showTestimonial(0);
    startSlideTimer();
  }


  // --- 6. Portfolio Category Filtering ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-grid-item');

  if (filterButtons.length > 0 && portfolioItems.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active filter button style
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedFilter = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');

          if (selectedFilter === 'all' || itemCategory === selectedFilter) {
            // Show item with animation
            item.style.display = 'block';
            item.style.animation = 'none'; // reset animation trigger
            setTimeout(() => {
              item.style.animation = 'filterFadeIn 0.5s ease forwards';
            }, 10);
          } else {
            // Hide item
            item.style.display = 'none';
          }
        });
      });
    });
  }


  // --- 7. Modal Windows (Success Alerts) ---
  const modal = document.querySelector('.modal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // stop page scrolling under modal
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto'; // restore page scrolling
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking on the overlay background
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }


  // --- 8. Contact Form Handler (Mock Submission) ---
  const contactForm = document.getElementById('agencyContactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple form validation visual state
      let formIsValid = true;
      const requiredInputs = contactForm.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          formIsValid = false;
          input.style.borderColor = 'var(--coral)';
        } else {
          input.style.borderColor = 'var(--grey-border)';
        }
      });

      if (formIsValid) {
        // Collect form data (for simulation demo console output)
        const formData = {
          name: contactForm.querySelector('#formName')?.value,
          email: contactForm.querySelector('#formEmail')?.value,
          service: contactForm.querySelector('#formService')?.value,
          message: contactForm.querySelector('#formMessage')?.value
        };
        console.log('Brino Contact Form Submission Received:', formData);

        // Open custom success modal
        openModal();

        // Reset form inputs
        contactForm.reset();
      }
    });
  }


  // --- 9. Newsletter Form Handler (Mock Submission) ---
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      
      if (emailInput && emailInput.value.trim()) {
        console.log('Newsletter subscription successful for:', emailInput.value.trim());
        
        // Show newsletter mock confirmation
        const modalTitle = document.getElementById('modalTitle');
        const modalText = document.getElementById('modalText');
        
        if (modalTitle && modalText) {
          modalTitle.textContent = "Subscription Successful!";
          modalText.textContent = "Thank you for subscribing to Brino Marketing newsletter. We will send you exclusive insights shortly.";
        }
        
        openModal();
        newsletterForm.reset();
      }
    });
  }
});
