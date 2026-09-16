/**
 * 吳奕霆 • AIoT Personal Portal & Dynamic Timekeeper (L2Web)
 * Educational & Architectural Reference Implementation
 * 
 * Core Features:
 * 1. Single Consolidated State Management (localStorage)
 * 2. Real-Time High-Precision Clock Engine (requestAnimationFrame)
 * 3. Asynchronous Portfolio Data Loader (fetch('./projects.json'))
 * 4. Procedural Web Audio API Clock Synthesizer
 * 5. Responsive Glassmorphic Drawer & Theme Switcher (Aurora, Minimal, Sunset)
 * 6. Zen / Focus Ambient Desk Clock Mode
 */

(function () {
  'use strict';

  const THEMES = ['aurora', 'minimal', 'sunset'];

  // =========================================================================
  // 1. Unified State Management (LocalStorage Single State Tree)
  // =========================================================================
  const STORAGE_KEY = 'aiot_user_state';

  const defaultState = {
    name: '吳奕霆',
    tagline: 'AIoT Pioneer • Instructor',
    theme: 'aurora',
    format24h: true,
    soundEnabled: false,
    zenMode: false
  };

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.warn('Could not parse saved user state, using defaults.', err);
    }
    return { ...defaultState };
  }

  let state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  }

  // =========================================================================
  // 2. Web Audio API Clock Synthesizer
  // =========================================================================
  class TickAudioEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTick() {
      if (!state.soundEnabled || !this.ctx || this.ctx.state !== 'running') return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // High mechanical transient click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

        // Soft volume envelope
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
      } catch (err) {
        console.debug('Audio tick synthesis skipped:', err);
      }
    }
  }

  const audio = new TickAudioEngine();

  // =========================================================================
  // 3. DOM Elements Cache
  // =========================================================================
  const dom = {
    body: document.body,
    // Clock
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    colon1: document.getElementById('colon1'),
    colon2: document.getElementById('colon2'),
    meridiemContainer: document.getElementById('meridiemContainer'),
    meridiem: document.getElementById('meridiem'),
    epochTime: document.getElementById('epochTime'),
    milliseconds: document.getElementById('milliseconds'),
    progressRing: document.getElementById('progressRing'),

    // Profile & Greeting
    greetingIcon: document.getElementById('greetingIcon'),
    greetingText: document.getElementById('greetingText'),
    userName: document.getElementById('userName'),
    userTagline: document.getElementById('userTagline'),
    avatarInitials: document.getElementById('avatarInitials'),
    editNameBtn: document.getElementById('editNameBtn'),

    // Calendar Badges & Status
    fullDate: document.getElementById('fullDate'),
    weekBadge: document.getElementById('weekBadge'),
    dayOfYearBadge: document.getElementById('dayOfYearBadge'),
    timezoneBadge: document.getElementById('timezoneBadge'),
    statusLabel: document.getElementById('statusLabel'),

    // Top Controls
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundOffIcon: document.querySelector('.sound-off-icon'),
    soundOnIcon: document.querySelector('.sound-on-icon'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeTooltip: document.getElementById('themeTooltip'),
    zenModeBtn: document.getElementById('zenModeBtn'),

    // Format & Action Toolbar
    btn24h: document.getElementById('btn24h'),
    btn12h: document.getElementById('btn12h'),
    copyTimeBtn: document.getElementById('copyTimeBtn'),
    toastContainer: document.getElementById('toastContainer'),

    // Portal Triggers & Drawer
    openProjectsBtn: document.getElementById('openProjectsBtn'),
    openAboutBtn: document.getElementById('openAboutBtn'),
    openConnectBtn: document.getElementById('openConnectBtn'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    drawerPanel: document.getElementById('drawerPanel'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawerTabs: document.querySelectorAll('.drawer-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    projectsGrid: document.getElementById('projectsGrid'),
    projectsCount: document.getElementById('projectsCount')
  };

  // SVG Progress Ring Geometry
  const RING_RADIUS = 162;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~1017.88
  if (dom.progressRing) {
    dom.progressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
    dom.progressRing.style.strokeDashoffset = '0';
  }

  // =========================================================================
  // 4. Toast Notifications
  // =========================================================================
  function showToast(message, icon = '✓') {
    if (!dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  // =========================================================================
  // 5. Time & Calendar Calculations
  // =========================================================================
  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function getISOWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }

  function getTimezoneAbbr() {
    try {
      const offsetMinutes = new Date().getTimezoneOffset();
      const offsetHours = -offsetMinutes / 60;
      const sign = offsetHours >= 0 ? '+' : '';
      return `GMT${sign}${offsetHours}`;
    } catch {
      return 'UTC';
    }
  }

  function getGreeting(hours24) {
    if (hours24 >= 5 && hours24 < 12) {
      return { text: 'Good morning', icon: '🌅' };
    } else if (hours24 >= 12 && hours24 < 17) {
      return { text: 'Good afternoon', icon: '☀️' };
    } else if (hours24 >= 17 && hours24 < 22) {
      return { text: 'Good evening', icon: '🌆' };
    } else {
      return { text: 'Good night', icon: '🌙' };
    }
  }

  function updateInitials(name) {
    if (!dom.avatarInitials) return;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      dom.avatarInitials.textContent = 'HC';
    } else if (parts.length === 1) {
      dom.avatarInitials.textContent = parts[0].slice(0, 2).toUpperCase();
    } else {
      dom.avatarInitials.textContent = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }

  // =========================================================================
  // 6. Live Clock Engine
  // =========================================================================
  let lastSecond = -1;

  function renderClock() {
    const now = new Date();
    const rawHours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();
    const epoch = Math.floor(now.getTime() / 1000);

    // Format Hours based on 12/24 preference
    let displayHours = rawHours;
    let ampm = '';

    if (state.format24h) {
      displayHours = String(rawHours).padStart(2, '0');
      if (dom.meridiemContainer) dom.meridiemContainer.style.display = 'none';
    } else {
      ampm = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12;
      displayHours = displayHours ? displayHours : 12;
      displayHours = String(displayHours).padStart(2, '0');
      if (dom.meridiemContainer) {
        dom.meridiemContainer.style.display = 'block';
        if (dom.meridiem) dom.meridiem.textContent = ampm;
      }
    }

    // Update DOM Numbers
    dom.hours.textContent = displayHours;
    dom.minutes.textContent = String(minutes).padStart(2, '0');
    dom.seconds.textContent = String(seconds).padStart(2, '0');
    dom.milliseconds.textContent = String(ms).padStart(3, '0');
    dom.epochTime.textContent = epoch;

    // Smooth Radial Seconds Progress Ring
    if (dom.progressRing) {
      const progressFraction = (seconds + ms / 1000) / 60;
      const strokeOffset = RING_CIRCUMFERENCE - (progressFraction * RING_CIRCUMFERENCE);
      dom.progressRing.style.strokeDashoffset = strokeOffset;
    }

    // Tick Event once per second
    if (seconds !== lastSecond) {
      lastSecond = seconds;

      // Play soft mechanical tick if sound is enabled
      audio.playTick();

      // Update greeting and dates
      const greeting = getGreeting(rawHours);
      if (dom.greetingText) dom.greetingText.textContent = greeting.text;
      if (dom.greetingIcon) dom.greetingIcon.textContent = greeting.icon;

      if (dom.fullDate) {
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dom.fullDate.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
      }

      const tzAbbr = getTimezoneAbbr();
      if (dom.weekBadge) dom.weekBadge.textContent = `Week ${getISOWeekNumber(now)}`;
      if (dom.dayOfYearBadge) dom.dayOfYearBadge.textContent = `Day ${getDayOfYear(now)}`;
      if (dom.timezoneBadge) dom.timezoneBadge.textContent = tzAbbr;
      if (dom.statusLabel) dom.statusLabel.textContent = `Live • ${tzAbbr}`;
    }

    requestAnimationFrame(renderClock);
  }

  // =========================================================================
  // 7. Asynchronous Projects Catalog (`projects.json` Fetch)
  // =========================================================================
  async function loadProjects() {
    try {
      const res = await fetch('./projects.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const projects = await res.json();

      if (dom.projectsCount) dom.projectsCount.textContent = projects.length;
      renderProjects(projects);
    } catch (err) {
      console.error('Could not load projects.json:', err);
      if (dom.projectsGrid) {
        dom.projectsGrid.innerHTML = `
          <div class="loading-indicator">
            Unable to load projects catalog from <code>projects.json</code>.
          </div>
        `;
      }
    }
  }

  function renderProjects(projects) {
    if (!dom.projectsGrid) return;
    dom.projectsGrid.innerHTML = '';

    projects.forEach(project => {
      const card = document.createElement('article');
      card.className = 'project-card';

      const techBadges = (project.techStack || [])
        .map(tag => `<span class="project-tag">${tag}</span>`)
        .join('');

      card.innerHTML = `
        <div class="project-meta">
          <span class="project-category">${project.category || 'AIoT'}</span>
          ${project.badge ? `<span class="project-badge">${project.badge}</span>` : ''}
        </div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tags">${techBadges}</div>
        <div class="project-actions">
          <a href="${project.githubUrl || '#'}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
            <span>Code Repo</span> ↗
          </a>
        </div>
      `;
      dom.projectsGrid.appendChild(card);
    });
  }

  // =========================================================================
  // 8. Drawer & Tab Controller
  // =========================================================================
  function openDrawer(tabName = 'projects') {
    dom.body.classList.add('drawer-open');
    switchDrawerTab(tabName);
  }

  function closeDrawer() {
    dom.body.classList.remove('drawer-open');
  }

  function switchDrawerTab(targetTab) {
    dom.drawerTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetTab);
    });

    dom.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
    });
  }

  // =========================================================================
  // 9. Preferences & Interactivity Handlers
  // =========================================================================
  function setFormat(is24h) {
    state.format24h = is24h;
    saveState();

    if (is24h) {
      dom.btn24h.classList.add('active');
      dom.btn12h.classList.remove('active');
    } else {
      dom.btn12h.classList.add('active');
      dom.btn24h.classList.remove('active');
    }
  }

  function cycleTheme() {
    const currentIndex = THEMES.indexOf(state.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    state.theme = THEMES[nextIndex];
    dom.body.dataset.theme = state.theme;
    saveState();

    const label = state.theme.charAt(0).toUpperCase() + state.theme.slice(1);
    if (dom.themeTooltip) dom.themeTooltip.textContent = `Theme: ${label}`;
    showToast(`Switched to ${label} theme`, '🎨');
  }

  function toggleSound() {
    audio.init();
    state.soundEnabled = !state.soundEnabled;
    saveState();
    updateSoundUI();

    showToast(state.soundEnabled ? 'Clock tick sound enabled' : 'Sound muted', state.soundEnabled ? '🔊' : '🔇');
  }

  function updateSoundUI() {
    if (state.soundEnabled) {
      dom.soundOffIcon.style.display = 'none';
      dom.soundOnIcon.style.display = 'block';
      dom.soundToggleBtn.classList.add('active-state');
    } else {
      dom.soundOffIcon.style.display = 'block';
      dom.soundOnIcon.style.display = 'none';
      dom.soundToggleBtn.classList.remove('active-state');
    }
  }

  function toggleZenMode() {
    state.zenMode = !state.zenMode;
    dom.body.classList.toggle('zen-active', state.zenMode);
    if (state.zenMode) closeDrawer();
  }

  function copyCurrentTimestamp() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
    const tz = getTimezoneAbbr();
    const copyText = `${state.name} • ${dateStr} ${dom.hours.textContent}:${dom.minutes.textContent}:${dom.seconds.textContent} (${tz})`;

    navigator.clipboard.writeText(copyText).then(() => {
      showToast('Current time copied to clipboard!', '📋');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = copyText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Current time copied to clipboard!', '📋');
    });
  }

  // =========================================================================
  // 10. Inline Editable Fields
  // =========================================================================
  function setupEditableField(element, stateKey, onSaveCallback) {
    if (!element) return;

    function enableEdit() {
      element.setAttribute('contenteditable', 'true');
      element.focus();

      const range = document.createRange();
      range.selectNodeContents(element);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function saveEdit() {
      element.removeAttribute('contenteditable');
      const cleanValue = element.textContent.trim();
      if (cleanValue) {
        state[stateKey] = cleanValue;
        saveState();
        if (onSaveCallback) onSaveCallback(cleanValue);
      } else {
        element.textContent = state[stateKey];
      }
    }

    element.addEventListener('click', enableEdit);
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        element.textContent = state[stateKey];
        element.removeAttribute('contenteditable');
      }
    });
    element.addEventListener('blur', saveEdit);
  }

  // =========================================================================
  // 11. Event Listeners Initialization
  // =========================================================================
  function initListeners() {
    // 12h/24h toggle
    dom.btn24h.addEventListener('click', () => setFormat(true));
    dom.btn12h.addEventListener('click', () => setFormat(false));

    // Theme & Sound & Zen
    dom.themeToggleBtn.addEventListener('click', cycleTheme);
    dom.soundToggleBtn.addEventListener('click', toggleSound);
    dom.zenModeBtn.addEventListener('click', toggleZenMode);
    dom.copyTimeBtn.addEventListener('click', copyCurrentTimestamp);

    // Drawer Triggers
    dom.openProjectsBtn.addEventListener('click', () => openDrawer('projects'));
    dom.openAboutBtn.addEventListener('click', () => openDrawer('about'));
    dom.openConnectBtn.addEventListener('click', () => openDrawer('connect'));

    dom.closeDrawerBtn.addEventListener('click', closeDrawer);
    dom.drawerOverlay.addEventListener('click', closeDrawer);

    dom.drawerTabs.forEach(tab => {
      tab.addEventListener('click', () => switchDrawerTab(tab.dataset.tab));
    });

    // Inline edit name & tagline
    dom.editNameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.userName.click();
    });

    setupEditableField(dom.userName, 'name', (newName) => {
      updateInitials(newName);
      showToast(`Name updated to "${newName}"`, '✨');
    });

    setupEditableField(dom.userTagline, 'tagline', () => {
      showToast('Tagline updated', '✨');
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'z') {
        toggleZenMode();
      } else if (key === 't') {
        setFormat(!state.format24h);
      } else if (key === 'c') {
        copyCurrentTimestamp();
      } else if (e.key === 'Escape') {
        if (dom.body.classList.contains('drawer-open')) {
          closeDrawer();
        } else if (state.zenMode) {
          toggleZenMode();
        }
      }
    });
  }

  // =========================================================================
  // 12. Application Bootstrapper
  // =========================================================================
  function bootstrap() {
    // Hydrate DOM from unified state
    dom.body.dataset.theme = state.theme;
    dom.userName.textContent = state.name;
    dom.userTagline.textContent = state.tagline;
    updateInitials(state.name);
    setFormat(state.format24h);
    updateSoundUI();

    const themeLabel = state.theme.charAt(0).toUpperCase() + state.theme.slice(1);
    if (dom.themeTooltip) dom.themeTooltip.textContent = `Theme: ${themeLabel}`;

    // Initialize Event Listeners
    initListeners();

    // Asynchronous project catalog loading
    loadProjects();

    // Start Live Clock
    requestAnimationFrame(renderClock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
