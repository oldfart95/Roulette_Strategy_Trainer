// src/config.js
const APP_TITLE = "Roulette Royale Lab";

const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const BLACK_NUMBERS = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

const CHIP_VALUES = [1, 5, 10, 25, 100, 500];

const DEFAULT_SETTINGS = {
  bankrollDefault: 1000,
  preferredChipValue: 25,
  preferredBetMode: "tap",
  animationSpeed: "normal",
  showBetOverlay: false,
  helpCollapsed: false,
  persistSession: true,
};

const ANIMATION_PRESETS = {
  relaxed: { duration: 6000, wheelTurns: 7, ballTurns: 10 },
  normal: { duration: 4700, wheelTurns: 6, ballTurns: 9 },
  brisk: { duration: 3500, wheelTurns: 5, ballTurns: 7 },
};

const RECENT_RESULTS_LIMIT = 18;
const HISTORY_LIMIT = 400;

const STORAGE_KEYS = {
  settings: "roulette-royale-settings",
  session: "roulette-royale-session",
  fairness: "roulette-royale-fairness-log",
};


// src/data/wheel.js

function getNumberColor(number) {
  if (number === 0) return "green";
  if (RED_NUMBERS.has(number)) return "red";
  if (BLACK_NUMBERS.has(number)) return "black";
  return "unknown";
}

function getNumberParity(number) {
  if (number === 0) return "zero";
  return number % 2 === 0 ? "even" : "odd";
}

function getNumberRange(number) {
  if (number === 0) return "zero";
  return number <= 18 ? "low" : "high";
}

function getDozen(number) {
  if (number === 0) return null;
  if (number <= 12) return 1;
  if (number <= 24) return 2;
  return 3;
}

function getColumn(number) {
  if (number === 0) return null;
  const mod = number % 3;
  if (mod === 1) return 1;
  if (mod === 2) return 2;
  return 3;
}

function getStreetIndex(number) {
  if (number === 0) return null;
  return Math.ceil(number / 3);
}

function describeOutcome(number) {
  return {
    number,
    color: getNumberColor(number),
    parity: getNumberParity(number),
    range: getNumberRange(number),
    dozen: getDozen(number),
    column: getColumn(number),
    street: getStreetIndex(number),
  };
}

function getWheelIndex(number) {
  return WHEEL_ORDER.indexOf(number);
}


// src/engine/rng.js

function secureRandomIndex(length) {
  if (!window.crypto?.getRandomValues) {
    throw new Error("Secure browser randomness is unavailable.");
  }

  const maxUint = 0xffffffff;
  const biasLimit = maxUint - (maxUint % length);
  const buffer = new Uint32Array(1);

  while (true) {
    window.crypto.getRandomValues(buffer);
    const value = buffer[0];
    if (value < biasLimit) {
      return value % length;
    }
  }
}

function generateSpin() {
  const wheelIndex = secureRandomIndex(WHEEL_ORDER.length);
  return {
    wheelIndex,
    number: WHEEL_ORDER[wheelIndex],
    timestamp: Date.now(),
    source: "window.crypto.getRandomValues",
  };
}


// src/engine/bets.js
const PAYOUTS = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  sixLine: 5,
  dozen: 2,
  column: 2,
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  low: 1,
  high: 1,
};

const INSIDE_GRID_ROWS = Array.from({ length: 12 }, (_, row) => [
  row * 3 + 3,
  row * 3 + 2,
  row * 3 + 1,
]);

function key(type, numbers, label) {
  return {
    key: `${type}:${label}`,
    type,
    numbers,
    label,
    payout: PAYOUTS[type],
    placement: type,
  };
}

function buildBetDefinitions() {
  const definitions = [];

  for (let number = 0; number <= 36; number += 1) {
    definitions.push(key("straight", [number], `${number}`));
  }

  for (let row = 0; row < INSIDE_GRID_ROWS.length; row += 1) {
    const numbers = INSIDE_GRID_ROWS[row];
    definitions.push(key("street", [...numbers].sort((a, b) => a - b), `${numbers[2]}-${numbers[0]}`));

    if (row < INSIDE_GRID_ROWS.length - 1) {
      const next = INSIDE_GRID_ROWS[row + 1];
      const sixLineNumbers = [...numbers, ...next].sort((a, b) => a - b);
      definitions.push(key("sixLine", sixLineNumbers, `${sixLineNumbers[0]}-${sixLineNumbers[sixLineNumbers.length - 1]}`));
    }

    for (let col = 0; col < numbers.length - 1; col += 1) {
      const splitNumbers = [numbers[col], numbers[col + 1]].sort((a, b) => a - b);
      definitions.push(key("split", splitNumbers, `${splitNumbers[0]}-${splitNumbers[1]}`));
    }
  }

  for (let row = 0; row < INSIDE_GRID_ROWS.length - 1; row += 1) {
    const current = INSIDE_GRID_ROWS[row];
    const next = INSIDE_GRID_ROWS[row + 1];

    for (let col = 0; col < current.length; col += 1) {
      const splitNumbers = [current[col], next[col]].sort((a, b) => a - b);
      definitions.push(key("split", splitNumbers, `${splitNumbers[0]}-${splitNumbers[1]}`));
    }

    for (let col = 0; col < current.length - 1; col += 1) {
      const cornerNumbers = [current[col], current[col + 1], next[col], next[col + 1]].sort((a, b) => a - b);
      definitions.push(key("corner", cornerNumbers, `${cornerNumbers.join("-")}`));
    }
  }

  definitions.push(key("split", [0, 1], "0-1"));
  definitions.push(key("split", [0, 2], "0-2"));
  definitions.push(key("split", [0, 3], "0-3"));
  definitions.push(key("street", [0, 1, 2], "0-1-2"));
  definitions.push(key("street", [0, 2, 3], "0-2-3"));

  for (let dozen = 1; dozen <= 3; dozen += 1) {
    const start = (dozen - 1) * 12 + 1;
    const numbers = Array.from({ length: 12 }, (_, index) => start + index);
    definitions.push(key("dozen", numbers, `dozen-${dozen}`));
  }

  for (let column = 1; column <= 3; column += 1) {
    const numbers = [];
    for (let value = 1; value <= 36; value += 1) {
      if (((value - column) % 3 + 3) % 3 === 0) numbers.push(value);
    }
    definitions.push(key("column", numbers, `column-${column}`));
  }

  definitions.push(key("red", [1], "red"));
  definitions.push(key("black", [1], "black"));
  definitions.push(key("odd", [1], "odd"));
  definitions.push(key("even", [1], "even"));
  definitions.push(key("low", [1], "low"));
  definitions.push(key("high", [1], "high"));

  return definitions;
}

const BET_DEFINITIONS = buildBetDefinitions();
const BET_INDEX = new Map(BET_DEFINITIONS.map((definition) => [definition.key, definition]));

function getBetDefinition(betKey) {
  return BET_INDEX.get(betKey) ?? null;
}

function isValidBetKey(betKey) {
  return BET_INDEX.has(betKey);
}

function getBetDisplayLabel(betKey) {
  const definition = getBetDefinition(betKey);
  if (!definition) return betKey;

  const friendly = {
    red: "Red",
    black: "Black",
    odd: "Odd",
    even: "Even",
    low: "1 to 18",
    high: "19 to 36",
  };

  if (friendly[definition.type]) return friendly[definition.type];
  if (definition.type === "dozen") return `Dozen ${definition.label.slice(-1)}`;
  if (definition.type === "column") return `Column ${definition.label.slice(-1)}`;
  return definition.label;
}

function describeBetType(type) {
  return {
    straight: "Straight up",
    split: "Split",
    street: "Street",
    corner: "Corner",
    sixLine: "Six line",
    dozen: "Dozen",
    column: "Column",
    red: "Red",
    black: "Black",
    odd: "Odd",
    even: "Even",
    low: "Low",
    high: "High",
  }[type];
}


// src/engine/payouts.js

function matchesOutsideBet(definition, outcome) {
  switch (definition.type) {
    case "red":
      return outcome.color === "red";
    case "black":
      return outcome.color === "black";
    case "odd":
      return outcome.parity === "odd";
    case "even":
      return outcome.parity === "even";
    case "low":
      return outcome.range === "low";
    case "high":
      return outcome.range === "high";
    case "dozen":
      return definition.label === `dozen-${outcome.dozen}`;
    case "column":
      return definition.label === `column-${outcome.column}`;
    default:
      return false;
  }
}

function resolveSpin(activeBets, winningNumber) {
  const outcome = describeOutcome(winningNumber);
  const betResults = [];
  let totalStake = 0;
  let totalReturn = 0;

  for (const bet of activeBets) {
    const definition = getBetDefinition(bet.betKey);
    if (!definition) continue;
    totalStake += bet.amount;

    const win =
      ["red", "black", "odd", "even", "low", "high", "dozen", "column"].includes(definition.type)
        ? matchesOutsideBet(definition, outcome)
        : definition.numbers.includes(winningNumber);

    const payout = win ? bet.amount * definition.payout : 0;
    const returnedStake = win ? bet.amount : 0;
    const grossReturn = payout + returnedStake;
    totalReturn += grossReturn;

    betResults.push({
      ...bet,
      type: definition.type,
      typeLabel: describeBetType(definition.type),
      label: definition.label,
      payoutMultiplier: definition.payout,
      win,
      payout,
      returnedStake,
      grossReturn,
      net: grossReturn - bet.amount,
    });
  }

  return {
    outcome,
    totalStake,
    totalReturn,
    net: totalReturn - totalStake,
    betResults,
  };
}


// src/engine/session.js

function createInitialSession(settings = DEFAULT_SETTINGS) {
  const bankroll = Number(settings.bankrollDefault) || DEFAULT_SETTINGS.bankrollDefault;
  return {
    bankroll,
    defaultBankroll: bankroll,
    peakBankroll: bankroll,
    maxDrawdown: 0,
    totalWagered: 0,
    spins: 0,
    profitLoss: 0,
    activeBets: [],
    previousBetLayout: [],
    history: [],
    recentResults: [],
    fairnessLog: [],
    locked: false,
    lastOutcome: null,
    lastNet: 0,
    actionStack: [],
  };
}

function snapshotBets(activeBets) {
  return activeBets.map((bet) => ({ ...bet }));
}

function placeBet(session, bet) {
  const nextBankroll = session.bankroll - bet.amount;
  if (bet.amount <= 0) throw new Error("Bet amount must be positive.");
  if (nextBankroll < 0) throw new Error("Insufficient bankroll.");

  return {
    ...session,
    bankroll: nextBankroll,
    activeBets: [...session.activeBets, bet],
    actionStack: [...session.actionStack, { type: "place", bet }],
  };
}

function undoLastAction(session) {
  if (!session.actionStack.length) return session;

  const lastAction = session.actionStack[session.actionStack.length - 1];
  if (lastAction.type !== "place") return session;

  const index = session.activeBets.findLastIndex(
    (bet) => bet.betKey === lastAction.bet.betKey && bet.amount === lastAction.bet.amount && bet.id === lastAction.bet.id,
  );

  if (index === -1) return { ...session, actionStack: session.actionStack.slice(0, -1) };

  const nextBets = session.activeBets.slice();
  const [removed] = nextBets.splice(index, 1);

  return {
    ...session,
    bankroll: session.bankroll + removed.amount,
    activeBets: nextBets,
    actionStack: session.actionStack.slice(0, -1),
  };
}

function clearBets(session) {
  const refunded = session.activeBets.reduce((sum, bet) => sum + bet.amount, 0);
  return {
    ...session,
    bankroll: session.bankroll + refunded,
    activeBets: [],
    actionStack: [],
  };
}

function repeatPreviousBets(session) {
  return snapshotBets(session.previousBetLayout).map((bet) => ({
    ...bet,
    id: crypto.randomUUID(),
  }));
}

function settleSpin(session, spinResult, resolution) {
  const bankroll = session.bankroll + resolution.totalReturn;
  const peakBankroll = Math.max(session.peakBankroll, bankroll);
  const drawdown = Math.max(0, peakBankroll - bankroll);
  const entry = {
    id: spinResult.timestamp,
    spin: session.spins + 1,
    number: spinResult.number,
    net: resolution.net,
    totalStake: resolution.totalStake,
    totalReturn: resolution.totalReturn,
    outcome: resolution.outcome,
    bets: resolution.betResults,
    timestamp: spinResult.timestamp,
  };

  return {
    ...session,
    bankroll,
    peakBankroll,
    maxDrawdown: Math.max(session.maxDrawdown, drawdown),
    totalWagered: session.totalWagered + resolution.totalStake,
    spins: session.spins + 1,
    profitLoss: bankroll - session.defaultBankroll,
    previousBetLayout: snapshotBets(session.activeBets),
    activeBets: [],
    actionStack: [],
    history: [entry, ...session.history].slice(0, HISTORY_LIMIT),
    recentResults: [spinResult.number, ...session.recentResults].slice(0, RECENT_RESULTS_LIMIT),
    fairnessLog: [
      {
        timestamp: spinResult.timestamp,
        number: spinResult.number,
        wheelIndex: spinResult.wheelIndex,
        source: spinResult.source,
      },
      ...session.fairnessLog,
    ].slice(0, 30),
    locked: false,
    lastOutcome: resolution.outcome,
    lastNet: resolution.net,
  };
}

function lockSession(session) {
  return { ...session, locked: true };
}

function unlockSession(session) {
  return { ...session, locked: false };
}

function resetSession(session, settings) {
  return createInitialSession(settings);
}


// src/engine/stats.js

function createDistribution(size, start = 0) {
  return Array.from({ length: size }, (_, index) => ({ key: index + start, count: 0, pct: 0 }));
}

function summarizeRolling(history, size) {
  const slice = history.slice(0, size);
  if (!slice.length) return { spins: 0, averageNet: 0, red: 0, black: 0, zero: 0 };

  const summary = { spins: slice.length, averageNet: 0, red: 0, black: 0, zero: 0 };
  let totalNet = 0;
  for (const entry of slice) {
    totalNet += entry.net;
    const color = getNumberColor(entry.number);
    summary[color] += 1;
  }
  summary.averageNet = totalNet / slice.length;
  return summary;
}

function collectStreaks(results) {
  const trackers = {
    color: { current: { label: "-", length: 0 }, longest: { label: "-", length: 0 } },
    parity: { current: { label: "-", length: 0 }, longest: { label: "-", length: 0 } },
    range: { current: { label: "-", length: 0 }, longest: { label: "-", length: 0 } },
  };

  for (const category of ["color", "parity", "range"]) {
    let previous = null;
    let currentLength = 0;

    for (const entry of results) {
      const value = entry.outcome[category];
      if (value === previous) {
        currentLength += 1;
      } else {
        currentLength = 1;
        previous = value;
      }

      if (currentLength > trackers[category].longest.length) {
        trackers[category].longest = { label: value, length: currentLength };
      }
    }

    if (results.length) {
      trackers[category].current = {
        label: results[0].outcome[category],
        length: (() => {
          let count = 0;
          for (const entry of results) {
            if (entry.outcome[category] === results[0].outcome[category]) count += 1;
            else break;
          }
          return count;
        })(),
      };
    }
  }

  return trackers;
}

function computeStats(session) {
  const history = session.history;
  const spins = history.length;

  const numberDistribution = createDistribution(37);
  const counts = {
    red: 0,
    black: 0,
    green: 0,
    odd: 0,
    even: 0,
    low: 0,
    high: 0,
    dozen1: 0,
    dozen2: 0,
    dozen3: 0,
    column1: 0,
    column2: 0,
    column3: 0,
  };

  const byBetType = {};

  for (const entry of history) {
    numberDistribution[entry.number].count += 1;
    const { outcome } = entry;
    counts[outcome.color] = (counts[outcome.color] ?? 0) + 1;
    if (outcome.parity === "odd" || outcome.parity === "even") counts[outcome.parity] += 1;
    if (outcome.range === "low" || outcome.range === "high") counts[outcome.range] += 1;
    if (outcome.dozen) counts[`dozen${outcome.dozen}`] += 1;
    if (outcome.column) counts[`column${outcome.column}`] += 1;

    for (const bet of entry.bets) {
      const bucket = byBetType[bet.type] ?? {
        type: bet.type,
        label: bet.typeLabel,
        stake: 0,
        returns: 0,
        wins: 0,
        losses: 0,
        net: 0,
      };
      bucket.stake += bet.amount;
      bucket.returns += bet.grossReturn;
      bucket.net += bet.net;
      if (bet.win) bucket.wins += 1;
      else bucket.losses += 1;
      byBetType[bet.type] = bucket;
    }
  }

  for (const item of numberDistribution) {
    item.pct = spins ? (item.count / spins) * 100 : 0;
  }

  const currentStreaks = collectStreaks(history);
  const hotNumbers = [...numberDistribution]
    .sort((a, b) => b.count - a.count || a.key - b.key)
    .slice(0, 5);
  const coldNumbers = [...numberDistribution]
    .sort((a, b) => a.count - b.count || a.key - b.key)
    .slice(0, 5);

  const winningSpins = history.filter((entry) => entry.net > 0).length;

  return {
    spins,
    currentBankroll: session.bankroll,
    profitLoss: session.profitLoss,
    totalWagered: session.totalWagered,
    hitRate: spins ? (winningSpins / spins) * 100 : 0,
    counts,
    numberDistribution,
    recentResults: session.recentResults,
    streaks: currentStreaks,
    rolling: [10, 25, 50, 100].map((size) => ({ size, ...summarizeRolling(history, size) })),
    hotNumbers,
    coldNumbers,
    byBetType: Object.values(byBetType).sort((a, b) => a.label.localeCompare(b.label)),
  };
}


// src/engine/game.js

function startSpin(session) {
  if (!session.activeBets.length) {
    throw new Error("Place at least one bet before spinning.");
  }
  if (session.locked) {
    throw new Error("Spin already in progress.");
  }

  const spin = generateSpin();
  const resolution = resolveSpin(session.activeBets, spin.number);
  return { spin, resolution };
}


// src/storage.js

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...loadJson(STORAGE_KEYS.settings, {}) };
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function loadSession(settings) {
  const saved = loadJson(STORAGE_KEYS.session, null);
  if (!saved || !settings.persistSession) return createInitialSession(settings);

  return {
    ...createInitialSession(settings),
    ...saved,
    locked: false,
    actionStack: [],
    activeBets: saved.activeBets ?? [],
    previousBetLayout: saved.previousBetLayout ?? [],
    history: saved.history ?? [],
    recentResults: saved.recentResults ?? [],
    fairnessLog: saved.fairnessLog ?? [],
  };
}

function saveSession(session, settings) {
  if (!settings.persistSession) return;
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function saveFairnessLog(log) {
  localStorage.setItem(STORAGE_KEYS.fairness, JSON.stringify(log));
}

function loadFairnessLog() {
  return loadJson(STORAGE_KEYS.fairness, []);
}


// src/ui/content.js
function getHelpContent() {
  return `
    <section class="help-section">
      <h2>How To Use The Simulator</h2>
      <div class="help-grid">
        <article>
          <h3>Selecting Chips</h3>
          <p>Choose a chip from the palette to set your default stake. Tap mode lets you place that value with a single click on any valid betting region. Drag mode lets you pick up the selected chip and drop it onto highlighted targets.</p>
        </article>
        <article>
          <h3>Dragging Bets</h3>
          <p>In drag mode, hold the chip button and move across the table. Valid regions glow on hover, including splits, corners, streets, six lines, dozens, columns, and even-money bets. Drop to place a chip with that denomination.</p>
        </article>
        <article>
          <h3>Fast Tap Placement</h3>
          <p>Tap mode is tuned for repeated study play. Select a stake, then click numbers, borders, or outside fields to add chips quickly. Use the overlay toggle if you want to study exactly where split, corner, street, and six-line targets live.</p>
        </article>
        <article>
          <h3>Undo, Clear, Repeat</h3>
          <p><strong>Undo</strong> removes the latest chip placement, <strong>Clear</strong> refunds all current bets, and <strong>Repeat</strong> restores the full layout from the most recently completed spin.</p>
        </article>
        <article>
          <h3>Spin Workflow</h3>
          <p>When you spin, the winning number is sampled immediately using secure browser randomness. Inputs lock during the animation, the ball settles honestly onto the preselected result, payouts resolve, and the stats engine updates.</p>
        </article>
        <article>
          <h3>Stats Views</h3>
          <p>The main stats panel is a quick-glance session dashboard. The advanced tab goes deeper with number frequencies, rolling samples, streak breakdowns, hot/cold descriptive views, and return by bet type.</p>
        </article>
      </div>
    </section>
    <section class="help-section">
      <h2>Roulette Basics</h2>
      <div class="help-grid">
        <article>
          <h3>European Roulette</h3>
          <p>This simulator uses single-zero European roulette only. That means 37 possible outcomes: 0 through 36. The single zero creates the natural house edge without any hidden adjustment.</p>
        </article>
        <article>
          <h3>Inside Bets</h3>
          <p>Inside bets cover specific number groupings on the number layout. Straight-up, split, street, corner, and six-line bets all offer higher payouts in exchange for lower hit frequency.</p>
        </article>
        <article>
          <h3>Outside Bets</h3>
          <p>Outside bets cover broader categories such as red or black, odd or even, low or high, dozens, and columns. They hit more often, but their payouts are lower.</p>
        </article>
        <article>
          <h3>Payout Reference</h3>
          <ul class="reference-list">
            <li>Straight up: 35:1</li>
            <li>Split: 17:1</li>
            <li>Street: 11:1</li>
            <li>Corner: 8:1</li>
            <li>Six line: 5:1</li>
            <li>Dozen: 2:1</li>
            <li>Column: 2:1</li>
            <li>Red / Black: 1:1</li>
            <li>Odd / Even: 1:1</li>
            <li>Low / High: 1:1</li>
          </ul>
        </article>
      </div>
    </section>
    <section class="help-section">
      <h2>Fair Play And RNG</h2>
      <div class="help-grid">
        <article>
          <h3>Every Spin Is Independent</h3>
          <p>Each result is sampled fresh. Previous spins do not influence the next one, and the simulator does not attempt to manufacture streaks, reversals, or “due” outcomes.</p>
        </article>
        <article>
          <h3>Fixed Probabilities</h3>
          <p>The probabilities are those of standard European roulette. A straight-up number has a 1 in 37 chance on each spin, a red or black bet wins 18 times out of 37 on average, and so on.</p>
        </article>
        <article>
          <h3>Secure Random Generation</h3>
          <p>The outcome uses <code>window.crypto.getRandomValues</code> with rejection sampling to avoid modulo bias. The winning result is determined before the animation begins, and the wheel simply reveals that honest result.</p>
        </article>
        <article>
          <h3>House Edge</h3>
          <p>The negative expectation comes naturally from the single zero. European roulette has a house edge of about 2.70%. No weighting, adaptation, hot/cold rigging, or player-specific manipulation is present.</p>
        </article>
      </div>
    </section>
    <section class="help-section">
      <h2>Strategy Guide</h2>
      <div class="strategy-stack">
        <article><h3>Flat Betting On Outside Bets</h3><p><strong>What it is:</strong> Staking the same amount each spin on red/black, odd/even, or low/high.</p><p><strong>When people use it:</strong> Long, lower-volatility sessions with predictable exposure.</p><p><strong>Strengths:</strong> Simple and easy to benchmark.</p><p><strong>Weaknesses:</strong> No protection from long negative drift.</p><p><strong>Risk profile:</strong> Lower variance than inside play, but still negative expectation.</p></article>
        <article><h3>Flat Betting On Dozens Or Columns</h3><p><strong>What it is:</strong> Repeating a constant stake on one or more dozen or column sections.</p><p><strong>When people use it:</strong> Sessions that want more movement than even-money bets without straight-up volatility.</p><p><strong>Strengths:</strong> Flexible 2:1 structure.</p><p><strong>Weaknesses:</strong> Miss runs remain normal and sometimes longer than expected.</p><p><strong>Risk profile:</strong> Moderate variance.</p></article>
        <article><h3>Straight-Up Hunting For Variance Lovers</h3><p><strong>What it is:</strong> Repeated single-number stakes.</p><p><strong>When people use it:</strong> Short high-variance tests and number tracking exercises.</p><p><strong>Strengths:</strong> Maximum standard payout.</p><p><strong>Weaknesses:</strong> Long droughts are common and emotionally demanding.</p><p><strong>Risk profile:</strong> Very high variance.</p></article>
        <article><h3>Martingale</h3><p><strong>What it is:</strong> Doubling after each loss, usually on even-money bets.</p><p><strong>Strengths:</strong> Produces many small recoveries.</p><p><strong>Weaknesses:</strong> Table limits and finite bankrolls break the progression quickly.</p><p><strong>Risk profile:</strong> Heavy tail risk. Example: 1, 2, 4, 8, 16, 32, 64.</p></article>
        <article><h3>Reverse Martingale / Paroli</h3><p><strong>What it is:</strong> Increasing stake after wins instead of losses.</p><p><strong>Strengths:</strong> Limits downside to the base unit if the sequence is managed well.</p><p><strong>Weaknesses:</strong> Most streaks end before the ladder grows much.</p><p><strong>Risk profile:</strong> Moderate, with clustered gains during rare win runs.</p></article>
        <article><h3>D’Alembert</h3><p><strong>What it is:</strong> Add one unit after a loss, subtract one after a win.</p><p><strong>Strengths:</strong> Smoother exposure growth than Martingale.</p><p><strong>Weaknesses:</strong> Recovery is slow and prolonged losses still push stake size higher.</p><p><strong>Risk profile:</strong> Moderate.</p></article>
        <article><h3>Fibonacci</h3><p><strong>What it is:</strong> Following the Fibonacci sequence after losses, stepping back after wins.</p><p><strong>Strengths:</strong> More gradual than doubling systems.</p><p><strong>Weaknesses:</strong> Exposure still becomes substantial during bad stretches.</p><p><strong>Risk profile:</strong> Moderate to high.</p></article>
        <article><h3>Labouchere</h3><p><strong>What it is:</strong> A cancellation system based on a target profit sequence.</p><p><strong>Strengths:</strong> Structured and visually easy to track.</p><p><strong>Weaknesses:</strong> Sequence inflation can become severe during losing periods.</p><p><strong>Risk profile:</strong> High when variance persists.</p></article>
        <article><h3>Oscar’s Grind</h3><p><strong>What it is:</strong> Increasing after wins while aiming for one unit per series.</p><p><strong>Strengths:</strong> Gentler than many recovery systems.</p><p><strong>Weaknesses:</strong> Still no edge, and long losses still hurt.</p><p><strong>Risk profile:</strong> Moderate.</p></article>
        <article><h3>Constant Stake Vs Variable Stake</h3><p>Constant stakes make variance easier to study. Variable staking can reshape session path and drawdown timing, but not expected value.</p></article>
        <article><h3>Stop-Loss And Stop-Win Discipline</h3><p>Session limits can help preserve emotional control and analytical discipline. They are management tools, not expectation-changing tools.</p></article>
        <article><h3>Bankroll Segmentation</h3><p>Breaking a bankroll into smaller session units can improve pacing and prevent oversized recovery attempts during normal variance.</p></article>
        <article><h3>Why Streak Chasing Does Not Alter Probabilities</h3><p>Runs happen naturally in random samples. A streak does not change the probability of the next independent spin.</p></article>
        <article><h3>Hot Numbers Are Descriptive, Not Predictive</h3><p>Hot and cold displays describe the observed sample. They do not forecast future fair-wheel outcomes.</p></article>
        <article><h3>Sober Expectation Note</h3><p>No betting progression overcomes the fixed negative expectation of fair European roulette. Systems change variance, not long-run edge.</p></article>
      </div>
    </section>
  `;
}


// src/ui/modals.js

function createModalMarkup() {
  return `
    <div class="modal-shell" hidden data-modal-shell>
      <div class="modal-backdrop" data-close-modal></div>
      <div class="modal-panel" role="dialog" aria-modal="true" aria-live="polite">
        <header class="modal-header">
          <div>
            <p class="eyebrow" data-modal-eyebrow></p>
            <h2 data-modal-title></h2>
          </div>
          <button class="icon-button" data-close-modal aria-label="Close modal">Close</button>
        </header>
        <div class="modal-body" data-modal-body></div>
      </div>
    </div>
  `;
}

function openHelp(modalElements) {
  modalElements.eyebrow.textContent = "Guide";
  modalElements.title.textContent = "Help, Fairness, and Strategy";
  modalElements.body.innerHTML = getHelpContent();
  modalElements.shell.hidden = false;
}

function openStats(modalElements, statsMarkup) {
  modalElements.eyebrow.textContent = "Session Stats";
  modalElements.title.textContent = "Performance and Analysis";
  modalElements.body.innerHTML = statsMarkup;
  modalElements.shell.hidden = false;
}

function closeModal(modalElements) {
  modalElements.shell.hidden = true;
}


// src/ui/wheel.js

function segmentMarkup(number, index) {
  const color = getNumberColor(number);
  const angle = (360 / WHEEL_ORDER.length) * index;
  return `
    <div class="wheel-segment wheel-segment--${color}" style="--segment-angle:${angle}deg">
      <span>${number}</span>
    </div>
  `;
}

function createWheelMarkup() {
  return `
    <section class="wheel-card glass-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">European Wheel</p>
          <h2>${APP_TITLE}</h2>
        </div>
        <div class="wheel-legend">
          <span class="legend-dot legend-dot--green"></span> Single zero
          <span class="legend-dot legend-dot--red"></span> Red
          <span class="legend-dot legend-dot--black"></span> Black
        </div>
      </div>
      <div class="wheel-stage">
        <div class="wheel-highlight" data-wheel-highlight></div>
        <div class="wheel-track">
          <div class="wheel-ring" data-wheel-ring>
            ${WHEEL_ORDER.map(segmentMarkup).join("")}
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

function animateWheel(elements, spin, settings) {
  const preset = settings.animationPreset;
  const segmentAngle = 360 / WHEEL_ORDER.length;
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

function settleWheel(elements, spin) {
  const color = getNumberColor(spin.number);
  elements.highlight.dataset.color = color;
  elements.highlight.textContent = `${spin.number} ${color}`;
  elements.result.textContent = `${spin.number} ${color}`;
}

function renderFairnessStrip(container, fairnessLog) {
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


// src/ui/table.js

const TOP_ROW = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
const MIDDLE_ROW = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const BOTTOM_ROW = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

function createNumberCell(number) {
  const colorClass = RED_NUMBERS.has(number) ? "red" : "black";
  return `
    <button class="bet-zone number-cell number-cell--${colorClass}" data-bet-key="straight:${number}" data-label="${number}">
      <span class="number-cell__disc">
        <span class="number-cell__value">${number}</span>
      </span>
      <div class="chip-stack" data-chip-stack="straight:${number}"></div>
    </button>
  `;
}

function createRowMarkup(numbers, rowClass) {
  return `
    <div class="number-row ${rowClass}">
      ${numbers.map(createNumberCell).join("")}
    </div>
  `;
}

function createVerticalSplitMarkup() {
  const rows = [TOP_ROW, MIDDLE_ROW, BOTTOM_ROW];
  const rowClasses = ["split-node--top", "split-node--middle", "split-node--bottom"];

  return rows
    .flatMap((row, rowIndex) =>
      row.slice(0, -1).map((number, columnIndex) => {
        const pair = [number, row[columnIndex + 1]].sort((a, b) => a - b);
        return `
          <button
            class="bet-zone split-node split-node--vertical ${rowClasses[rowIndex]}"
            style="--column:${columnIndex + 1}"
            data-bet-key="split:${pair[0]}-${pair[1]}"
            data-label="${pair[0]}-${pair[1]}"
            data-overlay-label="${pair[0]}-${pair[1]}"
          ></button>
        `;
      }),
    )
    .join("");
}

function createHorizontalSplitMarkup() {
  return TOP_ROW.map((topNumber, columnIndex) => {
    const topPair = [MIDDLE_ROW[columnIndex], topNumber].sort((a, b) => a - b);
    const bottomPair = [BOTTOM_ROW[columnIndex], MIDDLE_ROW[columnIndex]].sort((a, b) => a - b);
    return `
      <button
        class="bet-zone split-node split-node--horizontal split-node--between-top"
        style="--column:${columnIndex + 1}"
        data-bet-key="split:${topPair[0]}-${topPair[1]}"
        data-label="${topPair[0]}-${topPair[1]}"
        data-overlay-label="${topPair[0]}-${topPair[1]}"
      ></button>
      <button
        class="bet-zone split-node split-node--horizontal split-node--between-bottom"
        style="--column:${columnIndex + 1}"
        data-bet-key="split:${bottomPair[0]}-${bottomPair[1]}"
        data-label="${bottomPair[0]}-${bottomPair[1]}"
        data-overlay-label="${bottomPair[0]}-${bottomPair[1]}"
      ></button>
    `;
  }).join("");
}

function createCornerMarkup() {
  return TOP_ROW.slice(0, -1)
    .flatMap((topNumber, columnIndex) => {
      const topCorner = [topNumber, TOP_ROW[columnIndex + 1], MIDDLE_ROW[columnIndex], MIDDLE_ROW[columnIndex + 1]].sort((a, b) => a - b);
      const bottomCorner = [MIDDLE_ROW[columnIndex], MIDDLE_ROW[columnIndex + 1], BOTTOM_ROW[columnIndex], BOTTOM_ROW[columnIndex + 1]].sort((a, b) => a - b);

      return [
        `
          <button
            class="bet-zone corner-node corner-node--top"
            style="--column:${columnIndex + 1}"
            data-bet-key="corner:${topCorner.join("-")}"
            data-label="${topCorner.join("-")}"
            data-overlay-label="${topCorner.join("-")}"
          ></button>
        `,
        `
          <button
            class="bet-zone corner-node corner-node--bottom"
            style="--column:${columnIndex + 1}"
            data-bet-key="corner:${bottomCorner.join("-")}"
            data-label="${bottomCorner.join("-")}"
            data-overlay-label="${bottomCorner.join("-")}"
          ></button>
        `,
      ];
    })
    .join("");
}

function createStreetMarkup() {
  return TOP_ROW.map((topNumber, columnIndex) => {
    const start = topNumber - 2;
    return `
      <button
        class="bet-zone street-node"
        style="--column:${columnIndex + 1}"
        data-bet-key="street:${start}-${topNumber}"
        data-label="street ${start}-${topNumber}"
        data-overlay-label="${start}-${topNumber}"
      ></button>
    `;
  }).join("");
}

function createSixLineMarkup() {
  return TOP_ROW.slice(0, -1)
    .map((topNumber, columnIndex) => {
      const start = topNumber - 2;
      const end = TOP_ROW[columnIndex + 1];
      return `
        <button
          class="bet-zone six-line-node"
          style="--column:${columnIndex + 1}"
          data-bet-key="sixLine:${start}-${end}"
          data-label="six line ${start}-${end}"
          data-overlay-label="${start}-${end}"
        ></button>
      `;
    })
    .join("");
}

function createColumnMarkup() {
  return `
    <div class="column-strip">
      <button class="bet-zone column-zone" data-bet-key="column:column-3" data-label="column 3">2 to 1</button>
      <button class="bet-zone column-zone" data-bet-key="column:column-2" data-label="column 2">2 to 1</button>
      <button class="bet-zone column-zone" data-bet-key="column:column-1" data-label="column 1">2 to 1</button>
    </div>
  `;
}

function createZeroMarkup() {
  return `
    <div class="zero-lane">
      <button class="bet-zone zero-zone zero-zone--main" data-bet-key="straight:0" data-label="0">
        <span class="zero-zone__value">0</span>
        <div class="chip-stack" data-chip-stack="straight:0"></div>
      </button>
      <button class="bet-zone split-node zero-split-node zero-split-node--top" data-bet-key="split:0-3" data-label="0-3" data-overlay-label="0-3"></button>
      <button class="bet-zone split-node zero-split-node zero-split-node--middle" data-bet-key="split:0-2" data-label="0-2" data-overlay-label="0-2"></button>
      <button class="bet-zone split-node zero-split-node zero-split-node--bottom" data-bet-key="split:0-1" data-label="0-1" data-overlay-label="0-1"></button>
      <button class="bet-zone zero-street-node zero-street-node--top" data-bet-key="street:0-2-3" data-label="0-2-3" data-overlay-label="0-2-3"></button>
      <button class="bet-zone zero-street-node zero-street-node--bottom" data-bet-key="street:0-1-2" data-label="0-1-2" data-overlay-label="0-1-2"></button>
    </div>
  `;
}

function createTableMarkup() {
  return `
    <section class="table-card">
      <div class="table-card__header">
        <div>
          <p class="eyebrow">European Layout</p>
          <h2>Traditional Betting Surface</h2>
        </div>
        <label class="overlay-toggle">
          <input type="checkbox" data-overlay-toggle />
          <span>Study overlay</span>
        </label>
      </div>
      <div class="roulette-table" data-overlay="off">
        <div class="roulette-table__board">
          <div class="inside-board">
            ${createZeroMarkup()}
            <div class="inside-board__main">
              <div class="numbers-grid">
                ${createRowMarkup(TOP_ROW, "number-row--top")}
                ${createRowMarkup(MIDDLE_ROW, "number-row--middle")}
                ${createRowMarkup(BOTTOM_ROW, "number-row--bottom")}
                ${createVerticalSplitMarkup()}
                ${createHorizontalSplitMarkup()}
                ${createCornerMarkup()}
                ${createStreetMarkup()}
                ${createSixLineMarkup()}
              </div>
              ${createColumnMarkup()}
            </div>
          </div>
          <div class="dozen-row">
            <button class="bet-zone dozen-zone" data-bet-key="dozen:dozen-1" data-label="dozen 1">1st 12</button>
            <button class="bet-zone dozen-zone" data-bet-key="dozen:dozen-2" data-label="dozen 2">2nd 12</button>
            <button class="bet-zone dozen-zone" data-bet-key="dozen:dozen-3" data-label="dozen 3">3rd 12</button>
          </div>
          <div class="outside-row">
            <button class="bet-zone outside-zone" data-bet-key="low:low" data-label="1 to 18">1 to 18</button>
            <button class="bet-zone outside-zone" data-bet-key="even:even" data-label="even">Even</button>
            <button class="bet-zone outside-zone outside-zone--symbol outside-zone--red" data-bet-key="red:red" data-label="red">
              <span class="outside-zone__diamond outside-zone__diamond--red" aria-hidden="true"></span>
            </button>
            <button class="bet-zone outside-zone outside-zone--symbol outside-zone--dark" data-bet-key="black:black" data-label="black">
              <span class="outside-zone__diamond outside-zone__diamond--black" aria-hidden="true"></span>
            </button>
            <button class="bet-zone outside-zone" data-bet-key="odd:odd" data-label="odd">Odd</button>
            <button class="bet-zone outside-zone" data-bet-key="high:high" data-label="19 to 36">19 to 36</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderChipStacks(root, groupedBets) {
  root.querySelectorAll(".chip-cluster[data-generated-stack]").forEach((node) => node.remove());
  const stackNodes = root.querySelectorAll("[data-chip-stack]");
  for (const node of stackNodes) node.innerHTML = "";

  for (const [betKey, bets] of groupedBets.entries()) {
    const node = root.querySelector(`[data-chip-stack="${CSS.escape(betKey)}"]`);
    const total = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const count = bets.length;
    const markup = `
      <div class="chip-cluster" title="${getBetDisplayLabel(betKey)}: ${total}">
        <span class="chip-cluster__count">${count}</span>
        <span class="chip-cluster__value">${total}</span>
      </div>
    `;

    if (node) {
      node.innerHTML = markup;
      continue;
    }

    const zone = root.querySelector(`[data-bet-key="${CSS.escape(betKey)}"]`);
    if (!zone) continue;
    zone.insertAdjacentHTML(
      "beforeend",
      markup.replace('<div class="chip-cluster"', '<div class="chip-cluster" data-generated-stack="true"'),
    );
  }
}

function highlightWinningZones(root, results) {
  root.querySelectorAll(".bet-zone.is-winning, .bet-zone.is-losing").forEach((node) => {
    node.classList.remove("is-winning", "is-losing");
  });

  for (const result of results) {
    const node = root.querySelector(`[data-bet-key="${CSS.escape(result.betKey)}"]`);
    if (!node) continue;
    node.classList.add(result.win ? "is-winning" : "is-losing");
  }
}


// src/ui/app.js

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
        <div class="brand-block brand-block--compact">
          <p class="eyebrow">Casino Study Surface</p>
          <h1>${APP_TITLE}</h1>
        </div>
        <div class="hud hud--compact">
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
      <footer class="footer-note">Space spin. Z undo. C clear. R repeat. H help. S stats.</footer>
    </div>
  `;
}

function createApp(root) {
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


// src/main.js

createApp(document.querySelector("#app"));


