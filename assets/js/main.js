$(document).ready(function() {
    // ==================== PRELOADER ====================
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');

    // Simulate loading progress
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);

            // Hide preloader after loading completes
            setTimeout(() => {
                preloader.classList.add('hidden');
                // Enable scroll after preloader
                document.body.style.overflow = 'auto';
            }, 500);
        }
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }, 200);

    // Disable scroll during preloader
    document.body.style.overflow = 'hidden';

    // ==================== 3D CANVAS BACKGROUND ====================
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle3D {
        constructor() {
            this.x = Math.random() * width - width / 2;
            this.y = Math.random() * height - height / 2;
            this.z = Math.random() * 1000;
            this.size = Math.random() * 2 + 1;
            this.speed = Math.random() * 2 + 0.5;
        }

        update() {
            this.z -= this.speed;
            if (this.z <= 0) {
                this.z = 1000;
                this.x = Math.random() * width - width / 2;
                this.y = Math.random() * height - height / 2;
            }
        }

        draw() {
            const scale = 500 / (500 + this.z);
            const x2d = this.x * scale + width / 2 + (mouseX - width / 2) * 0.02;
            const y2d = this.y * scale + height / 2 + (mouseY - height / 2) * 0.02;
            const size = this.size * scale;

            ctx.beginPath();
            ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${scale * 0.5})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 200; i++) {
        particles.push(new Particle3D());
    }

    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connecting lines
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
                if (d < 200) {
                    const scale1 = 500 / (500 + p1.z);
                    const scale2 = 500 / (500 + p2.z);
                    const x1 = p1.x * scale1 + width / 2;
                    const y1 = p1.y * scale1 + height / 2;
                    const x2 = p2.x * scale2 + width / 2;
                    const y2 = p2.y * scale2 + height / 2;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - d / 200)})`;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }
    animate();

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ==================== PARTICLE BACKGROUND ====================
    const particleContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particleContainer.appendChild(particle);
    }

    // ==================== CUSTOM CURSOR ====================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';

        setTimeout(() => {
            cursorOutline.style.left = e.clientX + 'px';
            cursorOutline.style.top = e.clientY + 'px';
        }, 100);
    });

    // Hover effects for cursor
    document.querySelectorAll('a, button, .feature-card, .team-card, .hero-image-container').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'scale(1.5)';
            cursorOutline.style.borderColor = 'var(--accent-cyan)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'scale(1)';
            cursorOutline.style.borderColor = 'var(--accent-blue)';
        });
    });

    // ==================== SCROLL REVEAL ANIMATION ====================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==================== COUNTER ANIMATION ====================
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ==================== COMPARISON BAR ANIMATION ====================
    const comparisonBars = document.querySelectorAll('.comparison-fill');
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
                barObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    comparisonBars.forEach(bar => barObserver.observe(bar));

    // ==================== 3D TILT EFFECT ON CARDS ====================
    document.querySelectorAll('.feature-card, .team-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ==================== HERO IMAGE 3D MOUSE FOLLOW ====================
    const heroImage3d = document.querySelector('.hero-image-3d');
    if (heroImage3d) {
        document.addEventListener('mousemove', (e) => {
            const rect = heroImage3d.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const rotateX = (e.clientY - centerY) / 50;
            const rotateY = (centerX - e.clientX) / 50;

            heroImage3d.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    }

    // ==================== SMOOTH SCROLL FOR NAVIGATION ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==================== NAVBAR BACKGROUND ON SCROLL ====================
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.8)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // ==================== PARALLAX EFFECT FOR GLOW ====================
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const glow = document.querySelector('.glow');
        if (glow) {
            glow.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // ==================== ACTIVE NAVIGATION LINK ====================
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ==================== EXPERTISE 3D SCROLL EFFECTS ====================
    const expertiseTrack = document.getElementById('expertise-track');
    if (expertiseTrack) {
        // Clone cards for infinite scroll effect
        const cards = expertiseTrack.querySelectorAll('.expertise-3d-card');
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            expertiseTrack.appendChild(clone);
        });

        // Add scroll-based 3D tilt
        const expertiseContainer = document.querySelector('.expertise-3d-container');
        if (expertiseContainer) {
            expertiseContainer.addEventListener('scroll', () => {
                const scrollLeft = expertiseContainer.scrollLeft;
                const allCards = expertiseTrack.querySelectorAll('.expertise-3d-card');

                allCards.forEach((card, index) => {
                    const cardRect = card.getBoundingClientRect();
                    const containerRect = expertiseContainer.getBoundingClientRect();
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    const containerCenter = containerRect.left + containerRect.width / 2;
                    const distance = (cardCenter - containerCenter) / containerRect.width;

                    const rotateY = distance * 15;
                    const scale = 1 - Math.abs(distance) * 0.1;
                    const opacity = 1 - Math.abs(distance) * 0.3;

                    if (!card.matches(':hover')) {
                        card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`;
                        card.style.opacity = Math.max(0.5, opacity);
                    }
                });
            });
        }
    }

    // ==================== HERO STATS COUNTER ====================
    const heroCounters = document.querySelectorAll('.hero-stat-item .counter');
    const heroCounterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2500;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                updateCounter();
                heroCounterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.3 });

    heroCounters.forEach(counter => heroCounterObserver.observe(counter));

    // ==================== MARQUEE SPEED CONTROL ====================
    const marquee = document.querySelector('.marquee-content');
    if (marquee) {
        let marqueeSpeed = 1;
        window.addEventListener('scroll', () => {
            const scrollSpeed = Math.abs(window.scrollY - lastScroll);
            marqueeSpeed = 1 + scrollSpeed * 0.01;
            marquee.style.animationDuration = (30 / marqueeSpeed) + 's';
        });
    }
});