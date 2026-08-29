function createTextType(el, opts){
  const texts = Array.isArray(opts.text) ? opts.text : [opts.text || ''];
  const typingSpeed = opts.typingSpeed ?? 75;
  const deletingSpeed = opts.deletingSpeed ?? 30;
  const pauseDuration = opts.pauseDuration ?? 1500;
  const initialDelay = opts.initialDelay ?? 0;
  const loop = opts.loop !== false;
  const cursorCharacter = opts.cursorCharacter ?? '|';
  const showCursor = opts.showCursor !== false;
  const hideCursorWhileTyping = !!opts.hideCursorWhileTyping;

  el.classList.add('text-type');
  el.innerHTML = `<span class="text-type__content"></span>${showCursor ? `<span class="text-type__cursor">${cursorCharacter}</span>` : ''}`;
  const content = el.querySelector('.text-type__content');
  const cursor = el.querySelector('.text-type__cursor');

  if (cursor && window.gsap) {
    gsap.set(cursor, { opacity: 1 });
    gsap.to(cursor, { opacity: 0, duration: opts.cursorBlinkDuration || 0.5, repeat: -1, yoyo: true, ease: 'power2.inOut' });
  }

  let textIndex = 0, charIndex = 0, displayed = '', deleting = false;

  function tick(){
    const full = texts[textIndex] || '';
    if (deleting) {
      if (!displayed) {
        deleting = false;
        textIndex = (textIndex + 1) % texts.length;
        charIndex = 0;
        if (!loop && textIndex === 0) return;
        setTimeout(tick, pauseDuration);
        return;
      }
      displayed = displayed.slice(0, -1);
      content.textContent = displayed;
      setTimeout(tick, deletingSpeed);
      return;
    }
    if (charIndex < full.length) {
      displayed += full.charAt(charIndex);
      charIndex += 1;
      content.textContent = displayed;
      if (cursor) cursor.classList.toggle('text-type__cursor--hidden', hideCursorWhileTyping);
      setTimeout(tick, typingSpeed);
      return;
    }
    if (cursor) cursor.classList.remove('text-type__cursor--hidden');
    if (!loop && textIndex === texts.length - 1) return;
    setTimeout(() => { deleting = true; tick(); }, pauseDuration);
  }
  setTimeout(tick, initialDelay);
}
