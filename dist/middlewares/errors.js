function isValidationErrorArr(error) {
    return Array.isArray(error) && error.every((err) => err && "msg" in err);
}
export function parseError(error, _req, res, next) {
    if (error instanceof Error) {
        if (res.statusCode === 200)
            res.status(400);
        next([error.message]);
    }
    else if (isValidationErrorArr(error)) {
        const err = error.map((err) => typeof err.msg === "string" ? err.msg : "Unknown Validation Error");
        res.status(400);
        next(err);
    }
    else {
        res.status(500);
        next(`Unknown system error: ${String(error)}`);
    }
}
export function renderErrorPage(errors, _req, res, _next) {
    res.render("errorPage", {
        errors,
    });
}
