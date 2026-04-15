import { APP_TITLE, WHEEL_MODE_LABELS } from "../config.js";
import { getNumberColor, getWheelOrder } from "../data/wheel.js";

function segmentMarkup(number, index, wheelOrder) {
  const color = getNumberColor(number);
  const angle = (360 / wheelOrder.length) * index;
  return `
    <div class="wheel-segment wheel-segment--${color}" style="--segment-angle:${angle}deg">
      <span>${number}</span>
    </div>
  `;
}

export function createWheelMarkup(wheelMode = "european") {
  const wheelOrder = getWheelOrder(wheelMode);
  return `
    <section class="wheel-card glass-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${WHEEL_MODE_LABELS[wheelMode] ?? WHEEL_MODE_LABELS.european}</p>
          <h2>${APP_TITLE}</h2>
        </div>
        <div class="wheel-legend">
          <span class="legend-dot legend-dot--green"></span> ${wheelMode === "american" ? "0 and 00" : "Single zero"}
          <span class="legend-dot legend-dot--red"></span> Red
          <span class="legend-dot legend-dot--black"></span> Black
        </div>
      </div>
      <div class="wheel-stage">
        <div class="wheel-highlight" data-wheel-highlight></div>
        <div class="wheel-track">
          <div class="wheel-ring" data-wheel-ring>
            ${wheelOrder.map((number, index) => segmentMarkup(number, index, wheelOrder)).join("")}
          </div>
          <div class="wheel-center">
            <div class="wheel-center__inner">
              <span>Fair Play</span>
              <strong data-wheel-result>Ready</strong>
            </div>
          </div>
          <div class="wheel-ball-orbit" data-ball-orbit>
            <div class="wheel-ball"></div>
          </div>
        </div>
      </div>
      <div class="fairness-strip" data-fairness-strip></div>
    </section>
  `;
}

export function animateWheel(elements, spin, settings) {
  const preset = settings.animationPreset;
  const wheelOrder = getWheelOrder(spin.wheelMode);
  const segmentAngle = 360 / wheelOrder.length;
  const targetAngle = 360 - spin.wheelIndex * segmentAngle;
  const wheelRotation = preset.wheelTurns * 360 + targetAngle;
  const ballRotation = -(preset.ballTurns * 360 + targetAngle);

  elements.ring.style.setProperty("--spin-duration", `${preset.duration}ms`);
  elements.ballOrbit.style.setProperty("--spin-duration", `${preset.duration}ms`);
  elements.ring.style.setProperty("--wheel-rotation", `${wheelRotation}deg`);
  elements.ballOrbit.style.setProperty("--ball-rotation", `${ballRotation}deg`);
  elements.ring.classList.remove("is-spinning");
  elements.ballOrbit.classList.remove("is-spinning");
  void elements.ring.offsetWidth;
  elements.ring.classList.add("is-spinning");
  elements.ballOrbit.classList.add("is-spinning");
  elements.result.textContent = `${spin.number}`;
}

export function settleWheel(elements, spin) {
  const color = getNumberColor(spin.number);
  elements.highlight.dataset.color = color;
  elements.highlight.textContent = `${spin.number} ${color}`;
  elements.result.textContent = `${spin.number} ${color}`;
}

export function renderFairnessStrip(container, fairnessLog) {
  container.innerHTML = `
    <div class="fairness-strip__head">
      <span>RNG log</span>
      <small>Secure browser randomness. Latest outcome first.</small>
    </div>
    <div class="fairness-strip__items">
      ${fairnessLog
        .slice(0, 8)
        .map(
          (entry) => `
            <div class="fairness-token fairness-token--${getNumberColor(entry.number)}">
              <strong>${entry.number}</strong>
              <span>${new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}
