
const helpers = require('../../lib/helpers');

class CierreCicloUsecase {
  constructor(iCierreCicloRepository) {
    this.iCierreCicloRepository = iCierreCicloRepository;
  }

  getCierreCiclo() {
    return this.iCierreCicloRepository.getCierreCiclo();
  }
  
  getByIdiccCierreCiclo(idIcc) {
    return this.iCierreCicloRepository.getByIdiccCierreCiclo(idIcc);
  }
  getFilterCierreCiclo(filter, search) {
    return this.iCierreCicloRepository.getFilterCierreCiclo(filter, search);
  }
  getCausaCierreCiclo() {
    return this.iCierreCicloRepository.getCausaCierreCiclo();
  }
  getRolesCierreCiclo() {
    return this.iCierreCicloRepository.getRolesCierreCiclo();
  }

  async createCierreCiclo(cierreCiclo)  {
    const pyc = Number(cierreCiclo.calificacionPyC);
    const eyf = Number(cierreCiclo.calificacionEyF);
    const rs  = Number(cierreCiclo.calificacionRS);

    const promedioNps = Number(((pyc + eyf + rs) / 3).toFixed(2));
    const snapshot = await this.iCierreCicloRepository.findByOrder(cierreCiclo.orden);
    const data  = snapshot[0];
    if (data) {
      throw new Error('Esta OT ya esta registrada.');
    }

    const newCierreCiclo = {
      idCCiclo: helpers.generateCodeCC(),
      cliente: cierreCiclo.cliente.toUpperCase(),
      order: cierreCiclo.orden,
      phoneNumber: cierreCiclo.telefono,
      address: cierreCiclo.direccion.toUpperCase(),
      tecnico: cierreCiclo.tecnico.toUpperCase(),
      superviser: cierreCiclo.superviser.toUpperCase(),
      observation: cierreCiclo.observaciones.toUpperCase(),
      createdAt: cierreCiclo.fechaCreacion.toUpperCase(),
      // modifiedAt: admin.firestore.Timestamp.now(),
      status: cierreCiclo.estado.toUpperCase(),
      presentacionComportamiento: pyc,
      esteticaFuncionamiento: eyf,
      recomendacionServicio: rs,
      promedioNps,
      estadoGestionCC: cierreCiclo.estadoGestionCierreCiclo,
      causaCierreCiclo: 'N/A',
      createdBy: cierreCiclo.user.toUpperCase(),
      modifiedBy: 'N/A',
      notesClousure: 'N/A',
      evidence: 'N/A'
    };

    return this.iCierreCicloRepository.createCierreCiclo(newCierreCiclo);
  }

  async updateCierreCiclo(cierreCiclo) {
    //Buscar el documento por idCCiclo
    const snapshot = await this.getByIdiccCierreCiclo(cierreCiclo.editCcidCCiclo);
    const currentData = snapshot[0];
    // Validar si hubo cambios
    const hasChanges =
      currentData.idCCiclo !== cierreCiclo.editCcidCCiclo.toUpperCase() ||
      currentData.cliente !== cierreCiclo.editCccliente.toUpperCase() ||
      currentData.order !== cierreCiclo.editCcorden ||
      currentData.phoneNumber !== cierreCiclo.editCctelefono ||
      currentData.address !== cierreCiclo.editCcdireccion.toUpperCase() ||
      currentData.tecnico !== cierreCiclo.editCctecnico.toUpperCase() ||
      currentData.superviser !== cierreCiclo.editCcsuperviser.toUpperCase() ||
      currentData.observation !== cierreCiclo.editCcobservaciones.toUpperCase() ||
      currentData.presentacionComportamiento !== cierreCiclo.editCalificacionPyC || 
      currentData.esteticaFuncionamiento !== cierreCiclo.editCalificacionEyF ||
      currentData.recomendacionServicio !== cierreCiclo.editCalificacionRS ||
      currentData.causaCierreCiclo !== cierreCiclo.editCcCausa ||
      currentData.estadoGestionCC !== cierreCiclo.editEstadoGestionCierreCiclo ||
      currentData.status !== cierreCiclo.editCcestado ||
      currentData.notesClousure !== cierreCiclo.editCcNotas.toUpperCase();

    if (!hasChanges) {
      return {hasChanges: false};
    }
    //Obtener el ID real del documento
    const doc = snapshot[0];
    const docId = snapshot[0].id;
    const pyc = Number(cierreCiclo.editCalificacionPyC);
    const eyf = Number(cierreCiclo.editCalificacionEyF);
    const rs  = Number(cierreCiclo.editCalificacionRS);
    const promedioNps = Number(((pyc + eyf + rs) / 3).toFixed(2));

    const updateCC = {
      idCCiclo: cierreCiclo.editCcidCCiclo.toUpperCase(),
      cliente: cierreCiclo.editCccliente.toUpperCase(),
      order: cierreCiclo.editCcorden,
      phoneNumber: cierreCiclo.editCctelefono,
      address: cierreCiclo.editCcdireccion.toUpperCase(),
      tecnico: cierreCiclo.editCctecnico.toUpperCase(),
      superviser: cierreCiclo.editCcsuperviser.toUpperCase(),
      observation: cierreCiclo.editCcobservaciones.toUpperCase(),
      presentacionComportamiento: cierreCiclo.editCalificacionPyC, 
      esteticaFuncionamiento: cierreCiclo.editCalificacionEyF, 
      recomendacionServicio: cierreCiclo.editCalificacionRS,
      causaCierreCiclo: cierreCiclo.editCcCausa,
      estadoGestionCC: cierreCiclo.editEstadoGestionCierreCiclo,
      promedioNps: promedioNps,
      // modifiedAt: admin.firestore.Timestamp.now(),
      status: cierreCiclo.editCcestado,
      createdBy: doc.createdBy,
      modifiedBy: cierreCiclo.user.toUpperCase(),
      notesClousure: cierreCiclo.editCcNotas.toUpperCase(),
      evidence: null
    };
    return this.iCierreCicloRepository.updateCierreCiclo(updateCC);
  }

  async createMasiveCierreCiclo(excelData, user) {

    // Obtener órdenes existentes
    const ordersExistentes = new Set(
      await this.iCierreCicloRepository.getOrdersExistentes()
    );

    // Filtrar registros nuevos
    const nuevos = excelData.filter(row =>
      row['Orden de trabajo'] &&
      !ordersExistentes.has(row['Orden de trabajo'])
    );

    // Transformar datos (lógica de negocio)
    const dataToSave = nuevos.map(row => {

      const pyc = Number(row['Como califica la presentación personal, comportamiento y aptitud de los técnicos?']) || 0;
      const eyf = Number(row['Los servicios instalados cumplen con su necesidad en cuanto a estética y funcionamiento?']) || 0;
      const rs  = Number(row['Recomendaría usted los servicios de Claro?']) || 0;

      const promedioNps = Number(((pyc + eyf + rs) / 3).toFixed(2)) || null;

      return {
        idCCiclo: helpers.generateCodeCC(),
        cliente: row.Nombre || '',
        order: row['Orden de trabajo'],
        phoneNumber: (row['Telefono dos del cliente'] && row['Teléfono uno del contacto'])
          ? `${row['Telefono dos del cliente']} - ${row['Teléfono uno del contacto']}`
          : '0',
        address: row['Dirección campo 1'] || '',
        tecnico: row['Técnico'] || '',
        superviser: row['supervisor'] || '',
        observation: row['observaciones'] || '',
        presentacionComportamiento: pyc,
        esteticaFuncionamiento: eyf,
        recomendacionServicio: rs,
        causaCierreCiclo: '',
        estadoGestionCC: '',
        promedioNps,
        createdBy: user.name.toUpperCase(),
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: 'PENDIENTE',
        notesClousure: ''
      };
    });

    // Guardar
    const insertados = await this.iCierreCicloRepository.createMasiveCierreCiclo(dataToSave);

    // Retornar resultado
    return {
      totalExcel: excelData.length,
      insertados,
      duplicados: excelData.length - insertados
    };
  }
}

module.exports = CierreCicloUsecase;