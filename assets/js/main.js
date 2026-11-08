/* Nay Beleza & Estética — interactions.
   Brand name is one swappable constant: change BRAND_NAME and every
   [data-brand] slot updates. Static HTML already carries the name, so the
   site stays readable if JS fails. */
(function () {
  'use strict';
  var BRAND_NAME = 'Nay Beleza & Estética';
  document.documentElement.classList.add('js');

  /* Brand constant slots */
  document.querySelectorAll('[data-brand]').forEach(function (el) {
    el.textContent = BRAND_NAME;
  });

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  /* Entrance reveals (rest state is visible if JS or IO fails) */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Hero masked line-rise */
  document.querySelectorAll('.hero h1 .line > span').forEach(function (span, i) {
    setTimeout(function () { span.classList.add('in'); }, reduce ? 0 : 120 * i);
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    var panel = item.querySelector('.faq__a');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq__a').style.maxHeight = null;
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      } else {
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* Content calendar — coral "today" marker from the real weekday */
  var todayIdx = new Date().getDay(); /* 0 = domingo … 6 = sábado */
  document.querySelectorAll('.week-strip__day[data-dow]').forEach(function (el) {
    if (parseInt(el.getAttribute('data-dow'), 10) === todayIdx) {
      el.classList.add('week-strip__day--today');
    }
  });
  document.querySelectorAll('.day-card[data-dow]').forEach(function (card) {
    if (parseInt(card.getAttribute('data-dow'), 10) === todayIdx) {
      card.classList.add('day-card--today');
      var flag = card.querySelector('.today-flag');
      if (flag) flag.hidden = false;
    }
  });

  /* Gallery → Agendamento: pre-select the chosen style's service */
  var params = new URLSearchParams(window.location.search);
  var estilo = params.get('estilo');
  var serviceSelect = document.getElementById('servico');
  var styleNote = document.getElementById('estilo-escolhido');
  if (estilo && serviceSelect) {
    var map = {
      'loiro': 'Coloração', 'cachos': 'Corte', 'escova': 'Escova',
      'festa': 'Penteado', 'sobrancelha': 'Design de sobrancelha'
    };
    if (map[estilo]) serviceSelect.value = map[estilo];
    if (styleNote) {
      var labels = {
        'loiro': 'Loiro iluminado', 'cachos': 'Cachos definidos',
        'escova': 'Escova modelada volumosa', 'festa': 'Penteado de festa',
        'sobrancelha': 'Sobrancelha + make leve'
      };
      styleNote.textContent = 'Estilo escolhido: ' + (labels[estilo] || estilo) +
        ' — conte nos detalhes o que você quer.';
      styleNote.hidden = false;
    }
  }

  /* Booking form — field-tied errors + success state (demo: no backend) */
  var form = document.getElementById('booking-form');
  if (form) {
    var success = document.getElementById('form-success');
    function setError(field, message) {
      var wrap = field.closest('.field') || field.closest('.consent');
      if (!wrap) return;
      wrap.classList.add('field--error');
      var err = wrap.querySelector('.field__error');
      if (err) err.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    }
    function clearError(field) {
      var wrap = field.closest('.field') || field.closest('.consent');
      if (!wrap) return;
      wrap.classList.remove('field--error');
      field.removeAttribute('aria-invalid');
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('input', function () { clearError(f); });
      f.addEventListener('change', function () { clearError(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;
      function fail(field, msg) {
        setError(field, msg);
        ok = false;
        if (!firstBad) firstBad = field;
      }
      var nome = document.getElementById('nome');
      var telefone = document.getElementById('telefone');
      var servico = document.getElementById('servico');
      var dia = document.getElementById('dia');
      var horario = document.getElementById('horario');
      var lgpd = document.getElementById('lgpd');
      if (!nome.value.trim() || nome.value.trim().length < 2) {
        fail(nome, 'Digite seu nome completo.');
      }
      var digits = telefone.value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) {
        fail(telefone, 'Digite um telefone válido com DDD, ex.: (71) 98659-5586.');
      }
      if (!servico.value) fail(servico, 'Escolha um serviço.');
      if (!dia.value) fail(dia, 'Escolha o dia preferido.');
      if (!horario.value) fail(horario, 'Escolha o horário preferido.');
      if (!lgpd.checked) {
        fail(lgpd, 'Para enviar, confirme que você concorda com o uso dos seus dados para o agendamento.');
      }
      if (!ok) {
        if (firstBad) firstBad.focus();
        return;
      }
      form.hidden = true;
      if (success) {
        success.classList.add('show');
        success.querySelector('h3').focus && success.querySelector('h3').setAttribute('tabindex', '-1');
        success.querySelector('h3').focus();
      }
    });
  }
})();
