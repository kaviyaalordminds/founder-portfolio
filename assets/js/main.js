/* ════════════════════════════════════════════
   PRELOADER — Three.js orbiting rings + dismiss
════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('preloader-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x050505, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  const gold = 0xC9A84C;

  // Outer orbiting torus rings
  const rings = [];
  const ringDefs = [
    { r: 2.8, tube: 0.006, rot: [Math.PI/3, 0, 0], speed: 0.008, opacity: 0.5 },
    { r: 2.2, tube: 0.008, rot: [0, Math.PI/4, 0], speed: -0.012, opacity: 0.4 },
    { r: 1.6, tube: 0.01, rot: [Math.PI/6, Math.PI/3, 0], speed: 0.018, opacity: 0.35 },
    { r: 3.5, tube: 0.004, rot: [-Math.PI/5, Math.PI/7, 0], speed: -0.005, opacity: 0.2 },
  ];
  ringDefs.forEach(d => {
    const g = new THREE.TorusGeometry(d.r, d.tube, 8, 200);
    const m = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: d.opacity });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.set(...d.rot);
    mesh._speed = d.speed;
    scene.add(mesh);
    rings.push(mesh);
  });

  // Central glowing icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(0.5, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: gold, wireframe: true, transparent: true, opacity: 0.25 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // Particles
  const pCount = 600;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 1.8 + Math.random() * 2.5;
    pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i*3+2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: gold, size: 0.025, transparent: true, opacity: 0.5 });
  const pts = new THREE.Points(pGeo, pMat);
  scene.add(pts);

  let pt = 0;
  function animatePreloader() {
    if (!document.getElementById('preloader') || document.getElementById('preloader').classList.contains('hidden')) return;
    requestAnimationFrame(animatePreloader);
    pt += 0.008;
    rings.forEach(r => { r.rotation.y += r._speed; r.rotation.x += r._speed * 0.4; });
    ico.rotation.y += 0.012;
    ico.rotation.x += 0.007;
    pts.rotation.y += 0.003;
    renderer.render(scene, camera);
  }
  animatePreloader();

  // Progress simulation
  const bar = document.getElementById('loaderBar');
  const pct = document.getElementById('loaderPct');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 4 + 1;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress) + '%';
    if (progress === 100) {
      setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
      }, 400);
    }
  }, 50);
})();

/* ════════════════════════════════════════════
   HERO BACKGROUND — immersive 3D scene
   Inspired by 21hrs.space:
   - Dense star/particle field
   - Floating DNA-helix-style ribbon
   - Glowing icosphere
   - Mouse parallax depth
════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 8);

  const gold   = new THREE.Color(0xC9A84C);
  const goldBright = new THREE.Color(0xE8C97A);
  const white  = new THREE.Color(0xF5F3EE);
  const dim    = new THREE.Color(0x2A2820);

  /* ── 1. DEEP STAR FIELD ── */
  const starCount = 3000;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - 0.5) * 80;
    starPos[i*3+1] = (Math.random() - 0.5) * 50;
    starPos[i*3+2] = (Math.random() - 0.5) * 40 - 5;
    const t = Math.random();
    const c = t < 0.08 ? gold : t < 0.18 ? goldBright : t < 0.35 ? white : dim;
    starCol[i*3] = c.r; starCol[i*3+1] = c.g; starCol[i*3+2] = c.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true });
  scene.add(new THREE.Points(starGeo, starMat));

  /* ── 2. FOREGROUND BRIGHT PARTICLES (21hrs style: close, large glowing dots) ── */
  const fgCount = 120;
  const fgPos = new Float32Array(fgCount * 3);
  const fgSizes = new Float32Array(fgCount);
  for (let i = 0; i < fgCount; i++) {
    fgPos[i*3]   = (Math.random() - 0.5) * 22;
    fgPos[i*3+1] = (Math.random() - 0.5) * 14;
    fgPos[i*3+2] = (Math.random() - 0.5) * 6 + 1;
    fgSizes[i] = Math.random() * 0.06 + 0.02;
  }
  const fgGeo = new THREE.BufferGeometry();
  fgGeo.setAttribute('position', new THREE.BufferAttribute(fgPos, 3));
  fgGeo.setAttribute('size', new THREE.BufferAttribute(fgSizes, 1));
  const fgMat = new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.05, transparent: true, opacity: 0.5, sizeAttenuation: true });
  const fgPts = new THREE.Points(fgGeo, fgMat);
  scene.add(fgPts);

  /* ── 3. HELIX RIBBON (DNA-style path, unique signature) ── */
  const helixGroup = new THREE.Group();
  const helixPointsA = [], helixPointsB = [];
  const helixCount = 200;
  for (let i = 0; i < helixCount; i++) {
    const t = (i / helixCount) * Math.PI * 8 - Math.PI * 4;
    const r = 1.4;
    helixPointsA.push(new THREE.Vector3(r * Math.cos(t), t * 0.28, r * Math.sin(t)));
    helixPointsB.push(new THREE.Vector3(r * Math.cos(t + Math.PI), t * 0.28, r * Math.sin(t + Math.PI)));
  }
  const helixCurveA = new THREE.CatmullRomCurve3(helixPointsA);
  const helixCurveB = new THREE.CatmullRomCurve3(helixPointsB);

  const helixTubeA = new THREE.TubeGeometry(helixCurveA, 300, 0.012, 6, false);
  const helixTubeB = new THREE.TubeGeometry(helixCurveB, 300, 0.012, 6, false);
  const helixMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.18 });
  helixGroup.add(new THREE.Mesh(helixTubeA, helixMat));
  helixGroup.add(new THREE.Mesh(helixTubeB, helixMat));

  // Cross rungs
  for (let i = 0; i < 40; i++) {
    const frac = i / 40;
    const t = frac * Math.PI * 8 - Math.PI * 4;
    const r = 1.4;
    const ax = r * Math.cos(t), az = r * Math.sin(t), ay = t * 0.28;
    const bx = r * Math.cos(t + Math.PI), bz = r * Math.sin(t + Math.PI);
    const rungGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, ay, bz)
    ]);
    const rungMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.08 });
    helixGroup.add(new THREE.Line(rungGeo, rungMat));
  }

  helixGroup.position.set(5.5, 0, -1);
  helixGroup.rotation.z = 0.15;
  scene.add(helixGroup);

  /* ── 4. GLOWING ICOSPHERE (21hrs style central object) ── */
  const icoGeo = new THREE.IcosahedronGeometry(1.1, 1);
  const icoWire = new THREE.WireframeGeometry(icoGeo);
  const icoMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.12 });
  const icoMesh = new THREE.LineSegments(icoWire, icoMat);
  icoMesh.position.set(-5.5, 0.5, -2);
  scene.add(icoMesh);

  /* ── 5. ORBITAL RINGS (floating in space) ── */
  const orbitalGroup = new THREE.Group();
  [[3.5, 0.005, 0.06, [1.1,0.3,0]], [2.4, 0.007, 0.1, [0.5,1.2,0.4]], [4.8, 0.003, 0.04, [-0.8,0.5,1]]].forEach(([r,t,o,rot]) => {
    const g = new THREE.TorusGeometry(r, t, 6, 200);
    const m = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: o });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.set(...rot);
    orbitalGroup.add(mesh);
  });
  scene.add(orbitalGroup);

  /* ── 6. NETWORK LINES (sparse graph connecting points) ── */
  const netLinePts = [];
  for (let i = 0; i < 60; i++) {
    const ax = (Math.random()-0.5)*28, ay = (Math.random()-0.5)*18, az = (Math.random()-0.5)*8-2;
    const bx = ax+(Math.random()-0.5)*5, by = ay+(Math.random()-0.5)*4, bz = az+(Math.random()-0.5)*2;
    netLinePts.push(ax,ay,az, bx,by,bz);
  }
  const netGeo = new THREE.BufferGeometry();
  netGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(netLinePts), 3));
  const netMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.07 });
  scene.add(new THREE.LineSegments(netGeo, netMat));

  /* ── 7. AURORA PLANE (subtle gradient curtain, unique) ── */
  const auroraGeo = new THREE.PlaneGeometry(30, 10, 1, 1);
  const auroraMat = new THREE.MeshBasicMaterial({
    color: 0xC9A84C,
    transparent: true,
    opacity: 0.025,
    side: THREE.DoubleSide,
  });
  const aurora = new THREE.Mesh(auroraGeo, auroraMat);
  aurora.position.set(0, -2, -6);
  aurora.rotation.x = -0.3;
  scene.add(aurora);

  /* Mouse parallax */
  let mx = 0, my = 0, targetX = 0, targetY = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.004;

    // Smooth mouse follow
    targetX += (mx - targetX) * 0.03;
    targetY += (my - targetY) * 0.03;

    camera.position.x = targetX * 0.6;
    camera.position.y = -targetY * 0.4;
    camera.lookAt(0, 0, 0);

    // Helix slow rotation
    helixGroup.rotation.y = t * 0.12;

    // Icosphere float + spin
    icoMesh.rotation.y += 0.005;
    icoMesh.rotation.x += 0.003;
    icoMesh.position.y = 0.5 + Math.sin(t * 0.7) * 0.3;

    // Orbital rings drift
    orbitalGroup.rotation.y += 0.003;
    orbitalGroup.rotation.x += 0.001;

    // Stars gentle drift
    const sp = starGeo.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
      sp[i*3+2] += 0.002;
      if (sp[i*3+2] > 20) sp[i*3+2] = -30;
    }
    starGeo.attributes.position.needsUpdate = true;

    // FG particles oscillate
    const fp = fgGeo.attributes.position.array;
    for (let i = 0; i < fgCount; i++) {
      fp[i*3+1] += Math.sin(t * 1.2 + i * 0.7) * 0.001;
    }
    fgGeo.attributes.position.needsUpdate = true;

    // Aurora breathe
    aurora.material.opacity = 0.015 + 0.015 * Math.sin(t * 0.6);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* Nav scroll */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(8,8,8,0.95)';
    nav.style.backdropFilter = 'blur(20px)';
    nav.style.borderBottom = '1px solid rgba(201,168,76,0.1)';
  } else {
    nav.style.background = 'linear-gradient(to bottom, rgba(8,8,8,0.85) 0%, transparent 100%)';
    nav.style.backdropFilter = 'blur(0px)';
    nav.style.borderBottom = 'none';
  }
});