
document.addEventListener('DOMContentLoaded', () => {
  const editCierreCicloModal = document.getElementById('editCierreCicloModal');
  const closeBtnCc = document.querySelector('#closeCierreCiclo');
  // const noOptionCc = document.querySelector('#noOptionUser');
  const contentInfoCc = document.querySelector('#infoUser');
  const editForm = document.getElementById('editCierreCicloForm');

  
    closeBtnCc.addEventListener('click', () => {
      editCierreCicloModal.style.display = 'none';
    });

    // Asignar evento a todos los botones Editar
    document.querySelectorAll('#btnCierreCicloDetail').forEach(button => {
      button.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const cells = row.querySelectorAll('td');
        // console.log(cells);
        // Obtener los valores de la fila
        const idCiclo = cells[1].innerText;
        const cliente = cells[2].innerText;
        const orden = cells[3].innerText;
        const telefono = cells[4].innerText;
        const direccion = cells[5].innerText;
        const tecnico = cells[6].innerText;
        const supervisor = cells[7].innerText;
        const observaciones = cells[8].innerText;
        const fechaCreacion = cells[9].innerText;
        const fechaModificacion = cells[10].innerText;
        const estado = cells[11].innerText;
        const notasCierre = cells[13].innerText;
        const calificacionPyC = cells[14].innerText;
        const calificacionEyF = cells[15].innerText;
        const calificacionRS = cells[16].innerText;
        const causaCierre = cells[18].innerText;
        const estadoGestion = cells[19].innerText;
        
        // Llenar el formulario
        document.getElementById('editCcidCCiclo').value = idCiclo;
        document.getElementById('editCccliente').value = cliente;
        document.getElementById('editCcorden').value = orden;
        document.getElementById('editCctelefono').value = telefono;
        document.getElementById('editCcdireccion').value = direccion;
        document.getElementById('editCctecnico').value = tecnico;
        document.getElementById('editCcsuperviser').value = supervisor;
        document.getElementById('editCcobservaciones').value = observaciones;
        document.getElementById('editCcfechaCreacion').value = fechaCreacion;
        document.getElementById('editCcultimaModificacion').value = fechaModificacion;
        document.getElementById('editCcCausa').value = causaCierre;
        document.getElementById('editEstadoGestionCierreCiclo').value = estadoGestion; 
        document.getElementById('editCcestado').value = estado;
        document.getElementById('editCcNotas').value = notasCierre;
        document.getElementById('editCalificacionPyC').value = parseFloat(calificacionPyC);
        document.getElementById('editCalificacionEyF').value = parseFloat(calificacionEyF);
        document.getElementById('editCalificacionRS').value = parseFloat(calificacionRS);

        // Mostrar el modal
        editCierreCicloModal.style.display = 'block';
      });
    });

    document.addEventListener('DOMContentLoaded', () => {

      const editForm = document.getElementById('editCierreCicloForm');
      const imagesInput = document.getElementById('images');

      // Limitar a 4 imágenes
      imagesInput.addEventListener('change', () => {
        if (imagesInput.files.length > 4) {
          alert('Solo puedes subir un máximo de 4 imágenes');
          imagesInput.value = '';
        }
      });

      // Interceptar submit
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();

        //serviceId (usa el ID que ya tienes en el modal)
        const serviceId = document.getElementById('editCcidCCiclo').value;
        formData.append('serviceId', serviceId);

        //Agregar imágenes
        for (let i = 0; i < imagesInput.files.length; i++) {
          formData.append('images', imagesInput.files[i]);
        }

        try {
          const response = await fetch('/upload-all', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Error al subir imágenes');
          }

          console.log('Imágenes subidas:', result.images);

          alert(`Se subieron ${result.count} imágenes correctamente`);

          //Cerrar modal
          document.getElementById('editCierreCicloModal').style.display = 'none';

        } catch (error) {
          console.error(error);
          alert('Error al subir imágenes');
        }
      });

    });


    // Cerrar modal
    closeBtnCc.addEventListener('click', () => editCierreCicloModal.style.display = 'none', editCierreCicloModal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === editCierreCicloModal) editCierreCicloModal.style.display = 'none';
    });
    // // cerrar modal deleteUser
    // noOptionUser.addEventListener('click', () => editCierreCicloModal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === editCierreCicloModal) editCierreCicloModal.style.display = 'none';
    });
  
});
