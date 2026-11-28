// Interactions for the presentation style portfolio.
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const festiveToggle = document.querySelector('.festive-toggle');
  const festiveSnow = document.querySelector('#festive-snow');
  let festiveEnabled = true;
  try {
    festiveEnabled = localStorage.getItem('festive-mode') !== 'off';
  } catch (error) {
    console.warn(`Could not read the festive mode preference: ${error.message}`);
  }
  const festiveSnowLayers = [...(festiveSnow?.querySelectorAll('.festive-snow-layer') || [])];
  if (festiveSnowLayers.some((layer) => layer.childElementCount === 0)) {
    festiveSnowLayers.forEach((layer, layerIndex) => {
      const flakeCount = reduceMotion ? 8 : [34, 24, 16][layerIndex];
      for (let index = 0; index < flakeCount; index += 1) {
        const flake = document.createElement('span');
        const isCrystal = layerIndex === 2;
        flake.className = isCrystal ? 'festive-flake festive-flake-crystal' : 'festive-flake';
        if (isCrystal) flake.textContent = '❄';
        flake.style.setProperty('--flake-left', `${(index * 37 + layerIndex * 19 + 11) % 100}%`);
        flake.style.setProperty('--flake-top', `${(index * 41 + layerIndex * 23) % 100}%`);
        flake.style.setProperty('--flake-size', `${[2 + (index % 4), 4 + (index % 5), 7 + (index % 7)][layerIndex]}px`);
        flake.style.setProperty('--flake-opacity', `${[0.15 + (index % 5) * 0.045, 0.3 + (index % 6) * 0.075, 0.5 + (index % 5) * 0.09][layerIndex]}`);
        flake.style.setProperty('--flake-duration', `${[13 + (index % 8) * 1.3, 10 + (index % 8) * 1.15, 8 + (index % 7) * 1.1][layerIndex]}s`);
        flake.style.setProperty('--flake-delay', `${-(index % 18) * 0.72}s`);
        flake.style.setProperty('--drift', `${18 + (index % 6) * 12}px`);
        layer.append(flake);
      }
    });
  }
  document.querySelectorAll('main > .scene').forEach((scene, sceneIndex) => {
    if (scene.querySelector('.festive-scene-decor')) return;
    const decor = document.createElement('div');
    decor.className = 'festive-scene-decor';
    decor.setAttribute('aria-hidden', 'true');
    decor.innerHTML = '<div class="festive-scene-wire"></div><span class="festive-scene-bulb"></span><span class="festive-scene-bulb"></span><span class="festive-scene-bulb"></span><span class="festive-scene-bulb"></span><span class="festive-scene-bulb"></span><span class="festive-scene-bulb"></span><span class="festive-scene-bulb"></span><span class="festive-scene-ornament"></span><span class="festive-scene-ornament"></span><span class="festive-scene-crystal">❄</span><span class="festive-scene-crystal"></span>';
    decor.style.setProperty('--scene-garland-offset', `${sceneIndex % 2 ? 63 : 8}%`);
    decor.style.setProperty('--scene-garland-y', `${8 + (sceneIndex * 13) % 70}%`);
    decor.style.setProperty('--scene-ornament-y', `${12 + (sceneIndex * 19) % 68}%`);
    decor.style.setProperty('--scene-ornament-y-alt', `${20 + (sceneIndex * 23) % 64}%`);
    scene.prepend(decor);
  });
  const updateSnowParallax = () => {
    const scrollY = window.scrollY || 0;
    festiveSnowLayers.forEach((layer) => {
      const depth = Number(layer.dataset.depth) || 0;
      layer.style.setProperty('--snow-scroll-offset', `${reduceMotion ? 0 : -scrollY * depth}px`);
    });
  };
  updateSnowParallax();
  const applyFestiveMode = (enabled) => {
    festiveEnabled = enabled;
    document.body.classList.toggle('festive-off', !enabled);
    festiveToggle?.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    const uk = document.documentElement.lang === 'uk';
    const label = enabled
      ? uk ? 'Вимкнути новорічні ефекти' : 'Turn off holiday effects'
      : uk ? 'Увімкнути новорічні ефекти' : 'Turn on holiday effects';
    festiveToggle?.setAttribute('aria-label', label);
    festiveToggle?.setAttribute('title', label);
  };
  applyFestiveMode(festiveEnabled);
  festiveToggle?.addEventListener('click', () => {
    const enabled = !festiveEnabled;
    applyFestiveMode(enabled);
    try {
      localStorage.setItem('festive-mode', enabled ? 'on' : 'off');
    } catch (error) {
      console.warn(`Could not save the festive mode preference: ${error.message}`);
    }
  });
  const progressBar = document.querySelector('.scroll-progress span');
  const scenes = [...document.querySelectorAll('main > section')];
  const railLinks = [...document.querySelectorAll('.chapter-rail a')];
  const chapterRail = document.querySelector('.chapter-rail');
  const mainNav = document.querySelector('.main-nav');
  const mainNavLinks = [...document.querySelectorAll('.main-nav a')];
  mainNavLinks.filter((link) => link.hash === '#shop').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const shopScene = document.querySelector('#shop');
      if (!shopScene) return;
      if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
      const scrollOffset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      window.scrollTo({
        top: window.scrollY + shopScene.getBoundingClientRect().top - scrollOffset,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
      mainNavLinks.forEach((navLink) => navLink.classList.toggle('is-active', navLink === link));
      mainNav?.style.setProperty('--nav-indicator-x', `${link.offsetLeft}px`);
      mainNav?.style.setProperty('--nav-indicator-width', `${link.offsetWidth}px`);
      mainNav?.classList.add('has-active');
    });
  });
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
  let languageText = {};
  let englishLanguageText = {};
  let aboutTranslations = null;
  const languageAttributes = {
    uk: {
      loader: 'Завантаження сайту',
      pageNavigation: 'Навігація сторінкою',
      menuOpen: 'Відкрити меню',
      menuClose: 'Закрити меню',
      pageSections: 'Розділи сайту',
      home: 'Початок',
      about: 'Про мене',
      characters: 'Персонажі',
      game: 'Machinarium',
      steam: 'Steam',
      socials: 'Соцмережі',
      shop: 'Крамничка',
      thanks: 'Подяка',
      backToTop: 'Повернутися нагору',
      imageViewer: 'Перегляд зображення',
      close: 'Закрити',
      hero: 'Nikitoss2ss та Kuron — мій особистий простір',
      wordmark: 'Nikitoss2ss та Kuron — на початок',
      langButton: 'Перемкнути мову на англійську',
      langTitle: 'Switch to English'
    },
    en: {
      loader: 'Loading the site',
      pageNavigation: 'Page navigation',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      pageSections: 'Page sections',
      home: 'Home',
      about: 'About me',
      characters: 'Characters',
      game: 'Machinarium',
      steam: 'Steam',
      socials: 'Socials',
      shop: 'Shop',
      thanks: 'Thanks',
      backToTop: 'Back to top',
      imageViewer: 'Image viewer',
      close: 'Close',
      hero: 'Nikitoss2ss and Kuron — my personal space',
      wordmark: 'Nikitoss2ss and Kuron — back to top',
      langButton: 'Switch language to Ukrainian',
      langTitle: 'Switch to Ukrainian'
    }
  };
  const languageTextNodes = [];
  const languageWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (languageWalker.nextNode()) {
    const node = languageWalker.currentNode;
    if (node.nodeValue.trim() && node.parentElement !== loaderStatus) {
      languageTextNodes.push({ node, original: node.nodeValue });
    }
  }
  const languageToggle = document.querySelector('.language-toggle');
  const detectBrowserLanguage = () => {
    const preferredLanguage = navigator.languages?.[0] || navigator.language || 'en';
    return /^(uk|be|ru)(-|$)/i.test(preferredLanguage) ? 'uk' : 'en';
  };
  let currentLanguage = detectBrowserLanguage();
  try {
    const savedLanguage = localStorage.getItem('site-language-manual');
    if (savedLanguage === 'uk' || savedLanguage === 'en') currentLanguage = savedLanguage;
  } catch (error) {
    console.warn(`Could not read the saved language preference: ${error.message}`);
  }
  const getAge = (birthYear, birthMonth, birthDay) => {
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    if (today.getMonth() + 1 < birthMonth
      || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
      age -= 1;
    }
    return age;
  };
  const applyLanguage = (language) => {
    currentLanguage = language;
    document.documentElement.lang = language;
    const attributes = languageAttributes[language];
    const age = getAge(2009, 1, 5);
    const aboutIntro = document.querySelector('#about-intro');
    const aboutExtra = document.querySelector('#about-extra');
    const aboutExtraGames = document.querySelector('#about-extra-games');
    const aboutExtraFurry = document.querySelector('#about-extra-furry');
    const localizedAbout = aboutTranslations?.[language];
    if (localizedAbout) {
      if (aboutIntro) aboutIntro.innerHTML = localizedAbout.intro.replace('{age}', String(age));
      if (aboutExtra) aboutExtra.textContent = localizedAbout.extra;
      if (aboutExtraGames) aboutExtraGames.textContent = localizedAbout.games;
      if (aboutExtraFurry) aboutExtraFurry.textContent = localizedAbout.furry;
    }
    const interestItems = [...document.querySelectorAll('.interest-list li')];
    const ukrainianInterests = aboutTranslations?.uk?.interests || [
      ['💻 IT та програмування', 'розробка власних проєктів, експерименти з кодом та використання ШІ як помічника у програмуванні.'],
      ['🔧 Техніка та електроніка', "комп'ютери, комплектуючі, розбирання, обслуговування та ремонт різноманітних пристроїв."],
      ['🎨 Малювання', 'іноді створюю власні малюнки та цифрові арти.'],
      ['📺 YouTube', 'веду власний канал та займаюся створенням контенту.'],
      ['🎮 Відеоігри', 'люблю різноманітні жанри та ігри на кшталт Fortnite, Factorio, Roblox і Minecraft.'],
      ['🎬 Анімація та творчість', 'вивчаю 2D- і 3D-анімацію, створюю стікери та експериментую з різними форматами контенту.']
    ];
    const englishInterests = aboutTranslations?.en?.interests || [
      ['💻 IT & Programming', 'developing my own projects, experimenting with code, and using AI as a programming assistant.'],
      ['🔧 Hardware & Electronics', 'computers, components, taking things apart, maintenance, and repairing various devices.'],
      ['🎨 Drawing', 'sometimes creating my own pictures and digital art.'],
      ['📺 YouTube', 'running my own channel and creating content.'],
      ['🎮 Video Games', 'I enjoy many genres and games such as Fortnite, Factorio, Roblox, and Minecraft.'],
      ['🎬 Animation & Creativity', 'learning 2D and 3D animation, making stickers, and experimenting with different content formats.']
    ];
    interestItems.forEach((item, index) => {
      const content = item.querySelector('div');
      if (!content) return;
      const [title, description] = (language === 'en' ? englishInterests : ukrainianInterests)[index] || ['', ''];
      content.innerHTML = `<strong>${title}</strong> — ${description}`;
    });
    const factItems = [...document.querySelectorAll('.facts-field li')];
    const ukrainianFacts = aboutTranslations?.uk?.facts || [
      '🎨 Улюблені кольори — <strong>червоний та помаранчевий</strong>.',
      '🎂 День народження — <strong>5 січня</strong>.',
      '🌐 Мій основний нікнейм — <strong>Nikitoss2ss</strong>.',
      '🖥️ Основні платформи — <strong>PC та VR</strong>.',
      '🍵 <strong>ОБОЖНЮЮ ЧАЙ!</strong> Мабуть, це вже окрема частина моєї особистості.',
      '🎮 Люблю різноманітні жанри відеоігор, але <strong>шутери — точно не моє!</strong>',
      '🎧 Мій улюблений музичний напрямок — <strong>Electronic Dance Music (EDM)</strong>.'
    ];
    const englishFacts = aboutTranslations?.en?.facts || [
      '🎨 Favorite colors — <strong>red and orange</strong>.',
      '🎂 Birthday — <strong>January 5</strong>.',
      '🌐 My main username — <strong>Nikitoss2ss</strong>.',
      '🖥️ Primary platforms — <strong>PC and VR</strong>.',
      '🍵 <strong>I LOVE TEA!</strong> At this point, it’s probably a separate part of my personality.',
      '🎮 I enjoy lots of video game genres, but <strong>shooters are definitely not for me!</strong>',
      '🎧 My favorite music genre — <strong>Electronic Dance Music (EDM)</strong>.'
    ];
    factItems.forEach((item, index) => {
      const content = item.querySelector('div');
      if (content) content.innerHTML = (language === 'en' ? englishFacts : ukrainianFacts)[index] || '';
    });
    const interestsHeading = document.querySelector('.interests-block h3');
    if (interestsHeading) interestsHeading.innerHTML = `${localizedAbout?.interestsHeading || (language === 'en' ? 'What I’m into' : 'Чим цікавлюсь')} <span>✨</span>`;
    const factsHeading = document.querySelector('.facts-field h3');
    if (factsHeading) factsHeading.textContent = localizedAbout?.factsHeading || (language === 'en' ? 'Quick facts' : 'Факти');
    languageTextNodes.forEach(({ node, original }) => {
      const source = original.trim();
      const translated = language === 'en' ? languageText[source] : null;
      node.nodeValue = translated
        ? original.replace(source, translated)
        : original;
    });
    if (loaderStatus) {
      const currentMessage = loaderStatus.textContent.trim();
      const translatedMessage = language === 'en'
        ? languageText[currentMessage]
        : englishLanguageText[currentMessage];
      if (translatedMessage) loaderStatus.textContent = translatedMessage;
    }
    document.querySelector('.site-loader')?.setAttribute('aria-label', attributes.loader);
    document.querySelector('.main-nav')?.setAttribute('aria-label', attributes.pageNavigation);
    document.querySelector('.menu-toggle')?.setAttribute('aria-label', document.querySelector('.menu-toggle')?.getAttribute('aria-expanded') === 'true' ? attributes.menuClose : attributes.menuOpen);
    document.querySelector('.chapter-rail')?.setAttribute('aria-label', attributes.pageSections);
    const railLabels = [attributes.home, attributes.about, attributes.characters, attributes.game, attributes.steam, 'Music', attributes.socials, attributes.shop, attributes.thanks];
    document.querySelectorAll('.chapter-rail a').forEach((link, index) => link.setAttribute('aria-label', railLabels[index]));
    document.querySelector('#hero-title')?.setAttribute('aria-label', attributes.hero);
    document.querySelector('.wordmark')?.setAttribute('aria-label', attributes.wordmark);
    document.querySelector('.footer-mark')?.setAttribute('aria-label', attributes.wordmark);
    document.querySelector('.back-to-top')?.setAttribute('aria-label', attributes.backToTop);
    document.querySelector('.back-to-top')?.setAttribute('title', attributes.backToTop);
    document.querySelector('.lightbox')?.setAttribute('aria-label', attributes.imageViewer);
    document.querySelector('.lightbox button')?.setAttribute('aria-label', attributes.close);
    document.querySelector('[data-carousel-direction="-1"]')?.setAttribute('aria-label', language === 'en' ? 'Previous example' : 'Попередній приклад');
    document.querySelector('[data-carousel-direction="1"]')?.setAttribute('aria-label', language === 'en' ? 'Next example' : 'Наступний приклад');
    document.querySelector('#shop-sticker-track')?.setAttribute('aria-label', language === 'en' ? 'Sticker examples' : 'Приклади стікерів');
    document.querySelector('#shop-slots')?.setAttribute('aria-label', language === 'en' ? 'Four commission slots' : 'Чотири комішки');
    document.querySelector('#shop-figure-image')?.setAttribute('alt', language === 'en' ? 'Kuron acrylic figure' : 'Акрилова фігурка Kuron');
    document.querySelectorAll('.copy-feedback').forEach((feedback) => {
      const copied = feedback.closest('.copied');
      feedback.textContent = copied
        ? language === 'en' ? 'Copied!' : 'Скопійовано!'
        : language === 'en' ? 'Click to copy' : 'Скопіювати?';
    });
    const steamStatus = document.querySelector('.steam-status');
    if (steamStatus) {
      steamStatus.textContent = language === 'en' ? 'Could not load Steam stats.' : 'Не вдалося завантажити статистику Steam.';
    }
    document.querySelectorAll('.steam-game').forEach((gameCard) => {
      const name = gameCard.querySelector('.steam-game-info h3')?.textContent || '';
      const hours = Number(gameCard.dataset.gameHours) || 0;
      gameCard.setAttribute('aria-label', language === 'en' ? `Open ${name} on Steam` : `Відкрити ${name} у Steam`);
      const time = gameCard.querySelector('.steam-game-time');
      if (time) {
        time.textContent = `${Math.round(hours * 10) / 10} ${language === 'en' ? 'HRS' : 'ГОД'}`;
        time.setAttribute('aria-label', language === 'en' ? `${hours} hours over the last two weeks` : `${hours} годин за два тижні`);
      }
      const hoursLabel = gameCard.querySelector('.steam-game-info > p');
      if (hoursLabel) hoursLabel.textContent = language === 'en' ? 'PLAYTIME / LAST 14 DAYS' : 'ЧАС У ГРІ / ОСТАННІ 14 ДНІВ';
      const meter = gameCard.querySelector('.steam-game-meter');
      if (meter) meter.setAttribute('aria-label', language === 'en' ? `${hours} hours over the last two weeks` : `${hours} годин за останні два тижні`);
      const openLabel = gameCard.querySelector('.steam-game-open');
      if (openLabel) openLabel.textContent = language === 'en' ? 'GAME PAGE ↗' : 'СТОРІНКА ГРИ ↗';
    });
    document.querySelector('.language-toggle')?.setAttribute('aria-label', attributes.langButton);
    document.querySelector('.language-toggle')?.setAttribute('title', attributes.langTitle);
    applyFestiveMode(festiveEnabled);
    if (languageToggle) {
      languageToggle.querySelector('.language-toggle-label').textContent = language === 'en' ? 'UA' : 'EN';
    }
    window.requestAnimationFrame(() => {
      const activeLink = mainNavLinks.find((link) => link.classList.contains('is-active'));
      if (activeLink) {
        mainNav.style.setProperty('--nav-indicator-x', `${activeLink.offsetLeft}px`);
        mainNav.style.setProperty('--nav-indicator-width', `${activeLink.offsetWidth}px`);
      }
    });
    document.title = language === 'en'
      ? 'Nikitoss2ss / Kuron — Official Website'
      : 'Nikitoss2ss / Kuron — Особистий сайт';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'en'
      ? 'Nikitoss2ss, also known as Kuron — developer, creator and animator.'
      : 'Nikitoss2ss, також відомий як Kuron — розробник, творець та аніматор.');
  };
  const loadTranslations = async () => {
    try {
      const [ukResponse, enResponse] = await Promise.all([
        fetch('./ua.json', { cache: 'no-cache' }),
        fetch('./en.json', { cache: 'no-cache' })
      ]);
      if (!ukResponse.ok || !enResponse.ok) throw new Error('Could not load language files');
      const [ukTranslations, enTranslations] = await Promise.all([
        ukResponse.json(),
        enResponse.json()
      ]);
      languageText = enTranslations.translations || {};
      englishLanguageText = ukTranslations.translations || {};
      aboutTranslations = {
        uk: ukTranslations.about || null,
        en: enTranslations.about || null
      };
    } catch (error) {
      console.warn(`Could not load external translations: ${error.message}`);
    }
    applyLanguage(currentLanguage);
  };
  loadTranslations();
  const shopDataStatus = document.querySelector('#shop-data-status');
  const defaultSpotifyTracks = [
    '3DbBCR0XKCTorWj4GXfsnN',
    '46T3bl93hAhSwOz7nlLRSx',
    '5oZ9avBrfVtNmYQCkhGgPQ'
  ];
  let shopData;
  let stickerSamples = [];
  let stickerPageStart = 0;
  let stickerCarouselTransitioning = false;
  let shopPreviewObserver;
  const stickerTrack = document.querySelector('#shop-sticker-track');
  const stickerPageSize = 3;
  const lastStickerPageStart = () => Math.floor(Math.max(0, stickerSamples.length - 1) / stickerPageSize) * stickerPageSize;
  let renderedSpotifyTracks = [];
  const localizedText = (value) => {
    if (!value || typeof value.uk !== 'string' || typeof value.en !== 'string') {
      throw new Error('Invalid localized shop text');
    }
    return value[currentLanguage];
  };
  const formatDollars = (value) => `$${Number(value.toFixed(2))}`;
  const renderSpotifyTracks = (tracks) => {
    const container = document.querySelector('#music-content');
    if (!container) return;
    if (tracks.length === renderedSpotifyTracks.length
      && tracks.every((trackId, index) => trackId === renderedSpotifyTracks[index])) {
      container.querySelectorAll('iframe').forEach((frame, index) => {
        frame.title = currentLanguage === 'en'
          ? `Spotify top track ${index + 1}`
          : `Пісня №${index + 1} у Spotify`;
      });
      return;
    }
    container.replaceChildren();
    tracks.forEach((trackId, index) => {
      const frame = document.createElement('iframe');
      frame.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
      frame.width = '100%';
      frame.height = index === 0 ? '352' : '152';
      frame.setAttribute('frameborder', '0');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
      frame.setAttribute('loading', 'lazy');
      frame.title = currentLanguage === 'en'
        ? `Spotify top track ${index + 1}`
        : `Пісня №${index + 1} у Spotify`;
      container.append(frame);
    });
    renderedSpotifyTracks = [...tracks];
  };
  const updateStickerCarousel = () => {
    if (!stickerTrack) return;
    const firstVisible = stickerSamples.length ? stickerPageStart + 1 : 0;
    const lastVisible = Math.min(stickerSamples.length, stickerPageStart + stickerPageSize);
    document.querySelector('#shop-sticker-counter').textContent = stickerSamples.length
      ? `${String(firstVisible).padStart(2, '0')} — ${String(lastVisible).padStart(2, '0')} / ${String(stickerSamples.length).padStart(2, '0')}`
      : currentLanguage === 'en' ? 'No sticker examples yet' : 'Прикладів поки немає';
    document.querySelectorAll('.shop-carousel-button').forEach((button) => {
      button.disabled = stickerCarouselTransitioning || (button.dataset.carouselDirection === '-1'
        ? stickerPageStart === 0
        : stickerPageStart >= lastStickerPageStart());
    });
  };
  const renderStickerPage = (direction = 0) => {
    if (!stickerTrack) return;
    stickerPageStart = Math.min(stickerPageStart, lastStickerPageStart());
    stickerTrack.querySelectorAll('video').forEach((video) => {
      shopPreviewObserver?.unobserve(video);
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    stickerTrack.replaceChildren();
    const visibleStickers = stickerSamples.slice(stickerPageStart, stickerPageStart + stickerPageSize);
    visibleStickers.forEach((sticker, pageIndex) => {
      const sampleIndex = stickerPageStart + pageIndex;
      const card = document.createElement('article');
      card.className = 'shop-sticker-card';
      if (direction) card.dataset.entering = direction > 0 ? 'next' : 'previous';
      card.setAttribute('role', 'listitem');
      const preview = document.createElement('div');
      preview.className = 'shop-sticker-preview';
      if (sticker.preview) {
        const video = document.createElement('video');
        video.src = sticker.preview;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'none';
        video.setAttribute('aria-hidden', 'true');
        video.addEventListener('playing', () => preview.classList.add('is-playing'));
        if (!reduceMotion) {
          if (!shopPreviewObserver) {
            shopPreviewObserver = new IntersectionObserver((entries) => {
              entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) target.play().catch((error) => {
                  if (target.isConnected && target.dataset.failed !== 'true'
                    && error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                    console.warn(`Could not play sticker preview: ${error.message}`);
                  }
                });
                else target.pause();
              });
            }, { rootMargin: '80px 0px' });
          }
          shopPreviewObserver.observe(video);
        }
        video.addEventListener('error', () => {
          if (!video.isConnected) return;
          video.dataset.failed = 'true';
          shopPreviewObserver?.unobserve(video);
          video.hidden = true;
          preview.dataset.previewError = currentLanguage === 'en' ? 'Animation unavailable' : 'Анімація недоступна';
          card.classList.add('has-preview-error');
          console.warn(`Could not load sticker animation preview: ${sticker.preview}`);
        });
        preview.append(video);
      }
      const meta = document.createElement('div');
      meta.className = 'shop-sticker-meta';
      const name = document.createElement('h4');
      name.textContent = localizedText(sticker.title);
      const number = document.createElement('span');
      number.textContent = String(sampleIndex + 1).padStart(2, '0');
      meta.append(name, number);
      const price = document.createElement('p');
      price.className = 'shop-sticker-price';
      price.textContent = `${sticker.fursona} · ${formatDollars(shopData.stickerPriceUsd)}`;
      card.append(preview, meta, price);
      stickerTrack.append(card);
    });
    updateStickerCarousel();
  };
  document.querySelectorAll('.shop-carousel-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (stickerCarouselTransitioning) return;
      const direction = Number(button.dataset.carouselDirection);
      const nextStart = Math.max(0, Math.min(lastStickerPageStart(), stickerPageStart + direction * stickerPageSize));
      if (nextStart === stickerPageStart) return;
      stickerCarouselTransitioning = true;
      updateStickerCarousel();
      stickerTrack.classList.add(direction > 0 ? 'is-exiting-next' : 'is-exiting-previous');
      window.setTimeout(() => {
        stickerTrack.classList.remove('is-exiting-next', 'is-exiting-previous');
        stickerPageStart = nextStart;
        renderStickerPage(direction);
        window.setTimeout(() => {
          stickerCarouselTransitioning = false;
          updateStickerCarousel();
        }, reduceMotion ? 0 : 460);
      }, reduceMotion ? 0 : 220);
    });
  });
  const renderShop = () => {
    if (!shopData) {
      if (shopDataStatus?.classList.contains('has-error')) {
        shopDataStatus.textContent = currentLanguage === 'en'
          ? 'Shop information could not be loaded. Please try again later.'
          : 'Не вдалося завантажити дані крамнички. Спробуй пізніше.';
      }
      return;
    }
    const shopLanguage = currentLanguage;
    const figure = shopData.figure;
    document.querySelector('#shop-figure-image').src = figure.image;
    document.querySelector('#shop-figure-image').alt = localizedText(figure.name);
    document.querySelector('#shop-figure-name').textContent = localizedText(figure.name);
    document.querySelector('#shop-figure-description').textContent = localizedText(figure.description);
    document.querySelector('#shop-figure-price').textContent = figure.priceUah === null
      ? shopLanguage === 'en' ? 'Price to be confirmed' : 'Ціна уточнюється'
      : `${figure.priceUah} ${shopLanguage === 'en' ? 'UAH' : 'грн'}`;
    document.querySelector('#shop-figure-stock').textContent = figure.stock === null
      ? shopLanguage === 'en' ? 'Stock: to be confirmed' : 'На складі: кількість уточнюється'
      : shopLanguage === 'en' ? `In stock: ${figure.stock}` : `На складі: ${figure.stock} шт.`;
    document.querySelector('#shop-sticker-price').textContent = formatDollars(shopData.stickerPriceUsd);
    document.querySelector('#shop-gif-price').textContent = `+${formatDollars(shopData.gifAddonUsd)}`;
    renderSpotifyTracks(shopData.spotifyTracks || defaultSpotifyTracks);
    renderStickerPage();

    const occupied = new Set(shopData.occupiedSlots);
    const slots = document.querySelector('#shop-slots');
    slots.replaceChildren();
    for (let slotNumber = 1; slotNumber <= 4; slotNumber += 1) {
      const isOccupied = occupied.has(slotNumber);
      const slot = document.createElement('div');
      slot.className = `shop-slot ${isOccupied ? 'is-occupied' : 'is-available'}`;
      slot.style.setProperty('--slot-delay', `${(slotNumber - 1) * 90}ms`);
      slot.setAttribute('aria-label', shopLanguage === 'en'
        ? `Slot ${slotNumber}: ${isOccupied ? 'occupied' : 'available'}`
        : `Слот ${String(slotNumber).padStart(2, '0')}: ${isOccupied ? 'зайнятий' : 'вільний'}`);
      const number = document.createElement('span');
      number.className = 'shop-slot-number';
      number.textContent = `№ ${String(slotNumber).padStart(2, '0')}`;
      const lock = document.createElement('span');
      lock.className = 'shop-slot-lock';
      lock.setAttribute('aria-hidden', 'true');
      lock.style.animationDelay = `${(slotNumber - 1) * 65}ms`;
      const shackle = document.createElement('span');
      shackle.className = 'shop-lock-shackle';
      shackle.style.animationDelay = `${(slotNumber - 1) * 65}ms`;
      const lockBody = document.createElement('span');
      lockBody.className = 'shop-lock-body';
      lock.append(shackle, lockBody);
      const status = document.createElement('span');
      status.className = 'shop-slot-state';
      status.textContent = isOccupied
        ? shopLanguage === 'en' ? 'TAKEN' : 'ЗАЙНЯТО'
        : shopLanguage === 'en' ? 'FREE' : 'ВІЛЬНО';
      slot.append(number, lock, status);
      slots.append(slot);
    }
    const freeSlots = 4 - occupied.size;
    document.querySelector('#shop-slots-summary').textContent = freeSlots
      ? shopLanguage === 'en'
        ? `${freeSlots} of 4 commission slots are open — message me on Telegram.`
        : `Вільно ${freeSlots} із 4 комішок — напиши мені в Telegram.`
      : shopLanguage === 'en'
        ? 'All 4 commission slots are taken — I cannot take on new ideas right now.'
        : 'Усі 4 комішки зайняті — поки що не беру нових ідей.';
    document.querySelector('#shop-discount').textContent = shopLanguage === 'en'
      ? `${shopData.discount.percent}% off when ordering ${shopData.discount.minimumQuantity} or more stickers of the same fursona.`
      : `Знижка ${shopData.discount.percent}% при замовленні від ${shopData.discount.minimumQuantity} стікерів однієї фурсони.`;
  };
  const loadShopData = async () => {
    try {
      const response = await fetch('shop-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Shop data unavailable (${response.status})`);
      const data = await response.json();
      if (!data.figure || typeof data.figure.image !== 'string'
        || !Number.isFinite(data.figure.priceUah) || data.figure.priceUah < 0
        || !(data.figure.stock === null || Number.isInteger(data.figure.stock) && data.figure.stock >= 0)
        || !Number.isFinite(data.stickerPriceUsd) || data.stickerPriceUsd < 0
        || !Number.isFinite(data.gifAddonUsd) || data.gifAddonUsd < 0
        || !Array.isArray(data.occupiedSlots) || data.occupiedSlots.some((slot) => !Number.isInteger(slot) || slot < 1 || slot > 4)
        || new Set(data.occupiedSlots).size !== data.occupiedSlots.length
        || !Number.isInteger(data.discount?.minimumQuantity) || data.discount.minimumQuantity < 1
        || !Number.isFinite(data.discount?.percent) || data.discount.percent < 0
        || data.spotifyTracks !== undefined && (!Array.isArray(data.spotifyTracks)
          || data.spotifyTracks.length !== 3
          || data.spotifyTracks.some((track) => typeof track !== 'string' || !/^[A-Za-z0-9]{22}$/.test(track)))
        || data.musicCovers !== undefined && (!data.musicCovers || typeof data.musicCovers !== 'object'
          || data.musicCovers.image !== undefined && !/^Images\/cover\.(?:jpe?g|png)$/.test(data.musicCovers.image)
          || data.musicCovers.landscape !== undefined && !/^Images\/cover1\.(?:gif|jpe?g|mp4|png|webm|webp)$/.test(data.musicCovers.landscape)
          || data.musicCovers.portrait !== undefined && !/^Images\/cover2\.(?:gif|jpe?g|mp4|png|webm|webp)$/.test(data.musicCovers.portrait))
        || !Array.isArray(data.stickers) || !Array.isArray(data.otherStickers)) {
        throw new Error('Shop data has an invalid format');
      }
      [data.figure.name, data.figure.description].forEach(localizedText);
      [...data.stickers, ...data.otherStickers].forEach((sticker) => {
        localizedText(sticker.title);
        if (typeof sticker.fursona !== 'string'
          || !(sticker.preview === null || typeof sticker.preview === 'string' && sticker.preview.length > 0)
          || typeof sticker.poster !== 'string') {
          throw new Error('Invalid sticker item in shop data');
        }
      });
      shopData = data;
      stickerSamples = [...data.stickers, ...data.otherStickers];
      for (let index = stickerSamples.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [stickerSamples[index], stickerSamples[randomIndex]] = [stickerSamples[randomIndex], stickerSamples[index]];
      }
      renderShop();
    } catch (error) {
      console.error(`Could not load shop data: ${error.message}`);
      shopDataStatus.classList.add('has-error');
      shopDataStatus.textContent = currentLanguage === 'en'
        ? 'Shop information could not be loaded. Please try again later.'
        : 'Не вдалося завантажити дані крамнички. Спробуй пізніше.';
    }
  };
  const shopDataReady = loadShopData();
  languageToggle?.addEventListener('click', () => {
    if (languageToggle.classList.contains('is-switching')) return;
    languageToggle.classList.add('is-switching');
    document.body.classList.add('is-language-switching');
    const nextLanguage = currentLanguage === 'uk' ? 'en' : 'uk';
    window.setTimeout(() => {
      applyLanguage(nextLanguage);
      renderShop();
      try {
        localStorage.setItem('site-language-manual', nextLanguage);
      } catch (error) {
        console.warn(`Could not save the language preference: ${error.message}`);
      }
      languageToggle.classList.remove('is-switching');
    }, reduceMotion ? 0 : 150);
    window.setTimeout(() => {
      document.body.classList.remove('is-language-switching');
    }, reduceMotion ? 0 : 760);
  });

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
      if (loaderStatus) loaderStatus.textContent = currentLanguage === 'en' ? languageText[message] || message : message;
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
      heroAvatarVideo?.pause();
      heroAvatarVideo?.removeAttribute('src');
      heroAvatarVideo?.load();
      await waitForImage(heroAvatar);
    };
    if (heroAvatar && !heroAvatar.hasAttribute('src')) {
      heroAvatar.setAttribute('fetchpriority', 'high');
      heroAvatar.src = fallbackImage;
    }
    if (reduceMotion || !heroAvatarVideo) return showStill();
    const avatarMovie = await fileExists('Images/avatar.webm');
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
  const coverImageExtensions = ['.jpg', '.jpeg', '.png'];
  const portraitCoverQuery = window.matchMedia('(orientation: portrait)');
  const coverAssetsReady = shopDataReady.then(async () => {
    const covers = shopData?.musicCovers;
    const findConfiguredCover = async (path, base, extensions) => {
      if (path) {
        const configured = await fileExists(path);
        if (configured) return configured;
      }
      return findAsset(base, extensions);
    };
    const [coverFallback, coverOne, coverTwo] = await Promise.all([
      findConfiguredCover(covers?.image, 'Images/cover', coverImageExtensions),
      findConfiguredCover(covers?.landscape, 'Images/cover1', coverExtensions),
      findConfiguredCover(covers?.portrait, 'Images/cover2', coverExtensions)
    ]);
    const fallback = coverFallback || 'Images/cover.jpg';
    if (musicFilm) musicFilm.poster = fallback;
    if (musicScene) musicScene.dataset.coverFallback = fallback;
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
  let activeSceneId = '';
  let railArrivalTimer = 0;
  const updateActiveNavigation = (activeScene) => {
    const currentId = activeScene.id || 'top';
    const activeSceneIndex = scenes.indexOf(activeScene);
    const activeNavLink = mainNavLinks.find((link) => link.hash === `#${currentId}`)
      || mainNavLinks.reduce((nearestLink, link) => {
        const linkedScene = document.querySelector(link.hash);
        return linkedScene && scenes.indexOf(linkedScene) <= activeSceneIndex ? link : nearestLink;
      }, null)
      || mainNavLinks[0];
    const sceneChanged = currentId !== activeSceneId;
    if (sceneChanged) {
      activeSceneId = currentId;
      scenes.forEach((scene) => scene.classList.toggle('scene-active', scene === activeScene));
      railLinks.forEach((link) => {
        const isCurrent = link.hash === `#${currentId}`;
        link.classList.toggle('is-current', isCurrent);
        link.classList.remove('is-arriving');
        if (isCurrent && !reduceMotion) {
          void link.offsetWidth;
          link.classList.add('is-arriving');
        }
      });
      mainNavLinks.forEach((link) => link.classList.toggle('is-active', link === activeNavLink));
      if (!reduceMotion && chapterRail) {
        chapterRail.classList.add('is-switching');
        window.clearTimeout(railArrivalTimer);
        railArrivalTimer = window.setTimeout(() => chapterRail.classList.remove('is-switching'), 700);
      }
    }

    if (activeNavLink) {
      mainNav.style.setProperty('--nav-indicator-x', `${activeNavLink.offsetLeft}px`);
      mainNav.style.setProperty('--nav-indicator-width', `${activeNavLink.offsetWidth}px`);
      mainNav.classList.add('has-active');
    }

    const activeRailLink = railLinks.find((link) => link.hash === `#${currentId}`);
    if (chapterRail && activeRailLink) {
      const railBounds = chapterRail.getBoundingClientRect();
      const linkBounds = activeRailLink.getBoundingClientRect();
      const isHorizontal = window.matchMedia('(max-width: 760px)').matches;
      const x = isHorizontal ? linkBounds.left + linkBounds.width / 2 - railBounds.left - 4 : linkBounds.left - railBounds.left - 1;
      const y = isHorizontal ? 0 : linkBounds.top + linkBounds.height / 2 - railBounds.top - 4;
      chapterRail.style.setProperty('--rail-x', `${x}px`);
      chapterRail.style.setProperty('--rail-y', `${y}px`);
    }
  };
  const updateScrollScene = () => {
    motionFrame = 0;
    updateSnowParallax();
    const viewportHeight = window.innerHeight || 1;
    const pageRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    const pageProgress = clamp(window.scrollY / pageRange);
    progressBar?.style.setProperty('--page-progress', String(pageProgress));
    let activeScene = scenes[0];
    const navigationThreshold = Math.min(viewportHeight * .36, 280);
    scenes.forEach((scene) => {
      const bounds = scene.getBoundingClientRect();
      if (bounds.top <= navigationThreshold) activeScene = scene;
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
    updateActiveNavigation(activeScene);
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

  // Mobile navigation.
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen
      ? languageAttributes[currentLanguage].menuOpen
      : languageAttributes[currentLanguage].menuClose);
    mainNav?.classList.toggle('is-open', !isOpen);
  });
  mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', languageAttributes[currentLanguage].menuOpen);
    mainNav.classList.remove('is-open');
    mainNavLinks.forEach((navLink) => navLink.classList.toggle('is-active', navLink === link));
    mainNav.style.setProperty('--nav-indicator-x', `${link.offsetLeft}px`);
    mainNav.style.setProperty('--nav-indicator-width', `${link.offsetWidth}px`);
    mainNav.classList.add('has-active');
  }));

  // Only load and play the selected cover video while the music scene is visible.
  if (musicScene && musicFilm && !reduceMotion) {
    musicFilm.addEventListener('playing', () => musicScene.classList.add('video-ready'));
    musicFilm.addEventListener('error', () => {
      if (musicScene.dataset.coverKind !== 'video') return;
      const fallback = musicScene.dataset.coverFallback || 'Images/cover.jpg';
      musicFilm.pause();
      musicScene.classList.remove('video-ready');
      musicScene.dataset.coverKind = 'image';
      musicScene.style.setProperty('--music-cover-image', `url("${fallback}")`);
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
        const games = Array.isArray(data.games)
          ? data.games
            .filter((game) => game.isGame !== false && !isExcludedSteamApp(game))
            .sort((a, b) => (Number(b.playtimeMinutes ?? b.hours) || 0) - (Number(a.playtimeMinutes ?? a.hours) || 0))
            .slice(0, 3)
          : [];
        if (!games.length) throw new Error('No recently played games');
        const maxHours = Math.max(...games.map((game) => Number(game.hours) || 0), .1);
        steamGames.replaceChildren(...games.map((game, index) => {
          const row = document.createElement('a');
          row.className = index === 0 ? 'steam-game steam-game-featured' : 'steam-game';
          row.dataset.gameHours = String(game.hours);
          const appIdFromImage = typeof game.image === 'string'
            ? game.image.match(/\/steam\/apps\/(\d+)\//)?.[1]
            : null;
          const appId = String(game.appid ?? appIdFromImage ?? '');
          row.href = appId
            ? `https://store.steampowered.com/app/${encodeURIComponent(appId)}/`
            : `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name || '')}`;
          row.target = '_blank';
          row.rel = 'noopener noreferrer';
          row.setAttribute('aria-label', currentLanguage === 'en' ? `Open ${game.name} on Steam` : `Відкрити ${game.name} у Steam`);
          row.style.setProperty('--card-index', String(index));
          const rank = document.createElement('span');
          rank.className = 'steam-game-rank';
          rank.textContent = String(index + 1).padStart(2, '0');
          const art = document.createElement('div');
          art.className = 'steam-game-art';
          const image = document.createElement('img');
          image.src = game.image;
          image.alt = '';
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
          [0, 1, 2].forEach((lineIndex) => {
            const line = document.createElement('span');
            line.className = `steam-fallback-line line-${lineIndex + 1}`;
            const track = document.createElement('span');
            track.className = 'steam-fallback-track';
            [0, 1].forEach((copyIndex) => {
              const title = document.createElement('span');
              title.textContent = `${game.name}  ·  ${game.name}  ·  `;
              if (copyIndex) title.setAttribute('aria-hidden', 'true');
              track.append(title);
            });
            line.append(track);
            fallback.append(line);
          });
          const time = document.createElement('span');
          time.className = 'steam-game-time';
          time.textContent = `${Math.round(Number(game.hours) * 10) / 10} ${currentLanguage === 'en' ? 'HRS' : 'ГОД'}`;
          time.setAttribute('aria-label', currentLanguage === 'en' ? `${game.hours} hours over the last two weeks` : `${game.hours} годин за два тижні`);
          art.append(image, fallback, rank, time);
          const info = document.createElement('div');
          info.className = 'steam-game-info';
          const name = document.createElement('h3');
          name.textContent = game.name;
          const hours = document.createElement('p');
          hours.textContent = currentLanguage === 'en' ? 'PLAYTIME / LAST 14 DAYS' : 'ЧАС У ГРІ / ОСТАННІ 14 ДНІВ';
          const meter = document.createElement('div');
          meter.className = 'steam-game-meter';
          meter.setAttribute('aria-label', currentLanguage === 'en' ? `${game.hours} hours over the last two weeks` : `${game.hours} годин за останні два тижні`);
          const meterFill = document.createElement('span');
          meterFill.style.setProperty('--playtime-fill', `${Math.max(8, (Number(game.hours) || 0) / maxHours * 100)}%`);
          meter.append(meterFill);
          const openLabel = document.createElement('span');
          openLabel.className = 'steam-game-open';
          openLabel.textContent = currentLanguage === 'en' ? 'GAME PAGE ↗' : 'СТОРІНКА ГРИ ↗';
          info.append(name, hours, meter, openLabel);
          row.append(art, info);
          return row;
        }));
      })
      .catch(() => {
        const status = document.createElement('p');
        status.className = 'steam-status';
        status.textContent = currentLanguage === 'en' ? 'Could not load Steam stats.' : 'Не вдалося завантажити статистику Steam.';
        steamGames.replaceChildren(status);
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
    feedback.textContent = currentLanguage === 'en' ? 'Click to copy' : 'Скопіювати?';
    const copy = async () => {
      await copyText(name);
      feedback.textContent = currentLanguage === 'en' ? 'Copied!' : 'Скопійовано!';
      element.classList.add('copied');
      window.setTimeout(() => {
        element.classList.remove('copied');
        feedback.textContent = currentLanguage === 'en' ? 'Click to copy' : 'Скопіювати?';
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
      if (feedback) feedback.textContent = currentLanguage === 'en' ? 'Copied!' : 'Скопійовано!';
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
  lightbox.setAttribute('aria-label', languageAttributes[currentLanguage].imageViewer);
  const lightboxImage = document.createElement('img');
  const lightboxClose = document.createElement('button');
  lightboxClose.type = 'button';
  lightboxClose.setAttribute('aria-label', languageAttributes[currentLanguage].close);
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
