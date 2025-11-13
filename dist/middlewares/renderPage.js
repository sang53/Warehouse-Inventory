export default function (_req, res) {
    if (res.headersSent)
        return;
    const { locals } = res;
    assertLocals(locals, res);
    res.render(locals.view, locals.viewData);
}
// make sure .locals has correct shape for rendering
function assertLocals(locals, res) {
    const { view, viewData } = locals;
    if (!view || typeof view !== "string") {
        console.error("Invalid view: " + JSON.stringify(locals));
        res.status(404);
        throw new Error("Page Not Found");
    }
    else if (!viewData) {
        console.error("Invalid viewData: " + JSON.stringify(locals));
        res.status(404);
        throw new Error("Page Not Found");
    }
}
