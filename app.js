/**
 * Personal Space & Live Clock Engine
 * Features: High-precision clock, dynamic greeting, customizable name, 12h/24h toggle, copy time
 */

(() => {
  'use strict';

  // DOM Elements
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const periodBadgeEl = document.getElementById('periodBadge');
  const periodTextEl = document.getElementById('periodText');
  const secondsProgressEl = document.getElementById('secondsProgress');
  const formattedDateEl = document.getElementById('formattedDate');
  const timezoneTextEl = document.getElementById('timezoneText');
  
  const greetingBadgeEl = document.getElementById('greetingBadge');
  const greetingIconEl = document.getElementById('greetingIcon');
  const greetingTextEl = document.getElementById('greetingText');

  const formatToggleBtn = document.getElementById('formatToggleBtn');
  const formatLabel = document.getElementById('formatLabel');
  const copyTimeBtn = document.getElementById('copyTimeBtn');
  const copyTooltip = document.getElementById('copyTooltip');

  const nameWrapper = document.getElementById('nameWrapper');
  const userNameEl = document.getElementById('userName');
  const editNameBtn = document.getElementById('editNameBtn');
  const editHintEl = document.getElementById('editHint');
  const nameForm = document.getElementById('nameForm');
  const nameInput = document.getElementById('nameInput');
  const cancelNameBtn = document.getElementById('cancelNameBtn');

  const glassCard = document.getElementById('glassCard');
  const orb1 = document.getElementById('orb1');
  const orb2 = document.getElementById('orb2');
  const orb3 = document.getElementById('orb3');

  // State
  const STORAGE_KEYS = {
    NAME: 'personal_space_user_name',
    IS_24H: 'personal_space_is_24h'
  };

  let is24Hour = localStorage.getItem(STORAGE_KEYS.IS_24H) === 'true';
  const DEFAULT_NAME = '吳奕霆';
  let savedName = localStorage.getItem(STORAGE_KEYS.NAME);
  if (!savedName || savedName === 'Voyager') {
    savedName = DEFAULT_NAME;
    localStorage.setItem(STORAGE_KEYS.NAME, DEFAULT_NAME);
  }
  let currentName = savedName;

  // Initialize Name Display
  function initName() {
    userNameEl.textContent = currentName;
    nameInput.value = currentName;
  }

  function enterEditMode() {
    nameWrapper.style.display = 'none';
    editHintEl.style.display = 'none';
    nameForm.classList.remove('hidden');
    nameInput.value = currentName;
    nameInput.focus();
    nameInput.select();
  }

  function exitEditMode() {
    nameForm.classList.add('hidden');
    nameWrapper.style.display = 'inline-flex';
    editHintEl.style.display = 'block';
  }

  function saveName(newName) {
    const trimmed = newName.trim();
    if (trimmed) {
      currentName = trimmed;
      localStorage.setItem(STORAGE_KEYS.NAME, currentName);
      userNameEl.textContent = currentName;
    }
    exitEditMode();
  }

  // Event Listeners for Name Editing
  nameWrapper.addEventListener('click', enterEditMode);
  nameWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enterEditMode();
    }
  });
  editNameBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    enterEditMode();
  });

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveName(nameInput.value);
  });

  cancelNameBtn.addEventListener('click', exitEditMode);

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exitEditMode();
    }
  });

  // Time & Greeting Engine
  function updateGreeting(hour) {
    let greeting = 'Good Evening';
    let icon = '🌆';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
      icon = '🌅';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
      icon = '☀️';
    } else if (hour >= 17 && hour < 22) {
      greeting = 'Good Evening';
      icon = '🌆';
    } else {
      greeting = 'Good Night';
      icon = '🌙';
    }

    greetingTextEl.textContent = greeting;
    greetingIconEl.textContent = icon;
  }

  function updateClock() {
    const now = new Date();
    const rawHours = now.getHours();
    const rawMinutes = now.getMinutes();
    const rawSeconds = now.getSeconds();
    const rawMillis = now.getMilliseconds();

    // Greeting
    updateGreeting(rawHours);

    // Format Hours
    let displayHours = rawHours;
    let period = 'AM';

    if (!is24Hour) {
      period = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12 || 12;
      periodBadgeEl.classList.remove('hidden');
      periodTextEl.textContent = period;
    } else {
      periodBadgeEl.classList.add('hidden');
    }

    // Set Digits
    hoursEl.textContent = String(displayHours).padStart(2, '0');
    minutesEl.textContent = String(rawMinutes).padStart(2, '0');
    secondsEl.textContent = String(rawSeconds).padStart(2, '0');

    // Smooth Seconds Progress
    const progressPercent = ((rawSeconds + rawMillis / 1000) / 60) * 100;
    secondsProgressEl.style.width = `${progressPercent.toFixed(2)}%`;

    // Date & Timezone
    updateDateAndTimezone(now);
  }

  function updateDateAndTimezone(now) {
    // Formatted date: "Wednesday, September 16, 2026"
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    formattedDateEl.textContent = now.toLocaleDateString(undefined, options);

    // Timezone string
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const sign = offsetMinutes >= 0 ? '+' : '-';
      timezoneTextEl.textContent = `GMT${sign}${offsetHours} • ${tz}`;
    } catch {
      timezoneTextEl.textContent = 'Local Time';
    }
  }

  // 12/24 Hour Toggle
  function updateToggleUI() {
    formatLabel.textContent = is24Hour ? '24H' : '12H';
    localStorage.setItem(STORAGE_KEYS.IS_24H, is24Hour);
    updateClock();
  }

  formatToggleBtn.addEventListener('click', () => {
    is24Hour = !is24Hour;
    updateToggleUI();
  });

  // Copy Time to Clipboard
  copyTimeBtn.addEventListener('click', async () => {
    const timeStr = `${hoursEl.textContent}:${minutesEl.textContent}:${secondsEl.textContent} ${is24Hour ? '' : periodTextEl.textContent}`.trim();
    try {
      await navigator.clipboard.writeText(timeStr);
      copyTooltip.textContent = 'Copied!';
      setTimeout(() => {
        copyTooltip.textContent = 'Copy time';
      }, 2000);
    } catch (err) {
      copyTooltip.textContent = 'Failed to copy';
      setTimeout(() => {
        copyTooltip.textContent = 'Copy time';
      }, 2000);
    }
  });

  // Interactive 3D Card Tilt & Parallax
  let mouseX = 0;
  let mouseY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    mouseX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  });

  function renderParallax() {
    currentTiltX += (mouseX * 5 - currentTiltX) * 0.1;
    currentTiltY += (-mouseY * 5 - currentTiltY) * 0.1;

    if (glassCard && window.innerWidth > 768) {
      glassCard.style.transform = `rotateY(${currentTiltX.toFixed(2)}deg) rotateX(${currentTiltY.toFixed(2)}deg)`;
    }

    if (orb1 && orb2 && orb3) {
      orb1.style.transform = `translate(${mouseX * 25}px, ${mouseY * 25}px)`;
      orb2.style.transform = `translate(${-mouseX * 20}px, ${-mouseY * 20}px)`;
      orb3.style.transform = `translate(${mouseX * 15}px, ${-mouseY * 15}px)`;
    }

    requestAnimationFrame(renderParallax);
  }

  // Initialization
  initName();
  updateToggleUI();
  updateClock();

  // Run clock tick sync
  setInterval(updateClock, 200);
  requestAnimationFrame(renderParallax);

})();
