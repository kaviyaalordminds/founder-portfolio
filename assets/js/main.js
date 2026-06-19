$(document).ready(function() {
    // ==================== PRELOADER ANIMATION ====================
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');

    // ==================== DYNAMIC CALENDAR ICON ====================
    const calMonthLabel = document.getElementById('calMonthLabel');
    const calDateLabel = document.getElementById('calDateLabel');
    if (calMonthLabel && calDateLabel) {
        const now = new Date();
        const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        calMonthLabel.textContent = monthNames[now.getMonth()];
        calDateLabel.textContent = now.getDate();
    }

    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                if (preloader) preloader.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 500);
        }
        if (progressBar) progressBar.style.width = progress + '%';
    }, 200);
    document.body.style.overflow = 'hidden';

    // ==================== SMOKY CURSOR EFFECT ====================
    const cursor = document.getElementById('customCursor');
    let cursorX = -100, cursorY = -100;
    let smokeColors = [
        'rgba(59,130,246,0.55)', 'rgba(6,182,212,0.45)',
        'rgba(16,185,129,0.35)', 'rgba(99,102,241,0.4)'
    ];

    if (cursor && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX; cursorY = e.clientY;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            for (let i = 0; i < 2; i++) {
                const smoke = document.createElement('div');
                smoke.className = 'smoke-particle';
                const size = Math.random() * 18 + 8;
                const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
                const offsetX = (Math.random() - 0.5) * 20;
                const duration = Math.random() * 600 + 500;
                smoke.style.cssText = `
                    width:${size}px; height:${size}px; background:${color};
                    left:${cursorX + offsetX}px; top:${cursorY}px;
                    filter: blur(${Math.random()*5+3}px);
                    animation-duration:${duration}ms; position:fixed;
                    border-radius:50%; pointer-events:none; z-index:9998;
                `;
                document.body.appendChild(smoke);
                setTimeout(() => smoke.remove(), duration);
            }
        });

        const interactiveEls = document.querySelectorAll('a, button, input, select, textarea, .venture-card, .service-card');
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // ==================== 3D ZIG-ZAG PARALLAX ====================
    const zigzagContainer = document.getElementById('zigzag-bg');
    if (zigzagContainer) {
        let zigzagScrollY = 0, zigzagTargetY = 0;
        window.addEventListener('scroll', () => { zigzagTargetY = window.pageYOffset; }, { passive: true });

        function animateZigzag() {
            zigzagScrollY += (zigzagTargetY - zigzagScrollY) * 0.05;
            const lines = zigzagContainer.querySelectorAll('.zigzag-line');
            lines.forEach((line, index) => {
                const speed = (index % 2 === 0 ? 1 : -1) * (0.1 + index * 0.02);
                const yOffset = zigzagScrollY * speed;
                const currentTransform = line.style.transform || '';
                const rotateMatch = currentTransform.match(/rotate\\([^)]+\\)/);
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

        if (backToTop) {
            if (scrollTop > 300) backToTop.classList.add('visible');
            else backToTop.classList.remove('visible');
        }
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = circumference - (scrollPercent * circumference);
        }
    }
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    window.scrollToTop = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ==================== 3D CANVAS BACKGROUND ====================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [], mouseX = 0, mouseY = 0;

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

        for (let i = 0; i < 200; i++) particles.push(new Particle3D());

        function animate() {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
            ctx.fillRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const d = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2 + (p1.z-p2.z)**2);
                    if (d < 200) {
                        const s1 = 500/(500+p1.z), s2 = 500/(500+p2.z);
                        ctx.beginPath();
                        ctx.moveTo(p1.x*s1+width/2, p1.y*s1+height/2);
                        ctx.lineTo(p2.x*s2+width/2, p2.y*s2+height/2);
                        ctx.strokeStyle = `rgba(59,130,246,${0.1*(1-d/200)})`;
                        ctx.stroke();
                    }
                });
            });
            requestAnimationFrame(animate);
        }
        animate();
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    }

    // ==================== PARTICLE BACKGROUND ====================
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 15 + 's';
            p.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particleContainer.appendChild(p);
        }
    }

    // ==================== SCROLL REVEAL ANIMATION ====================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // ==================== COUNTER ANIMATION ====================
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000, step = target / (duration / 16);
                let current = 0;
                const updateCounter = () => {
                    current += step;
                    counter.textContent = current < target ? Math.floor(current) : target;
                    if (current < target) requestAnimationFrame(updateCounter);
                };
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));

    // ==================== 3D TILT EFFECT ON CARDS ====================
    document.querySelectorAll('.feature-card, .venture-card, .service-card, .portfolio-card, .achievement-card, .testimonial-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const centerX = rect.width / 2, centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15, rotateY = (centerX - x) / 15;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ==================== HERO IMAGE 3D MOUSE FOLLOW ====================
    const heroImage3d = document.querySelector('.hero-image-3d');
    if (heroImage3d) {
        document.addEventListener('mousemove', (e) => {
            const rect = heroImage3d.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
            heroImage3d.style.transform = `rotateX(${(e.clientY-centerY)/50}deg) rotateY(${(centerX-e.clientX)/50}deg)`;
        });
    }

    // ==================== SMOOTH SCROLL FOR NAVIGATION ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ==================== NAVBAR BACKGROUND ON SCROLL ====================
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        if (navbar) {
            if (currentScroll > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.background = 'var(--navbar-bg)';
                navbar.style.boxShadow = 'none';
            }
        }
        lastScroll = currentScroll;
    });

    // ==================== PARALLAX EFFECT FOR GLOW ====================
    window.addEventListener('scroll', () => {
        const glow = document.querySelector('.glow');
        if (glow) glow.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
    });

    // ==================== ACTIVE NAVIGATION LINK ====================
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (pageYOffset >= section.offsetTop - 200) current = section.getAttribute('id');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
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

    // ==================== MARQUEE PAUSE ON HOVER ====================
    marqueeTracks.forEach(track => {
        track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
        track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
    });

    // ==================== TIMELINE ANIMATION ====================
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.2 });
    timelineItems.forEach(item => timelineObserver.observe(item));

    // ==================== CONTACT FORM HANDLING ====================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                this.style.borderColor = !this.value.trim() ? '#ef4444' : '';
            });
            input.addEventListener('focus', function() { this.style.borderColor = ''; });
        });

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                if (this.value && !emailRegex.test(this.value)) this.style.borderColor = '#ef4444';
            });
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9+\\s-]/g, '');
            });
        }

        // Submit handler
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.contact-submit-btn');
            if (!btn) return;
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

    // ==================== 3D DEPTH CUBE PARALLAX ====================
    const depthCubes = document.querySelectorAll('.depth-cube');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        depthCubes.forEach((cube, index) => {
            const speed = 0.05 + (index * 0.01);
            const yOffset = scrolled * speed;
            const currentTransform = cube.style.transform || '';
            const animMatch = currentTransform.match(/translateY\\([^)]+\\)/);
            if (!animMatch) cube.style.transform = `translateY(${yOffset}px)`;
        });
    }, { passive: true });

    // ==================== STATS BANNER COUNTER ====================
    const statBannerNumbers = document.querySelectorAll('.stat-banner-number');
    const statBannerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const numMatch = text.match(/[\\d,]+/);
                if (numMatch) {
                    const target = parseInt(numMatch[0].replace(/,/g, ''));
                    const suffix = text.replace(numMatch[0], '');
                    const duration = 2000, step = target / (duration / 16);
                    let current = 0;
                    const updateStat = () => {
                        current += step;
                        el.textContent = current < target ? Math.floor(current).toLocaleString() + suffix : target.toLocaleString() + suffix;
                        if (current < target) requestAnimationFrame(updateStat);
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
                const numMatch = text.match(/[\\d,]+/);
                if (numMatch) {
                    const target = parseInt(numMatch[0].replace(/,/g, ''));
                    const suffix = text.replace(numMatch[0], '');
                    const duration = 2000, step = target / (duration / 16);
                    let current = 0;
                    const updateStat = () => {
                        current += step;
                        el.textContent = current < target ? Math.floor(current).toLocaleString() + suffix : target.toLocaleString() + suffix;
                        if (current < target) requestAnimationFrame(updateStat);
                    };
                    updateStat();
                }
                footerStatObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    footerStatNumbers.forEach(el => footerStatObserver.observe(el));

    // ==================== NEWSLETTER FORM HANDLER ====================
    const newsletterForms = document.querySelectorAll('.newsletter-form-inline');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            const btn = this.querySelector('button');
            if (input && input.value) {
                const originalText = btn ? btn.textContent : 'Subscribe';
                if (btn) { btn.textContent = 'Subscribed!'; btn.style.background = 'var(--accent-green)'; }
                const privacy = this.querySelector('.newsletter-privacy');
                if (privacy) { privacy.textContent = '✓ Successfully subscribed!'; privacy.style.color = 'var(--accent-green)'; }
                setTimeout(() => {
                    if (btn) { btn.textContent = originalText; btn.style.background = ''; }
                    if (privacy) { privacy.textContent = 'No spam. Unsubscribe anytime.'; privacy.style.color = ''; }
                    input.value = '';
                }, 3000);
            }
        });
    });

    // ==================== SOCIAL CONNECT CLICK HANDLERS ====================
    const socialItems = document.querySelectorAll('.social-connect-item');
    socialItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const platform = this.getAttribute('data-platform');
            if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                e.preventDefault();
                const tooltip = document.createElement('div');
                tooltip.textContent = platform + ' link coming soon!';
                tooltip.style.cssText = `
                    position: fixed; background: var(--card-bg); color: var(--text-primary);
                    padding: 8px 16px; border-radius: 8px; font-size: 0.85rem;
                    border: 1px solid var(--border-color); z-index: 9999;
                    pointer-events: none; top: ${e.clientY - 40}px; left: ${e.clientX}px;
                    transform: translateX(-50%); box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                `;
                document.body.appendChild(tooltip);
                setTimeout(() => { tooltip.style.opacity = '0'; tooltip.style.transition = 'opacity 0.3s'; setTimeout(() => tooltip.remove(), 300); }, 2000);
            }
        });
    });

    // ==================== CONTACT INFO CARD - COPY TO CLIPBOARD ====================
    const contactCards = document.querySelectorAll('.contact-info-card');
    contactCards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.querySelector('a');
            const text = this.querySelector('p');
            const content = link ? link.textContent : (text ? text.textContent : '');
            if (content) {
                navigator.clipboard.writeText(content).then(() => {
                    const h5 = this.querySelector('.info-card-content h5');
                    const original = h5 ? h5.textContent : '';
                    if (h5) h5.textContent = 'Copied!';
                    this.style.borderColor = 'var(--accent-green)';
                    setTimeout(() => { if (h5) h5.textContent = original; this.style.borderColor = ''; }, 1500);
                }).catch(() => {
                    const textArea = document.createElement('textarea');
                    textArea.value = content;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                });
            }
        });
    });

    // ==================== PORTFOLIO VIEW BUTTON HANDLERS ====================
    const portfolioViews = document.querySelectorAll('.portfolio-view');
    portfolioViews.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.portfolio-card');
            const title = card ? card.querySelector('.portfolio-title').textContent : 'Project';
            const modal = document.createElement('div');
            modal.className = 'portfolio-modal';
            modal.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.8);
                display: flex; align-items: center; justify-content: center;
                z-index: 10000; backdrop-filter: blur(10px);
            `;
            modal.innerHTML = `
                <div style="
                    background: var(--card-bg); border: 1px solid var(--border-color);
                    border-radius: 24px; padding: 3rem; max-width: 400px;
                    text-align: center; animation: modalIn 0.3s ease;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">&#128274;</div>
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">${title}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Case study details coming soon. Contact us for a private demo.</p>
                    <button class="btn btn-primary-custom btn-custom" style="border: none; cursor: pointer;">Close</button>
                </div>
            `;
            modal.addEventListener('click', (e) => { if (e.target === modal || e.target.tagName === 'BUTTON') modal.remove(); });
            document.body.appendChild(modal);
        });
    });

    // ==================== VENTURE BADGE TOOLTIPS ====================
    const ventureBadges = document.querySelectorAll('.venture-badge');
    ventureBadges.forEach(badge => {
        badge.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.venture-card');
            const title = card ? card.querySelector('.feature-title').textContent : 'Venture';
            const tooltip = document.createElement('div');
            tooltip.textContent = title + ' - Learn more in the About section';
            tooltip.style.cssText = `
                position: fixed; background: var(--card-bg); color: var(--text-primary);
                padding: 8px 16px; border-radius: 8px; font-size: 0.85rem;
                border: 1px solid var(--border-color); z-index: 9999;
                pointer-events: none; top: ${e.clientY - 40}px; left: ${e.clientX}px;
                transform: translateX(-50%);
            `;
            document.body.appendChild(tooltip);
            setTimeout(() => tooltip.remove(), 2000);
        });
    });

    // ==================== KEYBOARD ACCESSIBILITY - ESC TO CLOSE MODALS ====================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.portfolio-modal, .meeting-modal').forEach(m => m.remove());
        }
    });

    // ==================== NAVBAR TOGGLE ARIA SYNC ====================
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }
});