import { generateSpin } from "./rng.js";
import { resolveSpin } from "./payouts.js";

export function startSpin(session, settings = {}) {
  if (!session.activeBets.length) {
    throw new Error("Place at least one bet before spinning.");
  }
  if (session.locked) {
    throw new Error("Spin already in progress.");
  }

  const spin = generateSpin(settings.wheelMode);
  const resolution = resolveSpin(session.activeBets, spin.number);
  return { spin, resolution };
}
