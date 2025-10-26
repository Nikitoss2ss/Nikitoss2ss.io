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

  // Copy-to-clipboard for any .copiable-name element
  function showCopied(el){
    el.classList.add('copied');
    setTimeout(()=>el.classList.remove('copied'),1200);
  }

  document.querySelectorAll('.copiable-name').forEach(wrapper=>{
    const nameEl = wrapper.querySelector('.name-text');
    if(!nameEl) return;
    const text = nameEl.textContent.trim();

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
    el.addEventListener('click', async (e)=>{
      try{ await navigator.clipboard.writeText(toCopy); }
      catch(err){ const ta=document.createElement('textarea'); ta.value=toCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      el.classList.add('copied'); setTimeout(()=>el.classList.remove('copied'),900);
    });
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); el.click(); } });
    const icons = el.querySelector('.mikus-icons'); if(icons){ icons.addEventListener('click', ev=>{ ev.stopPropagation(); }); }
  });

  // Ensure copy-feedback element exists for Mikus; provide visual text if not in markup
  document.querySelectorAll('.copiable-mikus').forEach(el=>{
    if(!el.querySelector('.copy-feedback')){
      const fb = document.createElement('span'); fb.className = 'copy-feedback'; fb.textContent = 'Скопійовано'; el.appendChild(fb);
    }
  });

});

