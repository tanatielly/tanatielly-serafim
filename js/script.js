// ===============================================
// script.js — toda a interatividade do portfólio
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initActiveNavOnScroll();
  initTerminalTyping();
  initCounters();
  initContactForm();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* -----------------------------------------------------------------------
 * 1) TEMA CLARO / ESCURO
 * Guarda a preferência do usuário no localStorage para persistir entre visitas.
 * --------------------------------------------------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');

  // Aplica o tema salvo (ou o padrão escuro) assim que a página carrega
  if (stored === 'light') {
    root.classList.add('theme-light');
    btn.setAttribute('aria-pressed', 'true');
  }

  btn.addEventListener('click', () => {
    const isLight = root.classList.toggle('theme-light');
    btn.setAttribute('aria-pressed', String(isLight));
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

/* -----------------------------------------------------------------------
 * 2) MENU RESPONSIVO (mobile)
 * --------------------------------------------------------------------- */
function initMobileMenu() {
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuToggle');

  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha o menu automaticamente ao escolher um link (melhora a navegação no celular)
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* -----------------------------------------------------------------------
 * 3) DESTACAR O LINK DA SEÇÃO VISÍVEL NA NAVEGAÇÃO
 * Usa IntersectionObserver para saber qual seção está na tela no momento.
 * --------------------------------------------------------------------- */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.nav__link');

  const linkFor = id => [...links].find(l => l.getAttribute('href') === `#${id}`);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = linkFor(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* -----------------------------------------------------------------------
 * 4) EFEITO DE DIGITAÇÃO NO TERMINAL DO HERO
 * --------------------------------------------------------------------- */
function initTerminalTyping() {
  const target = document.getElementById('typeTarget');
  const ready = document.getElementById('terminalReady');
  const text = 'Tanatielly Serafim — Engenheira de Automação & IA';
  let i = 0;

  function type() {
    if (i <= text.length) {
      target.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 38);
    } else {
      // Quando termina de "digitar", revela a linha de status
      target.classList.remove('terminal__type');
      ready.hidden = false;
    }
  }
  type();
}

/* -----------------------------------------------------------------------
 * 5) CONTADORES ANIMADOS DA FAIXA DE MÉTRICAS
 * Só inicia a contagem quando o elemento entra na tela.
 * --------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.metric__value');

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(c => observer.observe(c));
}

/* -----------------------------------------------------------------------
 * 6) VALIDAÇÃO E ENVIO DO FORMULÁRIO DE CONTATO
 * O envio usa o FormSubmit (formsubmit.co), que repassa a mensagem por e-mail.
 * --------------------------------------------------------------------- */
function initContactForm() {
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/tanatielly.serafim26@gmail.com';

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  const honey = document.getElementById('honey');
  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');

  const fields = {
    name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
    message: { input: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, message) {
    field.input.closest('.field').classList.toggle('has-error', Boolean(message));
    field.error.textContent = message || '';
  }

  function validate() {
    let valid = true;

    // Nome: obrigatório
    if (!fields.name.input.value.trim()) {
      setError(fields.name, 'Informe seu nome.');
      valid = false;
    } else {
      setError(fields.name, '');
    }

    // E-mail: obrigatório e em formato válido
    const emailValue = fields.email.input.value.trim();
    if (!emailValue) {
      setError(fields.email, 'Informe seu e-mail.');
      valid = false;
    } else if (!emailPattern.test(emailValue)) {
      setError(fields.email, 'Digite um e-mail válido (ex: usuario@dominio.com).');
      valid = false;
    } else {
      setError(fields.email, '');
    }

    // Mensagem: obrigatória
    if (!fields.message.input.value.trim()) {
      setError(fields.message, 'Escreva uma mensagem.');
      valid = false;
    } else {
      setError(fields.message, '');
    }

    return valid;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // O envio é feito via fetch, sem recarregar a página

    if (!validate()) return;

    const name = fields.name.input.value.trim();
    const buttonLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    status.textContent = '';

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email: fields.email.input.value.trim(), // o FormSubmit usa este campo como Reply-To
          message: fields.message.input.value.trim(),
          _subject: `Novo contato pelo portfólio — ${name}`,
          _template: 'table',
          _honey: honey.value,
        }),
      });
      const data = await res.json();

      // O FormSubmit devolve "success" como string ("true" / "false")
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message);

      form.reset();
      openModal();
    } catch {
      // Mantém o que foi digitado para a pessoa poder tentar de novo
      status.textContent = 'Não foi possível enviar agora. Tente novamente ou me escreva em tanatielly.serafim26@gmail.com.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = buttonLabel;
    }
  });

  // Limpa o erro de um campo assim que o usuário volta a digitar nele
  Object.values(fields).forEach(field => {
    field.input.addEventListener('input', () => setError(field, ''));
  });

  function openModal() {
    modal.hidden = false;
    modalClose.focus();
  }
  function closeModal() {
    modal.hidden = true;
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
}
