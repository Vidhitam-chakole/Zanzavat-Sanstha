/**
 * Zanzavat Bahuudeshiya Shaikshanik Sanstha - Main Application Class
 * Handles basic interactions, sticky navs, animations, and backend form fetches.
 */

class MainApp {
  constructor() {
    this.initHeaderScroll();
    this.initMobileMenu();
    this.initScrollReveal();
    this.initStatCounters();
    this.initHeroCarousel();
    this.initFormSubmissions();
  }

  /**
   * 1. Header Scroll Shadow
   */
  initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const checkScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', checkScroll);
    checkScroll();
  }

  /**
   * 2. Mobile Menu Toggle
   */
  initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-active');
      navMenu.classList.toggle('is-active');
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        navMenu.classList.remove('is-active');
      });
    });
  }

  /**
   * 3. Scroll Reveal Animations
   */
  initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('active'));
    }
  }

  /**
   * 4. Statistics Counting Action
   */
  initStatCounters() {
    const counterSection = document.querySelector('.counter-section, .impact-intro-graphic');
    if (!counterSection) return;

    const counters = document.querySelectorAll('.counter-num, .impact-stat-num');
    
    const startCounting = (counter) => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = progress * (2 - progress);
        const currentVal = Math.floor(easeProgress * target);
        
        counter.textContent = currentVal + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            counters.forEach(counter => startCounting(counter));
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(counterSection);
    } else {
      counters.forEach(counter => {
        const target = counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        counter.textContent = target + suffix;
      });
    }
  }

  /**
   * 5. Home Page Hero Carousel
   */
  initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicator');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const slideInterval = 6000;
    let intervalId;

    const showSlide = (index) => {
      slides.forEach(slide => slide.classList.remove('active'));
      indicators.forEach(ind => ind.classList.remove('active'));

      slides[index].classList.add('active');
      if (indicators[index]) {
        indicators[index].classList.add('active');
      }
      currentSlide = index;
    };

    const nextSlide = () => {
      let next = (currentSlide + 1) % slides.length;
      showSlide(next);
    };

    const startAutoPlay = () => {
      intervalId = setInterval(nextSlide, slideInterval);
    };

    const stopAutoPlay = () => {
      clearInterval(intervalId);
    };

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        stopAutoPlay();
        showSlide(index);
        startAutoPlay();
      });
    });

    showSlide(0);
    startAutoPlay();
  }

  /**
   * 6. Form Submit Fetch integration (Contact & Volunteer Forms)
   */
  initFormSubmissions() {
    const forms = document.querySelectorAll('.vol-form, .contact-form');
    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const feedback = form.querySelector('.form-feedback');
        
        if (!submitBtn || !feedback) return;
        
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Determine endpoint based on form class
        const isVolunteerForm = form.classList.contains('vol-form');
        const endpoint = isVolunteerForm ? '/api/register' : '/api/contact';
        
        // Build JSON payload
        let payload = {};
        if (isVolunteerForm) {
          payload = {
            name: form.querySelector('#full-name').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value,
            interest: form.querySelector('#interest').value,
            message: form.querySelector('#message').value
          };
        } else {
          payload = {
            name: form.querySelector('#c-name').value,
            email: form.querySelector('#c-email').value,
            phone: form.querySelector('#c-phone').value,
            subject: form.querySelector('#c-subject').value,
            message: form.querySelector('#c-message').value
          };
        }

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          const result = await response.json();
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;

          if (response.ok && result.status === 'success') {
            form.reset();
            feedback.textContent = isVolunteerForm 
              ? '✔ Registration Successful! Thank you for joining Zanzavat. Our Nagpur operations team will contact you shortly.'
              : '✔ Message Sent! Thank you for contacting Zanzavat Sanstha. We will get back to you shortly.';
            feedback.style.backgroundColor = 'var(--color-green-light)';
            feedback.style.color = 'var(--color-green)';
            feedback.style.borderColor = 'var(--color-green)';
            feedback.style.display = 'block';
          } else {
            feedback.textContent = `❌ Error: ${result.message || 'Submission failed.'}`;
            feedback.style.backgroundColor = '#FFEBEE';
            feedback.style.color = '#C62828';
            feedback.style.borderColor = '#C62828';
            feedback.style.display = 'block';
          }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          feedback.textContent = `❌ Connection Error: Ensure server.py is running.`;
          feedback.style.backgroundColor = '#FFEBEE';
          feedback.style.color = '#C62828';
          feedback.style.borderColor = '#C62828';
          feedback.style.display = 'block';
        }
        
        feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }
}

// Instantiate the Main Application class on load
document.addEventListener('DOMContentLoaded', () => {
  new MainApp();
});
