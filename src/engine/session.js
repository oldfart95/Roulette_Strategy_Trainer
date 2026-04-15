import { DEFAULT_SETTINGS, HISTORY_LIMIT, RECENT_RESULTS_LIMIT } from "../config.js";

export function createInitialSession(settings = DEFAULT_SETTINGS) {
  const bankroll = Number(settings.bankrollDefault) || DEFAULT_SETTINGS.bankrollDefault;
  return {
    wheelMode: settings.wheelMode ?? DEFAULT_SETTINGS.wheelMode,
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

export function snapshotBets(activeBets) {
  return activeBets.map((bet) => ({ ...bet }));
}

export function placeBet(session, bet) {
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

export function undoLastAction(session) {
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

export function clearBets(session) {
  const refunded = session.activeBets.reduce((sum, bet) => sum + bet.amount, 0);
  return {
    ...session,
    bankroll: session.bankroll + refunded,
    activeBets: [],
    actionStack: [],
  };
}

export function repeatPreviousBets(session) {
  return snapshotBets(session.previousBetLayout).map((bet) => ({
    ...bet,
    id: crypto.randomUUID(),
  }));
}

export function settleSpin(session, spinResult, resolution) {
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
        wheelMode: spinResult.wheelMode,
        source: spinResult.source,
      },
      ...session.fairnessLog,
    ].slice(0, 30),
    locked: false,
    lastOutcome: resolution.outcome,
    lastNet: resolution.net,
  };
}

export function lockSession(session) {
  return { ...session, locked: true };
}

export function unlockSession(session) {
  return { ...session, locked: false };
}

export function resetSession(session, settings) {
  return createInitialSession(settings);
}
