/* Velor Group. Библиотеки движения (GSAP, ScrollTrigger, Lenis) подгружаются после первой отрисовки,
   чтобы первый экран не ждал их загрузки. */
(function () {
  'use strict';
  var SELF = (document.currentScript && document.currentScript.src) || '';
  /* фото плит услуг: адрес подставляется за ~1.5 экрана до показа, чтобы не грузиться вместе с первым экраном */
  (function () {
    var imgs = [].slice.call(document.querySelectorAll('img[data-lsrc]')).filter(function (i) { return !i.closest('.scene'); });
    function put(img) { var s = img.getAttribute('data-lsrc'); if (s) { img.src = s; img.removeAttribute('data-lsrc'); } }
    function putIn(box) { [].forEach.call(box.querySelectorAll('img[data-lsrc]'), put); }
    if (!('IntersectionObserver' in window)) return imgs.forEach(put);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); putIn(e.target); } });
    }, { rootMargin: '150% 0px' });
    imgs.forEach(function (img) { io.observe(img.closest('figure') || img); });
  })();
  function boot() {
  var d = document, root = d.documentElement, body = d.body;
  root.classList.add('js');
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  var ANIM = !!(G && ST) && !RM;
  var PHONE = '77710020909';
  var VER = (function () {
    var m = SELF.match(/[?&]v=([^&]+)/);
    return m ? m[1] : '1';
  })();
  function onLoad(fn) { if (d.readyState === 'complete') setTimeout(fn, 0); else window.addEventListener('load', fn); }
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---------- языки ---------- */
  var RU = {
    'wa.common': 'Здравствуйте! Хочу рассчитать стоимость мебели на заказ.',
    'wa.kitchen': 'Здравствуйте! Хочу рассчитать стоимость кухни на заказ.',
    'wa.closet': 'Здравствуйте! Хочу рассчитать стоимость шкафа на заказ.',
    'wa.wardrobe': 'Здравствуйте! Хочу рассчитать стоимость гардероба на заказ.',
    'wa.kids': 'Здравствуйте! Хочу рассчитать стоимость детской мебели на заказ.',
    'wa.extra': 'Здравствуйте! Хочу уточнить стоимость: прихожая, витрина или межкомнатные двери.',
    'wa.form': 'Здравствуйте! Заявка с сайта. Нужно изготовить: {type}. Имя: {name}. Телефон: {phone}. Комментарий: {comment}.',
    'meta.title': d.title,
    'meta.desc': (d.querySelector('meta[name="description"]') || {}).content || ''
  };
  var lang = 'ru', splits = [];
  function eachAttr(el, fn) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (p) {
      var a = p.split(':'); if (a.length === 2) fn(a[0].trim(), a[1].trim());
    });
  }
  $$('[data-i18n]').forEach(function (el) {
    var k = el.getAttribute('data-i18n'); if (!(k in RU)) RU[k] = el.innerHTML;
  });
  $$('[data-i18n-attr]').forEach(function (el) {
    eachAttr(el, function (a, k) { if (!(k in RU)) RU[k] = el.getAttribute(a) || ''; });
  });
  function t(k) {
    var kk = window.SITE_KK;
    return (lang === 'kk' && kk && kk[k] != null) ? kk[k] : (RU[k] != null ? RU[k] : '');
  }
  function setWa() {
    $$('a[data-wa]').forEach(function (a) {
      a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(t('wa.' + a.getAttribute('data-wa')));
    });
  }
  function applyLang(l) {
    lang = l;
    splits.forEach(function (s) { try { s.revert(); } catch (e) {} }); splits = [];
    $$('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-attr]').forEach(function (el) {
      eachAttr(el, function (a, k) { el.setAttribute(a, t(k)); });
    });
    root.lang = l === 'kk' ? 'kk' : 'ru';
    d.title = t('meta.title');
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t('meta.desc'));
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
    setWa(); marquee(); fitHero();
    if (ST) ST.refresh();
  }
  function setLang(l, save) {
    if (save) { try { localStorage.setItem('velor_lang', l); } catch (e) {} }
    if (l !== 'kk') return applyLang('ru');
    if (window.SITE_KK) return applyLang('kk');
    var s = d.createElement('script');
    s.src = 'assets/lang/kk.js?v=' + VER;
    s.onload = function () { applyLang('kk'); };
    s.onerror = function () { applyLang('ru'); };
    d.head.appendChild(s);
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });

  /* ---------- плавная прокрутка ---------- */
  var lenis = null;
  if (ANIM) {
    G.registerPlugin(ST);
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.11, anchors: false });
      lenis.on('scroll', ST.update);
      G.ticker.add(function (time) { lenis.raf(time * 1000); });
      G.ticker.lagSmoothing(0);
    }
  }
  function absTop(el) {
    if (el.classList.contains('plate') && getComputedStyle(el).position === 'sticky') {
      var p = el.parentNode, y = p.getBoundingClientRect().top + window.pageYOffset, s = p.firstElementChild;
      while (s && s !== el) { y += s.offsetHeight; s = s.nextElementSibling; }
      return y;
    }
    return el.getBoundingClientRect().top + window.pageYOffset;
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) { e.preventDefault(); return; }
    var el = $(id); if (!el) return;
    e.preventDefault();
    closeMenu();
    var y = Math.max(0, absTop(el));
    if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  });

  /* ---------- шапка и меню ---------- */
  var hdr = $('#hdr'), burger = $('#burger');
  function onScroll() { hdr.classList.toggle('is-solid', window.pageYOffset > 30); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() {
    if (!body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    var open = !body.classList.contains('menu-open');
    if (!open) return closeMenu();
    body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- мобильный герой: сцене достаётся место над текстом ---------- */
  /* лампа фона: на широких экранах кадр режется сверху, абажур уезжал под телефон в шапке - опускаем ниже шапки */
  function fitLamp() {
    var svg = $('.hero__shop'), lamp = $('.shop__lamp'); if (!svg || !lamp) return;
    var W = svg.clientWidth, H = svg.clientHeight; if (!W || !H) return;
    var sc = Math.max(W / 1600, H / 900), top = H - 900 * sc + 80 * sc;
    var hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 76;
    var t = Math.max(0, (hdr + 24 - top) / sc);
    lamp.setAttribute('transform', 'translate(0 ' + t.toFixed(1) + ')');
  }

  function fitHero() {
    fitLamp();
    var h = $('.hero'), tx = $('.hero__txt'); if (!h || !tx) return;
    if (window.innerWidth > 900) { h.style.removeProperty('--txh'); var s0 = $('.scene'); if (s0) { s0.style.removeProperty('--lbfs'); s0.classList.remove('no-lb'); } return; }
    h.style.setProperty('--txh', Math.ceil(tx.getBoundingClientRect().height) + 'px');
    /* подписи деталей в сцене - около 11px на экране при любом размере сцены */
    var sc = $('.scene'); if (sc && sc.offsetWidth) {
      var fs = 11 * 740 / (sc.offsetWidth * 1.1);
      /* на маленькой сцене подписи деталей слипаются - тогда их не показываем */
      sc.classList.toggle('no-lb', fs > 27);
      sc.style.setProperty('--lbfs', Math.min(fs, 27).toFixed(1) + 'px');
    }
  }

  /* ---------- раскрытие кадра деталями, как на карте раскроя ---------- */
  var PRE = { a: [[0, 0, 38, 56, 'l'], [38, 0, 62, 30, 't'], [38, 30, 34, 26, 'r'], [72, 30, 28, 70, 'r'], [0, 56, 46, 44, 'b'], [46, 56, 26, 44, 'b']] };
  PRE.b = PRE.a.map(function (r) { return [100 - r[0] - r[2], r[1], r[2], r[3], r[4] === 'l' ? 'r' : r[4] === 'r' ? 'l' : r[4]]; });
  var FROM = { l: { xPercent: -16 }, r: { xPercent: 16 }, t: { yPercent: -16 }, b: { yPercent: 16 } };
  function buildCut(fig) {
    var img = $('img', fig), pre = PRE[fig.getAttribute('data-cut')] || PRE.a, tiles = [], o = 0.2;
    pre.forEach(function (r) {
      var tl = d.createElement('div'), c = img.cloneNode(false);
      tl.className = 'cut__t';
      var ins = 'inset(' + Math.max(0, r[1] - o) + '% ' + Math.max(0, 100 - r[0] - r[2] - o) + '% ' + Math.max(0, 100 - r[1] - r[3] - o) + '% ' + Math.max(0, r[0] - o) + '%)';
      tl.style.clipPath = ins; tl.style.webkitClipPath = ins;
      c.removeAttribute('data-i18n-attr'); c.removeAttribute('fetchpriority'); c.alt = ''; c.setAttribute('aria-hidden', 'true');
      tl.appendChild(c); fig.appendChild(tl);
      tl._from = FROM[r[4]]; tiles.push(tl);
    });
    fig.classList.add('is-js');
    return tiles;
  }
  function cuts() {
    if (!ANIM) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var fig = en.target; io.unobserve(fig);
        var img = $('img', fig);
        var go = function () {
          var n = fig._tiles.length;
          fig._tiles.forEach(function (tl, i) {
            G.fromTo(tl, Object.assign({ opacity: 0 }, tl._from), {
              xPercent: 0, yPercent: 0, opacity: 1, duration: 1, delay: i * 0.09, ease: 'power3.out',
              onComplete: i === n - 1 ? function () { fig.classList.add('is-done'); } : null
            });
          });
        };
        if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
      });
    }, { threshold: 0.18 });
    $$('.cut:not([data-manual])').forEach(function (fig) {
      fig._tiles = buildCut(fig);
      G.set(fig._tiles, { opacity: 0 });
      io.observe(fig);
    });
  }

  /* ---------- герой: лист раскраивается и собирается в кухню ---------- */
  function hero() {
    var scene = $('#scene'), heroEl = $('.hero');
    if (!scene || !ANIM) return;
    heroEl.classList.add('is-anim');
    var photo = $('.scene__photo', scene), tiles = buildCut(photo);
    var cam = $('#cam', scene), saw = $('.sc-saw', scene);
    var parts = $$('.pt', scene), cutl = $$('.cutl', scene), labels = $$('.lb', scene);
    var order = [].concat($$('.pt--col', scene), $$('.pt--plinth', scene), $$('.pt--low', scene), $$('.pt--shelf', scene), $$('.pt--niche', scene), $$('.pt--up', scene), $$('.pt--top', scene));

    G.set(cam, { svgOrigin: '395 548', scale: 1.1, x: -25, y: -183 });
    parts.forEach(function (p) {
      G.set(p, { transformOrigin: '50% 50%', x: +p.getAttribute('data-dx'), y: +p.getAttribute('data-dy'), rotation: +p.getAttribute('data-r'), autoAlpha: 0 });
    });
    G.set(cutl, { strokeDashoffset: 1 });
    G.set('.sheet__b', { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
    G.set([labels, '.sc-led', '.sc-deco', '.sc-ghost', '.sc-holes', saw], { autoAlpha: 0 });
    tiles.forEach(function (tl) { G.set(tl, Object.assign({ opacity: 0 }, tl._from)); });

    var steps = $$('.scene__cap .st', scene);
    var tl = G.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    tl.to('.sheet__b', { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 0)
      .to('.sheet__b', { fillOpacity: 1, duration: 0.4 }, 0.2)
      .to(parts, { autoAlpha: 0.55, duration: 0.35, stagger: 0.01 }, 0.4)
      .set(saw, { autoAlpha: 1 }, 0.55);
    var tc = 0.55;
    cutl.forEach(function (c) {
      var x1 = +c.getAttribute('x1'), y1 = +c.getAttribute('y1'), x2 = +c.getAttribute('x2'), y2 = +c.getAttribute('y2');
      var dur = Math.abs(x2 - x1) > 200 ? 0.11 : 0.06;
      tl.to(c, { strokeDashoffset: 0, duration: dur, ease: 'none' }, tc)
        .fromTo(saw, { attr: { cx: x1, cy: y1 } }, { attr: { cx: x2, cy: y2 }, duration: dur, ease: 'none', immediateRender: false }, tc);
      tc += dur + 0.01;
    });
    tl.to(saw, { autoAlpha: 0, duration: 0.15 }, tc)
      .to(parts, { autoAlpha: 1, duration: 0.3 }, tc - 0.2)
      .to(labels, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, 0.7)
      .addLabel('cut', tc + 0.3);
    var t0 = tc + 0.35;
    tl.to(labels, { autoAlpha: 0, duration: 0.25 }, t0)
      .to(cam, { scale: 1, x: 0, y: 0, duration: 0.8, ease: 'power2.inOut' }, t0)
      .to('.sc-ghost', { autoAlpha: 1, duration: 0.4 }, t0 + 0.1);
    var tp = t0 + 0.25;
    order.forEach(function (p) {
      tl.to(p, { x: 0, rotation: 0, duration: 0.3, ease: 'power2.inOut' }, tp)
        .to(p, { y: 0, duration: 0.45, ease: 'power3.out' }, tp + 0.2);
      tp += 0.05;
    });
    var te = tp + 0.5;
    tl.to('.sc-led', { autoAlpha: 1, duration: 0.35 }, te)
      .to('.sc-deco', { autoAlpha: 1, duration: 0.3 }, te)
      .to(['.sc-sheet', '.sc-cuts'], { autoAlpha: 0, duration: 0.5 }, te);
    var tf = te + 0.35;
    tiles.forEach(function (ti, i) {
      tl.to(ti, { xPercent: 0, yPercent: 0, opacity: 1, duration: 0.7 }, tf + i * 0.06);
    });
    tl.to(['.sc-parts', '.sc-led', '.sc-deco', '.sc-ghost'], { autoAlpha: 0, duration: 0.4 }, tf + 0.7);
    /* подпись этапов следует за таймлайном и при прокрутке назад */
    var marks = [0, 0.55, tf];
    tl.eventCallback('onUpdate', function () {
      var t = tl.time();
      steps.forEach(function (st, i) { st.classList.toggle('is-on', t >= marks[i]); });
    });
    tl.progress(0.0001).progress(0);

    var floor = tl.labels.cut / tl.duration();
    var auto = G.to(tl, { progress: 1, duration: tl.duration(), ease: 'none', paused: true });
    var seen = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { seen.disconnect(); if (!taken) auto.play(); }
    }, { threshold: 0.35 });
    seen.observe(scene);
    var taken = false;

    var mm = G.matchMedia();
    mm.add('(min-width: 901px) and (min-height: 600px)', function () {
      var camTl = G.timeline({
        scrollTrigger: {
          trigger: heroEl, start: 'top top', end: '+=75%', pin: true, scrub: 0.5, anticipatePin: 1,
          onUpdate: function (self) {
            var sp = self.progress * 1.12;
            if (!taken && self.progress > 0.04 && auto.progress() < 1 && sp > tl.progress()) { taken = true; auto.kill(); }
            if (taken) G.to(tl, { progress: Math.min(1, Math.max(sp, floor)), duration: 0.4, ease: 'power2.out', overwrite: true });
          }
        }
      });
      camTl.to(scene, { scale: 1.07, xPercent: -5, ease: 'none', duration: 1 }, 0)
        .to('.shop__far', { xPercent: 2.5, ease: 'none', duration: 1 }, 0)
        .to('.hero__map', { xPercent: -2, ease: 'none', duration: 1 }, 0);
    });

    new IntersectionObserver(function (es) {
      heroEl.classList.toggle('is-off', !es[0].isIntersecting);
    }).observe(heroEl);

    /* вход текста первого экрана - CSS-анимацией в styles.css: текст рисуется сразу, без ожидания скриптов */
  }

  /* ---------- появление блоков ---------- */
  function reveals() {
    if (!ANIM) return;
    ST.batch('.sec .kick, .sec .h2, .sec .lead, .strip li, .extra, .kids__txt > *, .pro__list li, .cond__list li, .cond__r > .btn, .form > *, .cont__dl > div, .cont__btns, .map, .case, .card figcaption, .ba figcaption', {
      start: 'top 88%', once: true,
      onEnter: function (els) { G.to(els, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }); }
    });
    G.set('.sec .kick, .sec .h2, .sec .lead, .strip li, .extra, .kids__txt > *, .pro__list li, .cond__list li, .cond__r > .btn, .form > *:not([hidden]), .cont__dl > div, .cont__btns, .map, .case, .card figcaption, .ba figcaption', { y: 26, opacity: 0 });

    $$('.ph__draw').forEach(function (g) {
      G.from(g.children, { strokeDashoffset: 1, duration: 1.3, stagger: 0.08, ease: 'power2.inOut', scrollTrigger: { trigger: g, start: 'top 80%', once: true } });
    });
    $$('.solo__lines path').forEach(function (p) {
      G.from(p, { strokeDashoffset: 1, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
    });
  }

  /* ---------- плиты услуг ---------- */
  function plates() {
    if (!ANIM) return;
    var mm = G.matchMedia();
    mm.add('(min-width: 901px)', function () {
      var list = $$('.plate');
      list.forEach(function (p, i) {
        var txt = $$('.plate__txt > *', p);
        G.from(txt, { y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 55%', once: true } });
        var next = list[i + 1]; if (!next) return;
        G.to($('.plate__in', p), { scale: 0.93, yPercent: -3, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
        G.to(p, { '--dim': 0.6, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
      });
    });
  }

  /* ---------- производство: модуль в разборе ---------- */
  function production() {
    var draw = $('#proDraw'), list = $('#proList');
    if (!draw) return;
    draw.setAttribute('data-fin', 'ivory');
    $$('.sw', draw).forEach(function (b) {
      b.addEventListener('click', function () {
        draw.setAttribute('data-fin', b.getAttribute('data-fin'));
        $$('.sw', draw).forEach(function (o) { var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', String(on)); });
      });
    });
    $$('li', list).forEach(function (li) {
      var on = function () { draw.setAttribute('data-hi', li.getAttribute('data-part')); $$('li', list).forEach(function (o) { o.classList.toggle('is-on', o === li); }); };
      var off = function () { draw.removeAttribute('data-hi'); li.classList.remove('is-on'); };
      li.addEventListener('mouseenter', on); li.addEventListener('focus', on); li.addEventListener('click', on);
      li.addEventListener('mouseleave', off); li.addEventListener('blur', off);
    });
    if (!ANIM) return;
    $$('[data-ex]', draw).forEach(function (el) {
      var ex = el.getAttribute('data-ex').split(',');
      G.from(el, { x: +ex[0], y: +ex[1], ease: 'none', scrollTrigger: { trigger: draw, start: 'top 88%', end: 'center 48%', scrub: 0.6 } });
    });
  }

  /* ---------- шаги ---------- */
  function steps() {
    var el = $('#steps'); if (!el || !ANIM) return;
    var lis = $$('li', el);
    el.style.setProperty('--p', 0);
    ST.create({
      trigger: el, start: 'top 78%', end: 'bottom 62%', scrub: 0.4,
      onUpdate: function (self) {
        el.style.setProperty('--p', self.progress.toFixed(4));
        lis.forEach(function (li, i) { li.classList.toggle('is-on', self.progress >= i / lis.length + 0.02); });
      }
    });
  }

  /* ---------- лента работ ---------- */
  function lane() {
    var el = $('#lane'), prev = $('#lanePrev'), next = $('#laneNext'); if (!el) return;
    function step() { var c = el.firstElementChild, g = parseFloat(getComputedStyle(el).columnGap) || 20; return c.getBoundingClientRect().width + g; }
    function upd() {
      var max = el.scrollWidth - el.clientWidth;
      prev.hidden = next.hidden = max < 4;
      prev.disabled = el.scrollLeft < 4; next.disabled = el.scrollLeft > max - 4;
    }
    prev.addEventListener('click', function () { el.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { el.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }); });
    el.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    onLoad(upd);
  }

  /* ---------- бегущая строка ---------- */
  function marquee() {
    var tr = $('.mq__track'); if (!tr) return;
    $$('.mq__set', tr).slice(1).forEach(function (n) { tr.removeChild(n); });
    var set = $('.mq__set', tr), w = set.getBoundingClientRect().width; if (!w) return;
    var n = Math.ceil(window.innerWidth / w) + 1;
    for (var i = 0; i < n; i++) tr.appendChild(set.cloneNode(true));
    tr.style.setProperty('--mqw', w + 'px');
    tr.style.setProperty('--mqd', Math.round(w / 60) + 's');
    if (RM) tr.style.animation = 'none';
  }

  /* ---------- петля видео ---------- */
  function video() {
    $$('.vloop').forEach(function (box) {
      var v = $('video', box); if (!v || RM) return;
      v.addEventListener('playing', function () { box.classList.add('is-live'); });
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) {
          if (!v.src) v.src = box.getAttribute('data-src');
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      }, { threshold: 0.5 }).observe(box);
    });
  }

  /* ---------- заявка ---------- */
  function form() {
    var f = $('#form'); if (!f) return;
    var ph = $('#f-phone');
    ph.addEventListener('input', function () { ph.classList.remove('is-err'); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var digits = ph.value.replace(/\D/g, '');
      if (digits.length < 10) { ph.classList.add('is-err'); ph.focus(); return; }
      var type = $('input[name="type"]:checked', f);
      var txt = t('wa.form')
        .replace('{type}', type ? type.nextElementSibling.textContent : '-')
        .replace('{name}', $('#f-name').value.trim() || '-')
        .replace('{phone}', ph.value.trim())
        .replace('{comment}', $('#f-comment').value.trim() || '-');
      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      var ok = $('#formOk'); ok.hidden = false;
      if (G) G.fromTo(ok, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 });
    });
  }

  /* ---------- запуск ---------- */
  function start() {
    root.classList.add('is-ready');
    $$('.scene img[data-lsrc]').forEach(function (i) { i.src = i.getAttribute('data-lsrc'); i.removeAttribute('data-lsrc'); });
    fitHero(); setWa(); hero(); cuts(); reveals(); plates(); production(); steps(); lane(); marquee(); video(); form();
    var q = new URLSearchParams(location.search).get('lang'), saved = null;
    try { saved = localStorage.getItem('velor_lang'); } catch (e) {}
    var want = q === 'kk' || q === 'ru' ? q : saved;
    if (want === 'kk') setLang('kk', false);
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', function () { fitHero(); if (ST) ST.refresh(); });
    onLoad(function () { fitHero(); if (ST) ST.refresh(); });
    var rt, rw = window.innerWidth; window.addEventListener('resize', function () {
      if (window.innerWidth === rw) return; rw = window.innerWidth;
      fitHero(); clearTimeout(rt); rt = setTimeout(marquee, 200);
    });
    /* прямой переход по ссылке с якорем (реклама): после закрепления героя высоты меняются, догоняем цель */
    if (location.hash.length > 1) {
      var target = null; try { target = $(location.hash); } catch (e) {}
      if (target) onLoad(function () {
        setTimeout(function () { if (ST) ST.refresh(); var y = Math.max(0, absTop(target)); if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }, 60);
      });
    }
  }
  if (d.fonts && d.fonts.ready) {
    var done = false, go = function () { if (!done) { done = true; start(); } };
    d.fonts.ready.then(go); setTimeout(go, 1200);
  } else start();
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var libs = reduce ? [] : ['assets/vendor/gsap.min.js', 'assets/vendor/ScrollTrigger.min.js', 'assets/vendor/lenis.min.js'];
  function next() {
    var src = libs.shift(); if (!src) return boot();
    var s = document.createElement('script'); s.src = src; s.onload = s.onerror = next; document.head.appendChild(s);
  }
  if (window.requestAnimationFrame) requestAnimationFrame(function () { setTimeout(next, 0); }); else next();
})();
