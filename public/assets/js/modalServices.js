document.addEventListener('DOMContentLoaded', () => {
  const deleteModal = document.getElementById('deleteModal');
  const closeBtn = document.querySelector('.close');
  const noOption = document.querySelector('#noOption');
  const editForm = document.getElementById('editForm');

  // Asignar evento a todos los botones Editar
  document.querySelectorAll('#btn-delete').forEach(button => {
    button.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const cells = row.querySelectorAll('td');

      // Obtener los valores de la fila
      const idService = cells[1].innerText;

      // Llenar el formulario
      document.getElementById('deleteId').value = idService;

      // Mostrar el modal
      deleteModal.style.display = 'block';
    });
  });

  // Cerrar modal
  closeBtn.addEventListener('click', () => deleteModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });
  noOption.addEventListener('click', () => deleteModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });

});