/**
 * Animation utilities and scroll-triggered animations for Valentyn S website
 */

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    initializeCounterAnimations();
    initializeParallaxEffects();
    initializeTypingAnimation();
});

/**
 * Intersection Observer for scroll-triggered animations
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add staggered animation for service cards
                if (entry.target.classList.contains('service-card')) {
                    const cards = document.querySelectorAll('.service-card');
                    const index = Array.from(cards).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Additional animation classes
    document.querySelectorAll('.slide-in-left, .slide-in-right, .scale-in').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Counter animations for statistics (if added later)
 */
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length === 0) return;
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Animate counter numbers
 */
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = parseInt(element.getAttribute('data-duration')) || 2000;
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Parallax scrolling effects
 */
function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

/**
 * Typing animation for hero tagline
 */
function initializeTypingAnimation() {
    const taglineElement = document.querySelector('.hero .tagline');
    
    if (!taglineElement) return;
    
    const originalText = taglineElement.textContent;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;
    
    let currentText = '';
    let isDeleting = false;
    let charIndex = 0;
    
    function typeText() {
        if (isDeleting) {
            currentText = originalText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = originalText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        taglineElement.textContent = currentText;
        
        let speed = isDeleting ? deletingSpeed : typingSpeed;
        
        if (!isDeleting && charIndex === originalText.length) {
            speed = pauseTime;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            speed = typingSpeed;
        }
        
        setTimeout(typeText, speed);
    }
    
    // Start typing animation after page load
    setTimeout(() => {
        taglineElement.textContent = '';
        typeText();
    }, 1000);
}

/**
 * Smooth reveal animations for sections
 */
function addRevealAnimation(selector, animationType = 'fadeInUp') {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = getInitialTransform(animationType);
        element.style.transition = `all 0.8s ease ${index * 0.1}s`;
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translate(0, 0) scale(1)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(element);
    });
}

/**
 * Get initial transform based on animation type
 */
function getInitialTransform(type) {
    const transforms = {
        fadeInUp: 'translateY(30px)',
        fadeInDown: 'translateY(-30px)',
        fadeInLeft: 'translateX(-30px)',
        fadeInRight: 'translateX(30px)',
        scaleIn: 'scale(0.8)',
        rotateIn: 'rotate(10deg) scale(0.8)'
    };
    
    return transforms[type] || transforms.fadeInUp;
}

/**
 * Mouse-following effect for hero section
 */
function initializeMouseFollowEffect() {
    const hero = document.querySelector('.hero');
    
    if (!hero) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;
    
    hero.addEventListener('mousemove', function(e) {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isHovered = true;
        
        updateBackgroundPosition();
    });
    
    hero.addEventListener('mouseleave', function() {
        isHovered = false;
    });
    
    function updateBackgroundPosition() {
        if (!isHovered) return;
        
        const x = (mouseX / hero.offsetWidth) * 100;
        const y = (mouseY / hero.offsetHeight) * 100;
        
        hero.style.backgroundPosition = `${x}% ${y}%`;
    }
}

/**
 * Loading animation
 */
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">V</div>
            <div class="loader-text">Loading...</div>
        </div>
    `;
    
    // Add loader styles
    const loaderStyles = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--primary-green);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            transition: opacity 0.5s ease;
        }
        
        .loader-content {
            text-align: center;
            color: var(--white);
        }
        
        .loader-logo {
            width: 80px;
            height: 80px;
            background: var(--accent-yellow);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: 600;
            color: var(--primary-green);
            margin: 0 auto 1rem;
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loader-text {
            font-size: 1.2rem;
            font-weight: 500;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    
    // Add styles to head
    const style = document.createElement('style');
    style.textContent = loaderStyles;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
    
    // Hide loader when page is loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(loader);
                document.head.removeChild(style);
            }, 500);
        }, 1000);
    });
}

/**
 * Initialize page loading animation
 */
if (document.readyState === 'loading') {
    showLoadingAnimation();
}

/**
 * Scroll progress indicator
 */
function initializeScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    
    Object.assign(progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '0%',
        height: '3px',
        background: 'var(--accent-yellow)',
        zIndex: '10001',
        transition: 'width 0.1s ease'
    });
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress
initializeScrollProgress();

/**
 * Add custom CSS animations
 */
const customAnimations = `
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .slide-in-left.visible {
        animation: slideInLeft 0.8s ease forwards;
    }
    
    .slide-in-right.visible {
        animation: slideInRight 0.8s ease forwards;
    }
    
    .scale-in.visible {
        animation: scaleIn 0.8s ease forwards;
    }
`;

// Add animations to document
const animationStyle = document.createElement('style');
animationStyle.textContent = customAnimations;
document.head.appendChild(animationStyle);
