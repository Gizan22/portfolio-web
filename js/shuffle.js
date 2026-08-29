function createShuffle(el, opts){
  const text = opts.text ?? el.textContent.trim();
  const duration = opts.duration ?? 0.35;
  const ease = opts.ease ?? 'power3.out';
  const stagger = opts.stagger ?? 0.03;
  const shuffleTimes = Math.max(1, opts.shuffleTimes ?? 1);
  const charset = opts.scrambleCharset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const triggerOnHover = opts.triggerOnHover !== false;
  if (!el) return;
  if (!window.gsap) { el.textContent = text; return; }

  el.classList.add('shuffle-parent');
  el.textContent = '';

  const wraps = [];
  [...text].forEach(ch => {
    const display = ch === ' ' ? '\u00A0' : ch;
    const wrap = document.createElement('span');
    wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom';
    const probe = document.createElement('span');
    probe.className = 'shuffle-char';
    probe.textContent = display;
    wrap.appendChild(probe);
    el.appendChild(wrap);
    wraps.push({ wrap, ch: display });
  });

  function buildStrip(item){
    const { wrap, ch } = item;
    const w = item.w || wrap.getBoundingClientRect().width || 24;
    wrap.style.width = w + 'px';
    wrap.style.overflow = 'hidden';
    wrap.innerHTML = '';
    const inner = document.createElement('span');
    inner.style.cssText = 'display:inline-block;white-space:nowrap;will-change:transform';
    const glyphs = [ch];
    for (let i = 0; i < shuffleTimes; i++) {
      glyphs.push(charset[Math.floor(Math.random() * charset.length)]);
    }
    glyphs.push(ch);
    glyphs.forEach((g, i) => {
      const s = document.createElement('span');
      s.className = 'shuffle-char';
      s.textContent = g;
      s.style.cssText = 'display:inline-block;text-align:center;width:' + w + 'px';
      if (i === glyphs.length - 1) s.dataset.orig = '1';
      inner.appendChild(s);
    });
    wrap.appendChild(inner);
    gsap.set(inner, { x: -(glyphs.length - 1) * w });
    item.inner = inner;
    item.w = w;
  }

  requestAnimationFrame(() => {
    wraps.forEach(item => {
      item.w = item.wrap.getBoundingClientRect().width || 24;
      item.wrap.style.width = item.w + 'px';
      buildStrip(item);
    });
    play();
  });

  let playing = false;
  function play(){
    if (playing) return;
    playing = true;
    const inners = wraps.map(w => w.inner).filter(Boolean);
    const odd = inners.filter((_, i) => i % 2);
    const even = inners.filter((_, i) => i % 2 === 0);
    const tl = gsap.timeline({
      onComplete(){
        playing = false;
        wraps.forEach(item => {
          if (!item.inner) return;
          item.inner.querySelectorAll('.shuffle-char:not([data-orig="1"])').forEach(n => n.remove());
          gsap.set(item.inner, { x: 0 });
        });
      }
    });
    if (odd.length) tl.to(odd, { x: 0, duration, ease, stagger, force3D: true }, 0);
    if (even.length) tl.to(even, { x: 0, duration, ease, stagger, force3D: true }, duration * 0.55);
  }

  if (triggerOnHover) {
    el.addEventListener('mouseenter', () => {
      if (playing) return;
      wraps.forEach(buildStrip);
      play();
    });
  }
}
