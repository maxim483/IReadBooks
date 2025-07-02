export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ message: "You must be logged in." });
  }
  
  export function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: "Admins only." });
  }
  