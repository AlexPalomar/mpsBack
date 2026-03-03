const CierreCicloService = require('./routes/app/cierreCicloService');
const CierreCicloUsecase = require('./routes/domain/cierreCicloUsecase');
const CierreCicloRepositoryImpl = require('./routes/infra/cierreCicloRepositoryImpl');

// Instancias únicas
const cierreCicloRepositoryImpl = new CierreCicloRepositoryImpl();
const cierreCicloUsecase = new CierreCicloUsecase(cierreCicloRepositoryImpl);
const cierreCicloService = new CierreCicloService(cierreCicloUsecase);

module.exports = {
  cierreCicloRepositoryImpl,
  cierreCicloUsecase,
  cierreCicloService
};
