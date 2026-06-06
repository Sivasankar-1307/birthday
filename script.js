/* ==========================================================================
   Birthday Wishes Website - Script (Custom Premium Logic)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initializations
    initTheme();
    initNavbar();
    initParticles();
    initConfetti();
    initTimer();
    initTyping();
    initScrollReveal();
    initGallery();
    initCarousel();
    initGuestbook();
    initCake();
    initAudio();
    initScratchCard();

    // Trigger initial confetti burst after 1.5 seconds
    setTimeout(() => {
        burstConfetti(150);
    }, 1200);
});

/* ==========================================================================
   2. Dark / Light Theme Switcher
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved preference, otherwise default to dark theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const activeTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', activeTheme);
        // Trigger a small confetti burst on theme change for fun!
        burstConfetti(30);
    });
}

/* ==========================================================================
   3. Navbar Scroll Effect & Mobile Menu
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlighting based on section scroll
        let currentSection = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').substring(1) === currentSection) {
                item.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close menu when clicking link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });
}

/* ==========================================================================
   4. Floating Ambient Background Particles (Canvas)
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particleArray = [];

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse interactive coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * -0.6 - 0.1; // Float upwards
            this.color = document.body.classList.contains('light-theme') 
                ? 'rgba(170, 119, 28, ' + (Math.random() * 0.3 + 0.1) + ')'
                : 'rgba(212, 175, 55, ' + (Math.random() * 0.3 + 0.1) + ')';
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            // Loop back from bottom if floats out of top
            if (this.y < 0) {
                this.y = canvas.height;
                this.x = Math.random() * canvas.width;
            }
            if (this.x < 0 || this.x > canvas.width) {
                this.speedX = -this.speedX;
            }

            // Mouse hover push effect
            if (mouse.x != null && mouse.y != null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * 2;
                    let directionY = forceDirectionY * force * 2;
                    this.x += directionX;
                    this.y += directionY;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Populate particles
    function createParticles() {
        const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
        particleArray = [];
        for (let i = 0; i < Math.min(particleCount, 150); i++) {
            particleArray.push(new Particle());
        }
    }
    createParticles();
    window.addEventListener('resize', createParticles);

    // Update color themes for particles on body class toggle
    const observer = new MutationObserver(() => {
        particleArray.forEach(p => {
            p.color = document.body.classList.contains('light-theme')
                ? 'rgba(170, 119, 28, ' + (Math.random() * 0.3 + 0.1) + ')'
                : 'rgba(212, 175, 55, ' + (Math.random() * 0.3 + 0.1) + ')';
        });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particleArray.length; i++) {
            particleArray[i].update();
            particleArray[i].draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   5. Confetti Celebration System (Canvas)
   ========================================================================== */
let confettiArray = [];
let confettiCanvas;
let cCtx;

function initConfetti() {
    confettiCanvas = document.getElementById('confetti-canvas');
    cCtx = confettiCanvas.getContext('2d');

    function resizeConfetti() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    resizeConfetti();
    window.addEventListener('resize', resizeConfetti);

    class Confetti {
        constructor(x, y, isDirectional = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 10 + 6;
            // Warm/Golden and Royal celebration color palette
            const colors = ['#bf953f', '#fcf6ba', '#b38728', '#fbf5b7', '#aa771c', '#1e3a8a', '#ff1744', '#00bfa5', '#ffffff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            if (isDirectional) {
                // Shoot upwards and outwards
                this.speedX = Math.random() * 12 - 6;
                this.speedY = Math.random() * -12 - 6;
            } else {
                // Random fall direction
                this.speedX = Math.random() * 6 - 3;
                this.speedY = Math.random() * -6 - 2;
            }

            this.gravity = 0.2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.opacity = 1;
            this.decay = Math.random() * 0.005 + 0.005;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.decay;
        }

        draw() {
            cCtx.save();
            cCtx.translate(this.x, this.y);
            cCtx.rotate(this.rotation * Math.PI / 180);
            cCtx.fillStyle = this.color;
            cCtx.globalAlpha = this.opacity;
            cCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            cCtx.restore();
        }
    }

    window.burstConfetti = function(count, x = null, y = null) {
        const posX = x !== null ? x : Math.random() * confettiCanvas.width;
        const posY = y !== null ? y : (y === null && x !== null) ? y : confettiCanvas.height * 0.4;
        
        // If it's a manual trigger, shoot from sides or specified point
        const isDirectional = (x !== null || y !== null || count > 100);

        for (let i = 0; i < count; i++) {
            // If massive, shoot from left and right corners
            if (count > 100 && x === null) {
                const cornerX = Math.random() > 0.5 ? 20 : confettiCanvas.width - 20;
                const cornerY = confettiCanvas.height - 20;
                confettiArray.push(new Confetti(cornerX, cornerY, true));
            } else {
                confettiArray.push(new Confetti(posX, posY, isDirectional));
            }
        }
    };

    function animateConfetti() {
        cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        for (let i = 0; i < confettiArray.length; i++) {
            confettiArray[i].update();
            confettiArray[i].draw();

            // Remove faded particles
            if (confettiArray[i].opacity <= 0 || confettiArray[i].y > confettiCanvas.height) {
                confettiArray.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateConfetti);
    }
    animateConfetti();

    // Trigger button hooks
    const triggers = document.querySelectorAll('.celebrate-trigger-btn');
    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            // Shoot confetti from the clicked button
            burstConfetti(70, rect.left + rect.width / 2, rect.top);
        });
    });
}

/* ==========================================================================
   6. Grandfather's Life Journey Counter (Age Journey)
   ========================================================================== */
function initTimer() {
    // Setting Grandpa's Birth Date: June 7, 1950 (He is turning 76 in 2026!)
    const birthDate = new Date('1950-06-07T00:00:00');

    function updateCounter() {
        const now = new Date();
        
        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();

        if (days < 0) {
            // Borrow days from previous month
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }

        if (months < 0) {
            months += 12;
            years--;
        }

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        document.getElementById('years-val').textContent = String(years).padStart(2, '0');
        document.getElementById('months-val').textContent = String(months).padStart(2, '0');
        document.getElementById('days-val').textContent = String(days).padStart(2, '0');
        document.getElementById('hours-val').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes-val').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds-val').textContent = String(seconds).padStart(2, '0');
    }

    updateCounter();
    setInterval(updateCounter, 1000);
}

/* ==========================================================================
   7. Typing Wishes Text Animation
   ========================================================================== */
function initTyping() {
    const typingSpan = document.querySelector('.typing-text');
    const wishes = [
        "Celebrating 76 Golden Years of Love & Wisdom...",
        "The steady anchor of our lives...",
        "An inspiration, a guide, our absolute hero.",
        "Your storytelling warms our hearts.",
        "May your days be filled with peace and joy!"
    ];

    let wishIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const currentWish = wishes[wishIndex];
        
        if (isDeleting) {
            typingSpan.textContent = currentWish.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40; // Deletes faster
        } else {
            typingSpan.textContent = currentWish.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80; // Normal typing speed
        }

        // Handle states
        if (!isDeleting && charIndex === currentWish.length) {
            // Done typing, pause before deleting
            typeSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Done deleting, go to next wish
            isDeleting = false;
            wishIndex = (wishIndex + 1) % wishes.length;
            typeSpeed = 600; // Pause before typing next
        }

        setTimeout(type, typeSpeed);
    }

    if (typingSpan) {
        setTimeout(type, 1000);
    }
}

/* ==========================================================================
   8. Scroll Reveal Animations (Pure JS Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply a delay if it is specified in HTML
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('reveal-visible');
                }, delay);
                // Once visible, stop observing to improve scroll performance
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12, // Trigger when 12% of the element is visible
        rootMargin: '0px 0px -40px 0px' // Shrink viewport triggers slightly
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

/* ==========================================================================
   9. Photo Gallery & Lightbox
   ========================================================================== */
function initGallery() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgSrc = btn.getAttribute('data-img');
            const item = btn.closest('.gallery-item');
            const title = item.querySelector('h4').textContent;
            const subtitle = item.querySelector('p').textContent;

            lightboxImg.src = imgSrc;
            lightboxCaption.innerHTML = `<strong>${title}</strong> — ${subtitle}`;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Lock scrolling
        });
    });

    // Close Lightbox
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Unlock scroll
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });
    }

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            closeLightbox();
        }
    });
}

/* ==========================================================================
   10. Family Messages Carousel
   ========================================================================== */
function initCarousel() {
    const slides = document.querySelectorAll('.message-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-control-btn.prev');
    const nextBtn = document.querySelector('.carousel-control-btn.next');
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Remove active states
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev-slide');
        });
        dots.forEach(dot => dot.classList.remove('active'));

        // Handle indices
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Apply slide animation classes
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Handle visual classes for next slide transitions
        const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
        slides[prevIndex].classList.add('prev-slide');
    }

    function startAutoPlay() {
        slideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 6000);
    }

    function stopAutoPlay() {
        clearInterval(slideInterval);
    }

    // Controls
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(currentSlide + 1);
            startAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(currentSlide - 1);
            startAutoPlay();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(idx);
            startAutoPlay();
        });
    });

    startAutoPlay();
}

/* ==========================================================================
   11. Interactive Guestbook (localStorage persistence)
   ========================================================================== */
function initGuestbook() {
    const wishForm = document.getElementById('wish-form');
    const guestNameInput = document.getElementById('guest-name');
    const guestMessageInput = document.getElementById('guest-message');
    const wishesListContainer = document.getElementById('wishes-list-container');
    // Default wishes list starts empty
    const defaultWishes = [];

    // Get wishes from LocalStorage or use defaults
    let guestWishes = JSON.parse(localStorage.getItem('grandfather_wishes_v2'));
    if (!guestWishes) {
        guestWishes = defaultWishes;
        localStorage.setItem('grandfather_wishes_v2', JSON.stringify(guestWishes));
    }

    // Function to render wishes
    function renderWishes() {
        wishesListContainer.innerHTML = '';
        
        if (guestWishes.length === 0) {
            wishesListContainer.innerHTML = `
                <div class="wish-item empty-state">
                    <p>No messages left yet. Be the first to write something beautiful!</p>
                </div>`;
            return;
        }

        guestWishes.forEach((wish, idx) => {
            const wishItem = document.createElement('div');
            wishItem.className = 'wish-item';
            
            wishItem.innerHTML = `
                <div class="wish-author">
                    <span>${escapeHTML(wish.name)}</span>
                    <div class="wish-meta">
                        <span class="wish-time">${wish.time}</span>
                        <button class="delete-wish-btn" data-index="${idx}" title="Delete Message">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <p class="wish-text">"${escapeHTML(wish.message)}"</p>
            `;
            wishesListContainer.appendChild(wishItem);
        });
    }

    // Submit Wish Form
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = guestNameInput.value.trim();
        const message = guestMessageInput.value.trim();

        if (name && message) {
            const newWish = {
                name: name,
                message: message,
                time: new Date().toLocaleString()
            };

            // Add new wish to the top of list
            guestWishes.unshift(newWish);
            localStorage.setItem('grandfather_wishes_v2', JSON.stringify(guestWishes));
            
            renderWishes();

            // Clear inputs
            guestNameInput.value = '';
            guestMessageInput.value = '';

            // Trigger confetti burst on message send!
            burstConfetti(60);
        }
    });

    // Event delegation for deleting wishes
    wishesListContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-wish-btn');
        if (deleteBtn) {
            const index = parseInt(deleteBtn.getAttribute('data-index'), 10);
            if (confirm("Are you sure you want to delete this wish?")) {
                guestWishes.splice(index, 1);
                localStorage.setItem('grandfather_wishes_v2', JSON.stringify(guestWishes));
                renderWishes();
            }
        }
    });

    // Simple HTML escaping helper
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    renderWishes();
}

/* ==========================================================================
   12. Interactive Birthday Cake (Blow Out Candles)
   ========================================================================== */
function initCake() {
    const candles = document.querySelectorAll('.candle');
    const cakeFeedback = document.getElementById('cake-wishes-feedback');
    let blownOutCount = 0;

    candles.forEach(candle => {
        candle.addEventListener('click', () => {
            if (candle.classList.contains('active')) {
                candle.classList.remove('active');
                blownOutCount++;

                // Trigger a mini confetti spark at candle position
                const rect = candle.getBoundingClientRect();
                burstConfetti(15, rect.left + rect.width / 2, rect.top);

                // Check if all blown out
                if (blownOutCount === candles.length) {
                    // Trigger massive celebration bursts!
                    setTimeout(() => {
                        burstConfetti(150);
                        cakeFeedback.classList.remove('hidden');
                    }, 300);

                    // Relight candles after 12 seconds so users can play again
                    setTimeout(() => {
                        candles.forEach(c => c.classList.add('active'));
                        cakeFeedback.classList.add('hidden');
                        blownOutCount = 0;
                    }, 12000);
                }
            }
        });
    });
}

/* ==========================================================================
   13. Background Audio System
   ========================================================================== */
function initAudio() {
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = musicToggle.querySelector('i');

    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicIcon.className = 'fas fa-volume-mute';
        } else {
            bgMusic.play()
                .then(() => {
                    musicToggle.classList.add('playing');
                    musicIcon.className = 'fas fa-music';
                })
                .catch(err => {
                    console.log("Audio play blocked by browser policy. Interaction needed.", err);
                    alert("Please allow audio playback in your browser, or click again!");
                });
        }
        isPlaying = !isPlaying;
    });

    // Optional: Attempt gentle play on first touch/click of the page anywhere
    const playOnFirstInteraction = () => {
        if (!isPlaying) {
            bgMusic.play()
                .then(() => {
                    musicToggle.classList.add('playing');
                    musicIcon.className = 'fas fa-music';
                    isPlaying = true;
                })
                .catch(() => {
                    // Silent fail, wait for button click
                });
        }
        document.removeEventListener('click', playOnFirstInteraction);
        document.removeEventListener('touchstart', playOnFirstInteraction);
    };

    document.addEventListener('click', playOnFirstInteraction);
    document.addEventListener('touchstart', playOnFirstInteraction);
}

/* ==========================================================================
   14. Scratch Card Module (Surprise Message reveal)
   ========================================================================== */
function initScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const instructionText = document.getElementById('scratch-instruction-text');
    let isDrawing = false;
    let scratchedPercent = 0;
    let hasTriggeredConfetti = false;

    // Set canvas dimensions based on container sizes (makes it responsive)
    function resizeCanvas() {
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        fillCanvas();
    }

    // Fill canvas with gold scratchable texture
    function fillCanvas() {
        // Gold metallic gradient
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#bf953f');
        grad.addColorStop(0.25, '#fcf6ba');
        grad.addColorStop(0.5, '#b38728');
        grad.addColorStop(0.75, '#fbf5b7');
        grad.addColorStop(1, '#aa771c');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some noise/texture pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const r = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add overlay text
        ctx.fillStyle = '#050c18';
        ctx.font = '600 1.25rem Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.fillStyle = 'rgba(5, 12, 24, 0.7)';
        ctx.font = 'italic 0.85rem Montserrat, sans-serif';
        ctx.fillText('To Reveal Grandpa\'s Surprise', canvas.width / 2, canvas.height / 2 + 20);
    }

    // Handle scratching
    function scratch(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        // Support mouse and touch coords
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
    }

    // Start drawing
    function startDrawing(e) {
        isDrawing = true;
        scratch(e);
    }

    // Stop drawing & calculate cleared percentage
    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        
        // Calculate transparency
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparentCount = 0;
        
        // Sample every 16th pixel (faster performance)
        for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) {
                transparentCount++;
            }
        }
        
        const sampledTotal = pixels.length / 16;
        scratchedPercent = (transparentCount / sampledTotal) * 100;

        // If 40% of the canvas is scratched, fade it out entirely
        if (scratchedPercent > 40 && !hasTriggeredConfetti) {
            hasTriggeredConfetti = true;
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.pointerEvents = 'none';
                instructionText.innerHTML = '<i class="fas fa-heart" style="color: #ff1744;"></i> Revealed with Love! Happy Birthday Grandpa!';
                burstConfetti(120);
            }, 500);
        }
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', scratch);
    window.addEventListener('touchend', stopDrawing);

    // Initial load
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}
