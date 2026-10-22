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
      this.initLazyVideos();
      this.initInstantNavigation();
      this.initFormSubmissions();
      this.initAIChat();
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
        const rawTarget = counter.getAttribute('data-target');
        if (!rawTarget || isNaN(parseInt(rawTarget, 10))) return;
        const target = parseInt(rawTarget, 10);
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
          const rawTarget = counter.getAttribute('data-target');
          if (!rawTarget || isNaN(parseInt(rawTarget, 10))) return;
          const target = parseInt(rawTarget, 10);
          const suffix = counter.getAttribute('data-suffix') || '';
          counter.textContent = target + suffix;
        });
      }
    }

    /**
     * Lazy Video Playback & Performance Optimization
     */
    initLazyVideos() {
      const videos = document.querySelectorAll('.insta-video, video[data-src]');
      if (videos.length === 0) return;

      if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                video.load();
              }
              video.play().catch(() => {});
            } else {
              if (!video.paused) {
                video.pause();
              }
            }
          });
        }, { threshold: 0.15, rootMargin: '150px 0px' });

        videos.forEach(v => videoObserver.observe(v));
      }
    }

    /**
     * Instant Page Navigation via Link Prefetching
     */
    initInstantNavigation() {
      const prefetched = new Set();
      const prefetch = (url) => {
        if (!url || prefetched.has(url) || url.startsWith('http') || url.startsWith('#') || url.startsWith('tel:') || url.startsWith('mailto:')) return;
        prefetched.add(url);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
      };

      document.querySelectorAll('a[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
        
        anchor.addEventListener('mouseenter', () => prefetch(href), { passive: true });
        anchor.addEventListener('touchstart', () => prefetch(href), { passive: true });
      });

      if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
        const specScript = document.createElement('script');
        specScript.type = 'speculationrules';
        specScript.textContent = JSON.stringify({
          prerender: [{
            where: {
              href_matches: "/*\\.html"
            },
            eagerness: "moderate"
          }]
        });
        document.head.appendChild(specScript);
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
      const slideInterval = 3000;
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

      // Swipe Gestures for Mobile
      const sliderContainer = document.querySelector('.hero-slider-container');
      if (sliderContainer) {
        let touchStartX = 0;
        let touchEndX = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
          const swipeThreshold = 50;
          if (touchStartX - touchEndX > swipeThreshold) {
            // Swiped left -> next slide
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
          } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swiped right -> previous slide
            stopAutoPlay();
            let prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
            startAutoPlay();
          }
        };
      }

      showSlide(0);
      startAutoPlay();
    }

    /**
     * 6. Form Submit Fetch integration (Contact, Volunteer & Goods In-Kind Forms)
     */
    initFormSubmissions() {
      const forms = document.querySelectorAll('.vol-form, .contact-form, .goods-form');
      const getApiBase = () => {
        // If opened via file: protocol or no hostname
        if (window.location.protocol === 'file:' || !window.location.hostname) {
          return 'http://127.0.0.1:5000';
        }
        // If loaded from Live Server (e.g. port 5500, 3000, 5173, etc.) and backend runs on 5000
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          if (window.location.port && window.location.port !== '5000') {
            return 'http://127.0.0.1:5000';
          }
        }
        return '';
      };

      forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const submitBtn = form.querySelector('button[type="submit"]');
          const feedback = form.parentElement.querySelector('.form-feedback') || form.querySelector('.form-feedback') || document.querySelector('.form-feedback');
          
          if (!submitBtn) return;
          
          const isVolunteerForm = form.classList.contains('vol-form');
          const isGoodsForm = form.classList.contains('goods-form') || form.id === 'goods-donation-form';
          let endpoint = '/api/contact';
          if (isVolunteerForm) endpoint = '/api/register';
          if (isGoodsForm) endpoint = '/api/donate-goods';
          const apiUrl = `${getApiBase()}${endpoint}`;

          const originalText = submitBtn.textContent;
          submitBtn.disabled = true;
          submitBtn.textContent = isVolunteerForm 
            ? 'Submitting Registration...' 
            : isGoodsForm 
            ? 'Submitting Donation Query...' 
            : 'Sending Message...';
          
          if (feedback) {
            feedback.style.display = 'none';
          }
          
          // Build JSON payload
          let payload = {};
          if (isVolunteerForm) {
            const nameEl = form.querySelector('#full-name');
            const emailEl = form.querySelector('#email');
            const phoneEl = form.querySelector('#phone');
            const interestEl = form.querySelector('#interest');
            const messageEl = form.querySelector('#message');

            payload = {
              name: nameEl ? nameEl.value.trim() : '',
              email: emailEl ? emailEl.value.trim() : '',
              phone: phoneEl ? phoneEl.value.trim() : '',
              interest: interestEl ? interestEl.value.trim() : '',
              message: messageEl ? messageEl.value.trim() : ''
            };
          } else if (isGoodsForm) {
            const nameEl = form.querySelector('#g-name') || form.querySelector('[name="name"]');
            const emailEl = form.querySelector('#g-email') || form.querySelector('[name="email"]');
            const phoneEl = form.querySelector('#g-phone') || form.querySelector('[name="phone"]');
            const categoryEl = form.querySelector('#g-category') || form.querySelector('[name="category"]');
            const itemsEl = form.querySelector('#g-items') || form.querySelector('[name="items"]');
            const deliveryEl = form.querySelector('input[name="delivery_method"]:checked') || form.querySelector('#g-delivery');
            const addressEl = form.querySelector('#g-address') || form.querySelector('[name="address"]');
            const messageEl = form.querySelector('#g-message') || form.querySelector('[name="message"]');

            payload = {
              name: nameEl ? nameEl.value.trim() : '',
              email: emailEl ? emailEl.value.trim() : '',
              phone: phoneEl ? phoneEl.value.trim() : '',
              category: categoryEl ? categoryEl.value.trim() : 'General In-Kind Donation',
              items: itemsEl ? itemsEl.value.trim() : '',
              delivery_method: deliveryEl ? deliveryEl.value.trim() : 'dropoff',
              address: addressEl ? addressEl.value.trim() : '',
              message: messageEl ? messageEl.value.trim() : ''
            };
          } else {
            const nameEl = form.querySelector('#c-name');
            const emailEl = form.querySelector('#c-email');
            const phoneEl = form.querySelector('#c-phone');
            const subjectEl = form.querySelector('#c-subject');
            const messageEl = form.querySelector('#c-message');

            payload = {
              name: nameEl ? nameEl.value.trim() : '',
              email: emailEl ? emailEl.value.trim() : '',
              phone: phoneEl ? phoneEl.value.trim() : '',
              subject: subjectEl ? subjectEl.value.trim() : '',
              message: messageEl ? messageEl.value.trim() : ''
            };
          }

          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
            
            const result = await response.json().catch(() => ({}));
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            if (response.ok && (result.status === 'success' || response.status === 200)) {
              if (isGoodsForm) {
                // Clear and hide form, display prominent sender confirmation card
                const cardParent = form.parentElement;
                form.style.display = 'none';
                if (feedback) feedback.style.display = 'none';

                const existingSuccess = cardParent.querySelector('.goods-success-card');
                if (existingSuccess) existingSuccess.remove();

                const deliveryText = payload.delivery_method === 'dropoff' 
                  ? 'Drop-off at Nagpur Center' 
                  : 'Volunteer Pickup Requested in Nagpur';

                const successCard = document.createElement('div');
                successCard.className = 'goods-success-card';
                successCard.style.cssText = 'padding: 24px; background: rgba(46, 125, 50, 0.08); border: 2px solid #2e7d32; border-radius: 12px; margin-top: 10px; animation: fadeIn 0.4s ease;';
                successCard.innerHTML = `
                  <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #2e7d32; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 style="margin: 0; color: #1b5e20; font-size: 1.25rem;">Donation Query Received Successfully!</h3>
                      <p style="margin: 4px 0 0; color: #2e7d32; font-size: 0.95rem;">Thank you, <strong>${payload.name}</strong>! Your generosity directly supports rural students & families in Nagpur.</p>
                    </div>
                  </div>
                  
                  <div style="background: #ffffff; border: 1px solid rgba(46, 125, 50, 0.25); border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 0.9rem; line-height: 1.6; color: #333;">
                    <p style="margin: 0 0 8px 0; color: #1b5e20; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <span>Confirmation Email Dispatched</span>
                    </p>
                    <div style="font-size: 0.9rem; color: #444; margin-bottom: 8px;">
                      An acknowledgment copy has been emailed to <span style="font-weight: 700; color: #2e7d32;">${payload.email}</span>.
                    </div>
                    <div style="border-top: 1px dashed #c8e6c9; padding-top: 8px; margin-top: 8px; font-size: 0.88rem; color: #555;">
                      <div><strong>Item Category:</strong> ${payload.category}</div>
                      <div><strong>Delivery Preference:</strong> ${deliveryText}</div>
                      <div><strong>Contact Phone:</strong> ${payload.phone}</div>
                    </div>
                  </div>

                  <div style="background: rgba(200, 35, 51, 0.06); border-left: 4px solid #c82333; border-radius: 4px; padding: 12px 14px; margin-bottom: 18px; font-size: 0.88rem; color: #444; line-height: 1.5;">
                    <strong style="color: #c82333;">What Happens Next?</strong><br>
                    Our Nagpur volunteer team will review your query and contact you within 24–48 hours to coordinate item collection.
                  </div>

                  <button type="button" class="btn btn-primary reset-goods-btn" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600; cursor: pointer; border: none;">
                    <span>Submit Another Donation Query</span> &rarr;
                  </button>
                `;

                cardParent.appendChild(successCard);
                successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                const resetBtn = successCard.querySelector('.reset-goods-btn');
                if (resetBtn) {
                  resetBtn.addEventListener('click', () => {
                    form.reset();
                    form.style.display = 'block';
                    successCard.remove();
                    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  });
                }
              } else {
                form.reset();
                if (feedback) {
                  if (isVolunteerForm) {
                    feedback.textContent = 'Registration Successful! Thank you for joining Zanzavat. Our Nagpur operations team will contact you shortly.';
                  } else {
                    feedback.textContent = 'Message Sent! Thank you for contacting Zanzavat Sanstha. We will get back to you shortly.';
                  }
                  feedback.style.backgroundColor = 'var(--color-green-light)';
                  feedback.style.color = 'var(--color-green)';
                  feedback.style.borderColor = 'var(--color-green)';
                  feedback.style.display = 'block';
                  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }
            } else {
              if (feedback) {
                feedback.textContent = `Error: ${result.message || 'Submission failed. Please check your inputs and try again.'}`;
                feedback.style.backgroundColor = '#FFEBEE';
                feedback.style.color = '#C62828';
                feedback.style.borderColor = '#C62828';
                feedback.style.display = 'block';
                feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            if (feedback) {
              feedback.textContent = 'Unable to reach server. Please ensure the backend server is running and try again.';
              feedback.style.backgroundColor = '#FFEBEE';
              feedback.style.color = '#C62828';
              feedback.style.borderColor = '#C62828';
              feedback.style.display = 'block';
              feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });
      });
    }

    initAIChat() {
      const launcher = document.getElementById('ai-chat-launcher');
      const panel = document.getElementById('ai-chat-panel');
      const closeButton = document.getElementById('ai-chat-close');
      const form = document.getElementById('ai-chat-form');
      const input = document.getElementById('ai-chat-input');
      const messages = document.getElementById('ai-chat-messages');

      if (!launcher || !panel || !closeButton || !form || !input || !messages) return;

      const getApiBase = () => {
        if (window.location.protocol === 'file:' || !window.location.hostname) {
          return 'http://127.0.0.1:5000';
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          if (window.location.port && window.location.port !== '5000') {
            return 'http://127.0.0.1:5000';
          }
        }
        return '';
      };

      const togglePanel = (isOpen) => {
        panel.classList.toggle('is-open', isOpen);
        panel.setAttribute('aria-hidden', String(!isOpen));
        launcher.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
          input.focus();
          messages.scrollTop = messages.scrollHeight;
        }
      };

      const addMessage = (text, type) => {
        const message = document.createElement('div');
        message.className = `ai-chat-message ai-chat-message-${type}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
      };

      launcher.addEventListener('click', () => {
        const isOpen = panel.classList.contains('is-open');
        togglePanel(!isOpen);
      });
      closeButton.addEventListener('click', () => togglePanel(false));
      
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          form.requestSubmit();
        }
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        input.value = '';
        input.disabled = true;
        const sendBtn = form.querySelector('button[type="submit"]');
        if (sendBtn) sendBtn.disabled = true;

        const loadingMessage = addMessage('Thinking...', 'assistant');

        try {
          const chatUrl = `${getApiBase()}/api/chat`;
          const response = await fetch(chatUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          });
          const result = await response.json().catch(() => ({}));
          
          if (response.ok && result.status === 'success' && result.reply) {
            loadingMessage.textContent = result.reply;
          } else {
            loadingMessage.textContent = result.message || 'The assistant is temporarily unavailable. Please try again shortly.';
          }
        } catch (error) {
          loadingMessage.textContent = 'Unable to connect to the assistant. Please check your internet connection or ensure the server is running.';
        } finally {
          input.disabled = false;
          if (sendBtn) sendBtn.disabled = false;
          input.focus();
          messages.scrollTop = messages.scrollHeight;
        }
      });
    }
  }

  // Instantiate the Main Application class on load
  document.addEventListener('DOMContentLoaded', () => {
    new MainApp();
  });
