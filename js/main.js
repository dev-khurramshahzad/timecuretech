/* Time Cure Technologies - site scripts. Edit WHATSAPP below. */
/* ===== CONFIG: edit these ===== */
const WHATSAPP = "971524509691";   // +971 52 450 9691 (country code + number, no + or spaces)
/* ================================ */

document.getElementById('yr').textContent = new Date().getFullYear();
document.getElementById('waFloat').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello Time Cure Technologies, I need IT support.")}`;

/* Theme switch (light is the default) */
const root = document.documentElement, tBtn = document.getElementById('themeToggle'), meta = document.getElementById('metaTheme');
const applyTheme = (t, save) => {
  root.setAttribute('data-bs-theme', t);
  meta.content = t === 'dark' ? '#060A1C' : '#FFFFFF';
  tBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  if (save) { try { localStorage.setItem('tc-theme', t); } catch (e) {} }
  window.dispatchEvent(new Event('themechange'));
};
tBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark', true));
applyTheme(root.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light', false);

/* Counters, footer form, back-to-top */
const cio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; cio.unobserve(e.target);
  const t = +e.target.dataset.count; let n = 0; const id = setInterval(() => { n++; e.target.textContent = n; if (n >= t) clearInterval(id); }, 110); }), {threshold:.6});
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
document.getElementById('nlForm').addEventListener('submit', e => { e.preventDefault();
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hello Time Cure Technologies, please add me to your updates. Name: ' + document.getElementById('nlName').value.trim())}`, '_blank', 'noopener'); });
const toTop = document.getElementById('toTop'); addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), {passive:true});

/* Navbar state */
const nav = document.getElementById('mainNav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
document.querySelectorAll('#navMenu .nav-link').forEach(l => l.addEventListener('click', () => {
  const c = bootstrap.Collapse.getInstance(document.getElementById('navMenu')); if (c) c.hide();
}));

/* Contact form */
const form = document.getElementById('quoteForm'), note = document.getElementById('formNote');
const val = id => document.getElementById(id).value.trim();
const buildMsg = () => [
  'New enquiry – Time Cure Technologies',
  `Name: ${val('name')}`, `Phone: ${val('phone')}`,
  val('email') && `Email: ${val('email')}`, val('company') && `Company: ${val('company')}`,
  `Service: ${val('service')}`, val('message') && `Details: ${val('message')}`
].filter(Boolean).join('\n');

form.addEventListener('submit', e => {
  e.preventDefault(); form.classList.add('was-validated');
  if (!form.checkValidity()) { note.textContent = 'Fill in the highlighted fields to continue.'; return; }
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMsg())}`, '_blank', 'noopener');
  note.textContent = 'WhatsApp opened with your details. Send the message to complete your request.';
});

/* ===== Hero: live network topology ===== */
(() => {
  const cv = document.getElementById('net'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, nodes = [], packets = [], mouse = {x:-999, y:-999}, running = true, last = 0;
  const PAL = {
    dark:  {line:'130,165,255', lk:1,  a:'45,226,230', b:'139,108,255', hub:'#2DE2E6', node:'#8B6CFF', glow:16},
    light: {line:'50,80,170',   lk:.75, a:'8,145,178',  b:'107,78,230',  hub:'#0891B2', node:'#6B4EE6', glow:0}
  };
  let pal = PAL.dark;
  const setPal = () => { pal = PAL[document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light']; };
  setPal();

  const resize = () => {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const n = Math.max(30, Math.min(72, Math.round(W * H / 20000)));
    nodes = Array.from({length:n}, (_, i) => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.28, vy: (Math.random()-.5)*.28,
      hub: i % 9 === 0, r: i % 9 === 0 ? 5 : 2.4
    }));
  };

  const links = () => {
    const out = [];
    for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], max = (a.hub || b.hub) ? 200 : 135;
      const d = Math.hypot(a.x-b.x, a.y-b.y);
      if (d < max) out.push([a, b, d, max]);
    }
    return out;
  };

  const frame = t => {
    if (!running) return;
    const dt = Math.min(40, t - last || 16); last = t;
    ctx.clearRect(0,0,W,H);

    for (const n of nodes) {
      n.x += n.vx * dt/16; n.y += n.vy * dt/16;
      if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 110 && d > 0) { n.x += dx/d * .6; n.y += dy/d * .6; }
    }

    const L = links();
    for (const [a, b, d, max] of L) {
      const al = (1 - d/max) * .5;
      ctx.strokeStyle = `rgba(${pal.line},${al*pal.lk})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }

    /* data packets travelling along links */
    if (L.length && packets.length < 14 && Math.random() < .08) {
      const l = L[Math.floor(Math.random()*L.length)];
      packets.push({a:l[0], b:l[1], t:0, s:.008 + Math.random()*.01, c: Math.random() < .5 ? pal.a : pal.b});
    }
    packets = packets.filter(p => p.t < 1);
    for (const p of packets) {
      p.t += p.s * dt/16;
      const x = p.a.x + (p.b.x-p.a.x)*p.t, y = p.a.y + (p.b.y-p.a.y)*p.t;
      const g = ctx.createRadialGradient(x,y,0,x,y,9);
      g.addColorStop(0, `rgba(${p.c},.95)`); g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,9,0,7); ctx.fill();
    }

    /* cursor connections */
    for (const n of nodes) {
      const d = Math.hypot(n.x-mouse.x, n.y-mouse.y);
      if (d < 170) {
        ctx.strokeStyle = `rgba(${pal.a},${(1-d/170)*.8})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      }
    }

    for (const n of nodes) {
      ctx.fillStyle = n.hub ? pal.hub : pal.node;
      if (n.hub) { ctx.shadowColor = pal.hub; ctx.shadowBlur = pal.glow; }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      if (n.hub) { ctx.strokeStyle = `rgba(${pal.a},.4)`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r+5, 0, 7); ctx.stroke(); }
    }
    if (!reduce) requestAnimationFrame(frame);
  };

  addEventListener('resize', () => { resize(); if (reduce) frame(0); });
  addEventListener('themechange', () => { setPal(); packets = []; if (reduce) frame(0); });
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running && !reduce) requestAnimationFrame(frame); }).observe(cv);

  resize(); reduce ? frame(0) : requestAnimationFrame(frame);
})();
