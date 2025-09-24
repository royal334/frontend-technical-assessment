export class Navigation {
    constructor() {
        // Store elements and bind methods
        this.header = document.querySelector('header');
        this.nav = document.querySelector('.nav');
        this.navList = document.querySelector('.nav-list');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section');
        
        // Bind methods to preserve context
        this.toggleNav = this.toggleNav.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        
        // Set up intersection observer for section highlighting
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        this.highlightNavLink(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-50% 0px',
                threshold: [0.5]
            }
        );
        
        this.init();
    }

    init() {
        // Initialize observers
        this.sections.forEach(section => {
            this.observer.observe(section);
        });

        // Set up event listeners
        this.navToggle.addEventListener('click', this.toggleNav);
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
        document.addEventListener('keydown', this.handleKeydown);

        // Set up smooth scrolling
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Close mobile menu if open
                    if (window.innerWidth < 768) {
                        this.closeNav();
                    }
                    
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                    
                    // Update URL without scrolling
                    history.pushState(null, '', `#${targetId}`);
                    
                    // Update active state
                    this.highlightNavLink(targetId);
                }
            });
        });

        // Check for hash in URL on page load
        if (window.location.hash) {
            const targetId = window.location.hash.slice(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }

        // Initial check for viewport size
        this.handleResize();
    }

    highlightNavLink(sectionId) {
        this.navLinks.forEach(link => {
            const linkHref = link.getAttribute('href').slice(1);
            if (linkHref === sectionId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'true');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    toggleNav() {
        const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !isExpanded);
        this.navList.classList.toggle('nav-list--visible');
        
        if (!isExpanded) {
            // If opening, focus first link
            setTimeout(() => {
                this.navLinks[0].focus();
            }, 100);
        }
    }

    closeNav() {
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navList.classList.remove('nav-list--visible');
    }

    handleResize() {
        if (window.innerWidth >= 768) {
            this.navList.classList.remove('nav-list--visible');
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    handleScroll() {
        // Add/remove sticky class based on scroll position
        if (window.scrollY > 0) {
            this.header.classList.add('sticky');
        } else {
            this.header.classList.remove('sticky');
        }
    }

    handleKeydown(e) {
        // Handle keyboard navigation
        if (e.key === 'Escape') {
            this.closeNav();
        }

        if (this.navList.classList.contains('nav-list--visible')) {
            const links = Array.from(this.navLinks);
            const currentIdx = links.indexOf(document.activeElement);

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIdx = (currentIdx + 1) % links.length;
                links[nextIdx].focus();
            }

            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIdx = (currentIdx - 1 + links.length) % links.length;
                links[prevIdx].focus();
            }
        }
    }

    // Cleanup method to remove event listeners and observers
    destroy() {
        this.observer.disconnect();
        this.navToggle.removeEventListener('click', this.toggleNav);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('keydown', this.handleKeydown);
    }
}
