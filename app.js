/**
 * StrideSync Interactive Showcase Script
 * Features: Live Phone Simulator, Interactive Step & Water Tracker, OEM Tabs
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Live Clock on Phone Status Bar ---
  const clockEl = document.getElementById('mockup-clock');
  const updateClock = () => {
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockEl.textContent = `${hours}:${minutes} ${ampm}`;
  };
  updateClock();
  setInterval(updateClock, 30000);

  // --- 2. Live Step Tracking Simulator State ---
  const GOAL = 10000;
  const CIRCLE_CIRCUMFERENCE = 427; // 2 * PI * 68
  let currentSteps = 6420;
  let isWalking = false;
  let walkInterval = null;

  // DOM Elements
  const stepsCountEl = document.getElementById('demo-steps-count');
  const kmCountEl = document.getElementById('demo-km-count');
  const calCountEl = document.getElementById('demo-cal-count');
  const timeCountEl = document.getElementById('demo-time-count');
  const progressCircleEl = document.getElementById('demo-progress-circle');

  // Notification elements
  const notifStepsEl = document.getElementById('notif-steps-text');
  const notifProgressEl = document.getElementById('notif-progress-bar');
  const notifKmEl = document.getElementById('notif-km-text');
  const notifKcalEl = document.getElementById('notif-kcal-text');
  const notifMinsEl = document.getElementById('notif-mins-text');

  // Control Buttons
  const btnAddSteps = document.getElementById('btn-add-steps');
  const btnToggleWalk = document.getElementById('btn-toggle-walk');
  const btnResetDemo = document.getElementById('btn-reset-demo');
  const walkTextEl = document.getElementById('walk-text');

  const updateSimulatorUI = (steps) => {
    currentSteps = Math.max(0, steps);

    // Calculations based on 0.76m stride and 0.042 kcal per step
    const distanceKm = (currentSteps * 0.00076).toFixed(2);
    const calories = Math.round(currentSteps * 0.042);
    const activeMins = Math.round(currentSteps / 120);
    const percentage = Math.min(100, Math.round((currentSteps / GOAL) * 100));

    // Update screen metrics
    if (stepsCountEl) stepsCountEl.textContent = currentSteps.toLocaleString();
    if (kmCountEl) kmCountEl.textContent = distanceKm;
    if (calCountEl) calCountEl.textContent = calories;
    if (timeCountEl) timeCountEl.textContent = activeMins;

    // Update circular SVG
    if (progressCircleEl) {
      const offset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * Math.min(1, currentSteps / GOAL));
      progressCircleEl.style.strokeDashoffset = offset;
    }

    // Update Notification tray preview
    if (notifStepsEl) notifStepsEl.textContent = `${currentSteps.toLocaleString()} steps`;
    if (notifProgressEl) notifProgressEl.style.width = `${percentage}%`;
    if (notifKmEl) notifKmEl.textContent = `${distanceKm} km`;
    if (notifKcalEl) notifKcalEl.textContent = `${calories} kcal`;
    if (notifMinsEl) notifMinsEl.textContent = `${activeMins} mins`;
  };

  // Add 500 Steps button
  if (btnAddSteps) {
    btnAddSteps.addEventListener('click', () => {
      updateSimulatorUI(currentSteps + 500);
      animateElement(stepsCountEl);
    });
  }

  // Toggle Auto Walk Simulator
  if (btnToggleWalk) {
    btnToggleWalk.addEventListener('click', () => {
      isWalking = !isWalking;
      if (isWalking) {
        btnToggleWalk.style.background = 'var(--color-primary)';
        btnToggleWalk.style.color = '#FFFFFF';
        if (walkTextEl) walkTextEl.textContent = 'Walking...';
        walkInterval = setInterval(() => {
          const stepDelta = Math.floor(Math.random() * 8) + 12; // 12-20 steps per tick
          updateSimulatorUI(currentSteps + stepDelta);
        }, 800);
      } else {
        btnToggleWalk.style.background = '';
        btnToggleWalk.style.color = '';
        if (walkTextEl) walkTextEl.textContent = 'Auto Walk';
        clearInterval(walkInterval);
      }
    });
  }

  // Reset demo
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (isWalking) {
        btnToggleWalk.click();
      }
      updateSimulatorUI(1250);
    });
  }

  // Simple scale animation helper
  function animateElement(el) {
    if (!el) return;
    el.style.transform = 'scale(1.15)';
    el.style.transition = 'transform 0.15s ease';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
    }, 150);
  }

  // --- 3. Interactive 8-Glass Water Tracker ---
  const glassButtons = document.querySelectorAll('.mockup-water-card .glass');
  const waterTextEl = document.getElementById('demo-water-text');

  glassButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const isFilled = btn.classList.contains('filled');
      if (isFilled) {
        // Unfill this and subsequent glasses
        for (let i = idx; i < glassButtons.length; i++) {
          glassButtons[i].classList.remove('filled');
          glassButtons[i].classList.add('empty');
        }
      } else {
        // Fill up to this glass
        for (let i = 0; i <= idx; i++) {
          glassButtons[i].classList.add('filled');
          glassButtons[i].classList.remove('empty');
        }
      }

      // Count filled glasses
      const filledCount = document.querySelectorAll('.mockup-water-card .glass.filled').length;
      const ml = filledCount * 250;
      if (waterTextEl) {
        waterTextEl.textContent = `${ml.toLocaleString()} / 2,000 ml`;
        animateElement(waterTextEl);
      }
    });
  });

  // --- 4. OEM Battery Tabs Switching ---
  const oemTabs = document.querySelectorAll('.oem-tab');
  const oemContents = document.querySelectorAll('.oem-tab-content');

  oemTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const oem = tab.getAttribute('data-oem');

      oemTabs.forEach((t) => t.classList.remove('active'));
      oemContents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const targetContent = document.getElementById(`oem-${oem}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // --- 5. Download Button Toast / Notification ---
  const downloadButtons = document.querySelectorAll('#nav-download-btn, #hero-download-btn, #main-download-button');
  downloadButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      showToast('🚀 Downloading StrideSync APK v1.0.0! Check your browser downloads.');
    });
  });

  function showToast(message) {
    const existing = document.querySelector('.toast-banner');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-banner';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#0F172A',
      color: '#FFFFFF',
      border: '1px solid #10B981',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(16, 185, 129, 0.4)',
      padding: '14px 24px',
      borderRadius: '9999px',
      fontSize: '0.95rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: '9999',
      transition: 'all 0.3s ease',
      animation: 'fadeIn 0.3s ease',
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialize display
  updateSimulatorUI(currentSteps);
});
