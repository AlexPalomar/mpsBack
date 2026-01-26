document.addEventListener('DOMContentLoaded', () => {
  const editmodal = document.getElementById('editModal');
  const deleteUserModal = document.getElementById('deleteUserModal');
  const closeBtnEditUser = document.querySelector('#closeEditUser');
  const noOptionUser = document.querySelector('#noOptionUser');
  const contentInfoUser = document.querySelector('#infoUser');
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
      const estado = cells[7].innerText;

      // Llenar el formulario
      document.getElementById('editId').value = identificacion;
      document.getElementById('editName').value = nombre;
      document.getElementById('editRole').value = role;
      document.getElementById('editEmail').value = correo;
      document.getElementById('editStatus').value = estado;

      // Mostrar el modal
      editmodal.style.display = 'block';
    });
  });

  document.querySelectorAll('#btn-deleteUser').forEach(button => {
    button.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const cells = row.querySelectorAll('td');

      // Obtener los valores de la fila
      const identificacion = cells[1].innerText;
      const nombre = cells[2].innerText;
      const role = cells[3].innerText;
      const correo = cells[4].innerText;

      // Llenar el formulario
      document.getElementById('deleteUserId').value = identificacion;

      contentInfoUser.innerHTML = 
        "<section style='padding: 8px;'>" +
          "<div>Nombre: "+ nombre + "</div>" +
          "<div>Correo: "+ correo + "</div>" +
          "<div>Role: "+ role + "</div>" +
        "</section>";
      
      

      // Mostrar el modal
      deleteUserModal.style.display = 'block';
    });
  });

  // Cerrar modal
  if(closeBtnEditUser){
    closeBtnEditUser.addEventListener('click', () => editmodal.style.display = 'none', deleteUserModal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === editmodal) editmodal.style.display = 'none';
    });
  }

  // cerrar modal deleteUser
  if(noOptionUser){
    noOptionUser.addEventListener('click', () => deleteUserModal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === deleteUserModal) deleteUserModal.style.display = 'none';
    });
  }

});
