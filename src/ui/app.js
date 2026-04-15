import { ANIMATION_PRESETS, APP_TITLE, CHIP_VALUES } from "../config.js";
import { getNumberColor } from "../data/wheel.js";
import { getBetDisplayLabel } from "../engine/bets.js";
import { startSpin } from "../engine/game.js";
import {
  clearBets,
  lockSession,
  placeBet,
  repeatPreviousBets,
  resetSession,
  settleSpin,
  undoLastAction,
} from "../engine/session.js";
import { computeStats } from "../engine/stats.js";
import { loadFairnessLog, loadSession, loadSettings, saveFairnessLog, saveSession, saveSettings } from "../storage.js";
import { createModalMarkup, closeModal, openHelp, openStats } from "./modals.js";
import { createTableMarkup, highlightWinningZones, renderChipStacks } from "./table.js";
import { animateWheel, createWheelMarkup, renderFairnessStrip, settleWheel } from "./wheel.js";

function currency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function groupBets(activeBets) {
  const map = new Map();
  for (const bet of activeBets) {
    const bucket = map.get(bet.betKey) ?? [];
    bucket.push(bet);
    map.set(bet.betKey, bucket);
  }
  return map;
}

function createStatsMarkup(stats, session) {
  return `
    <div class="stats-layout">
      <section class="stats-simple">
        <div class="stats-grid">
          <article><span>Total spins</span><strong>${stats.spins}</strong></article>
          <article><span>Current bankroll</span><strong>${currency(stats.currentBankroll)}</strong></article>
          <article><span>Session P/L</span><strong class="${stats.profitLoss >= 0 ? "good" : "bad"}">${currency(stats.profitLoss)}</strong></article>
          <article><span>Total wagered</span><strong>${currency(stats.totalWagered)}</strong></article>
          <article><span>Hit rate</span><strong>${stats.hitRate.toFixed(1)}%</strong></article>
          <article><span>Peak bankroll</span><strong>${currency(session.peakBankroll)}</strong></article>
          <article><span>Drawdown</span><strong>${currency(session.maxDrawdown)}</strong></article>
          <article><span>Last spin</span><strong>${session.lastOutcome ? `${session.lastOutcome.number} ${session.lastOutcome.color}` : "None"}</strong></article>
        </div>
        <div class="stats-columns">
          <article class="stats-panel">
            <h3>Balance</h3>
            <ul class="compact-list">
              <li>Red vs black: ${stats.counts.red} / ${stats.counts.black}</li>
              <li>Odd vs even: ${stats.counts.odd} / ${stats.counts.even}</li>
              <li>Low vs high: ${stats.counts.low} / ${stats.counts.high}</li>
              <li>Zero hits: ${stats.counts.green}</li>
            </ul>
          </article>
          <article class="stats-panel">
            <h3>Streaks</h3>
            <ul class="compact-list">
              <li>Current color streak: ${stats.streaks.color.current.label} x${stats.streaks.color.current.length}</li>
              <li>Longest color streak: ${stats.streaks.color.longest.label} x${stats.streaks.color.longest.length}</li>
              <li>Current parity streak: ${stats.streaks.parity.current.label} x${stats.streaks.parity.current.length}</li>
              <li>Current range streak: ${stats.streaks.range.current.label} x${stats.streaks.range.current.length}</li>
            </ul>
          </article>
        </div>
        <article class="stats-panel">
          <h3>Recent Results</h3>
          <div class="recent-results-strip">
            ${stats.recentResults
              .map((number) => `<span class="result-pill result-pill--${getNumberColor(number)}">${number}</span>`)
              .join("")}
          </div>
        </article>
      </section>
      <section class="stats-advanced">
        <article class="stats-panel">
          <h3>Advanced Snapshot</h3>
          <p>Hot and cold numbers are descriptive only. They show what happened in this sample, not what is due next.</p>
          <div class="hot-cold-grid">
            <div>
              <h4>Hot</h4>
              <ul class="compact-list">
                ${stats.hotNumbers.map((item) => `<li>${item.key}: ${item.count} hits (${item.pct.toFixed(1)}%)</li>`).join("")}
              </ul>
            </div>
            <div>
              <h4>Cold</h4>
              <ul class="compact-list">
                ${stats.coldNumbers.map((item) => `<li>${item.key}: ${item.count} hits (${item.pct.toFixed(1)}%)</li>`).join("")}
              </ul>
            </div>
          </div>
        </article>
        <article class="stats-panel">
          <h3>Rolling Windows</h3>
          <ul class="compact-list">
            ${stats.rolling
              .map(
                (item) =>
                  `<li>Last ${item.size}: ${item.spins} spins, avg net ${currency(item.averageNet)}, red ${item.red}, black ${item.black}, zero ${item.zero}</li>`,
              )
              .join("")}
          </ul>
        </article>
        <article class="stats-panel">
          <h3>Return By Bet Type</h3>
          <table class="stats-table">
            <thead><tr><th>Type</th><th>Stake</th><th>Return</th><th>W/L</th><th>Net</th></tr></thead>
            <tbody>
              ${stats.byBetType
                .map(
                  (item) => `
                    <tr>
                      <td>${item.label}</td>
                      <td>${currency(item.stake)}</td>
                      <td>${currency(item.returns)}</td>
                      <td>${item.wins}/${item.losses}</td>
                      <td class="${item.net >= 0 ? "good" : "bad"}">${currency(item.net)}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </article>
        <article class="stats-panel">
          <h3>Number Frequency</h3>
          <div class="frequency-grid">
            ${stats.numberDistribution
              .map(
                (item) => `
                  <div class="frequency-tile frequency-tile--${getNumberColor(item.key)}">
                    <strong>${item.key}</strong>
                    <span>${item.count}</span>
                    <small>${item.pct.toFixed(1)}%</small>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
        <article class="stats-panel">
          <h3>Expected Value Note</h3>
          <p>European roulette carries a house edge of about 2.70%. In a fair wheel that edge stays fixed regardless of your staking pattern. Progressions can change the shape of wins and losses, but not the long-run expectation.</p>
        </article>
      </section>
    </div>
  `;
}

function appMarkup(settings) {
  return `
    <div class="shell">
      <header class="topbar">
        <div class="brand-block">
          <p class="eyebrow">Casino Study Surface</p>
          <h1>${APP_TITLE}</h1>
          <p class="brand-copy">Traditional table proportions, richer felt, and the same transparent engine underneath.</p>
        </div>
        <div class="hud">
          <article><span>Bankroll</span><strong data-bankroll></strong></article>
          <article><span>Total bet</span><strong data-total-bet></strong></article>
          <article><span>Last result</span><strong data-last-result>Waiting</strong></article>
        </div>
        <div class="topbar-actions">
          <button class="ghost-button" data-action="undo" title="Undo latest chip (Z / Backspace)">Undo</button>
          <button class="ghost-button" data-action="clear" title="Clear all current bets (C)">Clear</button>
          <button class="ghost-button" data-action="repeat" title="Repeat last completed layout (R)">Repeat</button>
          <button class="ghost-button" data-action="help" title="Open help (H)">Help</button>
          <button class="ghost-button" data-action="stats" title="Open stats (S)">Stats</button>
          <button class="primary-button" data-action="spin" title="Spin (Space)">Spin</button>
        </div>
      </header>
      <main class="casino-layout">
        <section class="casino-stage">
          <div class="stage-rail">
            <section class="chip-tray">
              <div class="chip-tray__head">
                <div>
                  <p class="eyebrow">Chip Bank</p>
                  <h2>Selection</h2>
                </div>
                <div class="segmented segmented--mode">
                  <button class="segment-button" data-mode="tap">Tap</button>
                  <button class="segment-button" data-mode="drag">Drag</button>
                </div>
              </div>
              <div class="chip-rack" data-chip-row>
                ${CHIP_VALUES.map((value) => `<button class="chip-button chip-button--${value}" data-chip-value="${value}"><span>${value}</span></button>`).join("")}
              </div>
            </section>
            ${createWheelMarkup()}
          </div>
          <div class="board-wing">
            ${createTableMarkup()}
          </div>
        </section>
        <section class="dashboard-grid">
          <article class="dashboard-card">
            <p class="eyebrow">Recent Spins</p>
            <h3>Latest Results</h3>
            <div class="recent-results-strip" data-recent-strip></div>
          </article>
          <article class="dashboard-card">
            <p class="eyebrow">Bets On The Felt</p>
            <h3>Active Layout</h3>
            <div class="bet-summary" data-bet-summary></div>
          </article>
          <aside class="utility-card">
            <div class="section-heading section-heading--stacked">
              <div>
                <p class="eyebrow">Session Controls</p>
                <h2>Preferences And Notes</h2>
              </div>
            </div>
            <section class="prefs-panel">
              <h3>Preferences</h3>
              <label>Default bankroll <input type="number" min="100" step="100" value="${settings.bankrollDefault}" data-setting="bankrollDefault" /></label>
              <label>Animation speed
                <select data-setting="animationSpeed">
                  <option value="relaxed">Relaxed</option>
                  <option value="normal">Normal</option>
                  <option value="brisk">Brisk</option>
                </select>
              </label>
              <label class="toggle-row"><input type="checkbox" data-setting="persistSession" ${settings.persistSession ? "checked" : ""} /> Preserve session on refresh</label>
              <button class="ghost-button utility-button" data-action="reset-session">Reset session</button>
            </section>
            <section class="notes-panel">
              <h3>House Notes</h3>
              <ul class="compact-list">
                <li>Every spin is independent.</li>
                <li>House edge is the standard European single-zero edge.</li>
                <li>Hot and cold displays are descriptive, not predictive.</li>
                <li>Study overlay reveals splits, corners, streets, and six lines.</li>
              </ul>
            </section>
          </aside>
        </section>
      </main>
      ${createModalMarkup()}
      <div class="drag-ghost" hidden data-drag-ghost></div>
      <footer class="footer-note">Keyboard: Space spin, Z or Backspace undo, C clear, R repeat, H help, S stats.</footer>
    </div>
  `;
}

export function createApp(root) {
  let settings = loadSettings();
  settings.animationPreset = ANIMATION_PRESETS[settings.animationSpeed] ?? ANIMATION_PRESETS.normal;
  let session = loadSession(settings);
  session.fairnessLog = session.fairnessLog?.length ? session.fairnessLog : loadFairnessLog();
  let selectedChip = settings.preferredChipValue;
  let betMode = settings.preferredBetMode;
  let dragState = null;

  root.innerHTML = appMarkup(settings);

  const elements = {
    bankroll: root.querySelector("[data-bankroll]"),
    totalBet: root.querySelector("[data-total-bet]"),
    lastResult: root.querySelector("[data-last-result]"),
    chipRow: root.querySelector("[data-chip-row]"),
    recentStrip: root.querySelector("[data-recent-strip]"),
    betSummary: root.querySelector("[data-bet-summary]"),
    wheelRing: root.querySelector("[data-wheel-ring]"),
    ballOrbit: root.querySelector("[data-ball-orbit]"),
    wheelResult: root.querySelector("[data-wheel-result]"),
    wheelHighlight: root.querySelector("[data-wheel-highlight]"),
    fairnessStrip: root.querySelector("[data-fairness-strip]"),
    table: root.querySelector(".roulette-table"),
    overlayToggle: root.querySelector("[data-overlay-toggle]"),
    dragGhost: root.querySelector("[data-drag-ghost]"),
    modalShell: root.querySelector("[data-modal-shell]"),
    modalEyebrow: root.querySelector("[data-modal-eyebrow]"),
    modalTitle: root.querySelector("[data-modal-title]"),
    modalBody: root.querySelector("[data-modal-body]"),
  };

  const modalElements = {
    shell: elements.modalShell,
    eyebrow: elements.modalEyebrow,
    title: elements.modalTitle,
    body: elements.modalBody,
  };

  function persist() {
    saveSettings(settings);
    saveSession(session, settings);
    saveFairnessLog(session.fairnessLog);
  }

  function applySettings() {
    settings.animationPreset = ANIMATION_PRESETS[settings.animationSpeed] ?? ANIMATION_PRESETS.normal;
  }

  function render() {
    const totalBet = session.activeBets.reduce((sum, bet) => sum + bet.amount, 0);
    elements.bankroll.textContent = currency(session.bankroll);
    elements.totalBet.textContent = currency(totalBet);
    elements.lastResult.textContent = session.lastOutcome ? `${session.lastOutcome.number} ${session.lastOutcome.color}` : "Waiting";

    root.querySelectorAll(".chip-button").forEach((button) => {
      button.classList.toggle("is-selected", Number(button.dataset.chipValue) === selectedChip);
    });

    root.querySelectorAll(".segment-button").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.mode === betMode);
    });

    const grouped = groupBets(session.activeBets);
    renderChipStacks(root, grouped);
    renderFairnessStrip(elements.fairnessStrip, session.fairnessLog ?? []);

    elements.recentStrip.innerHTML = session.recentResults
      .map((number) => `<span class="result-pill result-pill--${getNumberColor(number)}">${number}</span>`)
      .join("");

    elements.betSummary.innerHTML = session.activeBets.length
      ? Array.from(grouped.entries())
          .map(([betKey, bets]) => {
            const total = bets.reduce((sum, bet) => sum + bet.amount, 0);
            return `<article><span>${getBetDisplayLabel(betKey)}</span><strong>${currency(total)}</strong><small>${bets.length} chip${bets.length > 1 ? "s" : ""}</small></article>`;
          })
          .join("")
      : `<p class="muted">No active bets yet. Select a chip and place bets on the table.</p>`;

    elements.overlayToggle.checked = settings.showBetOverlay;
    elements.table.dataset.overlay = settings.showBetOverlay ? "on" : "off";

    root.querySelector('[data-setting="animationSpeed"]').value = settings.animationSpeed;
    root.querySelector('[data-setting="bankrollDefault"]').value = settings.bankrollDefault;
    root.querySelector('[data-setting="persistSession"]').checked = settings.persistSession;
  }

  function showError(message) {
    elements.lastResult.textContent = message;
  }

  function addBet(betKey, amount = selectedChip) {
    if (session.locked) return;
    try {
      session = placeBet(session, {
        id: crypto.randomUUID(),
        betKey,
        amount,
        placedAt: Date.now(),
      });
      persist();
      render();
    } catch (error) {
      showError(error.message);
    }
  }

  function runSpin() {
    try {
      const { spin, resolution } = startSpin(session);
      session = lockSession(session);
      render();
      animateWheel(
        {
          ring: elements.wheelRing,
          ballOrbit: elements.ballOrbit,
          result: elements.wheelResult,
        },
        spin,
        settings,
      );

      window.setTimeout(() => {
        settleWheel(
          {
            highlight: elements.wheelHighlight,
            result: elements.wheelResult,
          },
          spin,
        );
        highlightWinningZones(root, resolution.betResults);
        session = settleSpin(session, spin, resolution);
        persist();
        render();
      }, settings.animationPreset.duration);
    } catch (error) {
      session = { ...session, locked: false };
      showError(error.message);
    }
  }

  function repeatLayout() {
    if (session.locked || !session.previousBetLayout.length) return;
    const bets = repeatPreviousBets(session);
    let next = session;
    try {
      for (const bet of bets) next = placeBet(next, bet);
      session = next;
      persist();
      render();
    } catch (error) {
      showError(error.message);
    }
  }

  function openStatsView() {
    const stats = computeStats(session);
    openStats(modalElements, createStatsMarkup(stats, session));
  }

  root.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action === "undo") {
        session = undoLastAction(session);
        persist();
        render();
      }
      if (action === "clear") {
        session = clearBets(session);
        persist();
        render();
      }
      if (action === "repeat") repeatLayout();
      if (action === "spin") runSpin();
      if (action === "help") openHelp(modalElements);
      if (action === "stats") openStatsView();
      if (action === "reset-session") {
        session = resetSession(session, settings);
        persist();
        render();
      }
      return;
    }

    const chipButton = event.target.closest("[data-chip-value]");
    if (chipButton) {
      selectedChip = Number(chipButton.dataset.chipValue);
      settings.preferredChipValue = selectedChip;
      persist();
      render();
      return;
    }

    const modeButton = event.target.closest("[data-mode]");
    if (modeButton) {
      betMode = modeButton.dataset.mode;
      settings.preferredBetMode = betMode;
      persist();
      render();
      return;
    }

    if (event.target.matches("[data-close-modal]")) {
      closeModal(modalElements);
      return;
    }

    const zone = event.target.closest(".bet-zone");
    if (zone && betMode === "tap" && zone.dataset.betKey) {
      addBet(zone.dataset.betKey);
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.setting === "bankrollDefault") settings.bankrollDefault = Math.max(100, Number(target.value) || 1000);
    if (target.dataset.setting === "animationSpeed") {
      settings.animationSpeed = target.value;
      applySettings();
    }
    if (target.dataset.setting === "persistSession") settings.persistSession = target.checked;
    if (target === elements.overlayToggle) settings.showBetOverlay = target.checked;
    persist();
    render();
  });

  elements.chipRow.addEventListener("pointerdown", (event) => {
    const chipButton = event.target.closest("[data-chip-value]");
    if (!chipButton || betMode !== "drag") return;
    selectedChip = Number(chipButton.dataset.chipValue);
    settings.preferredChipValue = selectedChip;
    dragState = { amount: selectedChip };
    elements.dragGhost.hidden = false;
    elements.dragGhost.textContent = selectedChip;
    elements.dragGhost.style.left = `${event.clientX}px`;
    elements.dragGhost.style.top = `${event.clientY}px`;
    chipButton.setPointerCapture(event.pointerId);
    persist();
    render();
  });

  root.addEventListener("pointermove", (event) => {
    if (!dragState) return;
    elements.dragGhost.style.left = `${event.clientX}px`;
    elements.dragGhost.style.top = `${event.clientY}px`;
    root.querySelectorAll(".bet-zone.is-hovered").forEach((node) => node.classList.remove("is-hovered"));
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".bet-zone");
    if (target?.dataset.betKey) target.classList.add("is-hovered");
  });

  root.addEventListener("pointerup", (event) => {
    if (!dragState) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".bet-zone");
    if (target?.dataset.betKey) addBet(target.dataset.betKey, dragState.amount);
    dragState = null;
    elements.dragGhost.hidden = true;
    root.querySelectorAll(".bet-zone.is-hovered").forEach((node) => node.classList.remove("is-hovered"));
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, select, textarea")) return;
    const key = event.key.toLowerCase();
    if (event.code === "Space") {
      event.preventDefault();
      runSpin();
    }
    if (event.key === "Backspace" || key === "z") {
      event.preventDefault();
      session = undoLastAction(session);
      persist();
      render();
    }
    if (key === "c") {
      session = clearBets(session);
      persist();
      render();
    }
    if (key === "r") repeatLayout();
    if (key === "h") openHelp(modalElements);
    if (key === "s") openStatsView();
    if (event.key === "Escape") closeModal(modalElements);
  });

  render();
}
