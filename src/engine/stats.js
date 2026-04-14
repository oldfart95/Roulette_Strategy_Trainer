import { getNumberColor } from "../data/wheel.js";

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

export function computeStats(session) {
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
