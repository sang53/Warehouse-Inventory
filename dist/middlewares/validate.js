import { body, param, validationResult } from "express-validator";
export function validateAlphaNum(field) {
    return body(field)
        .notEmpty()
        .withMessage(`${field} Required`)
        .trim()
        .isAlphanumeric(undefined, { ignore: " " })
        .escape()
        .withMessage(`${field} Must Be Alphanumeric`);
}
export function validateInt(field) {
    return param(field)
        .notEmpty()
        .withMessage(`${field} is required`)
        .toInt()
        .isInt({ min: 1 })
        .withMessage(`${field} must be an integer > 0`);
}
export function validateOptionalInt(field) {
    return body(field)
        .optional()
        .toInt()
        .isInt({ min: 1 })
        .withMessage(`${field} must be an integer > 0`);
}
export function validateIntArr(field) {
    return [
        body(field).isArray({ min: 1 }).withMessage(`${field} must not be empty`),
        body(field + ".*")
            .toInt()
            .isInt({ min: 1 })
            .withMessage(`${field} must be integer > 0`),
    ];
}
function validateAlpha(field) {
    return body(field)
        .notEmpty()
        .withMessage(`${field} Required`)
        .trim()
        .isAlpha()
        .escape()
        .withMessage(`${field} must be string`);
}
function validateEnum(field, values) {
    return body(field)
        .notEmpty()
        .withMessage(`${field} is required`)
        .isIn(values)
        .withMessage(`${field} must be ${values.join(", ")}`);
}
export function validateOType(field = "o_type") {
    return [validateAlpha(field), validateEnum(field, ["IN", "OUT"])];
}
export function validateURole(field = "u_role") {
    return [
        validateAlpha(field),
        validateEnum(field, ["admin", "intake", "picker", "outgoing"]),
    ];
}
export function validatePassword(field = "password", confirmField = "passwordConfirm") {
    return [
        body(field)
            .trim()
            .notEmpty()
            .withMessage(`${field} is required`)
            .isLength({ min: 8 })
            .withMessage(`${field} must be at least 8 characters long`)
            .matches(/[a-z]/)
            .withMessage(`${field} must contain at least one lowercase letter`)
            .matches(/[A-Z]/)
            .withMessage(`${field} must contain at least one uppercase letter`)
            .matches(/[0-9]/)
            .withMessage(`${field} must contain at least one number`)
            .matches(/[^A-Za-z0-9]/)
            .withMessage(`${field} must contain at least one special character`),
        body(confirmField)
            .notEmpty()
            .withMessage(`${confirmField} is required`)
            .isLength({ min: 8 })
            .withMessage(`${field} must be at least 8 characters long`),
    ];
}
export function checkValidation(req, _res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty())
        next();
    else
        next(errors.array());
}
