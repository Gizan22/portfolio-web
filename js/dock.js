function createDock(root, items, opts){
  const {
    distance = 200,
    panelHeight = 68,
    baseItemSize = 50,
    magnification = 70
  } = opts || {};

  root.classList.add('dock-outer');
  const panel = document.createElement('div');
  panel.className = 'dock-panel';
  panel.style.height = panelHeight + 'px';
  root.appendChild(panel);

  const nodes = items.map(item => {
    const el = document.createElement(item.href ? 'a' : 'button');
    el.className = 'dock-item' + (item.className ? ' ' + item.className : '');
    if (item.href) el.href = item.href;
    el.setAttribute('aria-label', item.label);
    el.innerHTML = `<span class="dock-icon">${item.icon}</span><span class="dock-label">${item.label}</span>`;
    if (item.onClick) el.addEventListener('click', item.onClick);
    if (item.href && item.href.includes('#')) {
      el.addEventListener('click', e => {
        const u = new URL(item.href, location.href);
        if (u.pathname === location.pathname) {
          e.preventDefault();
          const t = document.getElementById(u.hash.slice(1));
          if (t) t.scrollIntoView({ behavior:'smooth' });
          history.replaceState(null,'',u.hash);
        }
      });
    }
    panel.appendChild(el);
    return el;
  });

  let mouseX = Infinity;
  panel.addEventListener('mousemove', e => { mouseX = e.pageX; tick(); });
  panel.addEventListener('mouseleave', () => {
    mouseX = Infinity;
    nodes.forEach(n => {
      n.classList.remove('is-hot');
      n.style.width = n.style.height = baseItemSize + 'px';
    });
  });

  function tick(){
    nodes.forEach(n => {
      const r = n.getBoundingClientRect();
      const d = mouseX - (r.x + r.width / 2);
      const t = Math.max(-1, Math.min(1, d / distance));
      const mag = baseItemSize + (magnification - baseItemSize) * (1 - Math.abs(t));
      const size = mouseX === Infinity ? baseItemSize : mag;
      n.style.width = n.style.height = size + 'px';
      n.classList.toggle('is-hot', Math.abs(d) < 28 && mouseX !== Infinity);
    });
  }
}
