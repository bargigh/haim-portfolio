// Sanity Configuration
const SANITY_CONFIG = {
    projectId: 'xotjnbwo',
    dataset: 'production',
    useCdn: true,
    apiVersion: '2024-01-01'
};

// Sanity Image URL Builder
function imageUrlFor(source, width = 800, height = 600) {
    if (!source || !SANITY_CONFIG.projectId) return '';
    
    const baseUrl = `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}`;
    if (source.asset && source.asset._ref) {
        const ref = source.asset._ref;
        const [id, extension] = ref.replace('image-', '').split('-');
        return `${baseUrl}/${id}.${extension}?w=${width}&h=${height}&fit=crop&auto=format`;
    }
    return '';
}

// YouTube Thumbnail Extractor
function getYouTubeThumbnail(url) {
    const videoId = extractYouTubeVideoId(url);
    // hqdefault exists for every YouTube video (maxresdefault 404s for ~1/3 of them)
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}

function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Mobile menu toggle
    hamburger?.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling (only for same-page anchor links)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return; // let normal page links navigate
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize portfolio
    initializePortfolio();
    initializeVideos();
    initializeStudio();
    initializeLightbox();
    initializeVideoModal();
    applyHashFilter(); // open category from URL hash (e.g. /#nudes)
    initHeroSlideshow();
});

// ===== Hero slideshow =====
function initHeroSlideshow() {
    const root = document.getElementById('heroSlideshow');
    if (!root || typeof SLIDESHOW === 'undefined' || typeof demoPortfolioData === 'undefined') return;
    const byId = {};
    demoPortfolioData.forEach(i => byId[i._id] = i);
    const slides = SLIDESHOW.map(id => byId[id]).filter(i => i && i.image);
    if (!slides.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = slides.map((item, idx) => {
        const d = document.createElement('div');
        d.className = 'hero-slide' + (idx === 0 ? ' active' : '');
        if (idx === 0) d.style.backgroundImage = `url(${item.image})`; // first slide loads immediately
        d.dataset.src = item.image;
        root.insertBefore(d, root.firstChild);
        return d;
    });
    const loadSlide = i => {
        const el = els[i];
        if (el && !el.style.backgroundImage) el.style.backgroundImage = `url(${el.dataset.src})`;
    };
    // Lazy-load remaining slides after window load (don't compete with LCP)
    window.addEventListener('load', () => setTimeout(() => els.forEach((_, i) => loadSlide(i)), 1500));

    const dotsBox = document.getElementById('slideDots');
    const dots = els.map((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Slide ' + (i + 1));
        if (i === 0) b.classList.add('active');
        b.addEventListener('click', () => { show(i); restart(); });
        dotsBox.appendChild(b);
        return b;
    });

    let cur = 0, timer = null, paused = false;
    function show(i) {
        i = (i + els.length) % els.length;
        loadSlide(i);
        loadSlide((i + 1) % els.length);
        els[cur].classList.remove('active');
        dots[cur].classList.remove('active');
        cur = i;
        els[cur].classList.add('active');
        dots[cur].classList.add('active');
    }
    function tick() { if (!paused) show(cur + 1); }
    function start() { if (!reduced && !timer) timer = setInterval(tick, 5000); }
    function restart() { if (timer) { clearInterval(timer); timer = null; } start(); }
    start();

    document.getElementById('slidePrev').addEventListener('click', () => { show(cur - 1); restart(); });
    document.getElementById('slideNext').addEventListener('click', () => { show(cur + 1); restart(); });

    const hero = root.closest('.hero') || root;
    hero.addEventListener('mouseenter', () => paused = true);
    hero.addEventListener('mouseleave', () => paused = false);

    // Touch: pause while touching, swipe to navigate
    let tx = null, ty = null;
    hero.addEventListener('touchstart', e => {
        paused = true;
        tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    hero.addEventListener('touchend', e => {
        paused = false;
        if (tx === null) return;
        const dx = e.changedTouches[0].clientX - tx;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            show(dx < 0 ? cur + 1 : cur - 1);
            restart();
        }
        tx = ty = null;
    }, { passive: true });
}

async function initializeSiteSettings() {
    try {
        const query = `*[_type == "siteSettings"][0] { heroImage, aboutImage }`;
        const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.result?.heroImage) {
            const heroUrl = imageUrlFor(data.result.heroImage, 1920);
            const heroBg = document.querySelector('.hero-background');
            if (heroUrl && heroBg) heroBg.style.backgroundImage = `url(${heroUrl})`;
        }
        if (data.result?.aboutImage) {
            const aboutUrl = imageUrlFor(data.result.aboutImage, 800);
            const el = document.getElementById('aboutImage');
            if (aboutUrl && el) el.src = aboutUrl;
        }
    } catch(e) {
        console.warn('Could not load site settings:', e);
    }
}

// Studio gallery (separate service section, not part of the portfolio)
function initializeStudio() {
    const grid = document.getElementById('studioGrid');
    if (!grid || typeof studioImages === 'undefined') return;
    studioImages.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'studio-item';
        div.innerHTML = `<img src="${src}" alt="Haim's Studio ${i + 1}" loading="lazy">`;
        div.addEventListener('click', () => openStudioLightbox(i));
        grid.appendChild(div);
    });
}

let studioLightboxIndex = 0;
function openStudioLightbox(i) {
    if (typeof studioImages === 'undefined') return;
    studioLightboxIndex = i;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    img.src = studioImages[i];
    lightbox?.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightbox.dataset.mode = 'studio';
}

// Portfolio Management
let portfolioData = [];
let currentFilter = 'all';

async function initializePortfolio() {
    // Static data is the source of truth (mirrored from the original Wix site, order preserved).
    try {
        showDemoPortfolio();
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showErrorState('portfolioGrid', 'Failed to load portfolio');
    }
}

function renderPhotoFilterButtons(categories) {
    const container = document.querySelector('.portfolio-filters');
    if (!container) return;
    container.innerHTML = `<button class="filter-btn active" data-filter="all">All</button>`;
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = cat.slug;
        btn.textContent = cat.title;
        container.appendChild(btn);
    });
    container.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderPortfolio();
            updateHashForFilter(this.dataset.filter);
        });
    });
}

// ── Hash routing (shareable category links: #portraits, #personal-work, #nudes) ──
const HASH_TO_SLUG = { 'portraits': 'portraits', 'personal-work': 'abstruct-landscapes', 'nudes': 'nudes', 'all': 'all' };
const SLUG_TO_HASH = { 'portraits': 'portraits', 'abstruct-landscapes': 'personal-work', 'nudes': 'nudes', 'all': 'all' };

function updateHashForFilter(slug) {
    const h = SLUG_TO_HASH[slug];
    if (h) history.replaceState(null, '', h === 'all' ? '#portfolio' : '#' + h);
}

function applyHashFilter() {
    const h = location.hash.replace('#', '');
    const slug = HASH_TO_SLUG[h];
    if (!slug) return;
    currentFilter = slug;
    const container = document.querySelector('.portfolio-filters');
    container?.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.filter === slug));
    renderPortfolio();
    document.getElementById('portfolio')?.scrollIntoView();
}

window.addEventListener('hashchange', applyHashFilter);

async function fetchPortfolioFromSanity() {
    const query = `*[_type == "photo"] | order(orderRank) {
        _id,
        title,
        description,
        credit,
        "category": category->slug.current,
        image,
        featured
    }`;
    
    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data.result || [];
}

function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    const filteredData = currentFilter === 'all' 
        ? portfolioData 
        : portfolioData.filter(item => item.category === currentFilter);

    grid.innerHTML = '';
    
    if (filteredData.length === 0) {
        grid.innerHTML = '<div class="no-items">No items found</div>';
        return;
    }

    filteredData.forEach((item, index) => {
        const portfolioItem = createPortfolioItem(item, index);
        grid.appendChild(portfolioItem);
    });
}

function createPortfolioItem(item, index) {
    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.dataset.index = index;
    
    // Use Sanity URL if available, otherwise use local asset
    const imageUrl = item.image.startsWith('assets/') ? item.image : imageUrlFor(item.image, 800, 600);
    
    div.innerHTML = `
        <img src="${imageUrl}" alt="" loading="lazy">
        <div class="portfolio-overlay"></div>
    `;
    
    div.addEventListener('click', () => openLightbox(index));
    return div;
}

function showDemoPortfolio() {
    // Use actual demo data with your photos
    if (typeof useDemoData === 'function') {
        useDemoData();
    }
}

// Video Management
let videoData = [];
let currentVideoFilter = 'all';

async function initializeVideos() {
    // Static data is the source of truth (mirrored from the original Wix site, order preserved).
    try {
        showDemoVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
        showErrorState('videoGrid', 'Failed to load videos');
    }
}

function renderVideoFilterButtons(categories) {
    const container = document.querySelector('.video-filters');
    if (!container) return;
    container.innerHTML = `<button class="filter-btn active" data-filter="all">All</button>`;
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = cat.slug;
        btn.textContent = cat.title;
        container.appendChild(btn);
    });
    container.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentVideoFilter = this.dataset.filter;
            renderVideos();
        });
    });
}

async function fetchCategoriesFromSanity(type) {
    const query = `*[_type == "category" && (type == "${type}" || type == "both")] | order(order asc) {
        title,
        "slug": slug.current
    }`;
    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.result || [];
}

async function fetchVideosFromSanity() {
    const query = `*[_type == "video" && visible == true] | order(order asc) {
        _id,
        title,
        description,
        youtubeUrl,
        customThumbnail,
        featured,
        "category": category->slug.current,
        visible
    }`;
    
    const url = `https://${SANITY_CONFIG.projectId}.api.sanity.io/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data.result || [];
}

function renderVideos() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    const filteredData = currentVideoFilter === 'all' 
        ? videoData 
        : videoData.filter(item => item.category === currentVideoFilter);

    grid.innerHTML = '';
    
    if (filteredData.length === 0) {
        grid.innerHTML = '<div class="no-items">No videos found in this category</div>';
        return;
    }

    filteredData.forEach((video, index) => {
        const videoItem = createVideoItem(video, index);
        grid.appendChild(videoItem);
    });
}

function createVideoItem(video, index) {
    const div = document.createElement('div');
    div.className = 'video-item';
    
    const thumbnailUrl = video.customThumbnail 
        ? imageUrlFor(video.customThumbnail, 800, 450)
        : getYouTubeThumbnail(video.youtubeUrl);
    
    div.innerHTML = `
        <img src="${thumbnailUrl}" alt="${video.title}" class="video-thumbnail" loading="lazy" onerror="this.onerror=null;this.src=this.src.replace('hqdefault','mqdefault');">
        <div class="play-button"></div>
        <div class="video-info">
            <h3>${video.title}</h3>
            <p>${video.description || ''}</p>
        </div>
    `;
    
    div.addEventListener('click', () => openVideo(video.youtubeUrl, index));
    return div;
}

function showDemoVideos() {
    if (typeof demoVideoData !== 'undefined') {
        videoData = demoVideoData;
        if (typeof demoVideoCategories !== 'undefined') renderVideoFilterButtons(demoVideoCategories);
        renderVideos();
    }
}

let currentVideoIndex = 0;

function getFilteredVideos() {
    return currentVideoFilter === 'all'
        ? videoData
        : videoData.filter(item => item.category === currentVideoFilter);
}

function openVideo(youtubeUrl, index) {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) return;
    currentVideoIndex = index ?? 0;
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function navigateVideo(direction) {
    const filtered = getFilteredVideos();
    if (!filtered.length) return;
    currentVideoIndex = (currentVideoIndex + direction + filtered.length) % filtered.length;
    const video = filtered[currentVideoIndex];
    const videoId = extractYouTubeVideoId(video.youtubeUrl);
    if (!videoId) return;
    const iframe = document.getElementById('videoIframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    iframe.src = '';
    modal?.classList.remove('active');
    document.body.style.overflow = '';
}

function initializeVideoModal() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('videoModalClose');
    const prevBtn = document.getElementById('videoPrevBtn');
    const nextBtn = document.getElementById('videoNextBtn');
    closeBtn?.addEventListener('click', closeVideoModal);
    prevBtn?.addEventListener('click', () => navigateVideo(-1));
    nextBtn?.addEventListener('click', () => navigateVideo(1));
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeVideoModal(); });
    document.addEventListener('keydown', (e) => {
        if (!modal?.classList.contains('active')) return;
        if (e.key === 'Escape') closeVideoModal();
        if (e.key === 'ArrowLeft') navigateVideo(-1);
        if (e.key === 'ArrowRight') navigateVideo(1);
    });
}

// Lightbox
let currentImageIndex = 0;

function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', () => navigateLightbox(-1));
    nextBtn?.addEventListener('click', () => navigateLightbox(1));

    // Close on background click
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Touch / swipe navigation
    let touchStartX = 0;
    lightbox?.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, {passive: true});
    lightbox?.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) navigateLightbox(diff > 0 ? 1 : -1);
    }, {passive: true});
}

function openLightbox(index) {
    if (portfolioData.length === 0) return;
    
    currentImageIndex = index;
    updateLightboxContent();
    
    const lightbox = document.getElementById('lightbox');
    lightbox?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) delete lightbox.dataset.mode;
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox?.dataset.mode === 'studio' && typeof studioImages !== 'undefined') {
        studioLightboxIndex = (studioLightboxIndex + direction + studioImages.length) % studioImages.length;
        document.getElementById('lightboxImage').src = studioImages[studioLightboxIndex];
        return;
    }
    const filteredData = currentFilter === 'all' 
        ? portfolioData 
        : portfolioData.filter(item => item.category === currentFilter);
    
    if (filteredData.length === 0) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = filteredData.length - 1;
    } else if (currentImageIndex >= filteredData.length) {
        currentImageIndex = 0;
    }
    
    updateLightboxContent();
}

function updateLightboxContent() {
    const filteredData = currentFilter === 'all' 
        ? portfolioData 
        : portfolioData.filter(item => item.category === currentFilter);
    
    if (filteredData.length === 0) return;
    
    const item = filteredData[currentImageIndex];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    if (lightboxImage) {
        // Use Sanity URL if available, otherwise use local asset
        const imageUrl = item.image.startsWith('assets/') ? item.image : imageUrlFor(item.image, 1200, 900);
        lightboxImage.src = imageUrl;
        lightboxImage.alt = item.title;
    }
    
    if (lightboxTitle) lightboxTitle.textContent = '';
    if (lightboxDescription) {
        const credit = item.credit ? `© ${item.credit}` : '';
        lightboxDescription.textContent = [item.description, credit].filter(Boolean).join('  ·  ');
    }
}

// Utility Functions
function showLoadingState(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="loading">
            <div class="loading-placeholder"></div>
        </div>
        <div class="loading">
            <div class="loading-placeholder"></div>
        </div>
        <div class="loading">
            <div class="loading-placeholder"></div>
        </div>
    `;
}

function showErrorState(gridId, message) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = `<div class="error-message">${message}</div>`;
}

// Scroll-based navbar background
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});
// Hidden events gallery — activated via ?events URL param
(function() {
    if (window.location.search.includes('events')) {
        document.addEventListener('DOMContentLoaded', function() {
            // Show events heading
            const section = document.getElementById('portfolio');
            if (section) {
                const title = section.querySelector('.section-title');
                if (title) title.textContent = 'Events Portfolio';
            }
            // Force events filter
            currentFilter = 'events';
            // Add visible events button
            const filters = document.querySelector('.portfolio-filters');
            if (filters) {
                filters.style.display = 'none'; // hide filter bar entirely for clean look
            }
            // Re-render after data loads
            const orig = window.useDemoData;
            window.useDemoData = function() {
                portfolioData = demoPortfolioData;
                currentFilter = 'events';
                renderPortfolio();
            };
        });
    }
})();
