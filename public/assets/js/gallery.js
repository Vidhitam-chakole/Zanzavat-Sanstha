/**
 * Zanzavat Bahuudeshiya Shaikshanik Sanstha - Gallery Controller Class
 * Manages masonry filters, Lightbox navigation, and the horizontal Spotlight Slider.
 */

class GalleryController {
  constructor() {
    this.lightboxImages = [];
    this.currentLightboxIndex = 0;
    
    this.initGalleryFilters();
    this.initLightbox();
    this.initSpotlightSlider();
  }

  /**
   * 1. Gallery Category Filtering
   */
  initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-masonry-item');
    
    if (filterButtons.length === 0 || galleryItems.length === 0) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          
          if (filterValue === 'all' || itemCategory === filterValue) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 10);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });

        // Update lightbox pool to only include currently visible images
        setTimeout(() => this.updateLightboxPool(), 350);
      });
    });

    // Run initially
    this.updateLightboxPool();
  }

  /**
   * Updates the array of images available to browse inside the Lightbox
   */
  updateLightboxPool() {
    const visibleItems = document.querySelectorAll('.gallery-masonry-item[style*="display: block"], .gallery-masonry-item:not([style*="display: none"])');
    
    this.lightboxImages = [];
    visibleItems.forEach(item => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-item-title')?.textContent || '';
      const tag = item.querySelector('.gallery-item-tag')?.textContent || '';
      if (img) {
        this.lightboxImages.push({
          src: img.src,
          caption: `${title} - ${tag}`
        });
      }
    });
  }

  /**
   * 2. Lightbox System
   */
  initLightbox() {
    const modal = document.querySelector('.lightbox-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.lightbox-close');
    const prevBtn = modal.querySelector('.lightbox-prev');
    const nextBtn = modal.querySelector('.lightbox-next');
    const lightboxImg = modal.querySelector('.lightbox-image');
    const captionText = modal.querySelector('.lightbox-caption');

    // Make openLightbox available globally so other scripts (e.g. events.js) can call it
    window.openLightbox = (imgSrc, caption = '') => {
      lightboxImg.src = imgSrc;
      captionText.textContent = caption;
      modal.classList.add('is-active');
      
      // Find index of clicked image in the current visible pool
      this.currentLightboxIndex = this.lightboxImages.findIndex(img => img.src === imgSrc);
    };

    const closeLightbox = () => {
      modal.classList.remove('is-active');
    };

    closeBtn.addEventListener('click', closeLightbox);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    const showImage = (index) => {
      if (index < 0) index = this.lightboxImages.length - 1;
      if (index >= this.lightboxImages.length) index = 0;
      
      this.currentLightboxIndex = index;
      const nextImg = this.lightboxImages[this.currentLightboxIndex];
      lightboxImg.src = nextImg.src;
      captionText.textContent = nextImg.caption;
    };

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(this.currentLightboxIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(this.currentLightboxIndex + 1);
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(this.currentLightboxIndex - 1);
      if (e.key === 'ArrowRight') showImage(this.currentLightboxIndex + 1);
    });

    // Setup click triggers on all masonry items
    const galleryItems = document.querySelectorAll('.gallery-masonry-item');
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-item-title')?.textContent || '';
        const tag = item.querySelector('.gallery-item-tag')?.textContent || '';
        if (img) {
          window.openLightbox(img.src, `${title} - ${tag}`);
        }
      });
    });
  }

  /**
   * 3. Spotlight Scrolling Image Slider (Middle Active Spotlight)
   */
  initSpotlightSlider() {
    const wrapper = document.querySelector('.spotlight-slider-wrapper');
    const track = document.querySelector('.spotlight-track');
    if (!wrapper || !track) return;

    const slides = Array.from(track.querySelectorAll('.spotlight-slide'));
    if (slides.length === 0) return;

    // Clone slides for infinite loop
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      track.appendChild(clone);
    });
    
    const allSlides = Array.from(track.querySelectorAll('.spotlight-slide'));
    
    // Click triggers
    allSlides.forEach(slide => {
      slide.addEventListener('click', () => {
        const img = slide.querySelector('img');
        const caption = slide.querySelector('.spotlight-slide-overlay')?.textContent || '';
        if (img && typeof window.openLightbox === 'function') {
          window.openLightbox(img.src, caption.trim());
        }
      });
    });

    let translateX = 0;
    let isHovered = false;
    const speed = 0.5;

    // Hover listeners to pause/play scroll
    wrapper.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    wrapper.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    const updateSpotlight = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperCenter = wrapperRect.left + (wrapperRect.width / 2);

      let closestSlide = null;
      let minDistance = Infinity;

      allSlides.forEach(slide => {
        const slideRect = slide.getBoundingClientRect();
        const slideCenter = slideRect.left + (slideRect.width / 2);
        const distance = Math.abs(slideCenter - wrapperCenter);

        slide.classList.remove('is-spotlighted');

        if (distance < minDistance) {
          minDistance = distance;
          closestSlide = slide;
        }
      });

      if (closestSlide) {
        closestSlide.classList.add('is-spotlighted');
      }
    };

    const animate = () => {
      if (!isHovered) {
        translateX -= speed;
        
        const gap = 30;
        const slideWidth = slides[0].offsetWidth;
        const singleTrackWidth = (slideWidth + gap) * slides.length;

        // Loop around seamlessly
        if (Math.abs(translateX) >= singleTrackWidth) {
          translateX = 0;
        }

        track.style.transform = `translateX(${translateX}px)`;
      }

      updateSpotlight();
      requestAnimationFrame(animate);
    };

    setTimeout(() => {
      updateSpotlight();
      requestAnimationFrame(animate);
    }, 100);

    window.addEventListener('resize', updateSpotlight);
  }
}

// Instantiate the Gallery Controller class on load
document.addEventListener('DOMContentLoaded', () => {
  new GalleryController();
});
