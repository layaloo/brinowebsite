(function () {
  'use strict';

  const OPENING = "Hi! I’m Brino Assistant 👋 Tell me a little about what you’re looking for, and I’ll help you from here.";
  const FALLBACK = "I don’t want to guess. I can help you explore our services, recommend a direction, or connect you with the Brino team.";
  const EMAIL = 'luckystardiner@gmail.com';
  const services = {
    'Branding & Identity': 'Build a clear, memorable identity with strategy and a cohesive visual system.',
    'Digital Marketing': 'Create a joined-up growth plan across the digital channels that fit your audience.',
    'Social Media': 'Plan, create, and manage content that makes your brand consistent and engaging.',
    'Content Creation': 'Turn your expertise and story into useful, on-brand content.',
    'SEO': 'Improve how the right customers discover your business through search.',
    'Paid Advertising': 'Reach targeted audiences with campaigns built to learn and improve.',
    'Web Design': 'Create a polished, responsive website that makes the next step clear.'
  };

  const state = {
    open: false,
    messages: [],
    mode: null,
    step: 0,
    answers: {},
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
        <textarea id="brino-chat-input" rows="1" maxlength="1800" placeholder="Type your message…"></textarea>
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

  function time() { return new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
  function escapeHtml(value) { const d = document.createElement('div'); d.textContent = value; return d.innerHTML; }
  function linkify(value) {
    return escapeHtml(value).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(role, text, options = {}) {
    state.messages.push({ role, content: text });
    const item = document.createElement('div');
    item.className = `brino-chat__message brino-chat__message--${role}`;
    item.innerHTML = `<div class="brino-chat__bubble">${linkify(text)}${options.html || ''}</div><time>${time()}</time>`;
    messagesEl.appendChild(item);
    scrollDown();
    if (role === 'assistant' && !state.open) badge.hidden = false;
  }

  function quick() { scrollDown(); }

  function menu() {
    state.mode = null; state.step = 0; state.answers = {};
    quick(['Explore services', 'Recommend a service', 'View our work', 'Request a quote', 'Book a consultation', 'Contact Brino', 'FAQs', { label: 'العربية', value: 'Arabic menu' }]);
  }

  function openChat() {
    state.open = true; panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true'); badge.hidden = true; input.focus();
    if (!state.messages.length) { addMessage('assistant', OPENING); menu(); }
  }
  function closeChat() { state.open = false; panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); launcher.setAttribute('aria-expanded', 'false'); }
  function reset() { state.messages = []; state.mode = null; state.answers = {}; messagesEl.innerHTML = ''; addMessage('assistant', OPENING); menu(); }

  function showServices() {
    addMessage('assistant', `Brino can help with ${Object.keys(services).join(', ')}. Tell me which one interests you, or describe your goal and I’ll point you in the right direction.`);
    quick([...Object.keys(services), 'Main menu']);
  }

  const recommendationQuestions = [
    ['What is your main goal right now?', ['Launch a brand', 'Get more leads', 'Improve visibility', 'Build a website', 'Grow social media']],
    ['What stage is your business at?', ['New idea', 'Early-stage business', 'Established business']],
    ['What is the biggest challenge?', ['Unclear brand', 'Low website traffic', 'Not enough enquiries', 'Inconsistent content', 'Website needs improvement']],
    ['When would you like to begin?', ['As soon as possible', 'Within 1–3 months', 'Just researching']]
  ];
  const leadQuestions = [
    ['name', 'What should we call you?'], ['business', 'What is your business or brand name?'],
    ['email', 'What email address should the team reply to?'], ['goal', 'Briefly, what would you like help with?'],
    ['timeline', 'What is your preferred timeline?'], ['budget', 'Do you have a comfortable budget range? You can say “not sure”.']
  ];

  function askRecommendation() {
    const q = recommendationQuestions[state.step];
    if (!q) return finishRecommendation();
    addMessage('assistant', q[0]); quick([...q[1], 'Main menu']);
  }
  function finishRecommendation() {
    const text = Object.values(state.answers).join(' ').toLowerCase();
    let pick = 'Digital Marketing';
    if (/brand|unclear/.test(text)) pick = 'Branding & Identity';
    else if (/website/.test(text)) pick = 'Web Design';
    else if (/traffic|visibility/.test(text)) pick = 'SEO';
    else if (/social|content/.test(text)) pick = 'Social Media';
    else if (/lead|enquir/.test(text)) pick = 'Digital Marketing';
    addMessage('assistant', `Based on your answers, I’d start with ${pick}. ${services[pick]} A short discovery conversation would help Brino confirm the best scope—this is a recommendation, not a promise of results.`);
    state.mode = null; quick(['Request a quote', 'Explore services', 'Main menu']);
  }

  function askLead() {
    const q = leadQuestions[state.step];
    if (!q) return leadSummary();
    addMessage('assistant', q[1]); quick(['Main menu']);
  }
  function leadSummary() {
    const a = state.answers;
    addMessage('assistant', `Please check your details before anything is shared:\n\nName: ${a.name}\nBusiness: ${a.business}\nEmail: ${a.email}\nGoal: ${a.goal}\nTimeline: ${a.timeline}\nBudget: ${a.budget}\n\nIs this correct?`);
    state.mode = 'lead-review'; quick(['Confirm details', 'Start over', 'Main menu']);
  }
  function consent() {
    addMessage('assistant', `With your permission, I’ll prepare an email to ${EMAIL} using these details. Nothing is sent until you review and send it from your own email app. Do you consent?`);
    state.mode = 'consent'; quick(['Yes, prepare email', 'No, keep chatting', 'Main menu']);
  }
  function prepareEmail() {
    const a = state.answers;
    const subject = encodeURIComponent(`Brino project enquiry from ${a.name}`);
    const body = encodeURIComponent(`Name: ${a.name}\nBusiness: ${a.business}\nEmail: ${a.email}\nGoal: ${a.goal}\nTimeline: ${a.timeline}\nBudget: ${a.budget}`);
    const href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    addMessage('assistant', 'Your email is ready. Please review it before sending.', { html: `<a class="brino-chat__cta" href="${href}">Open email draft</a>` });
    state.mode = null; state.answers = {}; quick(['Explore services', 'Main menu']);
  }

  function handleChoice(choice) {
    addMessage('user', choice);
    const normalized = choice.trim().toLowerCase()
      .replace(/[.!?]+$/g, '')
      .replace(/\bu\b/g, 'you')
      .replace(/\bur\b/g, 'your')
      .replace(/\bpls\b|\bplz\b/g, 'please')
      .replace(/\bwanna\b/g, 'want to');
    const isYes = /^(yes|yeah|yep|sure|okay|ok|absolutely|sounds good|go ahead|confirm|correct|نعم|أكيد|تمام)$/.test(normalized);
    const isNo = /^(no|nope|not now|maybe later|لا|ليس الآن)$/.test(normalized);
    if (/^(main menu|menu|start over|restart)$/.test(normalized)) { addMessage('assistant', 'Of course—what would you like help with?'); return menu(); }
    if (state.mode === 'recommend') { state.answers[`q${state.step}`] = choice; state.step += 1; return askRecommendation(); }
    if (state.mode === 'lead-review') {
      if (isYes || /confirm|correct/.test(normalized)) return consent();
      if (isNo || /edit|change|wrong/.test(normalized)) { state.mode = 'lead'; state.step = 0; state.answers = {}; addMessage('assistant', 'No problem—let’s update them from the beginning.'); return askLead(); }
    }
    if (state.mode === 'consent') {
      if (isYes || /prepare|consent|agree/.test(normalized)) return prepareEmail();
      if (isNo) { addMessage('assistant', 'No problem—your details have not been sent. What would you like to explore instead?'); return menu(); }
    }
    const previousAssistant = [...state.messages].reverse().find((message) => message.role === 'assistant')?.content.toLowerCase() || '';
    if (isYes && /quote|estimate|consultation|start a project/.test(previousAssistant)) {
      state.mode = 'lead'; state.step = 0; state.answers = {};
      addMessage('assistant', 'Great—I’ll ask for a few details one at a time, then show you a summary. Nothing will be shared without your permission.');
      return askLead();
    }
    if (isYes && /recommend|right direction|right service/.test(previousAssistant)) {
      state.mode = 'recommend'; state.step = 0; state.answers = {};
      return askRecommendation();
    }
    const serviceAliases = [
      ['Branding & Identity', /brand|branding|brand identity|visual identity|logo|rebrand|new identity/],
      ['Web Design', /website|web site|new site|redesign.*site|site redesign|landing page|ecommerce|e-commerce|online store/],
      ['SEO', /\bseo\b|search engine|rank on google|google ranking|organic traffic|show up on google/],
      ['Social Media', /social media|instagram|tiktok|facebook|linkedin|social posts|manage.*social/],
      ['Content Creation', /content|blog|articles|copywriting|photo|video|reels|creative posts/],
      ['Paid Advertising', /paid ads|advertising|ad campaign|google ads|meta ads|facebook ads|ppc|paid campaign/],
      ['Digital Marketing', /digital marketing|marketing strategy|more customers|more clients|more leads|grow.*business|increase sales/]
    ];
    const directService = Object.keys(services).find((name) => normalized === name.toLowerCase() || normalized.includes(name.toLowerCase()));
    const aliasService = serviceAliases.find(([, pattern]) => pattern.test(normalized))?.[0];
    const serviceName = directService || aliasService;

    let intent = choice;
    if (/quote|quotation|estimate|proposal|price for|cost for|how much.*project|start (a )?project|work with you|hire you|become a client|عرض سعر/.test(normalized)) intent = 'Request a quote';
    else if (/(consultation|consult|book|schedule|arrange|set up).*(call|meeting|appointment)|book a call|call me|meet.*team|speak.*specialist|استشارة/.test(normalized)) intent = 'Book a consultation';
    else if (/recommend|recommendation|suggest|suggestion|advise|advice|which service|right service|best service|help me choose|not sure.*need|do not know.*need|اقتراح/.test(normalized)) intent = 'Recommend a service';
    else if (/\bservices?\b|servies|serivces|what can you do|what do you (do|offer|provide)|what you offer|how can you help|ways you can help|help.*business|خدمات/.test(normalized)) intent = 'Explore services';
    else if (/portfolio|your work|previous work|past work|examples|case stud|success stor|results|who.*worked with|your clients|مشاريع|أعمال/.test(normalized)) intent = 'View our work';
    else if (/(contact|email|reach|get in touch|speak to|talk to|chat with).*(team|person|human|someone)|contact|email address|human agent|real person|تواصل/.test(normalized)) intent = 'Contact Brino';
    else if (/faq|common questions/.test(normalized)) intent = 'FAQs';

    if (serviceName && intent === choice) { addMessage('assistant', `${services[serviceName]} Because every project is different, Brino will confirm scope, timing, and pricing after learning about your needs. What would you like to know about it?`); return; }

    switch (intent) {
      case 'Explore services': return showServices();
      case 'Recommend a service': state.mode = 'recommend'; state.step = 0; state.answers = {}; return askRecommendation();
      case 'View our work': addMessage('assistant', 'Explore Brino’s featured work and Lucky Star Diner client story on our Clients page.', { html: '<a class="brino-chat__cta" href="clients.html">View our work</a>' }); return quick(['Explore services', 'Request a quote', 'Main menu']);
      case 'Request a quote': case 'Start a project': case 'Book a consultation': state.mode = 'lead'; state.step = 0; state.answers = {}; addMessage('assistant', 'Great—I’ll ask for a few details one at a time, then show you a summary. Nothing will be shared without your permission.'); return askLead();
      case 'Contact Brino': addMessage('assistant', `You can contact the Brino team at ${EMAIL}. Please avoid including passwords or payment information.`, { html: `<a class="brino-chat__cta" href="mailto:${EMAIL}">Email Brino</a>` }); return quick(['Request a quote', 'Main menu']);
      case 'FAQs': addMessage('assistant', 'People often ask about pricing, project timelines, expected results, and how to get started. Which of those would you like to know about?'); return;
      case 'How much does it cost?': addMessage('assistant', 'Pricing depends on the service, scope, and complexity. Brino won’t quote blindly—we can collect a few details so the team can prepare a suitable estimate.'); return quick(['Request a quote', 'Main menu']);
      case 'How long does a project take?': addMessage('assistant', 'Timelines depend on the service and scope. Once Brino understands your goals and required deliverables, the team can confirm a realistic schedule.'); return quick(['Book a consultation', 'Main menu']);
      case 'Do you guarantee results?': addMessage('assistant', 'No responsible agency can guarantee specific marketing results. Brino focuses on thoughtful strategy, strong execution, measurement, and continuous improvement.'); return quick(['Explore services', 'Main menu']);
      case 'Careers or partnerships': addMessage('assistant', `Brino welcomes thoughtful introductions, although I can’t confirm current openings or partnerships. Send a short note to ${EMAIL}.`, { html: `<a class="brino-chat__cta" href="mailto:${EMAIL}">Introduce yourself</a>` }); return quick(['Main menu']);
      case 'Arabic menu': addMessage('assistant', 'أهلًا! يمكنني مساعدتك في استكشاف خدمات برينو، اختيار الحل الأنسب، مشاهدة أعمالنا، أو التواصل مع الفريق. ماذا تفضّل؟'); return quick([{label:'استكشاف الخدمات',value:'Explore services'},{label:'اقتراح خدمة',value:'Recommend a service'},{label:'طلب عرض سعر',value:'Request a quote'},{label:'التواصل مع برينو',value:'Contact Brino'}]);
      default: return sendToAI(choice);
    }
  }

  function typing(show) {
    let el = messagesEl.querySelector('.brino-chat__typing');
    if (show && !el) { el = document.createElement('div'); el.className = 'brino-chat__typing'; el.innerHTML = '<span></span><span></span><span></span>'; messagesEl.appendChild(el); scrollDown(); }
    if (!show && el) el.remove();
  }
  async function sendToAI(text) {
    typing(true);
    try {
      const history = state.messages.slice(-10).map(({ role, content }) => ({ role: role === 'assistant' ? 'assistant' : 'user', content }));
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, sessionId: state.sessionId }) });
      if (!res.ok) throw new Error('Unavailable');
      const data = await res.json(); typing(false); addMessage('assistant', data.reply || FALLBACK); quick(['Explore services', 'Recommend a service', 'View our work', 'Request a quote', 'Book a consultation', 'Contact Brino', 'Main menu']);
    } catch (_) { typing(false); addMessage('assistant', `${FALLBACK}\n\nYou can also email us at ${EMAIL}.`); quick(['Explore services', 'Recommend a service', 'Contact Brino', 'Main menu']); }
  }

  launcher.addEventListener('click', () => state.open ? closeChat() : openChat());
  root.querySelector('[data-action="minimize"]').addEventListener('click', closeChat);
  root.querySelector('[data-action="close"]').addEventListener('click', closeChat);
  root.querySelector('[data-action="new"]').addEventListener('click', reset);
  form.addEventListener('submit', (event) => {
    event.preventDefault(); const value = input.value.trim(); if (!value) return; input.value = '';
    if (state.mode === 'lead') { const [key] = leadQuestions[state.step]; state.answers[key] = value; addMessage('user', value); state.step += 1; askLead(); }
    else handleChoice(value);
  });
  input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  setTimeout(() => { if (!state.open && !state.messages.length) { badge.hidden = false; } }, 4500);
})();
