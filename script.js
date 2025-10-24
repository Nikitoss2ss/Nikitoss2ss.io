/* FILE: script.js */
// Basic interactions: slideshow for Machinarium section + footer year + audio metadata helper (simple)

document.addEventListener('DOMContentLoaded',()=>{
  // footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // slideshow backgrounds for favgame
  const favBg = document.querySelector('.bg-slideshow::before');
  // Instead of trying to set pseudo-element, we'll update the container's style
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

  // small audio metadata display: shows file name + (if available) duration
  const audio = document.getElementById('audio');
  const trackTitle = document.getElementById('track-title');
  const trackMeta = document.getElementById('track-meta');
  const cover = document.getElementById('music-cover');

  audio.addEventListener('loadedmetadata', ()=>{
    const durSec = Math.floor(audio.duration);
    const mm = Math.floor(durSec/60); const ss = String(durSec%60).padStart(2,'0');
    trackMeta.textContent = `Тривалість: ${mm}:${ss}`;
    // leave title as filename (user can edit)
    const src = audio.querySelector('source').getAttribute('src');
    const fileName = src.split('/').pop();
    trackTitle.textContent = fileName;
  });

  // Optional: simple smooth scrolling for quick links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

});

