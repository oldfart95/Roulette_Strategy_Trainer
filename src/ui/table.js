import { getBetDisplayLabel } from "../engine/bets.js";
import { RED_NUMBERS } from "../config.js";

const STREETS = Array.from({ length: 12 }, (_, index) => ({
  column: index + 1,
  top: index * 3 + 3,
  middle: index * 3 + 2,
  bottom: index * 3 + 1,
}));

function createNumberCell(number) {
  const colorClass = RED_NUMBERS.has(number) ? "red" : "black";
  return `
    <button class="bet-zone number-cell number-cell--${colorClass}" data-bet-key="straight:${number}" data-label="${number}" aria-label="${getBetDisplayLabel(`straight:${number}`)}">
      <span class="number-cell__disc">
        <span class="number-cell__value">${number}</span>
      </span>
      <div class="chip-stack" data-chip-stack="straight:${number}"></div>
    </button>
  `;
}

function createRowMarkup(key, rowClass) {
  return `
    <div class="number-row ${rowClass}">
      ${STREETS.map((street) => createNumberCell(street[key])).join("")}
    </div>
  `;
}

function createSeamNode({ betKey, label, classes, style }) {
  return `
    <button
      class="bet-zone seam-node ${classes}"
      data-bet-key="${betKey}"
      data-label="${label}"
      aria-label="${getBetDisplayLabel(betKey)}"
      style="${style}"
    >
      <div class="chip-stack chip-stack--edge" data-chip-stack="${betKey}"></div>
    </button>
  `;
}

function createGridSeamMarkup() {
  const targets = [];

  for (const street of STREETS) {
    const centerColumn = street.column - 0.5;

    targets.push(
      createSeamNode({
        betKey: `split:${Math.min(street.top, street.middle)}-${Math.max(street.top, street.middle)}`,
        label: `${street.top}/${street.middle}`,
        classes: "seam-node--split seam-node--split-horizontal",
        style: `--grid-column:${centerColumn}; --grid-row:1;`,
      }),
    );

    targets.push(
      createSeamNode({
        betKey: `split:${Math.min(street.middle, street.bottom)}-${Math.max(street.middle, street.bottom)}`,
        label: `${street.middle}/${street.bottom}`,
        classes: "seam-node--split seam-node--split-horizontal",
        style: `--grid-column:${centerColumn}; --grid-row:2;`,
      }),
    );

    targets.push(
      createSeamNode({
        betKey: `street:${street.bottom}-${street.top}`,
        label: `${street.bottom}-${street.top}`,
        classes: "seam-node seam-node--street",
        style: `--grid-column:${centerColumn};`,
      }),
    );

    if (street.column < STREETS.length) {
      const nextStreet = STREETS[street.column];
      const seamColumn = street.column;

      targets.push(
        createSeamNode({
          betKey: `split:${Math.min(street.top, nextStreet.top)}-${Math.max(street.top, nextStreet.top)}`,
          label: `${street.top}/${nextStreet.top}`,
          classes: "seam-node--split seam-node--split-vertical seam-node--top",
          style: `--grid-column:${seamColumn};`,
        }),
      );

      targets.push(
        createSeamNode({
          betKey: `split:${Math.min(street.middle, nextStreet.middle)}-${Math.max(street.middle, nextStreet.middle)}`,
          label: `${street.middle}/${nextStreet.middle}`,
          classes: "seam-node--split seam-node--split-vertical seam-node--middle",
          style: `--grid-column:${seamColumn};`,
        }),
      );

      targets.push(
        createSeamNode({
          betKey: `split:${Math.min(street.bottom, nextStreet.bottom)}-${Math.max(street.bottom, nextStreet.bottom)}`,
          label: `${street.bottom}/${nextStreet.bottom}`,
          classes: "seam-node--split seam-node--split-vertical seam-node--bottom",
          style: `--grid-column:${seamColumn};`,
        }),
      );

      targets.push(
        createSeamNode({
          betKey: `corner:${[street.middle, street.top, nextStreet.middle, nextStreet.top].sort((a, b) => a - b).join("-")}`,
          label: `${street.middle}-${street.top}-${nextStreet.middle}-${nextStreet.top}`,
          classes: "seam-node--corner seam-node--corner-top",
          style: `--grid-column:${seamColumn};`,
        }),
      );

      targets.push(
        createSeamNode({
          betKey: `corner:${[street.bottom, street.middle, nextStreet.bottom, nextStreet.middle].sort((a, b) => a - b).join("-")}`,
          label: `${street.bottom}-${street.middle}-${nextStreet.bottom}-${nextStreet.middle}`,
          classes: "seam-node--corner seam-node--corner-bottom",
          style: `--grid-column:${seamColumn};`,
        }),
      );

      targets.push(
        createSeamNode({
          betKey: `sixLine:${street.bottom}-${nextStreet.top}`,
          label: `${street.bottom}-${nextStreet.top}`,
          classes: "seam-node seam-node--six-line",
          style: `--grid-column:${seamColumn};`,
        }),
      );
    }
  }

  return targets.join("");
}

function createColumnMarkup() {
  return `
    <div class="column-strip">
      <button class="bet-zone column-zone" data-bet-key="column:column-3" data-label="column 3"><span class="column-zone__label">2 to 1</span></button>
      <button class="bet-zone column-zone" data-bet-key="column:column-2" data-label="column 2"><span class="column-zone__label">2 to 1</span></button>
      <button class="bet-zone column-zone" data-bet-key="column:column-1" data-label="column 1"><span class="column-zone__label">2 to 1</span></button>
    </div>
  `;
}

function createZeroMarkup(wheelMode = "european") {
  if (wheelMode === "american") {
    return `
      <div class="zero-lane zero-lane--american">
        <button class="bet-zone zero-zone zero-zone--american zero-zone--top" data-bet-key="straight:0" data-label="0">
          <span class="zero-zone__value">0</span>
          <div class="chip-stack" data-chip-stack="straight:0"></div>
        </button>
        <button class="bet-zone zero-zone zero-zone--american zero-zone--bottom" data-bet-key="straight:00" data-label="00">
          <span class="zero-zone__value">00</span>
          <div class="chip-stack" data-chip-stack="straight:00"></div>
        </button>
        <div class="zero-seam-layer">
          ${createSeamNode({
            betKey: "split:0-00",
            label: "0/00",
            classes: "seam-node--split seam-node--zero-double",
            style: "",
          })}
          ${createSeamNode({
            betKey: "split:0-3",
            label: "0/3",
            classes: "seam-node--split seam-node--zero-split seam-node--top",
            style: "--zero-row:1;",
          })}
          ${createSeamNode({
            betKey: "split:0-2",
            label: "0/2",
            classes: "seam-node--split seam-node--zero-split seam-node--middle",
            style: "--zero-row:2;",
          })}
          ${createSeamNode({
            betKey: "split:0-1",
            label: "0/1",
            classes: "seam-node--split seam-node--zero-split seam-node--bottom",
            style: "--zero-row:3;",
          })}
        </div>
      </div>
    `;
  }

  return `
    <div class="zero-lane">
      <button class="bet-zone zero-zone zero-zone--main" data-bet-key="straight:0" data-label="0">
        <span class="zero-zone__value">0</span>
        <div class="chip-stack" data-chip-stack="straight:0"></div>
      </button>
      <div class="zero-seam-layer">
        ${createSeamNode({
          betKey: "split:0-3",
          label: "0/3",
          classes: "seam-node--split seam-node--zero-split seam-node--top",
          style: "--zero-row:1;",
        })}
        ${createSeamNode({
          betKey: "split:0-2",
          label: "0/2",
          classes: "seam-node--split seam-node--zero-split seam-node--middle",
          style: "--zero-row:2;",
        })}
        ${createSeamNode({
          betKey: "split:0-1",
          label: "0/1",
          classes: "seam-node--split seam-node--zero-split seam-node--bottom",
          style: "--zero-row:3;",
        })}
        ${createSeamNode({
          betKey: "street:0-2-3",
          label: "0-2-3",
          classes: "seam-node seam-node--zero-street seam-node--top-band",
          style: "--zero-band:1;",
        })}
        ${createSeamNode({
          betKey: "street:0-1-2",
          label: "0-1-2",
          classes: "seam-node seam-node--zero-street seam-node--bottom-band",
          style: "--zero-band:2;",
        })}
      </div>
    </div>
  `;
}

export function createTableMarkup(wheelMode = "european") {
  return `
    <section class="table-card">
      <div class="table-card__header">
        <div class="table-card__title">
          <p class="eyebrow">${wheelMode === "american" ? "American Layout" : "European Layout"}</p>
          <h2>Traditional Betting Surface</h2>
        </div>
      </div>
      <div class="roulette-table">
        <div class="roulette-table__board">
          <div class="inside-board">
            ${createZeroMarkup(wheelMode)}
            <div class="inside-board__main">
              <div class="numbers-grid-shell">
                <div class="numbers-grid">
                  ${createRowMarkup("top", "number-row--top")}
                  ${createRowMarkup("middle", "number-row--middle")}
                  ${createRowMarkup("bottom", "number-row--bottom")}
                </div>
                <div class="grid-seam-layer">
                  ${createGridSeamMarkup()}
                </div>
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
  root.querySelectorAll(".bet-zone.has-stack").forEach((node) => node.classList.remove("has-stack"));
  const stackNodes = root.querySelectorAll("[data-chip-stack]");
  for (const node of stackNodes) node.innerHTML = "";

  const canReceiveGeneratedStack = (zone) =>
    zone?.matches(".number-cell, .zero-zone--main, .dozen-zone, .outside-zone, .column-zone");

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
      node.closest(".bet-zone")?.classList.add("has-stack");
      node.innerHTML = markup;
      continue;
    }

    const zone = root.querySelector(`[data-bet-key="${CSS.escape(betKey)}"]`);
    if (!zone || !canReceiveGeneratedStack(zone)) continue;
    zone.classList.add("has-stack");
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
