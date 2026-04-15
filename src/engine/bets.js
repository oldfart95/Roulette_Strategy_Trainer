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

function sortBetNumbers(numbers) {
  return [...numbers].sort((a, b) => {
    if (a === b) return 0;
    if (a === 0) return -1;
    if (b === 0) return 1;
    if (a === "00") return -1;
    if (b === "00") return 1;
    return a - b;
  });
}

export function buildBetDefinitions() {
  const definitions = [];

  for (let number = 0; number <= 36; number += 1) {
    definitions.push(key("straight", [number], `${number}`));
  }
  definitions.push(key("straight", ["00"], "00"));

  for (let row = 0; row < INSIDE_GRID_ROWS.length; row += 1) {
    const numbers = INSIDE_GRID_ROWS[row];
    definitions.push(key("street", sortBetNumbers(numbers), `${numbers[2]}-${numbers[0]}`));

    if (row < INSIDE_GRID_ROWS.length - 1) {
      const next = INSIDE_GRID_ROWS[row + 1];
      const sixLineNumbers = sortBetNumbers([...numbers, ...next]);
      definitions.push(key("sixLine", sixLineNumbers, `${sixLineNumbers[0]}-${sixLineNumbers[sixLineNumbers.length - 1]}`));
    }

    for (let col = 0; col < numbers.length - 1; col += 1) {
      const splitNumbers = sortBetNumbers([numbers[col], numbers[col + 1]]);
      definitions.push(key("split", splitNumbers, `${splitNumbers[0]}-${splitNumbers[1]}`));
    }
  }

  for (let row = 0; row < INSIDE_GRID_ROWS.length - 1; row += 1) {
    const current = INSIDE_GRID_ROWS[row];
    const next = INSIDE_GRID_ROWS[row + 1];

    for (let col = 0; col < current.length; col += 1) {
      const splitNumbers = sortBetNumbers([current[col], next[col]]);
      definitions.push(key("split", splitNumbers, `${splitNumbers[0]}-${splitNumbers[1]}`));
    }

    for (let col = 0; col < current.length - 1; col += 1) {
      const cornerNumbers = sortBetNumbers([current[col], current[col + 1], next[col], next[col + 1]]);
      definitions.push(key("corner", cornerNumbers, `${cornerNumbers.join("-")}`));
    }
  }

  definitions.push(key("split", [0, 1], "0-1"));
  definitions.push(key("split", [0, 2], "0-2"));
  definitions.push(key("split", [0, 3], "0-3"));
  definitions.push(key("split", [0, "00"], "0-00"));
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

export const BET_DEFINITIONS = buildBetDefinitions();
export const BET_INDEX = new Map(BET_DEFINITIONS.map((definition) => [definition.key, definition]));

export function getBetDefinition(betKey) {
  return BET_INDEX.get(betKey) ?? null;
}

export function isValidBetKey(betKey) {
  return BET_INDEX.has(betKey);
}

export function getBetDisplayLabel(betKey) {
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

export function describeBetType(type) {
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
