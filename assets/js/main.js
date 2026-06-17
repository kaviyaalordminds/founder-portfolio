$(document).ready(function() {

    // ==================== SMOKY CURSOR EFFECT ====================
    const cursor = document.getElementById('customCursor');
    let cursorX = -100, cursorY = -100;
    let smokeColors = [
        'rgba(59,130,246,0.55)',
        'rgba(6,182,212,0.45)',
        'rgba(16,185,129,0.35)',
        'rgba(99,102,241,0.4)'
    ];

    if (cursor && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursor.style.left = cursorX + 'px';
            cursor.style.top  = cursorY + 'px';

            // Emit smoke particles
            for (let i = 0; i < 2; i++) {
                const smoke = document.createElement('div');
                smoke.className = 'smoke-particle';
                const size = Math.random() * 18 + 8;
                const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
                const offsetX = (Math.random() - 0.5) * 20;
                const duration = Math.random() * 600 + 500;
                smoke.style.cssText = `
                    width:${size}px; height:${size}px;
                    background:${color};
                    left:${cursorX + offsetX}px;
                    top:${cursorY}px;
                    filter: blur(${Math.random()*5+3}px);
                    animation-duration:${duration}ms;
                `;
                document.body.appendChild(smoke);
                setTimeout(() => smoke.remove(), duration);
            }
        });

        // Hover effect on interactive elements
        const interactiveEls = document.querySelectorAll('a, button, input, select, textarea, .venture-card, .service-card');
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }


    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');

    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 500);
        }
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }, 200);

    document.body.style.overflow = 'hidden';

    // ==================== 3D ZIG-ZAG PARALLAX ====================
    const zigzagContainer = document.getElementById('zigzag-bg');
    if (zigzagContainer) {
        let zigzagScrollY = 0;
        let zigzagTargetY = 0;

        window.addEventListener('scroll', () => {
            zigzagTargetY = window.pageYOffset;
        }, { passive: true });

        function animateZigzag() {
            zigzagScrollY += (zigzagTargetY - zigzagScrollY) * 0.05;
            const lines = zigzagContainer.querySelectorAll('.zigzag-line');
            lines.forEach((line, index) => {
                const speed = (index % 2 === 0 ? 1 : -1) * (0.1 + index * 0.02);
                const yOffset = zigzagScrollY * speed;
                const currentTransform = line.style.transform || '';
                const rotateMatch = currentTransform.match(/rotate\([^)]+\)/);
                const rotate = rotateMatch ? rotateMatch[0] : 'rotate(0deg)';
                line.style.transform = `translateY(${yOffset}px) ${rotate}`;
            });
            requestAnimationFrame(animateZigzag);
        }
        animateZigzag();
    }

    // ==================== BACK TO TOP BUTTON ====================
    const backToTop = document.getElementById('backToTop');
    const progressCircle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;

    if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = circumference;
    }

    function updateBackToTop() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;

        if (scrollTop > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        if (progressCircle) {
            const offset = circumference - (scrollPercent * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    window.scrollToTop = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    // ==================== MARQUEE SPEED CONTROL ON SCROLL ====================
    const marqueeTracks = document.querySelectorAll('.marquee-track');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const scrollSpeed = Math.abs(window.scrollY - lastScrollY);
        const speedMultiplier = 1 + scrollSpeed * 0.01;

        marqueeTracks.forEach(track => {
            const baseDuration = track.classList.contains('marquee-track-reverse') ? 35 :
                                track.classList.contains('marquee-track-slow') ? 45 : 30;
            track.style.animationDuration = (baseDuration / speedMultiplier) + 's';
        });

        lastScrollY = window.scrollY;
    }, { passive: true });

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

    // ==================== TIMELINE ANIMATION ====================
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => timelineObserver.observe(item));

    // ==================== ROADMAP PROGRESS ANIMATION ====================
    const roadmapProgressBars = document.querySelectorAll('.roadmap-progress-bar');
    const roadmapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
                roadmapObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    roadmapProgressBars.forEach(bar => roadmapObserver.observe(bar));

    // ==================== CONTACT FORM HANDLING ====================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.contact-submit-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="btn-text">Sending...</span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<span class="btn-text">Message Sent!</span> <span class="btn-icon">&#10003;</span>';
                btn.style.background = 'var(--accent-green)';
                btn.style.borderColor = 'var(--accent-green)';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.disabled = false;
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }

    // ==================== MARQUEE PAUSE ON HOVER ====================
    marqueeTracks.forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });

    // ==================== 3D DEPTH CUBE PARALLAX ====================
    const depthCubes = document.querySelectorAll('.depth-cube');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        depthCubes.forEach((cube, index) => {
            const speed = 0.05 + (index * 0.01);
            const yOffset = scrolled * speed;
            const currentTransform = cube.style.transform || '';
            const animMatch = currentTransform.match(/translateY\([^)]+\)/);
            if (!animMatch) {
                cube.style.transform = `translateY(${yOffset}px)`;
            }
        });
    }, { passive: true });

    // ==================== VENTURE CARDS 3D TILT ====================
    document.querySelectorAll('.venture-card, .service-card, .portfolio-card, .achievement-card, .testimonial-card, .roadmap-phase-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ==================== STATS BANNER COUNTER ====================
    const statBannerNumbers = document.querySelectorAll('.stat-banner-number');
    const statBannerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const numMatch = text.match(/[\d,]+/);
                if (numMatch) {
                    const target = parseInt(numMatch[0].replace(/,/g, ''));
                    const suffix = text.replace(numMatch[0], '');
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const updateStat = () => {
                        current += step;
                        if (current < target) {
                            el.textContent = Math.floor(current).toLocaleString() + suffix;
                            requestAnimationFrame(updateStat);
                        } else {
                            el.textContent = target.toLocaleString() + suffix;
                        }
                    };
                    updateStat();
                }
                statBannerObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statBannerNumbers.forEach(el => statBannerObserver.observe(el));

    // ==================== FOOTER STATS COUNTER ====================
    const footerStatNumbers = document.querySelectorAll('.footer-stat-number');
    const footerStatObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const numMatch = text.match(/[\d,]+/);
                if (numMatch) {
                    const target = parseInt(numMatch[0].replace(/,/g, ''));
                    const suffix = text.replace(numMatch[0], '');
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const updateStat = () => {
                        current += step;
                        if (current < target) {
                            el.textContent = Math.floor(current).toLocaleString() + suffix;
                            requestAnimationFrame(updateStat);
                        } else {
                            el.textContent = target.toLocaleString() + suffix;
                        }
                    };
                    updateStat();
                }
                footerStatObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    footerStatNumbers.forEach(el => footerStatObserver.observe(el));
});