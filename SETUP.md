# Portfolio Setup Guide

## Prerequisites
- GitHub account (`bargigh`)
- Domain: `haimbargig.com`
- Sanity.io account (free)

## Step 1: Create Sanity Project

1. Visit [sanity.io](https://sanity.io) and sign in/up
2. Create a new project:
   - Project name: "Haim Bargig Portfolio"
   - Dataset: "production"
   - Template: "Clean"

3. Note the **Project ID** (you'll need this)

## Step 2: Configure Sanity

1. Replace `YOUR_PROJECT_ID` in these files:
   - `/sanity/sanity.config.js`
   - `/sanity/sanity.cli.js`
   - `/frontend/js/app.js`

2. Install dependencies:
   ```bash
   cd sanity
   npm install sanity @sanity/vision
   ```

3. Start Sanity Studio:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3333](http://localhost:3333)
5. Add some sample content:
   - Photos with categories
   - Videos with YouTube URLs
   - Site settings

## Step 3: Create GitHub Repository

1. Create new repository: `haim-portfolio`
2. Upload this project to the repository
3. Go to Settings > Pages
4. Set source to "GitHub Actions"

## Step 4: Configure Custom Domain

1. In your domain registrar, set up DNS:
   ```
   Type: CNAME
   Name: www
   Value: bargigh.github.io
   
   Type: A (or AAAA)
   Name: @
   Values: 
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

2. In GitHub repository:
   - Settings > Pages > Custom domain
   - Enter: `haimbargig.com`
   - Enable "Enforce HTTPS"

## Step 5: Deploy

1. Push to main branch
2. GitHub Actions will automatically deploy
3. Site will be live at `haimbargig.com`

## Content Management

- **Add Photos**: Sanity Studio > Photos > Create
- **Add Videos**: Sanity Studio > Videos > Create
- **Update Settings**: Sanity Studio > Site Settings

## Image Optimization

Photos are automatically:
- Resized to fit design
- Compressed for web
- Served via Sanity CDN
- Cropped to aspect ratio

## Video Features

- YouTube integration
- Custom thumbnail upload
- Automatic fallback to YouTube thumbnails
- Responsive video grid

## Support

If you need help:
1. Check Sanity documentation
2. Verify DNS settings
3. Check GitHub Actions logs
4. Ensure project IDs are correct

## Next Steps (Future Features)

- Studio booking system
- Contact form
- Client galleries
- Payment integration
- SEO optimization
- Analytics