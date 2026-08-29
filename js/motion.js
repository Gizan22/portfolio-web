(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || typeof gsap === 'undefined') return;

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } else if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop(){
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('pointerenter', () => cursor.classList.add('hot'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('hot'));
  });

  document.querySelectorAll('.pill, .ghost, .icon-btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width/2);
      const y = e.clientY - (r.top + r.height/2);
      gsap.to(btn, { x: x * 0.22, y: y * 0.22, duration: 0.35, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1,0.55)' }));
  });

  document.querySelectorAll('h1, h2').forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(p => `<span class="line-mask"><span class="line">${p}</span></span>`).join('');
  });

  gsap.set('.line', { yPercent: 110 });
  gsap.to('.hero .line', { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.08, delay: 0.15 });
  gsap.from('.hero-lead, .hero-row, .eyebrow', { y: 18, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
  gsap.from('.frame', { y: 50, rotateY: -28, opacity: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });
  gsap.from('nav', { y: -24, opacity: 0, duration: 0.8, ease: 'power3.out' });

  document.querySelectorAll('section').forEach(sec => {
    const lines = sec.querySelectorAll('.line');
    if (lines.length) {
      gsap.fromTo(lines, { yPercent: 110 }, {
        yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.06,
        scrollTrigger: { trigger: sec, start: 'top 78%' }
      });
    }
    const bits = sec.querySelectorAll('.tile, .feat, .item, .quote, .stat, .side-card, .work-copy, .stage');
    if (bits.length) {
      gsap.from(bits, {
        y: 28, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: sec, start: 'top 80%' }
      });
    }
  });

  const nav = document.querySelector('.nav-wrap');
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.style.transform = y > last && y > 80 ? 'translateY(-120%)' : 'translateY(0)';
    last = y;
  }, { passive: true });
})();
