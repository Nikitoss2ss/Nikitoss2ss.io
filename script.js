/* FILE: script.js */
// Basic interactions: slideshow for Machinarium section + footer year + audio metadata helper (simple)

document.addEventListener('DOMContentLoaded',()=>{
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.style.overflowY = 'hidden';
  document.body.style.overflowY = 'hidden';

  const loader = document.querySelector('.site-loader');
  const loadingElements = document.querySelectorAll([
    '.site-page .hero-avatar-wrap > *',
    '.site-page .hero-copy > *',
    '.site-page .hero-copy .btn',
    '.site-page main .card summary',
    '.site-page main .card h2',
    '.site-page main .card h3',
    '.site-page main .card h4',
    '.site-page main .card p',
    '.site-page main .card li',
    '.site-page main .card figure',
    '.site-page main .card img',
    '.site-page main .card iframe',
    '.site-page main .card .panel',
    '.site-page main .card .btn',
    '.site-page .site-footer > *'
  ].join(','));
  loadingElements.forEach(element => {
    const delay = Math.round(Math.random() * 2200);
    const direction = Math.random() > 0.5 ? 1 : -1;
    element.style.setProperty('--loading-delay', `${delay}ms`);
    element.style.setProperty('--loading-direction', direction);
  });
  const loaderStartedAt = performance.now();
  const avatar = document.querySelector('.hero-avatar');
  const avatarReady = avatar && avatar.complete
    ? Promise.resolve()
    : new Promise(resolve => {
        avatar?.addEventListener('load', resolve, { once: true });
        avatar?.addEventListener('error', resolve, { once: true });
      });
  const pageReady = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  const timeout = new Promise(resolve => window.setTimeout(resolve, 4500));

  Promise.race([Promise.all([avatarReady, pageReady]), timeout]).then(() => {
    const remaining = Math.max(0, 3300 - (performance.now() - loaderStartedAt));
    window.setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, 0);
      loader?.setAttribute('aria-hidden', 'true');
      requestFocusUpdate?.();
    }, remaining);
  });

  // Give each background shape its own subtle pointer parallax.
  const supportsPointerMotion = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsPointerMotion) {
    let pointerFrame = 0;
    document.addEventListener('pointermove', (event) => {
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        const normalizedX = event.clientX / window.innerWidth - 0.5;
        const normalizedY = event.clientY / window.innerHeight - 0.5;
        document.querySelectorAll('#bg-abstract .shape').forEach((shape, index) => {
          const depth = 0.35 + (index % 4) * 0.12;
          shape.style.setProperty('--shape-shift-x', `${(normalizedX * 28 * depth).toFixed(2)}px`);
          shape.style.setProperty('--shape-shift-y', `${(normalizedY * 20 * depth).toFixed(2)}px`);
        });
        pointerFrame = 0;
      });
    }, { passive: true });
  }

  let scrollFrame = 0;
  if (supportsPointerMotion) {
    window.addEventListener('scroll', () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        const lift = -window.scrollY * 0.12;
        document.documentElement.style.setProperty('--scroll-lift', `${lift.toFixed(2)}px`);
        scrollFrame = 0;
      });
    }, { passive: true });
  }

  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.7);
    };

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Check for cover.webm and use it as background video if available
  const bgVideo = document.getElementById('bg-video');
  if (bgVideo) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const videoSources = isMobile ? [] : ['Images/cover.webm', 'Images/cover.mp4'];
    const fallbackImage = 'Images/cover.jpg';
    let sourceIndex = 0;
    let videoAvailable = false;

    bgVideo.poster = fallbackImage;

    const setFallback = () => {
      videoAvailable = false;
      document.body.classList.add('bg-video-fallback');
      document.body.classList.remove('bg-video-ready');
      bgVideo.pause();
      bgVideo.removeAttribute('src');
      bgVideo.load();
    };

    const loadNextVideo = () => {
      if (sourceIndex >= videoSources.length) {
        setFallback();
        return;
      }

      bgVideo.src = videoSources[sourceIndex];
      sourceIndex += 1;
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

    bgVideo.addEventListener('error', loadNextVideo);

    loadNextVideo();

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
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktopOnly = !isMobile;
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const isFavGame = el.classList.contains('favgame-animated');
      const isCharacterCard = el.matches('.chars figure');

      if (el.classList.contains('stagger')) {
        const children = Array.from(el.children);
        children.forEach((child, index) => {
          if (entry.isIntersecting) {
            const delay = isMobile ? 0 : index * 90;
            child.style.transitionDelay = `${delay}ms`;
            child.classList.add('scroll-visible');
            child.classList.add('is-visible');
            child.classList.remove('is-hidden');
          } else {
            child.classList.remove('scroll-visible');
            child.classList.remove('is-visible');
            child.classList.remove('is-hidden');
            child.classList.remove('is-hovered');
          }
        });
        return;
      }

      if (isFavGame) {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          el.classList.remove('is-hidden');
        } else {
          el.classList.remove('is-visible');
          el.classList.add('is-hidden');
        }
        return;
      }

      if (isCharacterCard) {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          el.classList.remove('is-hidden');
        } else {
          el.classList.remove('is-visible');
          el.classList.add('is-hidden');
        }
        return;
      }

      const revealTargets = el.classList.contains('scroll-fade-up') || el.classList.contains('scroll-fade-left') || el.classList.contains('scroll-fade-right') || el.classList.contains('scroll-scale')
        ? [el]
        : [];

      revealTargets.forEach(target => {
        if (entry.isIntersecting) {
          target.classList.add('scroll-visible');
          target.classList.add('is-visible');
          target.classList.remove('is-hidden');
        } else {
          target.classList.remove('scroll-visible');
          target.classList.remove('is-visible');
          target.classList.add('is-hidden');
        }
      });
    });
  }, {
    threshold: isMobile ? 0.08 : 0.03,
    rootMargin: isMobile ? '0px 0px -6% 0px' : '0px 0px -18% 0px'
  });

  // Observe elements with scroll animations
  const revealElements = Array.from(document.querySelectorAll([
    '.scroll-fade-up',
    '.scroll-fade-left',
    '.scroll-fade-right',
    '.scroll-scale',
    '.stagger',
    '.favgame-animated',
    '.chars figure'
  ].join(',')));

  revealElements.forEach(el => scrollObserver.observe(el));

  if (supportsHover && desktopOnly) {
    document.querySelectorAll('.chars figure').forEach(card => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tilt-x', `${(y * -8).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
        card.classList.add('is-hovered');
      });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-hovered');
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
  }

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

  // Keep content sharp near the viewport center and softly defocused near its edges.
  const focusTargets = document.querySelectorAll([
    '.site-page .hero-avatar-wrap',
    '.site-page .hero-copy > *',
    '.site-page main .card summary',
    '.site-page main .card h2',
    '.site-page main .card h3',
    '.site-page main .card h4',
    '.site-page main .card p',
    '.site-page main .card li',
    '.site-page main .card figure',
    '.site-page main .card iframe',
    '.site-page main .card .panel',
    '.site-page main .card .btn',
    '.site-page .site-footer > *'
  ].join(','));

  let focusFrame = 0;
  const updateFocus = () => {
    focusFrame = 0;
    if (document.body.classList.contains('is-loading')) return;

    const viewportCenter = window.innerHeight / 2;
    focusTargets.forEach(target => {
      if (target.closest('.hero, .site-footer')) {
        target.classList.remove('focus-managed');
        target.style.removeProperty('--focus-blur');
        target.style.removeProperty('--focus-opacity');
        return;
      }

      const rect = target.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter) / window.innerHeight;
      const rawProgress = Math.min(1, Math.max(0, (distance - 0.34) / 0.24));
      const smoothProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      target.classList.add('focus-managed');
      target.style.setProperty('--focus-blur', `${(smoothProgress * 3.2).toFixed(2)}px`);
      target.style.setProperty('--focus-opacity', (1 - smoothProgress * 0.2).toFixed(3));
    });
  };

  const requestFocusUpdate = () => {
    if (!focusFrame) focusFrame = window.requestAnimationFrame(updateFocus);
  };

  window.addEventListener('scroll', requestFocusUpdate, { passive: true });
  window.addEventListener('resize', requestFocusUpdate, { passive: true });
  window.setTimeout(requestFocusUpdate, 100);

  // Switch to a lighter visual mode when the device cannot keep a stable frame rate.
  (function setupPerformanceMode(){
    const body = document.body;
    const performanceVideo = document.getElementById('bg-video');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowFpsLimit = 24;
    const stableFpsLimit = 42;
    const requiredSeconds = 5;
    let frames = 0;
    let lastSample = performance.now();
    let lowFpsSeconds = 0;
    let stableFpsSeconds = 0;
    let lightweight = reduceMotion;

    if (lightweight) body.classList.add('performance-lite');

    function setLightweightMode(enabled){
      lightweight = enabled;
      body.classList.toggle('performance-lite', enabled);
      if (enabled) {
        performanceVideo?.pause();
      } else if (body.classList.contains('bg-video-ready') && body.classList.contains('music-bg')) {
        performanceVideo?.play().catch(() => {});
      }
    }

    function measure(now){
      frames += 1;
      const elapsed = now - lastSample;

      if (elapsed >= 1000) {
        const fps = frames * 1000 / elapsed;
        frames = 0;
        lastSample = now;

        if (fps < lowFpsLimit) {
          lowFpsSeconds += 1;
          stableFpsSeconds = 0;
        } else if (fps >= stableFpsLimit) {
          stableFpsSeconds += 1;
          lowFpsSeconds = 0;
        } else {
          lowFpsSeconds = 0;
          stableFpsSeconds = 0;
        }

        if (!lightweight && lowFpsSeconds >= requiredSeconds) {
          setLightweightMode(true);
        } else if (lightweight && !reduceMotion && stableFpsSeconds >= requiredSeconds) {
          setLightweightMode(false);
        }
      }

      window.requestAnimationFrame(measure);
    }

    window.requestAnimationFrame(measure);
  })();

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

