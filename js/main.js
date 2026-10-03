(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* nav: scrolled state, progress bar, back-to-top, parallax */
  var nav = $('.nav'), bar = $('.progress'), fab = $('.fab');
  var parts = $$('[data-speed]'), ticking = false;
  function onScroll() {
    var st = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', st > 20);
    if (bar) bar.style.setProperty('--p', max > 0 ? (st / max).toFixed(4) : 0);
    if (fab) fab.classList.toggle('show', st > 700);
    if (!reduce) parts.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      var off = (r.top + r.height / 2 - window.innerHeight / 2) * parseFloat(el.getAttribute('data-speed'));
      el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  if (fab) fab.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  $$('.totop').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); });

  /* mobile menu */
  var btn = $('.menu-btn'), menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) setMenu(false); });
  }

  /* reveal on scroll (plays again when you scroll back to it) */
  var rv = $$('[data-r],.steps');
  if ('IntersectionObserver' in window && !reduce) {
    // clipped (wipe) elements are watched through their parent, because a fully clipped box never counts as visible
    var map = new Map();
    rv.forEach(function (el) {
      var t = el.getAttribute('data-r') === 'wipe' ? el.parentElement : el;
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(el);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var list = map.get(e.target) || [];
        if (e.isIntersecting) list.forEach(function (x) { x.classList.add('in'); });
        else if (e.boundingClientRect.top > 0 || e.boundingClientRect.bottom < 0) list.forEach(function (x) { x.classList.remove('in'); });
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    map.forEach(function (_, t) { io.observe(t); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* hero art follows the pointer a little */
  var hero = $('.hero');
  if (hero && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var layers = $$('.layer', hero);
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth')) || 10;
        l.style.transform = 'translate(' + (x * d).toFixed(1) + 'px,' + (yy * d).toFixed(1) + 'px)';
      });
    });
  }

  /* FAQ accordion */
  $$('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      $$('.faq-q').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      q.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* portfolio filter + viewer */
  var fb = $$('.filters button'), items = $$('.pf');
  fb.forEach(function (b) {
    b.addEventListener('click', function () {
      fb.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var f = b.getAttribute('data-filter');
      items.forEach(function (it) { it.classList.add('out'); });
      setTimeout(function () {
        items.forEach(function (it) {
          var show = f === 'all' || it.getAttribute('data-cat') === f;
          it.hidden = !show;
          if (show) requestAnimationFrame(function () { it.classList.remove('out'); });
        });
      }, reduce ? 0 : 320);
      var c = $('#count'); if (c) c.textContent = items.filter(function (it) { return f === 'all' || it.getAttribute('data-cat') === f; }).length + ' concepts shown';
    });
  });
  var dlg = $('#viewer');
  if (dlg && dlg.showModal) {
    items.forEach(function (it) {
      $('button', it).addEventListener('click', function () {
        $('#viewer-img', dlg).src = $('img', it).getAttribute('src');
        $('#viewer-img', dlg).alt = $('img', it).getAttribute('alt');
        $('#viewer-title', dlg).textContent = $('strong', it).textContent;
        $('#viewer-type', dlg).textContent = $('small', it).textContent;
        dlg.showModal();
      });
    });
    $('.dlg-x', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* contact form */
  var form = $('#contact-form');
  if (form) {
    var msg = $('#form-msg'), email = form.getAttribute('data-email'), sub = $('button[type=submit]', form);
    var q = new URLSearchParams(location.search).get('service');
    if (q) { $$('option', form.service).forEach(function (o) { if (o.value === q) form.service.value = q; }); }
    function bad(f, on) { f.closest('.field').classList.toggle('bad', on); f.setAttribute('aria-invalid', on); }
    ['name', 'email', 'message'].forEach(function (n) { form[n].addEventListener('input', function () { bad(form[n], false); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      var checks = { name: form.name.value.trim().length > 1, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()), message: form.message.value.trim().length > 4 };
      Object.keys(checks).forEach(function (k) { bad(form[k], !checks[k]); if (!checks[k]) { ok = false; first = first || form[k]; } });
      if (!ok) { msg.className = 'form-msg no'; msg.textContent = 'Please fix the fields marked in red.'; first.focus(); return; }
      sub.disabled = true; var label = sub.firstChild.textContent; sub.firstChild.textContent = 'Opening your email app...';
      msg.className = 'form-msg'; msg.textContent = '';
      var subject = 'Project idea: ' + form.service.value;
      var body = 'Name: ' + form.name.value.trim() + '\nEmail: ' + form.email.value.trim() + '\nService: ' + form.service.value + '\n\n' + form.message.value.trim();
      setTimeout(function () {
        window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        msg.className = 'form-msg ok';
        msg.innerHTML = 'Your email is ready to send. If nothing opened, write to ' + email + ' <button type="button" class="copy-btn" id="copy">Copy email</button>';
        $('#copy').addEventListener('click', function () {
          var b = this;
          (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = email; });
        });
        sub.disabled = false; sub.firstChild.textContent = label;
      }, reduce ? 0 : 700);
    });
  }
})();
