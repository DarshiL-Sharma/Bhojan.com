/* ==========================================================================
   Bhojan.com — main.js  ("Spice & Glow")
   Shared across all pages. Every block checks its elements exist first,
   so this one file is safe to include everywhere.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientParticles();
  initAuthTabs();
  initScrollReveal();
  initTiltSpotlights();
  initRippleButtons();
  initCountUp();
  initAllergyChips();
  initFAQ();
  initGreeting();
  initOrderCardFormatting();
  initChatDashboard();
  initOrderTracking();
  initActiveNavLink();
});

/* ---------------------------------------------------------------------- *
 * 0. Ambient floating food-emoji particles (behind everything)
 * ---------------------------------------------------------------------- */
function initAmbientParticles() {
  const layer = document.querySelector('.food-particles');
  if (!layer) return;
  const emojis = ['🌶️', '🍛', '🍚', '🥘', '🍲', '✨'];
  const count = window.innerWidth < 700 ? 10 : 18;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = Math.random() * 100 + '%';
    span.style.fontSize = (Math.random() * 1.2 + 0.9) + 'rem';
    const duration = Math.random() * 10 + 14;
    span.style.animationDuration = duration + 's';
    span.style.animationDelay = -(Math.random() * duration) + 's';
    layer.appendChild(span);
  }
}

/* ---------------------------------------------------------------------- *
 * 1. About.html — Sign in / Register tab switching with sliding pill
 * ---------------------------------------------------------------------- */
function initAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  if (!tabs.length) return;
  const indicator = document.querySelector('.auth-tab-indicator');

  function switchTab(id, btn, index) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    if (indicator) indicator.classList.toggle('pos-1', index === 1);
  }

  function switchTabByName(id) {
    const index = id === 'login' ? 0 : 1;
    switchTab(id, tabs[index], index);
  }

  tabs[0].addEventListener('click', () => switchTab('login', tabs[0], 0));
  tabs[1].addEventListener('click', () => switchTab('register', tabs[1], 1));

  document.querySelectorAll('[data-switch-tab]').forEach(link => {
    link.addEventListener('click', () => switchTabByName(link.dataset.switchTab));
  });

  if (window.location.hash === '#register') switchTabByName('register');
}

/* ---------------------------------------------------------------------- *
 * 2. Scroll reveal for cards/steps
 * ---------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.feature-card, .order-card, .step, .quick-stat');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  targets.forEach((el, i) => { el.style.animationDelay = `${i * 80}ms`; });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------------------- *
 * 3. Cursor-tracked spotlight + light 3D tilt on cards
 * ---------------------------------------------------------------------- */
function initTiltSpotlights() {
  const spotlightEls = document.querySelectorAll('.feature-card, .order-card');
  spotlightEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    });
  });

  const tiltEls = document.querySelectorAll('.tilt-card');
  tiltEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------------- *
 * 4. Ripple effect on every button
 * ---------------------------------------------------------------------- */
function initRippleButtons() {
  const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-submit, button[type="submit"], form button');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}

/* ---------------------------------------------------------------------- *
 * 5. Count-up stats
 * ---------------------------------------------------------------------- */
function initCountUp() {
  const nums = document.querySelectorAll('.stat-num, .quick-stat .num');
  if (!nums.length || !('IntersectionObserver' in window)) return;

  function animateNum(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/[\d.]+/);
    if (!match) return;
    const target = parseFloat(match[0]);
    const suffix = raw.replace(match[0], '');
    const duration = 900;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (target * eased).toFixed(match[0].includes('.') ? 1 : 0);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNum(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------------------- *
 * 6. Secrets.html — combine checked allergy chips into one hidden field
 * ---------------------------------------------------------------------- */
function initAllergyChips() {
  const combined = document.getElementById('allergies-combined');
  if (!combined) return;
  const form = combined.closest('form');
  form.addEventListener('submit', () => {
    const checked = Array.from(document.querySelectorAll('[name^="allergy_"]:checked')).map(c => c.value);
    combined.value = checked.join(', ') || 'None';
  });
}

/* ---------------------------------------------------------------------- *
 * 7. FAQ accordion (About.html)
 * ---------------------------------------------------------------------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;
  items.forEach(item => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => { i.classList.remove('open'); i.querySelector('.faq__answer').style.maxHeight = null; });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ---------------------------------------------------------------------- *
 * 8. Home.html — time-of-day greeting
 * ---------------------------------------------------------------------- */
function initGreeting() {
  const el = document.getElementById('greeting-time');
  if (!el) return;
  const hour = new Date().getHours();
  el.textContent = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/* ---------------------------------------------------------------------- *
 * 9. Home.html — zero-pad order ids, compute quick stats client-side
 * ---------------------------------------------------------------------- */
function initOrderCardFormatting() {
  const idEls = document.querySelectorAll('[data-order-id]');
  idEls.forEach(el => {
    const id = el.dataset.orderId;
    el.textContent = '#' + String(id).padStart(4, '0');
  });

  const statusEls = document.querySelectorAll('[data-order-status]');
  if (!statusEls.length) return;
  const total = statusEls.length;
  const active = Array.from(statusEls).filter(el => el.dataset.orderStatus !== 'Delivered').length;
  const delivered = total - active;

  const totalEl = document.getElementById('stat-total');
  const activeEl = document.getElementById('stat-active');
  const deliveredEl = document.getElementById('stat-delivered');
  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (deliveredEl) deliveredEl.textContent = delivered;
}

/* ---------------------------------------------------------------------- *
 * 10. dashboard.html — live chat over Socket.IO, bubble UI
 * ---------------------------------------------------------------------- */
function initials(name) {
  if (!name) return '?';
  return name.trim()[0].toUpperCase();
}

function buildBubble({ username, email, timestamp, message }) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-bubble';
  wrap.innerHTML = `
    <div class="chat-avatar">${initials(username)}</div>
    <div class="chat-bubble__content">
      <span class="username">${username}</span><span class="meta">${email ? '(' + email + ') — ' : ''}${timestamp}</span>
      <div class="chat-bubble__text">${message}</div>
    </div>
  `;
  return wrap;
}

function initChatDashboard() {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox || typeof io === 'undefined') return;

  const socket = io();
  const input = document.getElementById('msg-input');
  const btn = document.getElementById('send-btn');

  function send() {
    const text = input.value.trim();
    if (!text) return;
    socket.emit('send_message', { message: text });
    input.value = '';
  }

  btn.addEventListener('click', send);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') send(); });

  socket.on('receive_message', (data) => {
    chatBox.appendChild(buildBubble(data));
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ---------------------------------------------------------------------- *
 * 11. track.html — Leaflet map + Socket.IO live delivery updates
 * ---------------------------------------------------------------------- */
const DELIVERY_STAGES = ['Placed', 'Paid', 'Out for Delivery', 'Delivered'];

function updateProgressUI(status) {
  const wrap = document.getElementById('progress-track');
  if (!wrap) return;
  const idx = Math.max(0, DELIVERY_STAGES.indexOf(status));

  wrap.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('done', i <= idx);
    dot.classList.toggle('current', i === idx);
  });
  wrap.querySelectorAll('.line-fill').forEach((fill, i) => {
    fill.style.setProperty('--fill', i < idx ? '100%' : '0%');
  });
  document.querySelectorAll('.progress-labels span').forEach((label, i) => {
    label.classList.toggle('active', i <= idx);
  });

  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.innerHTML = `Status: <span class="pill" data-status="${status}">${status}</span>`;
}

function initOrderTracking() {
  if (!window.__ORDER__) return;
  updateProgressUI(window.__ORDER__.status);

  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const { orderId, path, deliveryStage } = window.__ORDER__;
  let currentStage = deliveryStage;

  const map = L.map('map').setView([path[currentStage].lat, path[currentStage].lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const routeLine = L.polyline(path.map(p => [p.lat, p.lng]), { color: '#FF3D5A', weight: 3, dashArray: '6,6' }).addTo(map);
  map.fitBounds(routeLine.getBounds());

  let marker = L.marker([path[currentStage].lat, path[currentStage].lng])
    .addTo(map)
    .bindPopup(path[currentStage].label)
    .openPopup();

  const socket = io();
  socket.emit('join_tracking', { order_id: orderId });

  socket.on('delivery_update', (data) => {
    marker.setLatLng([data.point.lat, data.point.lng]);
    marker.bindPopup(data.point.label).openPopup();
    updateProgressUI(data.status);
    if (data.status === 'Delivered') {
      document.getElementById('advance-btn')?.remove();
    }
  });

  document.getElementById('advance-btn')?.addEventListener('click', () => {
    socket.emit('advance_delivery', { order_id: orderId });
  });
}

/* ---------------------------------------------------------------------- *
 * 12. Highlight the active nav link based on current path
 * ---------------------------------------------------------------------- */
function initActiveNavLink() {
  const links = document.querySelectorAll('.topnav__links a[href]');
  if (!links.length) return;
  const path = window.location.pathname.replace(/\/$/, '');
  links.forEach(link => {
    try {
      const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
      if (linkPath && linkPath === path) link.classList.add('is-active');
    } catch (e) { /* ignore malformed hrefs */ }
  });
}
