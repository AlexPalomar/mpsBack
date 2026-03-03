

class CierreCicloService {
  constructor(cierreCicloUsecase) {
    this.cierreCicloUsecase = cierreCicloUsecase;
  }

  getCierreCiclo() {
    return this.cierreCicloUsecase.getCierreCiclo();
  }

  getByIdiccCierreCiclo(idIcc) {
    return this.cierreCicloUsecase.getByIdiccCierreCiclo(idIcc);
  }
  
  getFilterCierreCiclo(filter, search) {
    return this.cierreCicloUsecase.getFilterCierreCiclo(filter, search);
  }

  getCausaCierreCiclo() {
    return this.cierreCicloUsecase.getCausaCierreCiclo();
  }
  getRolesCierreCiclo() {
    return this.cierreCicloUsecase.getRolesCierreCiclo();
  }

  createCierreCiclo(cierreCiclo) {
    return this.cierreCicloUsecase.createCierreCiclo(cierreCiclo);
  }
  updateCierreCiclo(cierreCiclo) {
    return this.cierreCicloUsecase.updateCierreCiclo(cierreCiclo);
  }

  createMasiveCierreCiclo(excelData, user) {
    return this.cierreCicloUsecase.createMasiveCierreCiclo(excelData, user);
  }
}

module.exports = CierreCicloService;