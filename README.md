# Civic Narrative Homepage

A professional, accessible, and engaging homepage for Civic Narrative - transforming how local governments and residents connect through open narratives, transparent websites, and advanced civic AI.

## 🎨 Design System

### Color Palette
All colors follow the official Civic Narrative brand guidelines:

- **Navy** (`#1D3557`) - Primary text, header background
- **Deep Blue** (`#005F83`) - Secondary text, accents
- **Teal Blue** (`#008B9A`) - Interactive elements, borders
- **Aqua** (`#00B695`) - Navigation links, CTAs
- **Green** (`#88DC7F`) - Primary buttons, highlights
- **Yellow** (`#F9F871`) - Accessibility controls, accents

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold)

## 📋 Sections

1. **Header**
   - Sticky navigation with logo
   - Accessibility controls (high contrast, language toggle)
   - Mobile-responsive hamburger menu
   - Smooth shadow effect on scroll

2. **Hero Section**
   - Full-width gradient background (Deep Blue → Teal Blue → Aqua)
   - Headline: "Clarity for Civic Storytelling."
   - Custom SVG illustration with civic icons
   - Primary CTA: "Request a Demo"

3. **Value Propositions**
   - 4 card layout highlighting key services:
     - Engaging, Accessible Websites
     - AI-Powered Resident Q&A
     - Narrative CMS
     - Transparency & Support
   - Color-coded top borders
   - Hover animations

4. **Featured Work**
   - 3 project case studies with before/after narratives
   - Gradient placeholders for project screenshots
   - Alternating card backgrounds (white/yellow)
   - "View Details" CTAs

5. **AI Communication Features**
   - Interactive chat mockup showing RAG-driven AI
   - Narrative CMS demo with social media post generation
   - Examples for Facebook, Twitter, and LinkedIn
   - Buffer API integration notation

6. **Insights & Learning**
   - 4 article cards with civic tech topics
   - Gradient accent bars
   - "See All Articles" CTA

7. **Footer**
   - Logo and tagline
   - Three-column link structure
   - Social media icons (LinkedIn, Twitter, Facebook)
   - Copyright and legal links

## ♿ Accessibility Features

- **WCAG AA+ Compliance**: All text meets contrast ratio requirements
- **Keyboard Navigation**: Full keyboard support with visible focus states
- **High Contrast Mode**: Toggle for enhanced visibility
- **Screen Reader Support**: Semantic HTML5, ARIA labels
- **Touch Targets**: All interactive elements minimum 44px tall
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Skip Links**: Keyboard shortcut (Alt+M) to main content

## 📱 Responsive Design

Mobile-first approach with breakpoints:
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

All sections stack appropriately on smaller screens, with optimized typography and spacing.

## 🚀 Interactive Features

### JavaScript Functionality
- Sticky header with scroll detection
- Mobile menu toggle with accessibility
- High contrast mode (persists via localStorage)
- Smooth scroll for anchor links
- Intersection Observer for scroll animations
- Performance monitoring
- Analytics tracking (placeholder)

### Performance Optimizations
- Lazy loading for images (via data-src)
- Debounced resize handlers
- Efficient scroll listeners
- Print-friendly styles

## 📂 File Structure

```
Civic Narrative/
├── index.html          # Main HTML structure
├── styles.css          # Complete stylesheet
├── script.js           # Interactive features
├── README.md           # This file
└── public/
    └── CN-Logo.png     # Official Civic Narrative logo
```

## 🛠️ How to Use

### Local Development
1. Open `index.html` directly in a web browser
2. Or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```
3. Navigate to `http://localhost:8000`

### Customization
- **Content**: Edit text directly in `index.html`
- **Colors**: Modify CSS variables in `:root` section of `styles.css`
- **Sections**: Add/remove sections by editing HTML and corresponding CSS
- **Images**: Replace project placeholders with actual screenshots

## 🎯 Key Features

✅ **100% Brand Compliant** - Exact color palette, official logo
✅ **Fully Accessible** - WCAG AA+ standards
✅ **Mobile-First** - Responsive from 320px upward
✅ **No Lorem Ipsum** - Real, mission-focused content
✅ **Interactive** - Smooth animations, sticky header, mobile menu
✅ **Semantic HTML5** - SEO-friendly, screen reader optimized
✅ **Modern UI/UX** - Rounded corners, drop shadows, hover effects

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 📝 Notes

- All SVG illustrations are inline for performance and customization
- Chat and CMS mockups are static demonstrations
- Social media integration references Buffer API (implementation separate)
- Demo request currently logs to console (modal implementation pending)

## 🔜 Future Enhancements

- Demo request modal/form
- Working carousel for insights section
- Actual project screenshots
- Blog/article content
- Contact form
- Newsletter signup
- Progressive Web App (PWA) support

## 📧 Support

For questions about this implementation, reference the code comments or contact the development team.

---

**Built with care for open government and empowered residents.**
© 2025 Civic Narrative. All rights reserved.
