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
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
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

    // Smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
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
    initializeLightbox();
    initializeVideoModal();
});

// Portfolio Management
let portfolioData = [];
let currentFilter = 'all';

async function initializePortfolio() {
    try {
        showLoadingState('portfolioGrid');
        const [photos, categories] = await Promise.all([
            fetchPortfolioFromSanity(),
            fetchCategoriesFromSanity('photo')
        ]);
        portfolioData = photos.length > 0 ? photos : (showDemoPortfolio(), []);
        if (categories.length > 0) renderPhotoFilterButtons(categories);
        if (portfolioData.length > 0) renderPortfolio();
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
        });
    });
}

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
    try {
        showLoadingState('videoGrid');
        const [videos, categories] = await Promise.all([
            fetchVideosFromSanity(),
            fetchCategoriesFromSanity('video')
        ]);
        videoData = videos.length > 0 ? videos : (showDemoVideos(), []);
        if (categories.length > 0) renderVideoFilterButtons(categories);
        if (videoData.length > 0) renderVideos();
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
        <img src="${thumbnailUrl}" alt="${video.title}" class="video-thumbnail" loading="lazy">
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
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
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
