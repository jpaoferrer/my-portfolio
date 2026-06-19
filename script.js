    // Always start at the top on load/refresh
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // ========== Loader ==========
    const loader = document.getElementById('loader');
    const lf = document.getElementById('lf');
    const loaderPct = document.getElementById('loaderPct');

    let targetPct = 0;
    let displayPct = 0;
    let pctRaf = null;
    let loadFired = false;

    function tickPct() {
      if (displayPct < targetPct) {
        displayPct = Math.min(targetPct, Math.floor(displayPct + Math.max(1, (targetPct - displayPct) * 0.08)));
        if (loaderPct) loaderPct.textContent = displayPct + '%';
        pctRaf = requestAnimationFrame(tickPct);
      } else {
        if (loaderPct) loaderPct.textContent = targetPct + '%';
      }
    }

    function setPct(v) {
      targetPct = v;
      lf.style.width = v + '%';
      cancelAnimationFrame(pctRaf);
      pctRaf = requestAnimationFrame(tickPct);
    }

    // Simulate gradual fill while page loads — each step is guarded so
    // none of them can overwrite 100% if load already fired
    setTimeout(() => { if (!loadFired) setPct(25); }, 80);
    setTimeout(() => { if (!loadFired) setPct(50); }, 400);
    setTimeout(() => { if (!loadFired) setPct(75); }, 800);

    function dismissLoader() {
      if (!document.body.classList.contains('is-loading')) return;
      loader.classList.add('done');
      document.body.classList.remove('is-loading');
      runScramble();
    }

    window.addEventListener('load', () => {
      loadFired = true;
      setPct(100);
      // Wait for bar CSS transition (1s) + 600ms hold at 100% before dismiss
      setTimeout(dismissLoader, 1600);
    });

    // Failsafe: never trap the visitor behind the loader if a video/asset hangs
    setTimeout(() => { setPct(100); dismissLoader(); }, 4000);

    // ========== Custom Cursor ==========
    const cur = document.getElementById('cur');
    const cdot = document.getElementById('cdot');
    let mx = -100, my = -100;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cdot.style.transform = `translate(${mx - 2.5}px, ${my - 2.5}px)`;
    });

    (function cursorLoop() {
      cur.style.transform = `translate(${mx - 19}px, ${my - 19}px)`;
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a, button, .magnetic').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });

    // ========== Hero cursor glow + parallax ==========
    (function() {
      const hero = document.getElementById('hero');
      if (!hero) return;

      // Inject spotlight blob into hero
      const glow = document.createElement('div');
      glow.className = 'hero-glow';
      const heroInner = hero.querySelector('.hero-inner');
      if (heroInner) hero.insertBefore(glow, heroInner);
      else hero.appendChild(glow);

      // Elements for parallax depth layers
      const orbA = hero.querySelector('.orb-a');
      const orbB = hero.querySelector('.orb-b');
      const name = document.getElementById('heroName');
      const sub  = hero.querySelector('.h-sub');
      const desc = hero.querySelector('.h-desc');

      // State
      let tGx = 0,  tGy = 0;  // glow target px (relative to hero)
      let cGx = 0,  cGy = 0;  // glow current (lerped)
      let tNx = 0,  tNy = 0;  // parallax target, normalized -0.5…0.5
      let cNx = 0,  cNy = 0;  // parallax current (lerped, slower)
      let inHero = false;

      // Parallax only starts after load animations finish
      let parallaxReady = false;
      setTimeout(() => { parallaxReady = true; }, 2200);

      hero.addEventListener('mouseenter', () => {
        inHero = true;
        glow.style.opacity = '1';
      });

      hero.addEventListener('mouseleave', () => {
        inHero = false;
        glow.style.opacity = '0';
        tNx = 0; tNy = 0; // drift back to rest
      });

      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        tGx = e.clientX - r.left;
        tGy = e.clientY - r.top;
        tNx = tGx / r.width  - 0.5;
        tNy = tGy / r.height - 0.5;
      });

      (function heroLoop() {
        // Glow lerp — snappier so light "arrives" quickly
        cGx += (tGx - cGx) * 0.09;
        cGy += (tGy - cGy) * 0.09;

        // Parallax lerp — dreamier, trails behind intentionally
        cNx += (tNx - cNx) * 0.048;
        cNy += (tNy - cNy) * 0.048;

        // Move spotlight blob: top:-280px / left:-280px already center it,
        // so translate(cursorX, cursorY) lands its center on the cursor
        glow.style.transform = `translate(${cGx}px, ${cGy}px)`;

        if (parallaxReady) {
          // Background orbs drift opposite (they're "behind" the scene)
          if (orbA) orbA.style.transform = `translate(${cNx * -26}px, ${cNy * -17}px)`;
          if (orbB) orbB.style.transform = `translate(${cNx *  20}px, ${cNy *  13}px)`;

          // Foreground text layers drift with cursor, subtly
          if (name) name.style.transform = `translate(${cNx * 11}px, ${cNy * 7}px)`;
          if (sub)  sub.style.transform  = `translate(${cNx * 6}px,  ${cNy * 4}px)`;
          if (desc) desc.style.transform = `translate(${cNx * 3}px,  ${cNy * 2}px)`;
        }

        requestAnimationFrame(heroLoop);
      })();
    })();

    document.addEventListener('mouseleave', () => { cur.classList.add('hide'); cdot.classList.add('hide'); });
    document.addEventListener('mouseenter', () => { cur.classList.remove('hide'); cdot.classList.remove('hide'); });

    // ========== Nav scroll ==========
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('stuck', window.scrollY > 32);
    }, { passive: true });

    // ========== Scroll Reveal ==========
    const reveals = document.querySelectorAll('[data-r]');
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => ro.observe(el));

    // ========== Staggered Grid Reveal ==========
    const staggers = document.querySelectorAll('[data-stagger]');
    const staggerObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); staggerObs.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });
    staggers.forEach(el => staggerObs.observe(el));

    // ========== Magnetic Buttons ==========
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.12s ease';
      });
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform = 'translate(0,0)';
      });
    });

    // ========== Text Scramble ==========
    class Scramble {
      constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        this.raf = null;
        this.tick = this.tick.bind(this);
      }

      run(text) {
        cancelAnimationFrame(this.raf);
        clearTimeout(this.failsafe);
        this.done = false;
        this.frame = 0;
        this.text = text;
        this.queue = [...text].map((ch, i) => ({
          to: ch,
          start: Math.floor(Math.random() * 10),
          end:   Math.floor(Math.random() * 14) + 10,
          ch: ''
        }));
        // Mobile browsers throttle/pause requestAnimationFrame for backgrounded
        // or not-yet-visible tabs, which can freeze this mid-scramble and leave
        // the name permanently blank. This guarantees it always resolves to the
        // final text even if the rAF loop never gets to run.
        this.failsafe = setTimeout(() => this.finish(), 2400);
        return new Promise(res => { this.resolve = res; this.tick(); });
      }

      finish() {
        if (this.done) return;
        this.done = true;
        cancelAnimationFrame(this.raf);
        clearTimeout(this.failsafe);
        this.el.innerHTML = 'JUAN PAOLO<br><span class="ao">BLANCO</span>';
        this.resolve();
      }

      tick() {
        if (this.done) return;
        let out = '', done = 0;
        for (const item of this.queue) {
          if (this.frame >= item.end) {
            done++;
            out += item.to === '\n' ? '<br>' : item.to === ' ' ? ' ' : item.to;
          } else if (this.frame >= item.start) {
            const r = item.to === '\n' || item.to === ' ';
            if (!item.ch || Math.random() < 0.3)
              item.ch = r ? item.to : this.chars[Math.floor(Math.random() * this.chars.length)];
            out += r
              ? (item.to === '\n' ? '<br>' : ' ')
              : `<span class="sc">${item.ch}</span>`;
          } else {
            out += item.to === '\n' ? '<br>' : '&nbsp;';
          }
        }
        this.el.innerHTML = out;
        this.frame++;
        if (done < this.queue.length) {
          this.raf = requestAnimationFrame(this.tick);
        } else {
          this.finish();
        }
      }
    }

    function runScramble() {
      /* Scramble disabled: the per-word clip-path reveal handles the entrance cleanly. */
    }

    // Mobile browsers can restore this page from the back-forward cache (bfcache)
    // in its exact prior DOM state without re-running load scripts — if that snapshot
    // was mid-scramble or stuck blank, repair it immediately on restore.
    window.addEventListener('pageshow', (e) => {
      const nameEl = document.getElementById('heroName');
      if (!nameEl) return;
      const text = nameEl.textContent.replace(/ /g, '').trim();
      const looksDone = text.includes('JUAN') && text.includes('PAOLO') && text.includes('BLANCO');
      if (e.persisted && !looksDone) {
        nameEl.innerHTML = 'JUAN PAOLO<br><span class="ao">BLANCO</span>';
      }
    });

    // ========== Copy Email ==========
    const toast = document.getElementById('toast');

    function copyEmail() {
      navigator.clipboard.writeText('blanco.jp19@gmail.com').then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2600);
      }).catch(() => {
        window.location.href = 'mailto:blanco.jp19@gmail.com';
      });
    }

    // ========== Active nav highlight ==========
    const allSections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    const so = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navAnchors.forEach(a => {
            a.style.color = a.getAttribute('href') === `#${e.target.id}`
              ? 'var(--text-1)' : '';
          });
        }
      });
    }, { threshold: 0.45 });

    allSections.forEach(s => so.observe(s));

    // ========== About Me — card fan + text animations ==========
    const amEls = [
      document.getElementById('amLabel'),
      document.getElementById('amHeading'),
      document.getElementById('amBody1'),
      document.getElementById('amBody2'),
      document.getElementById('amStats'),
      document.getElementById('amClose'),
    ];

    const photos = [
      document.getElementById('photoA'),
      document.getElementById('photoB'),
      document.getElementById('photoC'),
    ];

    // Scroll reveal — photos in + text animations
    let aboutAnimated = false;

    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !aboutAnimated) {
          aboutAnimated = true;

          // Stagger text reveals
          amEls.forEach((el, i) => {
            setTimeout(() => { if (el) el.classList.add('on'); }, i * 100);
          });

          // Stagger photo reveals + start float on wrapper
          photos.forEach((photo, i) => {
            if (!photo) return;
            setTimeout(() => {
              photo.classList.add('visible');
              if (posWrappers[i]) posWrappers[i].classList.add('floating');
            }, 350 + i * 200);
          });

          aboutObserver.disconnect();
        }
      });
    }, { threshold: 0.15 });

    const aboutSection = document.getElementById('about');
    if (aboutSection) aboutObserver.observe(aboutSection);

    // Photo collage — reveal on scroll, staggered float start
    const posWrappers = [
      document.getElementById('pos0'),
      document.getElementById('pos1'),
      document.getElementById('pos2'),
    ];

    // Responsive grid collapse
    function setAboutLayout() {
      const wrap = aboutSection && aboutSection.querySelector('.wrap');
      if (!wrap) return;
      if (window.innerWidth <= 768) {
        wrap.style.gridTemplateColumns = '1fr';
        wrap.style.gap = '56px';
      } else {
        wrap.style.gridTemplateColumns = '48% 52%';
        wrap.style.gap = '72px';
      }
    }
    setAboutLayout();
    window.addEventListener('resize', setAboutLayout, { passive: true });

    // ========== Video Work ==========
    // Seek all videos to first frame so thumbnail shows
    document.querySelectorAll('.vid-card video').forEach(v => {
      v.addEventListener('loadedmetadata', () => { v.currentTime = 0.1; }, { once: true });
    });

    // Tab switching
    document.querySelectorAll('.vt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vt').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.vid-cat').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('cat-' + btn.dataset.cat).classList.add('active');
        // Pause any playing video when switching tabs
        document.querySelectorAll('.vid-card video').forEach(v => v.pause());
        document.querySelectorAll('.vid-card').forEach(c => c.classList.remove('playing'));
      });
    });

    // Play button click — one video at a time
    document.querySelectorAll('.vid-card').forEach(card => {
      const video = card.querySelector('video');
      const overlay = card.querySelector('.vid-overlay');
      if (!video || !overlay) return;

      overlay.addEventListener('click', () => {
        // Pause all others
        document.querySelectorAll('.vid-card').forEach(c => {
          if (c !== card) {
            c.querySelector('video').pause();
            c.classList.remove('playing');
          }
        });
        video.setAttribute('controls', '');
        video.play();
        card.classList.add('playing');
      });

      video.addEventListener('pause', () => card.classList.remove('playing'));
      video.addEventListener('ended', () => {
        card.classList.remove('playing');
        video.removeAttribute('controls');
      });
    });

    // ========== Scroll Progress Bar ==========
    const sp = document.getElementById('sp');
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      sp.style.transform = `scaleX(${Math.min(scrolled, 1)})`;
    }, { passive: true });

    // ========== Spotlight Cursor on Cards ==========
    const spotlightCards = document.querySelectorAll('.pc, .bt, .cert-card, .gear-item, .hero-card');
    spotlightCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    // ========== Counter Animation ==========
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateCounter(el) {
      if (prefersReduced) return;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const isAmStat = el.classList.contains('am-stat-num');
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * target);

        if (isAmStat) {
          el.innerHTML = suffix ? `${value}<sup>${suffix}</sup>` : `${value}`;
        } else {
          el.textContent = `${value}${suffix}`;
        }

        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

    // ========== Hero Card 3D Tilt ==========
    const heroCard = document.querySelector('.hero-card');
    if (heroCard && !prefersReduced) {
      const TILT = 6;
      heroCard.addEventListener('mouseenter', () => {
        heroCard.style.transition = 'transform 0.12s ease';
      });
      heroCard.addEventListener('mousemove', e => {
        const r = heroCard.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        heroCard.style.transform = `perspective(700px) rotateY(${dx * TILT}deg) rotateX(${-dy * TILT}deg)`;
      });
      heroCard.addEventListener('mouseleave', () => {
        heroCard.style.transition = 'transform 0.6s var(--expo)';
        heroCard.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg)';
        setTimeout(() => { heroCard.style.transition = ''; heroCard.style.transform = ''; }, 620);
      });
    }

    // Section heading clip-path reveals are handled purely via CSS
    // ([data-r].on .sec-heading) — no JS needed.

    // ========== WOW LAYER: 3D Tilt on Project & Bento Cards ==========
    if (!prefersReduced) {
      function addTilt(selector, intensity) {
        document.querySelectorAll(selector).forEach(card => {
          card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.setProperty('--rx', (-y * intensity) + 'deg');
            card.style.setProperty('--ry', (x * intensity) + 'deg');
          });
          card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
          });
        });
      }
      addTilt('.pc', 5);
      addTilt('.bt', 3);
    }

    // ========== WOW LAYER: Conic Gradient Border on Project Cards ==========
    document.querySelectorAll('.pc').forEach(card => {
      const border = document.createElement('div');
      border.className = 'grad-border';
      card.appendChild(border);
    });

    // ========== WOW LAYER: Timeline Line Draw ==========
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      const tlObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          timeline.classList.add('line-on');
          tlObs.disconnect();
        }
      }, { threshold: 0.05 });
      tlObs.observe(timeline);
    }

    // ========== WOW LAYER: Ambient Floating Particles ==========
    if (!prefersReduced) {
      function spawnParticle() {
        const p = document.createElement('div');
        p.className = 'ap';
        const size = Math.random() * 2.5 + 1;
        const dur = Math.random() * 14 + 10;
        const delay = Math.random() * 3;
        const isGreen = Math.random() > 0.55;
        p.style.cssText = `
          left:${Math.random()*100}vw;
          bottom:-10px;
          width:${size}px;
          height:${size}px;
          background:${isGreen ? 'rgba(99,140,255,0.45)' : 'rgba(99,140,255,0.55)'};
          animation-duration:${dur}s;
          animation-delay:${delay}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), (dur + delay) * 1000 + 100);
      }
      setInterval(spawnParticle, 900);
    }

    // ========== WOW LAYER: Scroll-to-Top Button ==========
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTop';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollTopBtn);
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ========== WOW LAYER: Hero Noise Grain ==========
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      const noise = document.createElement('div');
      noise.className = 'hero-noise';
      heroEl.appendChild(noise);
    }

    // ========== WOW LAYER: Gear Item Spotlight ==========
    document.querySelectorAll('.gear-item').forEach(item => {
      item.addEventListener('mousemove', e => {
        const r = item.getBoundingClientRect();
        item.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        item.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // ========== WOW LAYER: Live Manila Clock (Geo Widget) ==========
    const geoClockEl = document.getElementById('geoClock');
    if (geoClockEl) {
      const updateGeoClock = () => {
        const utcMs = Date.now() + (new Date().getTimezoneOffset() * 60000);
        const manila = new Date(utcMs + 8 * 3600000);
        const hh = String(manila.getHours()).padStart(2, '0');
        const mm = String(manila.getMinutes()).padStart(2, '0');
        const ss = String(manila.getSeconds()).padStart(2, '0');
        geoClockEl.textContent = `${hh}:${mm}:${ss}`;
      };
      updateGeoClock();
      setInterval(updateGeoClock, 1000);
    }

