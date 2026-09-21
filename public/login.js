import { api } from './api.js';

const MIN_PASSWORD_LENGTH = 8;

const MODES = {
  login: {
    title: 'Entrar',
    submitLabel: 'Entrar',
    switchText: 'Ainda não tem conta?',
    switchLabel: 'Criar conta',
    passwordAutocomplete: 'current-password',
    submit: api.login,
  },
  register: {
    title: 'Criar conta',
    submitLabel: 'Criar conta',
    switchText: 'Já tem uma conta?',
    switchLabel: 'Entrar',
    passwordAutocomplete: 'new-password',
    submit: api.register,
  },
};

const dom = {
  title: document.getElementById('auth-title'),
  form: document.getElementById('auth-form'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  passwordHint: document.getElementById('password-hint'),
  error: document.getElementById('auth-error'),
  submit: document.getElementById('auth-submit'),
  switchText: document.getElementById('switch-text'),
  switchMode: document.getElementById('switch-mode'),
};

let mode = 'login';

function showError(message) {
  dom.error.textContent = message;
  dom.error.hidden = false;
}

function hideError() {
  dom.error.hidden = true;
}

function applyMode(nextMode) {
  mode = nextMode;
  const config = MODES[mode];
  const isRegister = mode === 'register';

  document.title = `${config.title} — Contador de Caixa`;
  dom.title.textContent = config.title;
  dom.submit.textContent = config.submitLabel;
  dom.switchText.textContent = config.switchText;
  dom.switchMode.textContent = config.switchLabel;
  dom.password.autocomplete = config.passwordAutocomplete;
  dom.password.minLength = isRegister ? MIN_PASSWORD_LENGTH : 0;
  dom.passwordHint.hidden = !isRegister;
  hideError();
}

async function handleSubmit(event) {
  event.preventDefault();
  hideError();
  dom.submit.disabled = true;

  try {
    await MODES[mode].submit({ email: dom.email.value, password: dom.password.value });
    window.location.replace('/');
  } catch (error) {
    showError(error.message);
    dom.submit.disabled = false;
  }
}

dom.form.addEventListener('submit', handleSubmit);
dom.switchMode.addEventListener('click', () => applyMode(mode === 'login' ? 'register' : 'login'));
