/* FILE: script.js */
// Basic interactions: slideshow for Machinarium section + footer year + audio metadata helper (simple)

document.addEventListener('DOMContentLoaded',()=>{
  // Check for cover.webm and use it as background video if available
  const bgVideo = document.getElementById('bg-video');
  if (bgVideo) {
    const videoUrl = 'Images/cover.webm';
    const fallbackImage = 'Images/cover.jpg';
    let videoAvailable = false;

    bgVideo.poster = fallbackImage;
    bgVideo.src = videoUrl;
    bgVideo.load();

    const setFallback = () => {
      videoAvailable = false;
      document.body.classList.add('bg-video-fallback');
      document.body.classList.remove('bg-video-ready');
      bgVideo.pause();
      bgVideo.removeAttribute('src');
      bgVideo.load();
    };

    const updateVideoPlayback = () => {
      if (!videoAvailable) return;
      const active = document.visibilityState === 'visible' && document.hasFocus();
      if (active) {
        bgVideo.play().catch(() => {});
      } else {
        bgVideo.pause();
      }
    };

    bgVideo.addEventListener('loadeddata', () => {
      videoAvailable = true;
      document.body.classList.add('bg-video-ready');
      document.body.classList.remove('bg-video-fallback');
      updateVideoPlayback();
    });

    bgVideo.addEventListener('error', setFallback);
    bgVideo.addEventListener('stalled', setFallback);

    document.addEventListener('visibilitychange', updateVideoPlayback);
    window.addEventListener('focus', updateVideoPlayback);
    window.addEventListener('blur', updateVideoPlayback);
  }

  // footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // slideshow backgrounds for favgame
  const favSection = document.querySelector('#favgame');
  const imgs = [
    'Images/Machinarium.jpg',
    'Images/Machinarium2.jpg',
    'Images/Machinarium3.jpg',
    'Images/Machinarium4.jpg'
  ];
  let current = 0;
  function setBg(i){
    favSection.style.setProperty('--bg-img', `url(${imgs[i]})`);
    // create a nice background element
    favSection.style.backgroundImage = `url(${imgs[i]})`;
    favSection.style.backgroundSize = 'cover';
    favSection.style.backgroundPosition = 'center';
    favSection.style.transition = 'background-image 1s ease-in-out';
    favSection.style.filter = 'none';
  }
  setBg(0);
  setInterval(()=>{
    current = (current+1) % imgs.length;
    setBg(current);
  },10000);

  // Optional: simple smooth scrolling for quick links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // Copy-to-clipboard for any .copiable-name element
  function showCopied(el){
    const fb = el.querySelector('.copy-feedback');
    if(fb){ fb.textContent = 'Скопійовано!'; }
    el.classList.add('copied');
    setTimeout(()=>{
      el.classList.remove('copied');
      if(fb){ fb.textContent = 'Скопіювати?'; }
    },1200);
  }

  document.querySelectorAll('.copiable-name').forEach(wrapper=>{
    const nameEl = wrapper.querySelector('.name-text');
    if(!nameEl) return;
    const text = nameEl.textContent.trim();
    let fb = wrapper.querySelector('.copy-feedback');
    if(!fb){
      fb = document.createElement('span');
      fb.className = 'copy-feedback';
      wrapper.appendChild(fb);
    }
    fb.textContent = 'Скопіювати?';

  // click handler
  wrapper.addEventListener('click', async (e)=>{
      try{
        await navigator.clipboard.writeText(text);
        showCopied(wrapper);
      }catch(err){
        // fallback: select text
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy'); showCopied(wrapper);}catch(e){} ta.remove();
      }
    });

    // keyboard support: Enter / Space
    wrapper.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault(); wrapper.click();
      }
    });
    // prevent icon clicks from copying; allow clicking the +N to expand icons
    const icons = wrapper.querySelector('.copy-icons');
    if(icons){
      icons.addEventListener('click', (ev)=>{
        const more = ev.target.closest('.icon-more');
        if(more){
          // toggle expanded state
          icons.classList.toggle('expanded');
          // update badge text
          const badge = icons.querySelector('.icon-more');
          if(icons.classList.contains('expanded')) badge.textContent = '—'; else badge.textContent = '+1';
          // stop propagation so parent doesn't copy
          ev.stopPropagation();
          ev.preventDefault();
          return;
        }
        // if clicking an image, prevent it from bubbling to wrapper to avoid copy
        if(ev.target && ev.target.tagName === 'IMG'){
          ev.stopPropagation();
        }
      });
    }
  });

  // Mikus: copy 'vadigr123' when clicked/activated
  document.querySelectorAll('.copiable-mikus').forEach(el=>{
    const toCopy = 'vadigr123';
    let fb = el.querySelector('.copy-feedback');
    if(!fb){ fb = document.createElement('span'); fb.className = 'copy-feedback'; el.appendChild(fb); }
    fb.textContent = 'Скопіювати?';

    el.addEventListener('click', async (e)=>{
      try{ await navigator.clipboard.writeText(toCopy); }
      catch(err){ const ta=document.createElement('textarea'); ta.value=toCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      fb.textContent = 'Скопійовано!';
      el.classList.add('copied');
      setTimeout(()=>{
        el.classList.remove('copied');
        fb.textContent = 'Скопіювати?';
      },900);
    });
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); el.click(); } });
    const icons = el.querySelector('.mikus-icons'); if(icons){ icons.addEventListener('click', ev=>{ ev.stopPropagation(); }); }
  });

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll animations observer
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
        
        // For staggered groups
        if (entry.target.classList.contains('stagger')) {
          entry.target.querySelectorAll('.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, .scroll-scale')
            .forEach(child => child.classList.add('scroll-visible'));
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px'
  });

  // Observe elements with scroll animations
  document.querySelectorAll([
    '.scroll-fade-up',
    '.scroll-fade-left',
    '.scroll-fade-right',
    '.scroll-scale',
    '.stagger'
  ].join(',')).forEach(el => scrollObserver.observe(el));

  // Change page background when the Music section is visible
  const musicSection = document.querySelector('#music');
  if (musicSection) {
    const musicObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.body.classList.add('music-bg');
        } else {
          document.body.classList.remove('music-bg');
        }
      });
    }, {
      threshold: 0,
      rootMargin: '-50% 0px -50% 0px'
    });
    musicObserver.observe(musicSection);
  }

  // Додаємо функціонал для збільшення картинок
  const zoomableImages = document.querySelectorAll('.chars img, .mikus, .hero-avatar');
  
  zoomableImages.forEach(img => {
      img.classList.add('zoomable');
      img.addEventListener('click', function(e) {
          e.preventDefault();
          if (this.classList.contains('zoomed')) {
              this.classList.remove('zoomed');
              document.body.style.overflow = '';
          } else {
              this.classList.add('zoomed');
              document.body.style.overflow = 'hidden';
          }
      });
  });

  // Закриваємо зум при кліку поза картинкою
  document.addEventListener('click', function(e) {
      if (!e.target.classList.contains('zoomable')) {
          document.querySelectorAll('.zoomed').forEach(img => {
              img.classList.remove('zoomed');
              document.body.style.overflow = '';
          });
      }
  });

  // Закриваємо зум при натисканні Escape
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
          document.querySelectorAll('.zoomed').forEach(img => {
              img.classList.remove('zoomed');
              document.body.style.overflow = '';
          });
      }
  });

  // --- Intro typing + scroll action ---
  (function(){
    const heroIntro = document.querySelector('.hero.intro-fullscreen');
    const scrollBtn = document.querySelector('.scroll-indicator');
    if(!heroIntro) return;

    const typedEl = heroIntro.querySelector('.typed');
    let sequences = [];
    try{ sequences = typedEl ? JSON.parse(typedEl.getAttribute('data-seq')) : []; }catch(e){ sequences = []; }

    function delay(ms){ return new Promise(res=>setTimeout(res,ms)); }

    async function typeTo(el, text, speed=45){
      el.textContent = '';
      for(let i=0;i<text.length;i++){
        el.textContent += text[i];
        await delay(speed + Math.random()*20);
      }
    }

    async function backspace(el, count, speed=28){
      for(let i=0;i<count;i++){
        el.textContent = el.textContent.slice(0, -1);
        await delay(speed + Math.random()*10);
      }
    }

    // run sequence
    (async function(){
      if(!typedEl || !sequences.length){
        typedEl && (typedEl.textContent = 'Привіт!');
        await delay(300);
        scrollBtn && (scrollBtn.style.opacity = 1);
        return;
      }
      for(let i=0;i<sequences.length;i++){
        await typeTo(typedEl, sequences[i], 45);
        await delay(900);
        if(i < sequences.length - 1) await backspace(typedEl, Math.min(18, sequences[i].length));
      }
      if(scrollBtn) scrollBtn.style.opacity = 1;
    })();

    function scrollToContent(){
      const main = document.querySelector('main');
      if(main) main.scrollIntoView({behavior:'smooth', block:'start'});
    }

    if(scrollBtn) scrollBtn.addEventListener('click', scrollToContent);
    window.addEventListener('keydown', function keyHandler(e){
      if(e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') scrollToContent();
    });
  })();
});

