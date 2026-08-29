function zoomCert(src, title, meta){
  let box = document.getElementById('certZoom');
  if (!box){
    box = document.createElement('div');
    box.id = 'certZoom';
    box.innerHTML = '<img alt="sertifikat"/><div class="zoom-cap"></div>';
    box.addEventListener('click', e => { if (e.target === box) box.classList.remove('is-on'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') box.classList.remove('is-on'); });
    document.body.appendChild(box);
  }
  box.querySelector('img').src = src;
  box.querySelector('.zoom-cap').innerHTML = `<b>${title||''}</b><div>${meta||''}</div>`;
  box.classList.add('is-on');
}

function createBounceCards(root, images, opts){
  const containerWidth = opts?.containerWidth ?? 500;
  const containerHeight = opts?.containerHeight ?? 250;
  const animationDelay = opts?.animationDelay ?? 1;
  const animationStagger = opts?.animationStagger ?? 0.08;
  const easeType = opts?.easeType ?? 'elastic.out(1, 0.5)';
  const enableHover = opts?.enableHover !== false;
  const transformStyles = opts?.transformStyles ?? [
    'rotate(5deg) translate(-150px)',
    'rotate(0deg) translate(-70px)',
    'rotate(-5deg)',
    'rotate(5deg) translate(70px)',
    'rotate(-5deg) translate(150px)'
  ];
  const onOpen = opts?.onOpen;

  root.classList.add('bounceCardsContainer');
  root.style.width = containerWidth + 'px';
  root.style.height = containerHeight + 'px';

  const items = images.map(it => typeof it === 'string' ? { src: it, title: opts?.title || '', meta: opts?.meta || '' } : it);
  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = `bounce-card bounce-card-${idx}`;
    el.style.transform = transformStyles[idx] ?? 'none';
    el.innerHTML = `<img class="image" src="${item.src}" alt="${item.title || ('card-'+idx)}"/>`;
    el.addEventListener('mouseenter', () => pushSiblings(idx));
    el.addEventListener('mouseleave', resetSiblings);
    el.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      zoomCert(item.src, item.title || '', item.meta || '');
      const info = document.getElementById('bounceMeta');
      if (info) {
        const t = info.querySelector('[data-title]');
        const m = info.querySelector('[data-meta]');
        const link = info.querySelector('[data-url]');
        if (t) t.textContent = item.title || '';
        if (m) m.textContent = item.meta || '';
        if (link) {
          if (item.url) { link.href = item.url; link.style.display = ''; link.textContent = 'Verifikasi'; }
          else { link.style.display = 'none'; }
        }
      }
      if (onOpen) onOpen(item.src, idx, item);
    });
    root.appendChild(el);
  });

  if (window.gsap) {
    gsap.fromTo(root.querySelectorAll('.bounce-card'), { scale: 0 }, {
      scale: 1, stagger: animationStagger, ease: easeType, delay: animationDelay
    });
  }

  function getNoRotationTransform(transformStr){
    if (/rotate\(/.test(transformStr)) return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    return transformStr === 'none' ? 'rotate(0deg)' : `${transformStr} rotate(0deg)`;
  }
  function getPushedTransform(baseTransform, offsetX){
    const match = baseTransform.match(/translate\(([-0-9.]+)px\)/);
    if (match) return baseTransform.replace(/translate\(([-0-9.]+)px\)/, `translate(${parseFloat(match[1])+offsetX}px)`);
    return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
  }
  function pushSiblings(hoveredIdx){
    if (!enableHover || !window.gsap) return;
    images.forEach((_, i) => {
      const target = root.querySelector(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      const base = transformStyles[i] || 'none';
      if (i === hoveredIdx) {
        gsap.to(target, { transform: getNoRotationTransform(base), duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' });
      } else {
        gsap.to(target, {
          transform: getPushedTransform(base, i < hoveredIdx ? -160 : 160),
          duration: 0.4, ease: 'back.out(1.4)', delay: Math.abs(hoveredIdx-i)*0.05, overwrite: 'auto'
        });
      }
    });
  }
  function resetSiblings(){
    if (!enableHover || !window.gsap) return;
    images.forEach((_, i) => {
      const target = root.querySelector(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, { transform: transformStyles[i] || 'none', duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' });
    });
  }
}
