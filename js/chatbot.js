(function () {
  'use strict';

  const OPENING = "Hi! I’m Brino Assistant 👋 Tell me a little about what you’re looking for, and I’ll help you from here.";
  const TEMPORARY_ERROR = "I’m sorry—I’m having trouble connecting right now. Please try again shortly, or email the Brino team at luckystardiner@gmail.com.";
  const state = {
    open: false,
    messages: [],
    waiting: false,
    sessionId: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
  };

  const root = document.createElement('div');
  root.className = 'brino-chat';
  root.innerHTML = `
    <button class="brino-chat__launcher" aria-label="Open Brino Assistant" aria-expanded="false">
      <span class="brino-chat__launcher-icon" aria-hidden="true">✦</span>
      <span class="brino-chat__badge" hidden>1</span>
    </button>
    <section class="brino-chat__panel" aria-label="Brino Assistant" aria-hidden="true">
      <header class="brino-chat__header">
        <div class="brino-chat__identity"><span class="brino-chat__mark">B</span><div><strong>Brino Assistant</strong><span><i></i> Here to help</span></div></div>
        <div class="brino-chat__actions">
          <button data-action="new" aria-label="New conversation" title="New conversation">↻</button>
          <button data-action="minimize" aria-label="Minimize chat" title="Minimize">−</button>
          <button data-action="close" aria-label="Close chat" title="Close">×</button>
        </div>
      </header>
      <div class="brino-chat__messages" aria-live="polite"></div>
      <form class="brino-chat__form">
        <label class="sr-only" for="brino-chat-input">Message Brino Assistant</label>
        <textarea id="brino-chat-input" rows="1" maxlength="2500" placeholder="Type your message…"></textarea>
        <button type="submit" aria-label="Send message">➤</button>
      </form>
      <p class="brino-chat__privacy">Please don’t share passwords or payment information.</p>
    </section>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.brino-chat__panel');
  const launcher = root.querySelector('.brino-chat__launcher');
  const badge = root.querySelector('.brino-chat__badge');
  const messagesEl = root.querySelector('.brino-chat__messages');
  const form = root.querySelector('.brino-chat__form');
  const input = root.querySelector('textarea');
  const sendButton = form.querySelector('button');

  function time() { return new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
  function escapeHtml(value) { const element = document.createElement('div'); element.textContent = value; return element.innerHTML; }
  function linkify(value) { return escapeHtml(value).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(role, text) {
    state.messages.push({ role, content: text });
    const item = document.createElement('div');
    item.className = `brino-chat__message brino-chat__message--${role}`;
    item.innerHTML = `<div class="brino-chat__bubble">${linkify(text)}</div><time>${time()}</time>`;
    messagesEl.appendChild(item);
    scrollDown();
    if (role === 'assistant' && !state.open) badge.hidden = false;
  }

  function typing(show) {
    let indicator = messagesEl.querySelector('.brino-chat__typing');
    if (show && !indicator) {
      indicator = document.createElement('div');
      indicator.className = 'brino-chat__typing';
      indicator.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(indicator);
      scrollDown();
    }
    if (!show && indicator) indicator.remove();
  }

  function setWaiting(waiting) {
    state.waiting = waiting;
    input.disabled = waiting;
    sendButton.disabled = waiting;
    typing(waiting);
  }

  async function askAI(text) {
    addMessage('user', text);
    setWaiting(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.messages.slice(-24), sessionId: state.sessionId })
      });
      if (!response.ok) throw new Error('AI unavailable');
      const data = await response.json();
      addMessage('assistant', data.reply || TEMPORARY_ERROR);
    } catch (_) {
      addMessage('assistant', TEMPORARY_ERROR);
    } finally {
      setWaiting(false);
      input.focus();
    }
  }

  function openChat() {
    state.open = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    badge.hidden = true;
    input.focus();
    if (!state.messages.length) addMessage('assistant', OPENING);
  }

  function closeChat() {
    state.open = false;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
  }

  function reset() {
    state.messages = [];
    state.sessionId = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    messagesEl.innerHTML = '';
    addMessage('assistant', OPENING);
    input.focus();
  }

  launcher.addEventListener('click', () => state.open ? closeChat() : openChat());
  root.querySelector('[data-action="minimize"]').addEventListener('click', closeChat);
  root.querySelector('[data-action="close"]').addEventListener('click', closeChat);
  root.querySelector('[data-action="new"]').addEventListener('click', reset);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value || state.waiting) return;
    input.value = '';
    askAI(value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  setTimeout(() => { if (!state.open && !state.messages.length) badge.hidden = false; }, 4500);
})();
