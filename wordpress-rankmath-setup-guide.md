# WordPress + RankMath Setup Guide for Vancouver Roof Cleaning Site

## Step 1: WordPress Installation (Local WP)

### Create Your Local WordPress Site
1. **Open Local WP** and click "Create a new site"
2. **Site Name:** "Vancouver Roof Cleaning" 
3. **Local Domain:** `vancouver-roof-cleaning.local`
4. **Environment:** Choose "Preferred" or "Custom" (PHP 8.1, MySQL 8.0)
5. **WordPress Admin Credentials:**
   - Username: `admin`
   - Password: `[secure-password]`
   - Email: `your-email@domain.com`

## Step 2: Essential Plugin Installation

### Required Plugins (Install via WP Admin → Plugins → Add New)
1. **Rank Math SEO** (Primary SEO plugin)
2. **Elementor** or **Beaver Builder** (For easy page building)
3. **WP Forms** (Contact form functionality)
4. **Google Analytics for WordPress by MonsterInsights**
5. **UpdraftPlus** (Backup solution)
6. **Smush** (Image optimization)

## Step 3: Import Your Landing Page Content

### Method 1: Copy HTML Content to WordPress
1. Go to **Pages → Add New**
2. **Title:** "Professional Roof Cleaning Vancouver | Moss Removal & Maintenance"
3. Switch to **Text/HTML Editor**
4. Copy the content from `vancouver-roof-cleaning-landing-page.html` (body content only)
5. Save as **Homepage**

### Method 2: Use Page Builder (Recommended)
1. Install **Elementor** (free version)
2. Create **New Page** with Elementor
3. Import sections from HTML file using Elementor's HTML widget
4. Customize design and styling within Elementor

## Step 4: RankMath SEO Configuration

### Initial Setup Wizard
1. **Navigate to:** Rank Math → Setup Wizard
2. **Choose:** "Advanced Mode" for full control
3. **Your Site:** Business website
4. **Connect Account:** Link your RankMath account (free)

### Local SEO Module Setup
1. **Go to:** Rank Math → Dashboard → Modules
2. **Enable:** Local SEO module
3. **Navigate to:** Rank Math → Local SEO → Settings

#### Business Information
```
Business Name: Big Truss Roof Cleaning
Business Type: Professional Service
Address: 123 Main Street, Vancouver, BC V6B 2W2
Phone: (604) XXX-XXXX
Email: info@bigtrusscleaning.com
Website: https://www.bigtrusscleaning.com
```

#### Service Areas
```
Primary: Vancouver, BC
Secondary: Burnaby, Richmond, West Vancouver, North Vancouver
Service Radius: 50 km from Vancouver
```

#### Business Hours
```
Monday-Friday: 08:00-18:00
Saturday: 09:00-16:00
Sunday: Closed (Emergency only)
```

### Focus Keywords Setup
1. **Primary Keyword:** "roof cleaning Vancouver"
2. **Secondary Keywords:** 
   - "moss removal Vancouver"
   - "roof washing Vancouver" 
   - "gutter cleaning Vancouver"
   - "roof maintenance Vancouver"

### Schema Markup Configuration
1. **Go to:** Rank Math → Titles & Meta → Local SEO
2. **Enable:** Local Business Schema
3. **Configure:**
   - Business Category: Professional Service Company
   - Price Range: $$
   - Payment Methods: Cash, Check, Credit Card
   - Service Type: Roof Cleaning, Moss Removal, Gutter Cleaning

## Step 5: Page-Specific RankMath Optimization

### Homepage SEO Settings
1. **Edit your homepage** in WordPress
2. **RankMath Meta Box Settings:**
   ```
   Focus Keyword: roof cleaning Vancouver
   SEO Title: Professional Roof Cleaning Vancouver | Moss Removal & Maintenance | Big Truss
   Meta Description: ★★★★★ Vancouver's #1 Roof Cleaning Service. Expert moss removal, pressure washing & maintenance. Free estimates. Licensed & insured. Call (604) XXX-XXXX today!
   ```

### Advanced SEO Settings
1. **Canonical URL:** Set to homepage URL
2. **Schema Type:** LocalBusiness + Service
3. **Social Media:** Add Facebook and Instagram URLs
4. **Breadcrumbs:** Enable site-wide

## Step 6: Google Analytics & Search Console Integration

### Google Analytics Setup
1. **Create Google Analytics 4 property**
2. **Install MonsterInsights plugin**
3. **Connect Analytics:** Plugins → MonsterInsights → Settings
4. **Enable Enhanced Ecommerce** (for conversion tracking)

### Google Search Console
1. **Add property** in Search Console
2. **Verify ownership** using HTML meta tag method
3. **Connect to RankMath:** Rank Math → General Settings → Search Console

## Step 7: Contact Form Setup

### WP Forms Configuration
1. **Install WP Forms** plugin
2. **Create New Form:** "Roof Cleaning Estimate Request"
3. **Form Fields:**
   - Name (required)
   - Email (required)
   - Phone (required)
   - Property Address (required)
   - Service Needed (dropdown)
   - Message (textarea)

### Form Notifications
1. **Admin Email:** Your business email
2. **Customer Confirmation:** Auto-reply with estimate timeline
3. **Integration:** Connect to your CRM if available

## Step 8: Speed & Performance Optimization

### Image Optimization
1. **Install Smush plugin**
2. **Compress all images** automatically
3. **Convert to WebP format** for faster loading
4. **Add Alt Text** with local keywords

### Caching Setup
1. **Install W3 Total Cache** (free) or **WP Rocket** (premium)
2. **Enable Page Caching** for faster load times
3. **Minify CSS & JavaScript**
4. **Enable GZIP compression**

## Step 9: Local Citations & NAP Consistency

### NAP Information (Name, Address, Phone)
Ensure consistent business information across:
- Website header/footer
- Contact page
- Google My Business
- Local directories
- Social media profiles

```
Business Name: Big Truss Roof Cleaning
Address: 123 Main Street, Vancouver, BC V6B 2W2, Canada
Phone: (604) XXX-XXXX
```

## Step 10: Content Optimization Checklist

### RankMath Content Analysis
- ✅ Focus keyword in title
- ✅ Focus keyword in first paragraph
- ✅ Focus keyword in headings (H1, H2)
- ✅ Keyword density 0.5-2.5%
- ✅ Meta description 150-160 characters
- ✅ Title tag 50-60 characters
- ✅ Internal linking to relevant pages
- ✅ External links to authoritative sources
- ✅ Alt text for all images
- ✅ Schema markup present

### Local SEO Checklist
- ✅ City name in title tag
- ✅ Local keywords in content
- ✅ Service areas mentioned
- ✅ Local business schema markup
- ✅ Google My Business optimization
- ✅ Local citations consistent
- ✅ Customer reviews/testimonials
- ✅ Local landing pages created

## Step 11: Google Ads Integration

### Conversion Tracking Setup
1. **Create Google Ads account**
2. **Set up conversion actions:**
   - Phone calls
   - Contact form submissions
   - Quote requests
3. **Add tracking codes** to website
4. **Test conversions** before launching ads

### Landing Page Optimization
- ✅ Clear value proposition
- ✅ Multiple CTA buttons
- ✅ Phone number prominently displayed
- ✅ Trust signals (licenses, insurance)
- ✅ Customer testimonials
- ✅ Service area coverage
- ✅ Fast loading speed (<3 seconds)

## Step 12: Ongoing Maintenance

### Monthly Tasks
- Update content with seasonal information
- Add new customer testimonials
- Check and fix broken links
- Monitor local rankings
- Update Google My Business posts

### Quarterly Tasks
- Review and update service pages
- Analyze Google Analytics data
- Update pricing if needed
- Refresh seasonal promotions
- Audit competitor websites

### Annual Tasks
- Comprehensive SEO audit
- Update business information
- Renew certifications/licenses
- Review and update schema markup
- Plan content calendar for next year

## Pro Tips for Maximum Results

1. **Mobile-First Design:** Ensure site looks perfect on mobile devices
2. **Page Speed:** Aim for loading speed under 3 seconds
3. **Local Content:** Create neighborhood-specific landing pages
4. **Reviews Management:** Actively request and respond to Google reviews
5. **Seasonal Content:** Update content for Vancouver's weather patterns
6. **Competitor Analysis:** Monitor local competitor SEO strategies
7. **Regular Updates:** Keep content fresh with latest industry information

## RankMath Specific Settings for Roof Cleaning Business

### Titles & Meta Templates
```
Homepage: Professional Roof Cleaning Vancouver | Moss Removal & Maintenance | Big Truss
Service Pages: [Service] Vancouver | Big Truss Roof Cleaning | Free Estimate
Location Pages: Roof Cleaning [Location] BC | Professional Moss Removal | Big Truss
```

### Social Media Integration
- **Facebook Page:** Connect business Facebook page
- **Twitter:** Link business Twitter account
- **Instagram:** Connect Instagram business profile
- **LinkedIn:** Link company LinkedIn page

This comprehensive setup will ensure your WordPress site is fully optimized for local SEO and ready for Google Ads campaigns while maximizing RankMath's capabilities for the Vancouver roof cleaning market.