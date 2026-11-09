// Interactions for the presentation style portfolio.
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressBar = document.querySelector('.scroll-progress span');
  const scenes = [...document.querySelectorAll('main > section')];
  const railLinks = [...document.querySelectorAll('.chapter-rail a')];
  const gameFrames = [...document.querySelectorAll('.game-frame')];
  const gameCurrent = document.querySelector('.game-current');
  const siteLoader = document.querySelector('#site-loader');
  const loaderName = document.querySelector('#loader-name');
  const loaderFill = document.querySelector('#loader-fill');
  const loaderPercent = document.querySelector('#loader-percent');
  const loaderStatus = document.querySelector('#loader-status');
  const heroArt = document.querySelector('.hero-art');
  const heroAvatar = document.querySelector('.hero-avatar');
  const heroAvatarVideo = document.querySelector('.hero-avatar-video');
  const musicScene = document.querySelector('#music');
  const musicFilm = document.querySelector('.music-film');
  let filmRequested = false;
  let filmVisible = false;
  let loadingFinishStarted = false;
  let motionFrame = 0;

  let loadingProgress = 0;
  let targetLoadingProgress = 4;
  let loadingAnimationFrame = 0;
  const startedAt = performance.now();
  const paintLoadingProgress = () => {
    loadingAnimationFrame = 0;
    loadingProgress += (targetLoadingProgress - loadingProgress) * .18;
    if (Math.abs(targetLoadingProgress - loadingProgress) < .4) loadingProgress = targetLoadingProgress;
    const percentage = `${Math.round(loadingProgress)}%`;
    siteLoader?.style.setProperty('--loader-progress', percentage);
    siteLoader?.style.setProperty('--loader-fraction', String(loadingProgress / 100));
    if (loaderFill) loaderFill.style.width = percentage;
    if (loaderPercent) loaderPercent.textContent = `${String(Math.round(loadingProgress)).padStart(2, '0')}%`;
    if (loadingProgress !== targetLoadingProgress) loadingAnimationFrame = requestAnimationFrame(paintLoadingProgress);
  };
  const setLoadingStage = (progress, message) => {
    if (progress >= targetLoadingProgress) {
      targetLoadingProgress = progress;
      if (loaderStatus) loaderStatus.textContent = message;
    }
    if (!loadingAnimationFrame) loadingAnimationFrame = requestAnimationFrame(paintLoadingProgress);
  };

  const startMusicCoverVideo = () => {
    if (!musicScene || !musicFilm || !filmVisible || musicScene.dataset.coverKind !== 'video') return;
    if (!filmRequested) {
      filmRequested = true;
      musicFilm.src = musicScene.dataset.coverSource;
      musicFilm.load();
    }
    musicFilm.play().then(() => musicScene.classList.add('video-ready')).catch(() => {});
  };

  const fileExists = async (path) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1900);
    try {
      const response = await fetch(path, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      return response.ok ? path : null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  };
  const findAsset = async (base, extensions) => {
    const choices = await Promise.all(extensions.map((extension) => fileExists(`${base}${extension}`)));
    return choices.find(Boolean) || null;
  };
  const waitForImage = (image) => new Promise((resolve) => {
    if (image.complete) { resolve(); return; }
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });

  const heroAvatarReady = (async () => {
    const fallbackImage = heroAvatar?.dataset.fallback || 'Images/avatar.png';
    const showStill = async () => {
      heroArt?.classList.remove('avatar-is-video');
      if (heroAvatar && !heroAvatar.hasAttribute('src')) {
        heroAvatar.setAttribute('fetchpriority', 'high');
        heroAvatar.src = fallbackImage;
      }
      await waitForImage(heroAvatar);
    };
    if (reduceMotion || !heroAvatarVideo) return showStill();
    const avatarMovie = await findAsset('Images/avatar', ['.mp4', '.webm']);
    if (!avatarMovie) return showStill();
    await new Promise((resolve) => {
      let resolved = false;
      const finish = () => { if (!resolved) { resolved = true; resolve(); } };
      const fallback = () => { showStill().finally(finish); };
      const timeout = window.setTimeout(fallback, 3600);
      heroAvatarVideo.addEventListener('loadeddata', () => {
        window.clearTimeout(timeout);
        heroArt?.classList.add('avatar-is-video');
        heroAvatarVideo.play().catch(fallback);
        finish();
      }, { once: true });
      heroAvatarVideo.addEventListener('error', () => {
        window.clearTimeout(timeout);
        fallback();
      }, { once: true });
      heroAvatarVideo.src = avatarMovie;
      heroAvatarVideo.preload = 'auto';
      heroAvatarVideo.load();
    });
  })();
  heroAvatarReady.then(() => setLoadingStage(58, 'Готую персонажа...'));

  const coverExtensions = ['.mp4', '.webm', '.webp', '.jpg', '.jpeg', '.png', '.gif'];
  const portraitCoverQuery = window.matchMedia('(orientation: portrait)');
  const coverAssetsReady = Promise.all([
    findAsset('Images/cover1', coverExtensions),
    findAsset('Images/cover2', coverExtensions)
  ]).then(([coverOne, coverTwo]) => {
    const fallback = 'Images/cover.jpg';
    const applyCover = () => {
      const preferred = portraitCoverQuery.matches ? (coverTwo || coverOne) : (coverOne || coverTwo);
      const selected = reduceMotion && preferred && /\.(mp4|webm)$/i.test(preferred) ? fallback : (preferred || fallback);
      if (!musicScene || !musicFilm) return;
      if (musicScene.dataset.coverPath === selected) return;
      musicScene.dataset.coverPath = selected;
      musicScene.classList.remove('has-cover-image', 'video-ready');
      musicFilm.pause();
      if (/\.(mp4|webm)$/i.test(selected)) {
        musicScene.dataset.coverKind = 'video';
        musicScene.dataset.coverSource = selected;
        musicFilm.poster = fallback;
        filmRequested = false;
        if (filmVisible) startMusicCoverVideo();
      } else {
        musicScene.dataset.coverKind = 'image';
        musicScene.style.setProperty('--music-cover-image', `url("${selected}")`);
        musicScene.classList.add('has-cover-image');
        musicFilm.removeAttribute('src');
        musicFilm.load();
        filmRequested = false;
      }
    };
    applyCover();
    const onOrientationChange = () => applyCover();
    if (portraitCoverQuery.addEventListener) portraitCoverQuery.addEventListener('change', onOrientationChange);
    else portraitCoverQuery.addListener(onOrientationChange);
    return true;
  });
  coverAssetsReady.then(() => setLoadingStage(78, 'Вибираю правильний формат...'));

  const pageLoaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  const fontsLoaded = document.fonts?.ready || Promise.resolve();
  pageLoaded.then(() => setLoadingStage(28, 'Завантажую сцени...'));
  fontsLoaded.then(() => setLoadingStage(43, 'Підключаю типографіку...'));
  const finishLoading = () => {
    if (!document.body.classList.contains('is-loading') || loadingFinishStarted) return;
    loadingFinishStarted = true;
    setLoadingStage(100, 'Світ готовий!');
    window.setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      siteLoader?.setAttribute('aria-hidden', 'true');
      requestAnimationFrame(requestScrollScene);
      animateHeroLetters();
    }, 420);
  };
  const animateHeroLetters = () => {
    const target = document.querySelector('.hero-typewriter');
    if (!target) return;
    const text = target.dataset.text || target.textContent.trim();
    target.setAttribute('aria-label', text);
    if (reduceMotion) return;
    target.replaceChildren();
    [...text].forEach((character, index) => {
      const letter = document.createElement('span');
      letter.className = 'hero-letter';
      letter.style.setProperty('--letter-index', index);
      letter.textContent = character;
      target.append(letter);
    });
    target.classList.add('letters-ready');
  };
  Promise.allSettled([heroAvatarReady, coverAssetsReady, pageLoaded, fontsLoaded]).then(() => {
    setLoadingStage(94, 'Завершую збірку...');
    const wait = Math.max(0, 1450 - (performance.now() - startedAt));
    window.setTimeout(finishLoading, wait + 120);
  });
  window.setTimeout(finishLoading, 7200);

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const updateScrollScene = () => {
    motionFrame = 0;
    const viewportHeight = window.innerHeight || 1;
    const pageRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    const pageProgress = clamp(window.scrollY / pageRange);
    progressBar?.style.setProperty('--page-progress', String(pageProgress));
    scenes.forEach((scene) => {
      const bounds = scene.getBoundingClientRect();
      const centerDistance = Math.abs(bounds.top + bounds.height / 2 - viewportHeight / 2);
      const sceneProgress = clamp(1 - centerDistance / (viewportHeight * .9));
      scene.style.setProperty('--scene-progress', sceneProgress.toFixed(3));

      if (scene.id === 'favgame' && gameFrames.length) {
        const travel = clamp((viewportHeight - bounds.top) / (bounds.height + viewportHeight));
        const frameIndex = Math.min(gameFrames.length - 1, Math.floor(travel * gameFrames.length));
        gameFrames.forEach((frame, index) => frame.classList.toggle('is-active', index === frameIndex));
        if (gameCurrent) gameCurrent.textContent = String(frameIndex + 1).padStart(2, '0');
      }
    });
  };
  const requestScrollScene = () => {
    if (!motionFrame) motionFrame = requestAnimationFrame(updateScrollScene);
  };
  window.addEventListener('scroll', requestScrollScene, { passive: true });
  window.addEventListener('resize', requestScrollScene, { passive: true });
  requestScrollScene();

  // Reveal each composition as it enters view, with motion removed when requested.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => target.classList.toggle('is-visible', isIntersecting));
  }, { threshold: .1, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((element, index) => {
    if (reduceMotion) element.classList.add('is-visible');
    else {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 75}ms`;
      revealObserver.observe(element);
    }
  });
  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  // A soft cursor glow adds depth on precise-pointer devices; touch screens stay clean.
  const pointerAura = document.querySelector('.pointer-aura');
  if (pointerAura && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    document.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      document.body.classList.add('pointer-active');
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerAura.style.left = `${pointerX}px`;
        pointerAura.style.top = `${pointerY}px`;
        pointerFrame = 0;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => document.body.classList.remove('pointer-active'));
  }

  // Keep the chapter rail in sync with the scene nearest the middle of the screen.
  const railObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('scene-active', isIntersecting);
      if (!isIntersecting) return;
      const currentId = target.id || 'top';
      railLinks.forEach((link) => link.classList.toggle('is-current', link.hash === `#${currentId}`));
      document.querySelectorAll('.main-nav a').forEach((link) => link.classList.toggle('is-active', link.hash === `#${currentId}`));
    });
  }, { threshold: 0, rootMargin: '-48% 0px -48% 0px' });
  document.querySelectorAll('main > section').forEach((scene) => railObserver.observe(scene));
  railObserver.observe(document.querySelector('.hero-scene'));

  // Mobile navigation.
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Відкрити меню' : 'Закрити меню');
    mainNav?.classList.toggle('is-open', !isOpen);
  });
  mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Відкрити меню');
    mainNav.classList.remove('is-open');
  }));

  // Only load and play the selected cover video while the music scene is visible.
  if (musicScene && musicFilm && !reduceMotion) {
    musicFilm.addEventListener('playing', () => musicScene.classList.add('video-ready'));
    musicFilm.addEventListener('error', () => {
      if (musicScene.dataset.coverKind !== 'video') return;
      musicFilm.pause();
      musicScene.classList.remove('video-ready');
      musicScene.dataset.coverKind = 'image';
      musicScene.style.setProperty('--music-cover-image', 'url("Images/cover.jpg")');
      musicScene.classList.add('has-cover-image');
      filmRequested = false;
    });
    const musicCoverObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        filmVisible = entry.isIntersecting;
        if (!filmVisible) {
          musicFilm.pause();
          musicScene.classList.remove('video-ready');
          return;
        }
        startMusicCoverVideo();
      });
    }, { threshold: .18, rootMargin: '80px 0px 80px 0px' });
    musicCoverObserver.observe(musicScene);
  }

  // Sticker clips are requested only as they approach the viewport.
  const stickerClips = document.querySelectorAll('.sticker-float[data-sticker]');
  if (!reduceMotion && stickerClips.length) {
    const stickerObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          if (!target.hasAttribute('src')) target.src = target.dataset.sticker;
          target.play().catch(() => {});
        } else {
          target.pause();
        }
      });
    }, { rootMargin: '160px 0px 160px 0px' });
    stickerClips.forEach((clip) => stickerObserver.observe(clip));
  }

  // Current Steam stats remain live from the existing JSON file.
  const steamGames = document.querySelector('#steam-games');
  if (steamGames) {
    const isExcludedSteamApp = (game) => {
      const appId = String(game?.appid ?? '');
      const title = String(game?.name ?? '').trim();
      return appId === '250820' || appId === '431960' || /steam\s*vr|wallpaper\s*engine/i.test(title);
    };
    fetch('steam-stats.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Steam stats unavailable');
        return response.json();
      })
      .then((data) => {
        const games = Array.isArray(data.games) ? data.games.filter((game) => !isExcludedSteamApp(game)).slice(0, 3) : [];
        if (!games.length) throw new Error('No recently played games');
        steamGames.classList.toggle('has-one-game', games.length === 1);
        const maxHours = Math.max(...games.map((game) => Number(game.hours) || 0), .1);
        steamGames.replaceChildren(...games.map((game, index) => {
          const row = document.createElement('article');
          row.className = 'steam-game';
          row.style.setProperty('--card-index', String(index));
          const rank = document.createElement('span');
          rank.className = 'steam-game-rank';
          rank.textContent = String(index + 1).padStart(2, '0');
          const art = document.createElement('div');
          art.className = 'steam-game-art';
          const image = document.createElement('img');
          image.src = game.image;
          image.alt = game.name;
          image.loading = 'lazy';
          const imageBase = typeof game.image === 'string'
            ? game.image.match(/^https:\/\/cdn\.cloudflare\.steamstatic\.com\/steam\/apps\/\d+\//)?.[0]
            : null;
          const alternates = ['header.jpg', 'capsule_467x181.jpg', 'capsule_616x353.jpg', 'library_hero.jpg', 'library_600x900.jpg'];
          let alternateIndex = 0;
          image.addEventListener('error', () => {
            if (imageBase && alternateIndex < alternates.length) {
              image.src = `${imageBase}${alternates[alternateIndex++]}`;
              return;
            }
            art.classList.add('has-fallback');
          });
          const fallback = document.createElement('span');
          fallback.className = 'steam-game-art-fallback';
          fallback.setAttribute('aria-hidden', 'true');
          const orbitTitle = document.createElement('span');
          orbitTitle.className = 'steam-fallback-orbit';
          orbitTitle.textContent = `${game.name} · ${game.name} ·`;
          const centerTitle = document.createElement('strong');
          centerTitle.className = 'steam-fallback-center';
          centerTitle.textContent = game.name;
          fallback.append(orbitTitle, centerTitle);
          const time = document.createElement('span');
          time.className = 'steam-game-time';
          time.textContent = `${Math.round(Number(game.hours) * 10) / 10} ГОД`;
          time.setAttribute('aria-label', `${game.hours} годин за два тижні`);
          art.append(image, fallback, rank, time);
          const info = document.createElement('div');
          info.className = 'steam-game-info';
          const name = document.createElement('h3');
          name.textContent = game.name;
          const hours = document.createElement('p');
          hours.textContent = 'ЧАС У ГРІ / ОСТАННІ 14 ДНІВ';
          const meter = document.createElement('div');
          meter.className = 'steam-game-meter';
          meter.setAttribute('aria-label', `${game.hours} годин за останні два тижні`);
          const meterFill = document.createElement('span');
          meterFill.style.setProperty('--playtime-fill', `${Math.max(8, (Number(game.hours) || 0) / maxHours * 100)}%`);
          meter.append(meterFill);
          info.append(name, hours, meter);
          row.append(rank, art, info);
          return row;
        }));
      })
      .catch(() => {
        steamGames.innerHTML = '<p class="steam-status">Не вдалося завантажити статистику Steam.</p>';
      });
  }

  // Copy names and give immediate feedback.
  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = value;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
  };
  document.querySelectorAll('.copiable-name').forEach((element) => {
    const name = element.querySelector('.name-text')?.textContent.trim();
    if (!name) return;
    let feedback = element.querySelector('.copy-feedback');
    if (!feedback) {
      feedback = document.createElement('span');
      feedback.className = 'copy-feedback';
      element.append(feedback);
    }
    feedback.textContent = 'Скопіювати?';
    const copy = async () => {
      await copyText(name);
      feedback.textContent = 'Скопійовано!';
      element.classList.add('copied');
      window.setTimeout(() => {
        element.classList.remove('copied');
        feedback.textContent = 'Скопіювати?';
      }, 1100);
    };
    element.addEventListener('click', (event) => {
      if (event.target.closest('.copy-icons')) return;
      copy();
    });
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copy();
      }
    });
  });
  document.querySelectorAll('.copiable-mikus').forEach((element) => {
    element.addEventListener('click', (event) => {
      if (event.target.closest('.mikus-icons')) return;
      copyText('vadigr123');
      element.classList.add('copied');
      const feedback = element.querySelector('.copy-feedback');
      if (feedback) feedback.textContent = 'Скопійовано!';
      window.setTimeout(() => element.classList.remove('copied'), 1000);
    });
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  });

  // Click-to-zoom for character art and the thank-you artwork.
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Перегляд зображення');
  const lightboxImage = document.createElement('img');
  const lightboxClose = document.createElement('button');
  lightboxClose.type = 'button';
  lightboxClose.setAttribute('aria-label', 'Закрити');
  lightboxClose.textContent = '×';
  lightbox.append(lightboxImage, lightboxClose);
  document.body.append(lightbox);
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lightboxImage.removeAttribute('src');
  };
  document.querySelectorAll('.character-visual img, .thanks-art img, .hero-avatar').forEach((image) => {
    image.addEventListener('click', () => {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    });
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target === lightboxClose) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  // Footer year and return-to-top control.
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
  const backToTop = document.querySelector('.back-to-top');
  const updateBackToTop = () => backToTop?.classList.toggle('is-visible', window.scrollY > window.innerHeight * .75);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  updateBackToTop();
});
