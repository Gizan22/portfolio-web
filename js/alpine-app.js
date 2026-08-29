function openCertZoom(src, title, meta){
  let box=document.getElementById("certZoom");
  if(!box){
    box=document.createElement("div");
    box.id="certZoom";
    box.className="lightbox";
    box.innerHTML='<img alt="sertifikat"/><div class="zoom-cap"><b></b><div class="muted"></div></div>';
    box.addEventListener("click",e=>{if(e.target===box)box.classList.remove("is-on");});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")box.classList.remove("is-on");});
    document.body.appendChild(box);
  }
  box.querySelector("img").src=src;
  box.querySelector("b").textContent=title||"";
  box.querySelector(".muted").textContent=meta||"";
  box.classList.add("is-on");
}

function portfolioApp(){
  return {
    intro: !sessionStorage.getItem('gz-in') && !location.hash,
    palette: false,
    q: '',
    theme: localStorage.getItem('theme') || 'dark',
    role: 'fresh Graduate _',
    roles: ['fresh Graduate _','Junior Programmer _','Happy coding! _','Frontend Engineer _'],
    ri: 0,
    lightbox: false,
    lb: {src:'', title:'', meta:''},
    items: [
      { label: 'Home', href: 'index.html#home' },
      { label: 'Work', href: 'index.html#work' },
      { label: 'Prestasi', href: 'index.html#prestasi' },
      { label: 'Features', href: 'index.html#features' },
      { label: 'Contact', href: 'index.html#contact' },
      { label: 'Archive', href: 'work.html' },
      { label: 'CV', href: 'cv.txt', download: true }
    ],
    get filtered(){
      const q = (this.q || '').trim().toLowerCase();
      if (!q) return this.items;
      return this.items.filter(i => i.label.toLowerCase().includes(q));
    },
    init(){
      document.documentElement.dataset.theme = this.theme;
      if (this.intro) setTimeout(() => this.enter(), 2400);
      else document.body.classList.add('ready');
      setInterval(() => {
        this.ri = (this.ri + 1) % this.roles.length;
        this.role = this.roles[this.ri];
      }, 2200);
      window.addEventListener('keydown', e => {
        const k = (e.key || '').toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === 'k') {
          e.preventDefault();
          e.stopPropagation();
          this.togglePalette();
        } else if (k === 'escape') {
          this.closePalette();
          this.lightbox = false;
        }
      }, true);
      addEventListener('open-cert', e => {
        const d = e.detail || {};
        this.openCert(d.src, d.title || '', d.meta || '');
      });
    },
    togglePalette(){
      if (this.palette) this.closePalette();
      else this.openPalette();
    },
    openPalette(){
      this.palette = true;
      this.q = '';
      const frame = document.querySelector('.lanyard-frame');
      if (frame) frame.blur();
      window.focus();
      this.$nextTick(() => {
        const el = this.$refs.palInput;
        if (el) { el.focus(); el.select(); }
      });
    },
    closePalette(){
      this.palette = false;
      this.q = '';
    },
    go(item){
      this.closePalette();
      if (!item) return;
      if (item.download) {
        const a = document.createElement('a');
        a.href = item.href; a.download = ''; a.click();
        return;
      }
      const u = new URL(item.href, location.origin);
      if (u.pathname === location.pathname && u.hash) {
        const t = document.getElementById(u.hash.slice(1));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', u.hash);
        return;
      }
      location.href = item.href;
    },
    goFirst(){
      if (this.filtered[0]) this.go(this.filtered[0]);
    },
    enter(){
      this.intro = false;
      sessionStorage.setItem('gz-in', '1');
      document.body.classList.add('ready');
    },
    toggleTheme(){
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.theme);
      document.documentElement.dataset.theme = this.theme;
    },
    openCert(src, title, meta){
      this.lb = {src, title, meta};
      this.lightbox = true;
    }
  }
}
