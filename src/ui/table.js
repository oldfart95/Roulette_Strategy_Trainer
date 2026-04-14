import { getBetDisplayLabel } from "../engine/bets.js";
import { RED_NUMBERS } from "../config.js";

function createNumberCell(number) {
  const colorClass = number === 0 ? "green" : RED_NUMBERS.has(number) ? "red" : "black";
  return `
    <button class="bet-zone number-cell number-cell--${colorClass}" data-bet-key="straight:${number}" data-label="${number}">
      <span>${number}</span>
      <div class="chip-stack" data-chip-stack="straight:${number}"></div>
    </button>
  `;
}

function createHorizontalSplits(row) {
  const base = row * 3 + 1;
  const left = base + 2;
  const middle = base + 1;
  const right = base;
  const firstPair = [middle, left].sort((a, b) => a - b);
  const secondPair = [right, middle].sort((a, b) => a - b);
  return `
    <button class="bet-zone split-zone split-zone--h split-zone--h-a" data-bet-key="split:${firstPair[0]}-${firstPair[1]}" data-label="${firstPair[0]}-${firstPair[1]}"></button>
    <button class="bet-zone split-zone split-zone--h split-zone--h-b" data-bet-key="split:${secondPair[0]}-${secondPair[1]}" data-label="${secondPair[0]}-${secondPair[1]}"></button>
  `;
}

function createVerticalSplits(row) {
  if (row === 11) return "";
  const base = row * 3 + 1;
  const nextBase = base + 3;
  const current = [base + 2, base + 1, base];
  const next = [nextBase + 2, nextBase + 1, nextBase];
  const pairA = [current[0], next[0]].sort((a, b) => a - b);
  const pairB = [current[1], next[1]].sort((a, b) => a - b);
  const pairC = [current[2], next[2]].sort((a, b) => a - b);

  return `
    <button class="bet-zone split-zone split-zone--v split-zone--v-a" data-bet-key="split:${pairA[0]}-${pairA[1]}" data-label="${pairA[0]}-${pairA[1]}"></button>
    <button class="bet-zone split-zone split-zone--v split-zone--v-b" data-bet-key="split:${pairB[0]}-${pairB[1]}" data-label="${pairB[0]}-${pairB[1]}"></button>
    <button class="bet-zone split-zone split-zone--v split-zone--v-c" data-bet-key="split:${pairC[0]}-${pairC[1]}" data-label="${pairC[0]}-${pairC[1]}"></button>
  `;
}

function createCorners(row) {
  if (row === 11) return "";
  const base = row * 3 + 1;
  const nextBase = base + 3;
  const current = [base + 2, base + 1, base];
  const next = [nextBase + 2, nextBase + 1, nextBase];
  const cornerA = [current[0], current[1], next[0], next[1]].sort((a, b) => a - b);
  const cornerB = [current[1], current[2], next[1], next[2]].sort((a, b) => a - b);

  return `
    <button class="bet-zone corner-zone corner-zone--a" data-bet-key="corner:${cornerA.join("-")}" data-label="${cornerA.join("-")}"></button>
    <button class="bet-zone corner-zone corner-zone--b" data-bet-key="corner:${cornerB.join("-")}" data-label="${cornerB.join("-")}"></button>
  `;
}

function createRowMarkup(row) {
  const base = row * 3 + 1;
  const numbers = [base + 2, base + 1, base];
  return `
    <div class="inside-row" data-row="${row + 1}">
      <button class="bet-zone rail-zone rail-zone--street" data-bet-key="street:${base}-${base + 2}" data-label="street ${base}-${base + 2}">Street</button>
      <div class="inside-row__numbers">
        ${numbers.map(createNumberCell).join("")}
        ${createHorizontalSplits(row)}
      </div>
    </div>
  `;
}

function createDividerMarkup(row) {
  if (row === 11) return "";
  const start = row * 3 + 1;
  const end = start + 5;
  return `
    <div class="inside-divider">
      <button class="bet-zone rail-zone rail-zone--six" data-bet-key="sixLine:${start}-${end}" data-label="six line ${start}-${end}">6 line</button>
      <div class="inside-divider__grid">
        ${createVerticalSplits(row)}
        ${createCorners(row)}
      </div>
    </div>
  `;
}

export function createTableMarkup() {
  const rows = Array.from({ length: 12 }, (_, row) => createRowMarkup(row) + createDividerMarkup(row)).join("");

  return `
    <section class="table-card glass-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Premium Table</p>
          <h2>European Betting Surface</h2>
        </div>
        <label class="overlay-toggle">
          <input type="checkbox" data-overlay-toggle />
          <span>Study overlay</span>
        </label>
      </div>
      <div class="roulette-table" data-overlay="off">
        <div class="zero-complex">
          <button class="bet-zone zero-zone zero-zone--main" data-bet-key="straight:0" data-label="0"><span>0</span><div class="chip-stack" data-chip-stack="straight:0"></div></button>
          <button class="bet-zone zero-zone zero-zone--split-a" data-bet-key="split:0-3" data-label="0-3"></button>
          <button class="bet-zone zero-zone zero-zone--split-b" data-bet-key="split:0-2" data-label="0-2"></button>
          <button class="bet-zone zero-zone zero-zone--split-c" data-bet-key="split:0-1" data-label="0-1"></button>
          <button class="bet-zone zero-zone zero-zone--street-a" data-bet-key="street:0-2-3" data-label="0-2-3"></button>
          <button class="bet-zone zero-zone zero-zone--street-b" data-bet-key="street:0-1-2" data-label="0-1-2"></button>
        </div>
        <div class="inside-layout">
          ${rows}
        </div>
        <div class="bottom-bets">
          <div class="column-row">
            <button class="bet-zone outside-zone" data-bet-key="column:column-3" data-label="column 3">2 to 1</button>
            <button class="bet-zone outside-zone" data-bet-key="column:column-2" data-label="column 2">2 to 1</button>
            <button class="bet-zone outside-zone" data-bet-key="column:column-1" data-label="column 1">2 to 1</button>
          </div>
          <div class="dozen-row">
            <button class="bet-zone outside-zone" data-bet-key="dozen:dozen-1" data-label="dozen 1">1st 12</button>
            <button class="bet-zone outside-zone" data-bet-key="dozen:dozen-2" data-label="dozen 2">2nd 12</button>
            <button class="bet-zone outside-zone" data-bet-key="dozen:dozen-3" data-label="dozen 3">3rd 12</button>
          </div>
          <div class="outside-row">
            <button class="bet-zone outside-zone" data-bet-key="low:low" data-label="1 to 18">1 to 18</button>
            <button class="bet-zone outside-zone outside-zone--dark" data-bet-key="even:even" data-label="even">Even</button>
            <button class="bet-zone outside-zone outside-zone--red" data-bet-key="red:red" data-label="red">Red</button>
            <button class="bet-zone outside-zone outside-zone--dark" data-bet-key="black:black" data-label="black">Black</button>
            <button class="bet-zone outside-zone outside-zone--dark" data-bet-key="odd:odd" data-label="odd">Odd</button>
            <button class="bet-zone outside-zone" data-bet-key="high:high" data-label="19 to 36">19 to 36</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderChipStacks(root, groupedBets) {
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

export function highlightWinningZones(root, results) {
  root.querySelectorAll(".bet-zone.is-winning, .bet-zone.is-losing").forEach((node) => {
    node.classList.remove("is-winning", "is-losing");
  });

  for (const result of results) {
    const node = root.querySelector(`[data-bet-key="${CSS.escape(result.betKey)}"]`);
    if (!node) continue;
    node.classList.add(result.win ? "is-winning" : "is-losing");
  }
}
