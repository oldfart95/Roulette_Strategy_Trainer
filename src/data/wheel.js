import { BLACK_NUMBERS, RED_NUMBERS, WHEEL_ORDER } from "../config.js";

export function getNumberColor(number) {
  if (number === 0) return "green";
  if (RED_NUMBERS.has(number)) return "red";
  if (BLACK_NUMBERS.has(number)) return "black";
  return "unknown";
}

export function getNumberParity(number) {
  if (number === 0) return "zero";
  return number % 2 === 0 ? "even" : "odd";
}

export function getNumberRange(number) {
  if (number === 0) return "zero";
  return number <= 18 ? "low" : "high";
}

export function getDozen(number) {
  if (number === 0) return null;
  if (number <= 12) return 1;
  if (number <= 24) return 2;
  return 3;
}

export function getColumn(number) {
  if (number === 0) return null;
  const mod = number % 3;
  if (mod === 1) return 1;
  if (mod === 2) return 2;
  return 3;
}

export function getStreetIndex(number) {
  if (number === 0) return null;
  return Math.ceil(number / 3);
}

export function describeOutcome(number) {
  return {
    number,
    color: getNumberColor(number),
    parity: getNumberParity(number),
    range: getNumberRange(number),
    dozen: getDozen(number),
    column: getColumn(number),
    street: getStreetIndex(number),
  };
}

export function getWheelIndex(number) {
  return WHEEL_ORDER.indexOf(number);
}
