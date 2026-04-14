import { describeOutcome } from "../data/wheel.js";
import { describeBetType, getBetDefinition } from "./bets.js";

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

export function resolveSpin(activeBets, winningNumber) {
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
