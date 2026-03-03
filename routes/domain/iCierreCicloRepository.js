const { AppError } = require('./appError');

class ICierreCicloRepository {
  constructor() {
    if (this.constructor === ICierreCicloRepository) {
      throw new AppError("Abstract class cannot be instantiated", 500);
    }
  }

  getCierreCiclo() {
    throw new AppError("Method 'getCierreCiclo()' must be implemented.", 500);
  }

  getByIdiccCierreCiclo(idIcc) {
    throw new AppError("Method 'getByIdiccCierreCiclo()' must be implemented.", 500);
  }

  findByOrder(orden) {
    throw new AppError("Method 'findByOrder()' must be implemented.", 500);
  }

  getFilterCierreCiclo(filter, search) {
    throw new AppError("Method 'getFilterCierreCiclo()' must be implemented.", 500);
  }

  createCierreCiclo(cierreCiclo) {
    throw new AppError("Method 'createCierreCiclo()' must be implemented.", 500);
  }

  updateCierreCiclo(cierreCiclo) {
    throw new AppError("Method 'updateCierreCiclo()' must be implemented.", 500);
  }

  createMasiveCierreCiclo(newCierreCiclo) {
    throw new AppError("Method 'createMasiveCierreCiclo()' must be implemented.", 500);
  }

  getCausaCierreCiclo(){
    throw new AppError("Method 'getCausaCierreCiclo()' must be implemented.", 500);
  }
  getRolesCierreCiclo(){
    throw new AppError("Method 'getRolesCierreCiclo()' must be implemented.", 500);
  }

  deleteCierreCiclo(orden) {
    throw new AppError("Method 'deleteCierreCiclo()' must be implemented.", 500);
  }

  test(orden) {
    throw new AppError("Method 'test()' must be implemented.", 500);
  }
}

module.exports = ICierreCicloRepository;