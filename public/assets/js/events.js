/**
 * Zanzavat Bahuudeshiya Shaikshanik Sanstha - Events Router Class
 * Manages fetching events.json and routing between list view and details view.
 */

class EventsRouter {
  constructor() {
    this.listContainer = document.getElementById('events-list-section');
    this.detailContainer = document.getElementById('events-detail-section');
    this.gridElement = document.getElementById('events-grid');
    this.events = [];

    if (this.listContainer && this.detailContainer && this.gridElement) {
      this.init();
      // Listen for window hash changes
      window.addEventListener('hashchange', () => this.handleRouting());
    }
  }

  /**
   * Initialize and load database
   */
  async init() {
    try {
      const response = await fetch('public/assets/data/events.json');
      if (!response.ok) {
        throw new Error('Failed to load events database');
      }
      this.events = await response.json();
      this.handleRouting();
    } catch (err) {
      console.error('Events System Error:', err);
      this.gridElement.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-primary);">
          <h3>Unable to load events at this time</h3>
          <p>Please ensure you are opening this page via a local server (e.g., live server) or check console logs.</p>
        </div>
      `;
    }
  }

  /**
   * Router handler based on hash state
   */
  handleRouting() {
    const hash = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    const eventId = hash || queryId;

    if (eventId && this.events.length > 0) {
      const activeEvent = this.events.find(e => e.id === eventId);
      if (activeEvent) {
        this.renderEventDetails(activeEvent);
      } else {
        this.renderEventsList();
      }
    } else {
      this.renderEventsList();
    }
  }

  /**
   * Renders the grid of events
   */
  renderEventsList() {
    this.detailContainer.style.display = 'none';
    this.listContainer.style.display = 'block';
    this.gridElement.innerHTML = '';

    // Sort events by date (newest first)
    const sortedEvents = [...this.events].sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

    sortedEvents.forEach(event => {
      const card = document.createElement('div');
      card.className = 'card reveal active';
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${event.coverImage}" alt="${event.title}" onerror="this.src='public/assets/images/logo/logo-placeholder.webp';">
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="icon">📅</span> ${event.date}
          </div>
          <h3 class="card-title">${event.title}</h3>
          <p class="card-text">${event.description}</p>
          <a href="#${event.id}" class="btn btn-primary btn-sm" style="margin-top: auto; align-self: flex-start;">View Details</a>
        </div>
      `;
      this.gridElement.appendChild(card);
    });
  }

  /**
   * Renders detailed view of a single event
   */
  renderEventDetails(event) {
    this.listContainer.style.display = 'none';
    this.detailContainer.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const backBtn = this.detailContainer.querySelector('.event-detail-back');
    const heroSection = this.detailContainer.querySelector('.event-detail-hero');
    const heroContent = this.detailContainer.querySelector('.event-detail-hero-content');
    const mainContent = this.detailContainer.querySelector('.event-detail-main');
    const sidebarContent = this.detailContainer.querySelector('.event-sidebar-info-box');
    const gallerySection = this.detailContainer.querySelector('.event-detail-gallery');
    const galleryGrid = this.detailContainer.querySelector('.event-detail-gallery-grid');

    backBtn.onclick = () => {
      window.location.hash = '';
    };

    heroSection.style.backgroundImage = `url('${event.coverImage}')`;
    heroContent.innerHTML = `
      <div class="event-detail-meta">Zanzavat Events &bull; ${event.date}</div>
      <h1 class="event-detail-title">${event.title}</h1>
    `;

    mainContent.innerHTML = `
      <h3 class="section-tag">The Story</h3>
      <h2 style="font-family: var(--font-serif); margin-bottom: 20px;">Impact and Service Highlight</h2>
      <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 30px;">${event.longDescription}</p>
    `;

    sidebarContent.innerHTML = `
      <h4 class="event-detail-sidebar-title">Event Information</h4>
      <div class="event-sidebar-info-item">
        <div class="icon">📍</div>
        <div>
          <div class="event-sidebar-info-label">Location</div>
          <div class="event-sidebar-info-value">${event.location}</div>
        </div>
      </div>
      <div class="event-sidebar-info-item">
        <div class="icon">📅</div>
        <div>
          <div class="event-sidebar-info-label">Date Held</div>
          <div class="event-sidebar-info-value">${event.date}</div>
        </div>
      </div>
    `;

    if (event.statistics && event.statistics.length > 0) {
      const statsContainer = document.createElement('div');
      statsContainer.style.marginTop = '30px';
      statsContainer.style.display = 'grid';
      statsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
      statsContainer.style.gap = '15px';
      
      event.statistics.forEach(stat => {
        statsContainer.innerHTML += `
          <div class="program-stat-item" style="padding: 10px;">
            <div class="program-stat-val" style="font-size: 1.25rem;">${stat.value}</div>
            <div class="program-stat-lbl" style="font-size: 0.65rem;">${stat.label}</div>
          </div>
        `;
      });
      sidebarContent.appendChild(statsContainer);
    }

    if (event.galleryImages && event.galleryImages.length > 0) {
      gallerySection.style.display = 'block';
      galleryGrid.innerHTML = '';
      
      event.galleryImages.forEach(imgUrl => {
        const item = document.createElement('div');
        item.className = 'event-detail-gallery-item';
        item.innerHTML = `
          <img src="${imgUrl}" alt="Event photo" onerror="this.src='public/assets/images/logo/logo-placeholder.webp';">
        `;
        item.addEventListener('click', () => {
          if (typeof openLightbox === 'function') {
            openLightbox(imgUrl, event.title);
          }
        });
        galleryGrid.appendChild(item);
      });
    } else {
      gallerySection.style.display = 'none';
    }
  }
}

// Instantiate the Events Router class on load
document.addEventListener('DOMContentLoaded', () => {
  new EventsRouter();
});
