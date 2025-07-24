import { body } from "express-validator";

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

export function createAlphaChain(field: string) {
  return body(field)
    .trim()
    .notEmpty()
    .isAlpha()
    .withMessage(`${capitalise(field)}: ${alphaErr}`);
}

export function createLengthChain(field: string) {
  return body(field)
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage(`${capitalise(field)}: ${lengthErr}`);
}

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
