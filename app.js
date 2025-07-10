// Navigation functionality
class LeftGateApp {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupContactForm();
        this.setupScrollEffects();
        this.setupPricingActions();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = document.querySelectorAll('.page');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip adding event listener for external links
            if (href.startsWith('http')) {
                return; // Let the browser handle external links naturally
            }
            
            // Add event listener only for internal navigation
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = href.substring(1);
                this.showPage(targetPage);
                this.updateActiveNavLink(link);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page, false);
            }
        });

        // Check URL hash on page load to show correct page
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.currentPage = hash;
            this.showPage(hash, false);
        } else {
            // Set initial state for home page
            this.showPage('home', false);
        }

        // Set initial state in history
        history.replaceState({ page: this.currentPage }, '', `#${this.currentPage}`);
    }

    showPage(pageId, pushState = true) {
        const pages = document.querySelectorAll('.page');
        const targetPage = document.getElementById(pageId);

        if (!targetPage) return;

        // If trying to show contact page, redirect to Calendly instead
        if (pageId === 'contact') {
            window.open('https://calendly.com/leftgate-secure/30min', '_blank');
            return;
        }

        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        targetPage.classList.add('active');
        this.currentPage = pageId;

        // Update URL and history
        if (pushState) {
            history.pushState({ page: pageId }, '', `#${pageId}`);
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    setupContactForm() {
        // Contact form removed - now redirects directly to Calendly
        // Keeping this method for backward compatibility
    }

    handleContactSubmission(form) {
        // Get form data
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Validate required fields
        const requiredFields = ['name', 'company', 'email', 'mobile'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

        if (missingFields.length > 0) {
            this.showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate email format
        if (!this.isValidEmail(data.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Simulate form submission
        this.submitContactForm(data);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    submitContactForm(data) {
        // Show loading state
        const submitButton = document.querySelector('#contactForm button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Redirect to Calendly for booking
        this.redirectToCalendly(data);
    }

    redirectToCalendly(data) {
        // Calendly booking link
        const calendlyURL = 'https://calendly.com/leftgate-secure/30min';
        
        // Build URL with pre-filled information if Calendly supports it
        const params = new URLSearchParams();
        if (data.name) params.append('name', data.name);
        if (data.email) params.append('email', data.email);
        
        const finalURL = params.toString() ? `${calendlyURL}?${params.toString()}` : calendlyURL;
        
        // Open Calendly in the same tab
        window.location.href = finalURL;
        
        return Promise.resolve();
    }

    showSuccessMessage() {
        const successModal = document.getElementById('successMessage');
        successModal.classList.remove('hidden');
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: var(--color-error-bg);
                color: var(--color-error);
                padding: var(--space-12) var(--space-16);
                border-radius: var(--radius-base);
                margin-bottom: var(--space-16);
                border: 1px solid var(--color-error);
            `;
            
            const form = document.getElementById('contactForm');
            form.insertBefore(errorDiv, form.firstChild);
        }

        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    setupScrollEffects() {
        // Add scroll-based animations and effects
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            '.stat-card, .feature-card, .pricing-card, .incident-card'
        );
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupPricingActions() {
        // Handle pricing card actions
        const pricingButtons = document.querySelectorAll('.pricing-card .btn');
        
        pricingButtons.forEach(button => {
            if (button.textContent.includes('Contact Sales')) {
                button.addEventListener('click', () => {
                    this.showPage('contact');
                });
            } else {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tier = button.closest('.pricing-card').querySelector('h3').textContent;
                    this.handlePricingSelection(tier);
                });
            }
        });
    }

    handlePricingSelection(tier) {
        // Navigate to contact form with pre-filled information
        this.showPage('contact');
        
        // Pre-fill team size based on tier
        setTimeout(() => {
            const teamSizeSelect = document.getElementById('teamSize');
            const messageField = document.getElementById('message');
            
            if (teamSizeSelect && messageField) {
                let teamSizeValue = '';
                let message = `I'm interested in the ${tier} plan. `;
                
                switch(tier) {
                    case 'Startup':
                        teamSizeValue = '50-100';
                        break;
                    case 'Growth':
                        teamSizeValue = '100-300';
                        break;
                    case 'Enterprise':
                        teamSizeValue = '300-1000';
                        break;
                }
                
                if (teamSizeValue) {
                    teamSizeSelect.value = teamSizeValue;
                }
                
                messageField.value = message;
            }
        }, 100);
    }
}

// Global functions for HTML onclick handlers
function showContact() {
    app.showPage('contact');
}

function hideSuccess() {
    const successModal = document.getElementById('successMessage');
    successModal.classList.add('hidden');
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Enhanced interaction effects
function addInteractionEffects() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.stat-card, .feature-card, .pricing-card, .incident-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS for ripple animation
function addRippleCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Performance optimization
function optimizePerformance() {
    // Lazy load images when they come into view (excluding logo and critical images)
    const images = document.querySelectorAll('img[src]:not(.logo-icon)');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize app when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new LeftGateApp();
    addRippleCSS();
    addInteractionEffects();
    optimizePerformance();
    
    // Handle hash navigation on page load
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'pricing', 'contact'].includes(hash)) {
        app.showPage(hash, false);
    }
    
    console.log('LeftGate application initialized successfully');
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', function() {
    // Adjust layouts if needed
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Handle Escape key to close modals
    if (e.key === 'Escape') {
        const successModal = document.getElementById('successMessage');
        if (successModal && !successModal.classList.contains('hidden')) {
            hideSuccess();
        }
    }
    
    // Handle Tab navigation for accessibility
    if (e.key === 'Tab') {
        // Ensure focus is visible
        document.body.classList.add('keyboard-navigation');
    }
});

// Remove keyboard navigation class on mouse use
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Add error handling for any uncaught errors
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Export for potential testing or external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeftGateApp };
}