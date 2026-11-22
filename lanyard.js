document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("lanyard-root");
  if (!root) return;

  // Customize your photo path and details here anytime
  const PROFILE = {
    photo: "image/WhatsApp Image 2026-10-11 at 23.28.41.jpeg",
    name: "BEH YI CHEN",
    course: "UTM Data Engineering",
    matric: "A26CS0073",
  };

  root.innerHTML = `
    <div class="lanyard-stage" id="lanyardStage">
      <svg class="lanyard-svg" viewBox="0 0 340 500" aria-hidden="true">
        <defs>
          <linearGradient id="strapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#471023" />
            <stop offset="50%" stop-color="#6e1b38" />
            <stop offset="100%" stop-color="#471023" />
          </linearGradient>
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="50%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
        </defs>
        <!-- Top ceiling mount -->
        <rect x="150" y="0" width="40" height="8" rx="4" fill="#334155" />
        <!-- Back & front woven lanyard straps -->
        <path id="strapLeft" fill="none" stroke="url(#strapGrad)" stroke-width="13" stroke-linecap="round" />
        <path id="strapLeftTrim" fill="none" stroke="#c5a059" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.75" />
        <path id="strapRight" fill="none" stroke="url(#strapGrad)" stroke-width="13" stroke-linecap="round" />
        <path id="strapRightTrim" fill="none" stroke="#c5a059" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.75" />
        <!-- Metal crimp & swivel hook -->
        <g id="claspGroup">
          <rect x="-10" y="-18" width="20" height="12" rx="3" fill="url(#metalGrad)" />
          <circle cx="0" cy="-3" r="5" fill="none" stroke="#64748b" stroke-width="2.5" />
          <path d="M 0 1 L 0 11" stroke="#475569" stroke-width="3" stroke-linecap="round" />
        </g>
      </svg>

      <div class="lanyard-card" id="lanyardCard">
        <div class="lanyard-slot"></div>
        <div class="lanyard-accent"></div>
        <div class="lanyard-photo-box">
          <img src="${PROFILE.photo}" alt="${PROFILE.name}" />
        </div>
        <h3 class="lanyard-name">${PROFILE.name}</h3>
        <p class="lanyard-course">${PROFILE.course}</p>
        <p class="lanyard-matric">${PROFILE.matric}</p>
      </div>
    </div>
  `;

  const stage = document.getElementById("lanyardStage");
  const card = document.getElementById("lanyardCard");
  const strapLeft = document.getElementById("strapLeft");
  const strapLeftTrim = document.getElementById("strapLeftTrim");
  const strapRight = document.getElementById("strapRight");
  const strapRightTrim = document.getElementById("strapRightTrim");
  const claspGroup = document.getElementById("claspGroup");

  const stageW = 340;
  const stageH = 500;
  const cardW = 220;
  const anchorX = stageW / 2;
  const anchorY = 6;
  const restLength = 124;

  // Physics state (pivot point = top slot hole of card)
  let px = anchorX;
  let py = anchorY + restLength;
  let vx = 0;
  let vy = 0;
  let theta = 0;
  let omega = 0;

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let targetX = px;
  let targetY = py;
  let lastScrollY = window.scrollY;
  let lastTime = performance.now();

  function clampPivot(x, y) {
    const currentCardH = card.offsetHeight || 312;
    const minX = cardW / 2 + 12;
    const maxX = stageW - cardW / 2 - 12;
    const minY = anchorY + 52;
    const maxY = stageH - currentCardH - 10;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }

  function getPointerPos(e) {
    const rect = stage.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * stageW,
      y: ((clientY - rect.top) / rect.height) * stageH,
    };
  }

  // Scroll-triggered swing & vertical bounce motion
  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.scrollY;
      const delta = Math.max(-60, Math.min(60, currentScroll - lastScrollY));
      lastScrollY = currentScroll;

      if (!isDragging && currentScroll < window.innerHeight * 1.2) {
        vx += delta * 1.15;
        vy += Math.abs(delta) * 0.7;
        omega += delta * 0.014;
      }
    },
    { passive: true }
  );

  card.addEventListener("pointerdown", (e) => {
    isDragging = true;
    card.setPointerCapture(e.pointerId);
    const pos = getPointerPos(e);
    dragOffsetX = px - pos.x;
    dragOffsetY = py - pos.y;
    targetX = px;
    targetY = py;
  });

  window.addEventListener("pointermove", (e) => {
    const pos = getPointerPos(e);
    if (isDragging) {
      const clamped = clampPivot(pos.x + dragOffsetX, pos.y + dragOffsetY);
      targetX = clamped.x;
      targetY = clamped.y;
    } else {
      const currentCardH = card.offsetHeight || 312;
      const dx = px - pos.x;
      const dy = py + currentCardH * 0.45 - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140 && dist > 1) {
        vx += (dx / dist) * 1.4;
      }
    }
  });

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });

  function animate(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;
    const t = now / 1000;

    if (isDragging) {
      vx = (targetX - px) * 18;
      vy = (targetY - py) * 18;
      px += vx * dt;
      py += vy * dt;

      const targetTheta = Math.max(-0.42, Math.min(0.42, -vx * 0.00055));
      theta += (targetTheta - theta) * 10 * dt;
      omega = 0;
    } else {
      const breeze = Math.sin(t * 1.35) * 14 + Math.cos(t * 0.85) * 6;
      const ax = (anchorX - px) * 20 - vx * 4.2 + breeze;
      const ay = (anchorY + restLength - py) * 26 - vy * 5.2;

      vx += ax * dt;
      vy += ay * dt;
      px += vx * dt;
      py += vy * dt;

      const clamped = clampPivot(px, py);
      if (clamped.x !== px) {
        px = clamped.x;
        vx *= -0.35;
      }
      if (clamped.y !== py) {
        py = clamped.y;
        vy *= -0.35;
      }

      const alpha = -Math.sin(theta) * 32 - ax * 0.0048 - omega * 4.4;
      omega += alpha * dt;
      theta += omega * dt;
      theta = Math.max(-0.52, Math.min(0.52, theta));
    }

    const claspX = px;
    const claspY = py - 8;
    const swayShift = (claspX - anchorX) * 0.25;

    const leftPath = `M ${anchorX - 11} ${anchorY} C ${anchorX - 18 + swayShift} ${anchorY + 48}, ${claspX - 12} ${claspY - 42}, ${claspX} ${claspY - 12}`;
    const rightPath = `M ${anchorX + 11} ${anchorY} C ${anchorX + 18 + swayShift} ${anchorY + 48}, ${claspX + 12} ${claspY - 42}, ${claspX} ${claspY - 12}`;

    strapLeft.setAttribute("d", leftPath);
    strapLeftTrim.setAttribute("d", leftPath);
    strapRight.setAttribute("d", rightPath);
    strapRightTrim.setAttribute("d", rightPath);

    const deg = (theta * 180) / Math.PI;
    claspGroup.setAttribute("transform", `translate(${claspX}, ${claspY}) rotate(${deg * 0.45})`);

    card.style.transform = `translate3d(${px - cardW / 2}px, ${py}px, 0) rotate(${theta}rad)`;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});