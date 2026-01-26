document.addEventListener('DOMContentLoaded', () => {
  const btnCreateCC = document.getElementById('btn-createCierreCiclo');
  const closeBtnAlertCC = document.querySelector('#closeCreateService');
  const modalCierreCiclo = document.getElementById('createCierreCicloModal');
  const closeLoadModal = document.getElementById('closeLoadModal');
  const loadDataModal = document.querySelector('#loadDataModal');
  const fileInput = document.getElementById('excelFile');
  const resetBtn = document.getElementById('resetBtn');
  const btnCreateCausaCierreCiclo = document.getElementById('btn-createCausaCierreCiclo');
  const causaCierreCicloModal = document.getElementById('causaCierreCicloModal');
  const closeCausaModal = document.getElementById('closeCausaModal');


    if(btnCreateCausaCierreCiclo && closeCausaModal && btnCreateCC && closeBtnAlertCC && modalCierreCiclo && closeLoadModal && loadDataModal && fileInput && resetBtn){

      btnCreateCausaCierreCiclo.addEventListener('click', (e) => {
        causaCierreCicloModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
      closeCausaModal.addEventListener('click', (e) => {
        causaCierreCicloModal.style.display = 'none';
      });

      btnCreateCC.addEventListener('click', (e) => {
        modalCierreCiclo.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
      
      closeBtnAlertCC.addEventListener('click', () => {
        modalCierreCiclo.style.display = 'none';
      });
      window.addEventListener('click', (e) => {
        if (e.target === modalCierreCiclo) modalCierreCiclo.style.display = 'none';
      });
      
      closeLoadModal.addEventListener('click', (e) => {
        loadDataModal.style.display = 'none';
      });
    
    window.addEventListener('click', (e) => {
      if (e.target === loadDataModal) loadDataModal.style.display = 'none';
    });

    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      
      
      if (!file) return;

      const reader = new FileReader();

      reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);

        // Leer Excel
        const workbook = XLSX.read(data, { type: 'array' });

        // Tomar la primera hoja
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const headers = Object.keys(jsonData[0]);
        
        renderTable(jsonData, headers);
        
      };
      reader.readAsArrayBuffer(file);
    });

    resetBtn.addEventListener('click', () => {
      fileInput.value = ''; // Esto limpia el input
      document.getElementById('cliente').value = '';
      document.getElementById('orden').value = '';
      document.getElementById('telefono').value = '';
      document.getElementById('direccion').value = '';
      document.getElementById('calificacionPyC').value = 0;
      document.getElementById('calificacionEyF').value = 0;
      document.getElementById('calificacionRS').value = 0;
    });

    // renderiza la tabla del excel
    window.addEventListener('click', (e) => {
      if (e.target === document.getElementById('loadDataModal')) listHtml.style.display = 'none';
    });

    let selectedRowData = null;

    // Crear tabla desde Excel
    function renderTable(jsonData, headers) {

      try {
        const tableHeaders = document.getElementById('tableHeaders');
        const tableBody = document.getElementById('tableBody');
        const actionBtn = document.getElementById('actionBtnLoadData');
        const messageLoadData = document.getElementById('messageLoadData');

        const REQUIRED_HEADERS = [
          'Técnico',
          'Fecha',
          'Nombre',
          'Dirección campo 1',
          'Tipo de Actividad',
          'Orden de trabajo',
          'Estado',
          'Zonas de trabajo',
          'Número de cuenta',
          'External ID',
          'Telefono dos del cliente',
          'Teléfono uno del contacto',
          'supervisor'
        ];

        equals = 0;
        noequals = 0;

        for (let index = 0; index < REQUIRED_HEADERS.length; index++) {
          if(REQUIRED_HEADERS[index] == headers[index]){
            equals++;
          }else noequals++;
        }

        if(equals < noequals){
          console.log(headers['Orden de trabajo']);
          messageLoadData.style.display = 'block';
          messageLoadData.innerHTML = 'El archivo no tiene el formato correcto.';
          fileInput.value = '';
          setTimeout(()=> {
              messageLoadData.style.display = 'none';
            }, 4000
          );
        }else{
          loadDataModal.style.display = 'block';
          
          
          tableHeaders.innerHTML = '';
          tableBody.innerHTML = '';
          selectedRowData = null;
          actionBtn.disabled = true;

          // Agrega encabezado para enumerar las filas
          const thId = document.createElement('th');
          thId.textContent = '#';
          tableHeaders.appendChild(thId);

          // Crear encabezados dinámicos
          Object.keys(jsonData[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.toUpperCase();
            tableHeaders.appendChild(th);
          });

          // Crear filas
          jsonData.forEach((rowData, index) => {
            const tr = document.createElement('tr');
            const tdId = document.createElement('td');
            tdId.textContent = index +1;
            tr.appendChild(tdId);
            tdId.classList.add('rowFixedLoadData');

            Object.values(rowData).forEach(value => {
              const td = document.createElement('td');
              td.textContent = value;
              tr.appendChild(td);
            });
            // Seleccionar fila
            tr.addEventListener('click', () => {
              document.querySelectorAll('#excelTable tbody tr')
                .forEach(r => r.classList.remove('table-primary'));

              tr.classList.add('table-primary');
              selectedRowData = rowData;
              actionBtn.disabled = false;

              const array = Object.values(selectedRowData);

              // Llenar el formulario
              document.getElementById('cliente').value = array[2];
              document.getElementById('orden').value = array[5];
              document.getElementById('telefono').value = array[10]+' - '+array[11];
              document.getElementById('direccion').value = array[3];
              document.getElementById('calificacionPyC').value = Number(array[12]) ? Number(array[12]): 0;
              document.getElementById('calificacionEyF').value = Number(array[13]) ? Number(array[13]): 0;
              document.getElementById('calificacionRS').value = Number(array[14]) ? Number(array[14]): 0;
            });

            actionBtn.addEventListener('click', () => {
              loadDataModal.style.display = 'none';
            });

            tableBody.appendChild(tr);
          });
        }
          

      } catch (error) {
        console.log(error);
        messageLoadData.display = 'block';
        fileInput.value = '';
        messageLoadData.innerHTML = 'El archivo no tiene el formato correcto.';
        setTimeout(()=> {
            messageLoadData.display = 'none';
          }, 3000
        );
        
      }
    }
  }
      
});
    
