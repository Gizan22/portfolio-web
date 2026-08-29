function createLogoLoop(root, logos, opts){
  const speed = opts?.speed ?? 120;
  const direction = opts?.direction ?? 'left';
  const logoHeight = opts?.logoHeight ?? 28;
  const gap = opts?.gap ?? 40;
  const hoverSpeed = opts?.hoverSpeed ?? 0;
  const fadeOut = opts?.fadeOut !== false;
  const scaleOnHover = opts?.scaleOnHover !== false;

  root.className = 'logoloop logoloop--horizontal' + (fadeOut ? ' logoloop--fade' : '') + (scaleOnHover ? ' logoloop--scale-hover' : '');
  root.style.setProperty('--logoloop-gap', gap + 'px');
  root.style.setProperty('--logoloop-logoHeight', logoHeight + 'px');
  root.setAttribute('aria-label', opts?.ariaLabel || 'Technology stack');

  const track = document.createElement('div');
  track.className = 'logoloop__track';
  root.appendChild(track);

  function makeList(hidden){
    const ul = document.createElement('ul');
    ul.className = 'logoloop__list';
    if (hidden) ul.setAttribute('aria-hidden','true');
    logos.forEach(item => {
      const li = document.createElement('li');
      li.className = 'logoloop__item';
      const node = `<span class="logoloop__node">${item.node || item.title}</span>`;
      li.innerHTML = item.href
        ? `<a class="logoloop__link" href="${item.href}" target="_blank" rel="noreferrer">${node}</a>`
        : node;
      ul.appendChild(li);
    });
    return ul;
  }

  const seq = makeList(false);
  track.appendChild(seq);
  track.appendChild(makeList(true));
  track.appendChild(makeList(true));

  let offset = 0, vel = 0, last = null, hovered = false;
  const target = Math.abs(speed) * (direction === 'left' ? 1 : -1);

  track.addEventListener('mouseenter', () => hovered = true);
  track.addEventListener('mouseleave', () => hovered = false);

  function frame(ts){
    if (last == null) last = ts;
    const dt = Math.max(0, ts - last) / 1000;
    last = ts;
    const want = hovered ? hoverSpeed : target;
    vel += (want - vel) * (1 - Math.exp(-dt / 0.25));
    const seqW = seq.getBoundingClientRect().width || 1;
    offset = ((offset + vel * dt) % seqW + seqW) % seqW;
    track.style.transform = `translate3d(${-offset}px,0,0)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
