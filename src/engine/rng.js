import { getWheelOrder } from "../data/wheel.js";

export function secureRandomIndex(length) {
  if (!window.crypto?.getRandomValues) {
    throw new Error("Secure browser randomness is unavailable.");
  }

  const maxExclusive = 0x100000000;
  const biasLimit = maxExclusive - (maxExclusive % length);
  const buffer = new Uint32Array(1);

  while (true) {
    window.crypto.getRandomValues(buffer);
    const value = buffer[0];
    if (value < biasLimit) {
      return value % length;
    }
  }
}

export function generateSpin(wheelMode = "european") {
  const wheelOrder = getWheelOrder(wheelMode);
  const wheelIndex = secureRandomIndex(wheelOrder.length);
  return {
    wheelIndex,
    number: wheelOrder[wheelIndex],
    wheelMode,
    timestamp: Date.now(),
    source: "window.crypto.getRandomValues",
  };
}
