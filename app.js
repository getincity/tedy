/* ══════════════════════════════════════════
   GIC BROADBAND — Main Application Script
   ══════════════════════════════════════════ */

'use strict';

/* ── CURSOR ── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursor.style.left = tx + 'px'; cursor.style.top = ty + 'px'; });
  function animTrail() { cx += (tx - cx) * .12; cy += (ty - cy) * .12; trail.style.left = cx + 'px'; trail.style.top = cy + 'px'; requestAnimationFrame(animTrail); }
  animTrail();
  document.querySelectorAll('button, a, input, select, textarea, label').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width = '20px'; cursor.style.height = '20px'; cursor.style.background = 'var(--cyan)'; });
    el.addEventListener('mouseleave', () => { cursor.style.width = '12px'; cursor.style.height = '12px'; cursor.style.background = 'var(--purple)'; });
  });
})();

/* ── NAV SCROLL ── */
(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    const links = nav.querySelector('.nav-links');
    if (!links) return;
    if (links.style.display === 'flex') {
      links.style.display = '';
    } else {
      links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(7,15,31,.97);padding:2rem;gap:1.5rem;border-bottom:1px solid var(--glass-border)';
    }
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      const links = nav.querySelector('.nav-links');
      if (links && window.innerWidth < 768) links.style.display = '';
    });
  });
})();

/* ── SCROLL REVEAL ── */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── STATS COUNTER ── */
(function initStats() {
  const nums = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => observer.observe(n));
})();

/* ── PROGRESS BARS ── */
(function initProgressBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.net-card').forEach(card => observer.observe(card));
})();

/* ── HERO CANVAS ── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(168,85,247,', 'rgba(59,130,246,', 'rgba(6,182,212,'];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * 2000 - 500,
      y: Math.random() * 1200 - 100,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r: Math.random() * 2 + .5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * .6 + .1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * .15;
          ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
          ctx.lineWidth = .5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -100) p.x = W + 100;
      if (p.x > W + 100) p.x = -100;
      if (p.y < -100) p.y = H + 100;
      if (p.y > H + 100) p.y = -100;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── GLOBE CANVAS ── */
(function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = 400;
  const H = canvas.height = 400;
  const cx = W / 2, cy = H / 2, r = 160;
  let angle = 0;
  const dots = [];

  for (let lat = -80; lat <= 80; lat += 12) {
    for (let lon = -180; lon < 180; lon += 15) {
      dots.push({ lat: lat * Math.PI / 180, lon: lon * Math.PI / 180 });
    }
  }

  const nodes = Array.from({ length: 18 }, () => ({
    lat: (Math.random() * 160 - 80) * Math.PI / 180,
    lon: Math.random() * Math.PI * 2,
    pulse: Math.random() * Math.PI * 2,
  }));

  function project(lat, lon) {
    const rotLon = lon + angle;
    const x = r * Math.cos(lat) * Math.sin(rotLon);
    const y = r * Math.sin(lat);
    const z = r * Math.cos(lat) * Math.cos(rotLon);
    return { x: cx + x, y: cy - y, z };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    angle += 0.004;

    // Globe base glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(168,85,247,0.04)');
    grad.addColorStop(1, 'rgba(168,85,247,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,85,247,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dots
    dots.forEach(d => {
      const p = project(d.lat, d.lon);
      if (p.z > 0) {
        const alpha = (p.z / r) * 0.5 + 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,150,255,${alpha})`;
        ctx.fill();
      }
    });

    // Glowing nodes
    nodes.forEach(n => {
      n.pulse += 0.04;
      const p = project(n.lat, n.lon);
      if (p.z > 0) {
        const pulse = Math.sin(n.pulse) * 0.5 + 0.5;
        const pr = 4 + pulse * 4;
        const grad2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 2);
        grad2.addColorStop(0, `rgba(168,85,247,${0.8 * (p.z / r)})`);
        grad2.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad2;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,85,247,${(p.z / r)})`;
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── LIVE DASHBOARD ── */
(function initDashboard() {
  function updateTime() {
    const el = document.getElementById('dashTime');
    if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
  }
  updateTime();
  setInterval(updateTime, 1000);

  const sparklines = {
    latencySparkline: [],
    nodeSparkline: [],
    throughputSparkline: [],
  };

  function makeSparkline(containerId, values, color) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    const max = Math.max(...values, 1);
    values.forEach(v => {
      const bar = document.createElement('div');
      bar.style.cssText = `width:6px;background:${color};border-radius:2px;height:${(v/max)*100}%;opacity:0.7;transition:height .3s`;
      el.appendChild(bar);
    });
  }

  function updateMetrics() {
    // Latency
    const lat = (2.8 + Math.random() * 0.8).toFixed(1);
    const latEl = document.getElementById('latency');
    if (latEl) latEl.innerHTML = lat + '<span class="dm-unit">ms</span>';
    sparklines.latencySparkline.push(parseFloat(lat));
    if (sparklines.latencySparkline.length > 12) sparklines.latencySparkline.shift();
    makeSparkline('latencySparkline', sparklines.latencySparkline, '#a855f7');

    // Nodes
    const nodes = (3980 + Math.floor(Math.random() * 40));
    const nodeEl = document.getElementById('nodeCount');
    if (nodeEl) nodeEl.innerHTML = (nodes/1000).toFixed(1) + '<span class="dm-unit">k</span>';
    sparklines.nodeSparkline.push(nodes);
    if (sparklines.nodeSparkline.length > 12) sparklines.nodeSparkline.shift();
    makeSparkline('nodeSparkline', sparklines.nodeSparkline, '#06b6d4');

    // Throughput
    const tp = (7.8 + Math.random() * 1.2).toFixed(1);
    const tpEl = document.getElementById('throughput');
    if (tpEl) tpEl.innerHTML = tp + '<span class="dm-unit">Gbps</span>';
    sparklines.throughputSparkline.push(parseFloat(tp));
    if (sparklines.throughputSparkline.length > 12) sparklines.throughputSparkline.shift();
    makeSparkline('throughputSparkline', sparklines.throughputSparkline, '#3b82f6');
  }

  updateMetrics();
  setInterval(updateMetrics, 2000);
})();

/* ── BILLING TOGGLE ── */
window.toggleBilling = function() {
  const yearly = document.getElementById('billingToggle').checked;
  document.querySelectorAll('.monthly-price').forEach(el => el.style.display = yearly ? 'none' : 'inline');
  document.querySelectorAll('.yearly-price').forEach(el => el.style.display = yearly ? 'inline' : 'none');
};

/* ── PLAN SELECTION ── */
window.selectPlan = function(planName) {
  const select = document.getElementById('fplan');
  if (select) select.value = planName;
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
};

/* ── COVERAGE CHECKER ── */
const COVERED_PINCODES = [
  // Mumbai
  ...Array.from({length:104}, (_,i) => String(400001+i)),
  // Thane
  ...Array.from({length:15}, (_,i) => String(400601+i)),
  // Pune
  ...Array.from({length:48}, (_,i) => String(411001+i)),
  // Navi Mumbai
  ...Array.from({length:10}, (_,i) => String(400701+i)),
  // Nashik
  ...Array.from({length:13}, (_,i) => String(422001+i)),
  // Aurangabad
  ...Array.from({length:10}, (_,i) => String(431001+i)),
];

window.checkCoverage = function() {
  const input = document.getElementById('pincodeInput');
  const resultEl = document.getElementById('coverageResult');
  const pincode = input.value.trim();

  if (!/^\d{6}$/.test(pincode)) {
    resultEl.innerHTML = `<div class="result-card unavailable"><span class="result-icon">⚠️</span><div><div>Please enter a valid 6-digit pincode</div></div></div>`;
    return;
  }

  const available = COVERED_PINCODES.includes(pincode);

  if (available) {
    resultEl.innerHTML = `
      <div class="result-card available">
        <span class="result-icon">✅</span>
        <div>
          <div>Great news! GIC Broadband is available at <strong>${pincode}</strong></div>
          <div class="result-sub">Installation within 48 hours · All plans available</div>
        </div>
      </div>`;
    // Prefill form
    const fpincode = document.getElementById('fpincode');
    if (fpincode) fpincode.value = pincode;
  } else {
    resultEl.innerHTML = `
      <div class="result-card unavailable">
        <span class="result-icon">📍</span>
        <div>
          <div>Not available at <strong>${pincode}</strong> yet</div>
          <div class="result-sub">We're expanding! Register interest and we'll notify you first.</div>
        </div>
      </div>`;
  }
};

document.getElementById('pincodeInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') window.checkCoverage();
});

/* ── LEAD FORM SUBMISSION ── */
window.submitLead = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('formSubmit');
  const successEl = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');
  const submitText = document.getElementById('submitText');

  successEl.style.display = 'none';
  errorEl.style.display = 'none';
  btn.disabled = true;
  submitText.textContent = 'Submitting…';

  const lead = {
    name: document.getElementById('fname').value.trim(),
    phone: document.getElementById('fphone').value.trim(),
    address: document.getElementById('faddress').value.trim(),
    plan: document.getElementById('fplan').value,
    pincode: document.getElementById('fpincode').value.trim(),
    installDate: document.getElementById('fdate').value,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  try {
    if (window.gicFirebase && window.gicFirebase.addLead) {
      await window.gicFirebase.addLead(lead);
      successEl.style.display = 'block';
      document.getElementById('leadForm').reset();
    } else {
      // Fallback: log and show success (Firebase not configured)
      console.log('[GIC] Lead submitted (Firebase not connected):', lead);
      successEl.style.display = 'block';
      document.getElementById('leadForm').reset();
    }
  } catch (err) {
    errorEl.textContent = 'Error submitting form: ' + err.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    submitText.textContent = 'Submit Request';
  }
};

/* ── ADMIN AUTH ── */
window.adminLogin = async function() {
  const email = document.getElementById('adminEmail').value.trim();
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('authError');
  errEl.textContent = '';

  if (!email || !pass) { errEl.textContent = 'Please fill in all fields.'; return; }

  try {
    if (window.gicFirebase && window.gicFirebase.loginAdmin) {
      await window.gicFirebase.loginAdmin(email, pass);
      showAdminPanel(email);
    } else {
      // Demo mode fallback
      if (email === 'admin@gicbroadband.in' && pass === 'admin123') {
        showAdminPanel(email);
        loadDemoLeads();
      } else {
        errEl.textContent = 'Invalid credentials. Demo: admin@gicbroadband.in / admin123';
      }
    }
  } catch (err) {
    errEl.textContent = err.message || 'Login failed.';
  }
};

function showAdminPanel(email) {
  document.getElementById('adminAuth').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('adminUserInfo').textContent = '🔐 Logged in as: ' + email;
  if (window.gicFirebase && window.gicFirebase.loadLeads) {
    window.gicFirebase.loadLeads().then(renderLeads);
  }
}

window.adminLogout = function() {
  if (window.gicFirebase && window.gicFirebase.logoutAdmin) window.gicFirebase.logoutAdmin();
  document.getElementById('adminAuth').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
};

function loadDemoLeads() {
  const demo = [
    { id: 'demo1', name: 'Arjun Sharma', phone: '+91 98765 43210', plan: 'Surge', pincode: '400001', createdAt: '2025-01-15T10:30:00Z', status: 'installed' },
    { id: 'demo2', name: 'Priya Mehta', phone: '+91 87654 32109', plan: 'Nova', pincode: '411001', createdAt: '2025-01-16T14:22:00Z', status: 'contacted' },
    { id: 'demo3', name: 'Rahul Verma', phone: '+91 76543 21098', plan: 'Pulse', pincode: '400601', createdAt: '2025-01-17T09:15:00Z', status: 'new' },
    { id: 'demo4', name: 'Sneha Patil', phone: '+91 65432 10987', plan: 'Apex', pincode: '400701', createdAt: '2025-01-17T16:45:00Z', status: 'new' },
  ];
  renderLeads(demo);
}

function renderLeads(leads) {
  const tbody = document.getElementById('leadsBody');
  const total = document.getElementById('totalLeads');
  const pending = document.getElementById('pendingLeads');
  const installed = document.getElementById('installedLeads');

  if (!leads || leads.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-leads">No leads yet</td></tr>';
    return;
  }

  if (total) total.textContent = leads.length;
  if (pending) pending.textContent = leads.filter(l => l.status === 'new').length;
  if (installed) installed.textContent = leads.filter(l => l.status === 'installed').length;

  tbody.innerHTML = leads.map((lead, i) => `
    <tr>
      <td style="color:var(--text-dim)">${i + 1}</td>
      <td style="font-weight:600">${esc(lead.name)}</td>
      <td style="font-family:var(--font-mono);font-size:.8rem">${esc(lead.phone)}</td>
      <td><span style="color:var(--cyan);font-weight:600">${esc(lead.plan)}</span></td>
      <td style="font-family:var(--font-mono)">${esc(lead.pincode)}</td>
      <td style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-dim)">${new Date(lead.createdAt).toLocaleDateString('en-IN')}</td>
      <td><span class="status-badge ${lead.status}">${lead.status}</span></td>
      <td>
        <select class="status-select" onchange="updateLeadStatus('${lead.id}', this.value)">
          <option value="new" ${lead.status==='new'?'selected':''}>New</option>
          <option value="contacted" ${lead.status==='contacted'?'selected':''}>Contacted</option>
          <option value="installed" ${lead.status==='installed'?'selected':''}>Installed</option>
          <option value="cancelled" ${lead.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

window.updateLeadStatus = async function(id, status) {
  if (window.gicFirebase && window.gicFirebase.updateLead) {
    try { await window.gicFirebase.updateLead(id, { status }); } catch (err) { console.error(err); }
  } else {
    console.log(`[GIC] Demo: Update lead ${id} status → ${status}`);
  }
};

/* ── AI CHATBOT ── */
window.toggleChatbot = function() {
  const win = document.getElementById('chatbotWindow');
  win.style.display = win.style.display === 'none' ? 'flex' : 'none';
  if (win.style.display === 'flex') {
    win.style.flexDirection = 'column';
    document.getElementById('chatInput')?.focus();
  }
};

window.sendChat = async function() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  // User message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.innerHTML = `<div class="msg-bubble">${esc(text)}</div>`;
  messages.appendChild(userMsg);

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot typing';
  typing.innerHTML = '<div class="msg-bubble"></div>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  try {
    let reply;
    if (window.gicFirebase && window.gicFirebase.chatWithAI) {
      reply = await window.gicFirebase.chatWithAI(text);
    } else {
      // Local smart fallback
      reply = localChatResponse(text);
    }
    typing.remove();
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.innerHTML = `<div class="msg-bubble">${esc(reply)}</div>`;
    messages.appendChild(botMsg);
  } catch (err) {
    typing.remove();
    const errMsg = document.createElement('div');
    errMsg.className = 'chat-msg bot';
    errMsg.innerHTML = `<div class="msg-bubble">Sorry, I'm having trouble connecting. Call us at 1800-GIC-FAST!</div>`;
    messages.appendChild(errMsg);
  }

  messages.scrollTop = messages.scrollHeight;
};

function localChatResponse(text) {
  const t = text.toLowerCase();
  if (t.includes('plan') || t.includes('best') || t.includes('recommend') || t.includes('which')) {
    return "For home streaming & gaming, our **Surge plan (200 Mbps, ₹899/mo)** is the most popular. Power users and home offices love **Nova (1 Gbps, ₹1799/mo)**. For 4K streaming on 1-2 devices, **Pulse (50 Mbps, ₹499/mo)** works great!";
  }
  if (t.includes('price') || t.includes('cost') || t.includes('₹') || t.includes('rs')) {
    return "Our plans start at ₹499/mo (Pulse - 50Mbps), going up to ₹899/mo (Surge - 200Mbps) and ₹1799/mo (Nova - 1Gbps). Enterprise Apex pricing is custom. Switch to yearly billing to save 20%!";
  }
  if (t.includes('cover') || t.includes('area') || t.includes('city') || t.includes('available')) {
    return "We currently cover Mumbai (400001-400104), Thane (400601-400615), Pune (411001-411048), Navi Mumbai, Nashik, and Aurangabad. Use our Coverage Checker above to verify your exact pincode!";
  }
  if (t.includes('install') || t.includes('setup') || t.includes('connect')) {
    return "Installation is done within 48 hours of order confirmation! Our technician visits, sets up the fibre line, and ensures everything is working. We handle the entire setup — you just sit back.";
  }
  if (t.includes('speed') || t.includes('fast') || t.includes('mbps') || t.includes('gbps')) {
    return "Our network delivers up to 10 Gbps peak speed. Consumer plans range from 50 Mbps to 1 Gbps. We guarantee at least 90% of your subscribed speed at all times — backed by our 99.97% uptime SLA.";
  }
  if (t.includes('support') || t.includes('help') || t.includes('problem') || t.includes('issue')) {
    return "We offer 24×7×365 support! Reach us at 1800-GIC-FAST (toll-free), hello@gicbroadband.in, or via live chat here. Our AI network also proactively detects and resolves issues before you notice them!";
  }
  if (t.includes('cancel') || t.includes('refund') || t.includes('contract')) {
    return "No contracts, no lock-ins! Cancel anytime with 30 days notice. We offer a 7-day satisfaction guarantee — if you're not happy, we'll refund your first month.";
  }
  if (t.includes('wifi') || t.includes('router') || t.includes('equipment')) {
    return "Yes! We provide a free premium Wi-Fi 6 router with all plans. The router supports the latest 802.11ax standard for the best wireless performance throughout your home.";
  }
  return "Great question! I'd recommend speaking with our team for personalized advice. Call us at **1800-GIC-FAST** (toll-free) or fill in the contact form above — we'll reach out within 2 hours! 🚀";
}

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── PLAN CARD HOVER PARALLAX ── */
document.querySelectorAll('.plan-card, .story-card, .net-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(600px) rotateX(${-y*6}deg) rotateY(${x*6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .5s ease';
    setTimeout(() => card.style.transition = '', 500);
  });
});

console.log('%c GIC Broadband ', 'background:linear-gradient(135deg,#a855f7,#06b6d4);color:white;font-size:16px;font-weight:bold;padding:8px 16px;border-radius:4px;');
console.log('%c AI-Native Network · v1.0 ', 'color:#a855f7;font-size:12px');
