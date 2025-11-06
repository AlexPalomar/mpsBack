document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('editModal');
  const closeBtn = document.querySelector('.close');
  const editForm = document.getElementById('editForm');

  // Asignar evento a todos los botones Editar
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const cells = row.querySelectorAll('td');

      // Obtener los valores de la fila
      const identificacion = cells[1].innerText;
      const nombre = cells[2].innerText;
      const role = cells[3].innerText;
      const correo = cells[4].innerText;
      const estado = cells[6].innerText;

      // Llenar el formulario
      document.getElementById('editId').value = identificacion;
      document.getElementById('editName').value = nombre;
      document.getElementById('editRole').value = role;
      document.getElementById('editEmail').value = correo;
      document.getElementById('editStatus').value = estado;

      // Mostrar el modal
      modal.style.display = 'block';
    });
  });

  // Cerrar modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Evento guardar
  // editForm.addEventListener('submit', (e) => {
  //   e.preventDefault();
  //   alert('Datos guardados:\n' + 
  //     document.getElementById('editId').value + '\n' +
  //     document.getElementById('editName').value + '\n' + 
  //     document.getElementById('editRole').value + '\n' +
  //     document.getElementById('editEmail').value) + '\n' +
  //     document.getElementById('editStatus').value;
  //   modal.style.display = 'none';
  // });

  
});
