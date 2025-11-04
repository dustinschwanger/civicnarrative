// ========================================
// Civic Narrative - Interactive Features
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initStickyHeader();
    initMobileMenu();
    initHighContrastToggle();
    initSmoothScroll();
    initScrollAnimations();
});

// ========================================
// Sticky Header on Scroll
// ========================================
function initStickyHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// Mobile Menu Toggle
// ========================================
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = mainNav.querySelectorAll('.nav-link');

    // Toggle menu
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');

        // Update ARIA attribute
        const isExpanded = mainNav.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);

        // Prevent body scroll when menu is open
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Handle keyboard accessibility
    mobileMenuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            mobileMenuToggle.click();
        }
    });
}

// ========================================
// High Contrast Mode Toggle
// ========================================
function initHighContrastToggle() {
    const contrastToggle = document.getElementById('contrastToggle');
    const body = document.body;

    // Check for saved preference
    const savedPreference = localStorage.getItem('highContrast');
    if (savedPreference === 'true') {
        body.classList.add('high-contrast');
        contrastToggle.setAttribute('aria-pressed', 'true');
    }

    // Toggle high contrast mode
    contrastToggle.addEventListener('click', () => {
        body.classList.toggle('high-contrast');
        const isActive = body.classList.contains('high-contrast');

        // Save preference
        localStorage.setItem('highContrast', isActive);
        contrastToggle.setAttribute('aria-pressed', isActive);
    });

    // Keyboard accessibility
    contrastToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            contrastToggle.click();
        }
    });
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                // Get header height for offset
                const header = document.getElementById('header');
                const headerHeight = header.offsetHeight;

                // Calculate position
                const targetPosition = target.offsetTop - headerHeight - 20;

                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
function initScrollAnimations() {
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(
        '.value-card, .work-card, .insight-card, .feature-panel'
    );

    // Intersection Observer options
    const options = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';

                // Trigger animation
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                // Stop observing after animation
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe all animated elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ========================================
// Form Validation (if forms are added)
// ========================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ========================================
// Accessibility: Keyboard Navigation Enhancement
// ========================================
document.addEventListener('keydown', (e) => {
    // Skip to main content with keyboard shortcut
    if (e.altKey && e.key === 'm') {
        const mainContent = document.querySelector('main') || document.querySelector('.hero');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
        }
    }
});

// ========================================
// Performance: Lazy Loading Images
// ========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');

                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    // Observe images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========================================
// Analytics Integration (placeholder)
// ========================================
function trackEvent(category, action, label) {
    // Example: Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }

    // Console log for development
    console.log(`Track Event: ${category} - ${action} - ${label}`);
}

// Track CTA clicks
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('CTA', 'Click', btn.textContent);
    });
});

// ========================================
// Carousel/Slider for Insights (Future Enhancement)
// ========================================
function initCarousel() {
    const carousel = document.querySelector('.insights-carousel');

    if (!carousel) return;

    // This is a placeholder for a more sophisticated carousel
    // For now, the grid layout handles responsive display

    // Future: Add arrow navigation, touch swipe, auto-rotate
}

// ========================================
// Demo Request Modal (Future Enhancement)
// ========================================
function showDemoModal() {
    // Placeholder for demo request modal functionality
    console.log('Demo request modal would appear here');
}

// Attach to demo buttons
document.querySelectorAll('a[href="#demo"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showDemoModal();
        trackEvent('Demo', 'Request', 'Button Click');
    });
});

// ========================================
// Print Detection
// ========================================
window.addEventListener('beforeprint', () => {
    console.log('Page is being printed');
    // Any print-specific adjustments
});

window.addEventListener('afterprint', () => {
    console.log('Print completed or cancelled');
});

// ========================================
// Resize Handler (Debounced)
// ========================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Handle resize-specific logic
        const isMobile = window.innerWidth < 768;

        if (!isMobile) {
            // Reset mobile menu if window is resized to desktop
            const mainNav = document.getElementById('mainNav');
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');

            mainNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});

// ========================================
// Page Load Performance Monitoring
// ========================================
window.addEventListener('load', () => {
    // Check performance timing
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        console.log(`Page loaded in ${pageLoadTime}ms`);

        // Track slow loads
        if (pageLoadTime > 3000) {
            console.warn('Slow page load detected');
        }
    }
});

// ========================================
// Service Worker Registration (PWA - Future)
// ========================================
if ('serviceWorker' in navigator) {
    // Uncomment when ready to implement PWA
    // navigator.serviceWorker.register('/sw.js')
    //     .then(reg => console.log('Service Worker registered', reg))
    //     .catch(err => console.log('Service Worker registration failed', err));
}
