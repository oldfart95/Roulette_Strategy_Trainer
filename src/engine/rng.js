import { WHEEL_ORDER } from "../config.js";

export function secureRandomIndex(length) {
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

export function generateSpin() {
  const wheelIndex = secureRandomIndex(WHEEL_ORDER.length);
  return {
    wheelIndex,
    number: WHEEL_ORDER[wheelIndex],
    timestamp: Date.now(),
    source: "window.crypto.getRandomValues",
  };
}
