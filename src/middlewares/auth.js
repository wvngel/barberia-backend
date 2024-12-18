const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ error: "No hay sesión activa" });
  };
  
  const isBarbero = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === "barbero") {
      return next();
    }
    return res.status(403).json({ error: "Acceso denegado: solo para barberos" });
  };
  
  const isCliente = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === "cliente") {
      return next();
    }
    return res.status(403).json({ error: "Acceso denegado: solo para clientes" });
  };
  
  module.exports = { isAuthenticated, isBarbero, isCliente };
  