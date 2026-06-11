// PRELOADER
// =========================================================
(function() {
  const bar = document.getElementById('preloader-bar');
  const pct = document.getElementById('preloader-pct');
  const loader = document.getElementById('preloader');
  let start = null;
  const dur = 1800;
  function tick(ts) {
    if (!start) start = ts;
    const p = Math.min(1, (ts - start) / dur);
    const v = Math.round(p * 100);
    bar.style.width = v + '%';
    pct.textContent = v + '%';
    if (p < 1) { requestAnimationFrame(tick); }
    else { setTimeout(() => loader.classList.add('done'), 350); }
  }
  requestAnimationFrame(tick);
})();

// =========================================================
// CURSOR BLOB
// =========================================================
(function() {
  const blob = document.getElementById('cursor-blob');
  let tx = -9999, ty = -9999, cx = -9999, cy = -9999;
  document.addEventListener('mousemove', e => { tx = e.clientX - 250; ty = e.clientY - 250; });
  function loop() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    blob.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    requestAnimationFrame(loop);
  }
  loop();
})();

// =========================================================
// THEME TOGGLE
// =========================================================
(function() {
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
  let contrast = localStorage.getItem('nk-theme') === 'contrast';
  if (contrast) { document.documentElement.classList.add('theme-contrast'); icon.innerHTML = SUN; }
  btn.addEventListener('click', () => {
    contrast = !contrast;
    document.documentElement.classList.toggle('theme-contrast', contrast);
    localStorage.setItem('nk-theme', contrast ? 'contrast' : 'default');
    icon.innerHTML = contrast ? SUN : MOON;
  });
})();

// =========================================================
// SCROLL REVEAL
// =========================================================
(function() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '-50px' });
  els.forEach(el => obs.observe(el));
})();

// =========================================================
// SMOKE CANVAS
// =========================================================
(function() {
  const canvas = document.getElementById('smoke-canvas');
  const container = document.getElementById('smoke-container');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];
  function resize() {
    const r = container.getBoundingClientRect();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  new ResizeObserver(resize).observe(container);
  let lx = 0, ly = 0, active = false;
  function spawn(x, y) {
    const hue = Math.random() > 0.5 ? 45 : 285;
    particles.push({ x, y, vx: (Math.random()-.5)*.3, vy: -Math.random()*.35-.1, life: 0, maxLife: 40+Math.random()*25, size: 10+Math.random()*14, hue });
  }
  container.addEventListener('mousemove', e => {
    const r = container.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const dx = x - lx, dy = y - ly, dist = Math.hypot(dx, dy);
    const steps = Math.min(2, Math.max(1, Math.floor(dist / 24)));
    for (let i = 0; i < steps; i++) spawn(lx + dx*i/steps, ly + dy*i/steps);
    lx = x; ly = y; active = true;
  });
  container.addEventListener('mouseleave', () => active = false);
  function tick() {
    ctx.clearRect(0, 0, canvas.width/dpr, canvas.height/dpr);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = particles.length-1; i >= 0; i--) {
      const p = particles[i];
      p.life++; p.x += p.vx; p.y += p.vy; p.vy -= 0.01; p.vx *= 0.99; p.size += 0.18;
      const t = p.life/p.maxLife, alpha = (1-t)*0.1;
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
      g.addColorStop(0, `hsla(${p.hue},90%,65%,${alpha})`);
      g.addColorStop(0.4, `hsla(${p.hue},80%,55%,${alpha*.4})`);
      g.addColorStop(1, `hsla(${p.hue},80%,55%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      if (p.life >= p.maxLife) particles.splice(i, 1);
    }
    if (active && particles.length < 40 && Math.random() < 0.05) spawn(lx, ly);
    requestAnimationFrame(tick);
  }
  tick();
})();

// =========================================================
// SKILLS DATA + RENDER
// =========================================================
(function() {
  const rings = [
    { label: 'Performance Marketing', value: 95 },
    { label: 'SEO & Google Ads', value: 92 },
    { label: 'Brand Architecture', value: 88 },
    { label: 'Social Campaigns', value: 90 },
    { label: 'Analytics & ROI', value: 93 },
    { label: 'Team Leadership', value: 96 },
  ];
  const stack = ['Google Ads','Meta Ads','SEO','GA4','WordPress','Figma','React','Mobile First','Automation','Branding'];
  const grid = document.getElementById('skills-grid');
  const stackWrap = document.getElementById('stack-wrap');
  const circ = 2 * Math.PI * 52;

  rings.forEach((r, i) => {
    const dash = (r.value / 100) * circ;
    const card = document.createElement('div');
    card.className = 'ring-card glass reveal';
    card.style.transitionDelay = (i * 0.08) + 's';
    card.innerHTML = `
      <div class="ring-svg-wrap">
        <svg class="ring-svg" viewBox="0 0 120 120">
          <defs><linearGradient id="rg${i}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="oklch(0.88 0.12 88)"/>
            <stop offset="100%" stop-color="oklch(0.55 0.22 305)"/>
          </linearGradient></defs>
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
          <circle class="ring-progress" data-val="${r.value}" cx="60" cy="60" r="52" fill="none" stroke="url(#rg${i})" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}" style="transition:stroke-dashoffset 1.6s ease"/>
        </svg>
        <div class="ring-center">
          <span class="ring-pct text-gradient-gold" style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700">0%</span>
        </div>
      </div>
      <div>
        <p class="ring-label-text">${r.label}</p>
        <p class="ring-mastery">Mastery level</p>
      </div>`;
    grid.appendChild(card);
  });

  stack.forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'stack-pill reveal';
    pill.textContent = s;
    stackWrap.appendChild(pill);
  });

  // Animate rings when in view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const circle = e.target.querySelector('.ring-progress');
      const pctEl = e.target.querySelector('.ring-pct');
      if (!circle) return;
      const val = +circle.dataset.val;
      const dash = (val / 100) * circ;
      circle.style.strokeDashoffset = circ - dash;
      // animate counter
      const t0 = performance.now();
      function countTick(ts) {
        const p = Math.min(1, (ts - t0) / 1500);
        pctEl.textContent = Math.round(val * (1 - Math.pow(1-p,3))) + '%';
        if (p < 1) requestAnimationFrame(countTick);
      }
      requestAnimationFrame(countTick);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.ring-card').forEach(c => obs.observe(c));
})();

// =========================================================
// GALLERY DATA + RENDER
// =========================================================
(function() {
  const galleryData = [
    {
      title: 'Performance Marketing Suite',
      venture: 'LordMinds',
      type: 'Dashboard',
      src: 'assets/images/gallery-construct.jpg',
      desc: 'Strong, recognizable digital identities crafted for emerging brands ready to scale.'
    },

    {
      title: 'AI Analytics Platform',
      venture: 'NovaTech',
      type: 'Web Application',
      src: 'assets/images/gallery-edu.jpg',
      desc: 'AI powered analytics dashboard with modern user experience.'
    },

    {
      title: 'E-Commerce Experience',
      venture: 'ShopVerse',
      type: 'Website',
      src: 'assets/images/gallery-innov.jpg',
      desc: 'High performance ecommerce platform designed for conversions.'
    },

    {
      title: 'Brand Identity Design',
      venture: 'Creative Studio',
      type: 'Branding',
      src: 'assets/images/gallery-marketing.jpg',
      desc: 'Premium branding solutions with futuristic visual language.'
    }
  ];

  const grid = document.getElementById('gallery-grid');
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-img');
  const modalMeta = document.getElementById('modal-meta');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');

  document.getElementById('modal-close')
  .addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', e => {
    if(e.target === modal){
      modal.classList.remove('open');
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key === "Escape"){
      modal.classList.remove('open');
    }
  });

  galleryData.forEach((g,i)=>{
    const card = document.createElement('div');
    card.className = 'gallery-card glass reveal';
    card.style.transitionDelay = (i * 0.08)+'s';

    card.innerHTML = `
      <div class="gallery-img-wrap">
        <img 
          src="${g.src}" 
          alt="${g.title}" 
          loading="lazy"
        >
        <div class="gallery-img-overlay"></div>
        <span class="gallery-type-badge">
          ${g.type}
        </span>

        <div class="gallery-arrow">
          <svg 
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M7 17 17 7"/>
          <path d="M7 7h10v10"/>
          </svg>
        </div>
      </div>

      <div class="gallery-card-body">
        <p class="gallery-venture">
          ${g.venture}
        </p>
        <h3 class="gallery-title">
          ${g.title}
        </h3>
      </div>
    `;

    card.addEventListener('click',()=>{
      modalImg.src = g.src;
      modalImg.alt = g.title;
      modalMeta.textContent =
      `${g.venture} · ${g.type}`;
      modalTitle.textContent = g.title;
      modalDesc.textContent = g.desc;
      modal.classList.add('open');
    });
    grid.appendChild(card);
  });
})();

// =========================================================
// CONTACT FORM
// =========================================================
(function() {
  const nameEl = document.getElementById('f-name');
  const emailEl = document.getElementById('f-email');
  const msgEl = document.getElementById('f-msg');
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const btn = document.getElementById('submit-btn');

  function counter(input, id, max) {
    const el = document.getElementById(id);
    input.addEventListener('input', () => el.textContent = input.value.length + '/' + max);
  }
  counter(nameEl, 'name-counter', 100);
  counter(emailEl, 'email-counter', 255);
  counter(msgEl, 'msg-counter', 1000);

  function validate() {
    let ok = true;
    const n = nameEl.value.trim(), e = emailEl.value.trim(), m = msgEl.value.trim();
    const show = (id, msg) => { document.getElementById(id).textContent = msg; };
    // name
    if (!n) { show('name-error','Name is required'); nameEl.classList.add('error'); ok=false; }
    else if (n.length>100) { show('name-error','Name must be under 100 characters'); nameEl.classList.add('error'); ok=false; }
    else { show('name-error',''); nameEl.classList.remove('error'); }
    // email
    if (!e) { show('email-error','Email is required'); emailEl.classList.add('error'); ok=false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { show('email-error','Enter a valid email address'); emailEl.classList.add('error'); ok=false; }
    else { show('email-error',''); emailEl.classList.remove('error'); }
    // message
    if (!m) { show('msg-error','Message is required'); msgEl.classList.add('error'); ok=false; }
    else if (m.length<10) { show('msg-error','Message should be at least 10 characters'); msgEl.classList.add('error'); ok=false; }
    else { show('msg-error',''); msgEl.classList.remove('error'); }
    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    btn.disabled = true;
    btn.innerHTML = '<svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending…';
    await new Promise(r => setTimeout(r, 1200));
    form.style.display = 'none';
    success.classList.add('show');
    setTimeout(() => {
      success.classList.remove('show');
      form.style.display = '';
      btn.disabled = false;
      btn.innerHTML = '<svg class="send-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Send Message';
      nameEl.value=''; emailEl.value=''; msgEl.value='';
      ['name','email','msg'].forEach(id => { document.getElementById(id+'-counter').textContent='0/'+(id==='msg'?1000:id==='email'?255:100); document.getElementById(id+'-error').textContent=''; });
    }, 3500);
  });
})();

// =========================================================
// FOOTER YEAR
// =========================================================
document.getElementById('year').textContent = new Date().getFullYear();
// =========================================================
// HERO 3D PARALLAX + SCROLL ZOOM EFFECTS
// =========================================================
(function() {
  const heroSection = document.getElementById('top');
  if (!heroSection) return;

  const heroBgImg = heroSection.querySelector('.hero-bg img');
  const heroContent = heroSection.querySelector('.hero-content');
  const badge = heroSection.querySelector('.hero-badge');
  const title = heroSection.querySelector('.hero-title');
  const sub = heroSection.querySelector('.hero-sub');
  const ventures = heroSection.querySelector('.hero-ventures');
  const scrollIndicator = heroSection.querySelector('.hero-scroll');
  const floatingShapes = heroSection.querySelectorAll('.shape');

  // ---------- Mouse 3D tilt parallax (desktop) ----------
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to +1
    const dy = (e.clientY - cy) / (rect.height / 2);   // -1 to +1

    // Background moves opposite (parallax depth)
    if (heroBgImg) {
      heroBgImg.style.transform = `scale(1.1) translate(${dx * -12}px, ${dy * -8}px)`;
    }

    // Badge — deepest foreground layer
    if (badge) badge.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;

    // Title — slight float
    if (title) title.style.transform = `translate(${dx * 10}px, ${dy * 6}px)`;

    // Sub — subtle
    if (sub) sub.style.transform = `translate(${dx * 7}px, ${dy * 4}px)`;

    // Ventures bar
    if (ventures) ventures.style.transform = `translate(${dx * 5}px, ${dy * 3}px)`;

    // Floating shapes — most movement
    floatingShapes.forEach((shape, i) => {
      const depth = 8 + i * 5;
      shape.style.transform = `translate(${dx * depth}px, ${dy * depth * 0.7}px)`;
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    if (heroBgImg) heroBgImg.style.transform = 'scale(1.1)';
    [badge, title, sub, ventures].forEach(el => {
      if (el) el.style.transform = '';
    });
    floatingShapes.forEach(shape => shape.style.transform = '');
  });

  // ---------- Scroll zoom + parallax ----------
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroH = heroSection.offsetHeight;

      if (scrollY > heroH) { ticking = false; return; }

      const progress = scrollY / heroH; // 0 → 1

      // BG zooms in as you scroll down
      if (heroBgImg) {
        const scale = 1.1 + progress * 0.15;
        heroBgImg.style.transform = `scale(${scale}) translateY(${progress * 30}px)`;
      }

      // Content floats up + fades
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
        heroContent.style.opacity = Math.max(0, 1 - progress * 2.2);
      }

      // Floating shapes drift at different rates
      floatingShapes.forEach((shape, i) => {
        const speed = 0.15 + i * 0.05;
        shape.style.transform = `translateY(${scrollY * speed}px)`;
      });

      // Scroll indicator fades out quickly
      if (scrollIndicator) {
        scrollIndicator.style.opacity = Math.max(0, 1 - progress * 5);
      }

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

})();

// =========================================================
// HERO SMOKEY CURSOR ORB
// =========================================================
(function() {
  const heroSection = document.getElementById('top');
  const smokeOrb = heroSection && heroSection.querySelector('.hero-smoke-hover');
  if (!heroSection || !smokeOrb) return;

  let visible = false;

  heroSection.addEventListener('mouseenter', () => {
    smokeOrb.style.opacity = '1';
    smokeOrb.style.transform = 'translate(-50%, -50%) scale(1)';
    visible = true;
  });

  heroSection.addEventListener('mouseleave', () => {
    smokeOrb.style.opacity = '0';
    smokeOrb.style.transform = 'translate(-50%, -50%) scale(0.85)';
    visible = false;
  });

  heroSection.addEventListener('mousemove', (e) => {
    smokeOrb.style.left = e.clientX + 'px';
    smokeOrb.style.top  = e.clientY + 'px';
  });
})();
