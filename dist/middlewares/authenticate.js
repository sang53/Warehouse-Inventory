export function ensureAuthenticated(req, res, next) {
    // redirect to login page if not logged in
    if (req.isAuthenticated())
        next();
    else
        res.status(401).redirect("/login");
}
// returns middleware function that only allows given roles &| admin
export function ensureRole(u_roles = [], admin = true) {
    return (req, res, next) => {
        const user = req.user;
        // make sure user has correct role or admin acess
        if (!u_roles.includes(user.u_role) && (!admin || user.u_role !== "admin")) {
            res.status(403);
            throw new Error(`Access Denied. Current Role: ${user.u_role}`);
        }
        next();
    };
}
