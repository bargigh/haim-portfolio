// Demo portfolio data with actual photos
const demoPortfolioData = [
    {
        _id: '1',
        title: 'Abstract Form',
        description: 'Black and white artistic nude study',
        category: 'portrait',
        image: 'assets/images/portrait-01.jpg',
        featured: true
    },
    {
        _id: '2',
        title: 'Studio Elegance',
        description: 'Classic studio portrait with dramatic lighting',
        category: 'studio',
        image: 'assets/images/studio-01.jpg',
        featured: true
    },
    {
        _id: '3',
        title: 'Urban Solitude',
        description: 'City skyline portrait with contemplative mood',
        category: 'portrait',
        image: 'assets/images/portrait-02.jpg',
        featured: false
    },
    {
        _id: '4',
        title: 'Light & Shadow',
        description: 'Experimental lighting with dramatic contrast',
        category: 'commercial',
        image: 'assets/images/commercial-01.jpg',
        featured: true
    },
    {
        _id: '5',
        title: 'Industrial Beauty',
        description: 'Behind-the-scenes production photography',
        category: 'commercial',
        image: 'assets/images/commercial-02.jpg',
        featured: false
    },
    {
        _id: '6',
        title: 'Golden Hour',
        description: 'Portrait with warm dramatic lighting',
        category: 'portrait',
        image: 'assets/images/portrait-03.jpg',
        featured: true
    },
    {
        _id: '7',
        title: 'Intimate Moment',
        description: 'Couple portrait with soft lighting',
        category: 'portrait',
        image: 'assets/images/portrait-04.jpg',
        featured: false
    },
    {
        _id: '8',
        title: 'Rooftop Session',
        description: 'Architectural studio photography',
        category: 'studio',
        image: 'assets/images/studio-02.jpg',
        featured: true
    }
];

const demoVideoData = [
    {
        _id: 'v1',
        title: 'Visual Story I',
        description: 'Cinematic storytelling and visual narrative',
        youtubeUrl: 'https://youtu.be/rE1j-sjP5Hk',
        category: 'commercial',
        featured: true
    },
    {
        _id: 'v2',
        title: 'Creative Vision II',
        description: 'Artistic cinematography and direction',
        youtubeUrl: 'https://youtu.be/lFmQFlIdyr4',
        category: 'music',
        featured: true
    },
    {
        _id: 'v3',
        title: 'Production Work III',
        description: 'Professional video production showcase',
        youtubeUrl: 'https://youtu.be/2K8KQEcXv4s',
        category: 'documentary',
        featured: false
    },
    {
        _id: 'v4',
        title: 'Visual Narrative IV',
        description: 'Documentary and commercial work',
        youtubeUrl: 'https://youtu.be/bDU3xlj6Wzc',
        category: 'commercial',
        featured: true
    },
    {
        _id: 'v5',
        title: 'Cinematic Piece V',
        description: 'Creative direction and cinematography',
        youtubeUrl: 'https://youtu.be/xmdVEgJ3gIM',
        category: 'corporate',
        featured: false
    },
    {
        _id: 'v6',
        title: 'Latest Work VI',
        description: 'Recent cinematography and production',
        youtubeUrl: 'https://youtu.be/-d6ffZjZvPk',
        category: 'event',
        featured: true
    }
];

// Function to use demo data when Sanity is not available
function useDemoData() {
    portfolioData = demoPortfolioData;
    videoData = demoVideoData;
    
    renderPortfolio();
    renderVideos();
}