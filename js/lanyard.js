function mountLanyard(opts){
  const canvas = document.getElementById(opts.canvasId || 'id3d');
  if (!canvas) return;
  const frontImage = opts.frontImage;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const photo = new Image();
  if (frontImage) photo.src = frontImage;

  let W = 0, H = 0;
  function resize(){
    const r = canvas.getBoundingClientRect();
    W = Math.max(280, r.width);
    H = Math.max(420, r.height);
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  const N = 16, rest = 18, pts = [];
  function resetPts(){
    pts.length = 0;
    const x = W / 2;
    for (let i = 0; i < N; i++) {
      const y = 8 + i * rest;
      pts.push({ x, y, px: x, py: y, pin: i === 0 });
    }
  }
  resetPts();

  const card = { w: 168, h: 228, rot: 0, vr: 0 };
  let grab = false, lx = 0, ly = 0;
  const tail = () => pts[N - 1];
  const head = () => pts[0];

  canvas.style.pointerEvents = 'auto';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', e => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const t = tail();
    if (Math.hypot(x - t.x, y - (t.y + card.h * 0.45)) < 170) {
      grab = true; lx = x; ly = y;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (!grab) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const t = tail();
    t.px = t.x; t.py = t.y;
    t.x += (x - t.x) * 0.55;
    t.y += (y - 90 - t.y) * 0.55;
    card.vr += (x - lx) * 0.002;
    lx = x; ly = y;
  });
  function endGrab(){ grab = false; canvas.style.cursor = 'grab'; }
  canvas.addEventListener('pointerup', endGrab);
  canvas.addEventListener('pointercancel', endGrab);

  function verlet(){
    for (const p of pts) {
      if (p.pin || (grab && p === tail())) continue;
      const vx = (p.x - p.px) * 0.98;
      const vy = (p.y - p.py) * 0.98 + 0.55;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy;
    }
    for (let k = 0; k < 10; k++) {
      for (let i = 0; i < N - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const corr = (d - rest) / d;
        if (!a.pin) { a.x += dx * corr * 0.5; a.y += dy * corr * 0.5; }
        if (!(grab && b === tail()) && !b.pin) { b.x -= dx * corr * 0.5; b.y -= dy * corr * 0.5; }
      }
      head().x = W / 2; head().y = 10;
    }
    card.vr *= 0.94;
    card.rot = card.rot * 0.9 + Math.atan2(tail().x - pts[N-2].x, tail().y - pts[N-2].y) * 0.35 + card.vr;
  }

  function roundRect(x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < N; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.stroke();

    const t = tail();
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(-14, -8, 28, 16);
    ctx.fillStyle = '#eee';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(t.x, t.y + 8);
    ctx.rotate(card.rot);
    ctx.fillStyle = '#f4f4f4';
    ctx.shadowColor = 'rgba(0,0,0,.28)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    roundRect(-card.w / 2, 0, card.w, card.h, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (photo.complete && photo.naturalWidth) {
      ctx.save();
      roundRect(-card.w / 2 + 10, 10, card.w - 20, card.h - 20, 12);
      ctx.clip();
      ctx.drawImage(photo, -card.w / 2 + 10, 10, card.w - 20, card.h - 20);
      ctx.restore();
    }
    ctx.restore();
  }

  (function loop(){
    verlet();
    draw();
    requestAnimationFrame(loop);
  })();
}
