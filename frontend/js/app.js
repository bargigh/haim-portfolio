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
});

// Portfolio Management
let portfolioData = [];
let currentFilter = 'all';

async function initializePortfolio() {
    try {
        // For now, show loading state until Sanity is configured
        showLoadingState('portfolioGrid');
        
        // This will be replaced with actual Sanity data fetching
        if (SANITY_CONFIG.projectId !== 'YOUR_PROJECT_ID') {
            portfolioData = await fetchPortfolioFromSanity();
            renderPortfolio();
        } else {
            // Show demo content for now
            showDemoPortfolio();
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showErrorState('portfolioGrid', 'Failed to load portfolio');
    }

    // Setup filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
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
        category,
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
        <img src="${imageUrl}" alt="${item.title}" loading="lazy">
        <div class="portfolio-overlay">
            <div class="portfolio-info">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
            </div>
        </div>
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
        
        if (SANITY_CONFIG.projectId !== 'xotjnbwo') {
            videoData = await fetchVideosFromSanity();
            renderVideos();
        } else {
            showDemoVideos();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showErrorState('videoGrid', 'Failed to load videos');
    }
    
    // Setup video filter buttons
    const videoFilterButtons = document.querySelectorAll('.video-filters .filter-btn');
    videoFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            videoFilterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentVideoFilter = this.dataset.filter;
            renderVideos();
        });
    });
}

async function fetchVideosFromSanity() {
    const query = `*[_type == "video"] | order(orderRank) {
        _id,
        title,
        description,
        youtubeUrl,
        customThumbnail,
        featured
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

    filteredData.forEach(video => {
        const videoItem = createVideoItem(video);
        grid.appendChild(videoItem);
    });
}

function createVideoItem(video) {
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
    
    div.addEventListener('click', () => openVideo(video.youtubeUrl));
    return div;
}

function showDemoVideos() {
    // Use actual demo data with your videos
    if (typeof useDemoData === 'function') {
        // Demo data is already loaded, just render
        renderVideos();
    }
}

function openVideo(youtubeUrl) {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
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
    
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDescription) lightboxDescription.textContent = item.description || '';
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