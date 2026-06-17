function validarSessaoCliente(req, res, next) {
  if (req.session.usuario && req.session.usuario.tipo === 'cliente') {
    return next();
  }
  res.redirect('/login');
}

function validarSessaoAdmin(req, res, next) {
    console.log('Sessão:', req.session.usuario); 
  if (req.session.usuario && req.session.usuario.tipo === 'admin') {
    return next();
  }
  res.redirect('/login');
}

module.exports = { validarSessaoCliente, validarSessaoAdmin };