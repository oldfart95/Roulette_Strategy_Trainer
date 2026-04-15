import { getBetDisplayLabel } from "../engine/bets.js";
import { RED_NUMBERS } from "../config.js";

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

export function createTableMarkup() {
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
