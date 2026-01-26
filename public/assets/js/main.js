

document.addEventListener('DOMContentLoaded', () => {
  const btnCloseMessage = document.getElementById('#btnCloseMessage');
  const alertCloseMessage = document.getElementById('#alertCloseMessage');

  const btnShowModal = document.getElementById('btnHelpReport');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalHelpReport = document.getElementById('modalHelpReport');

  
  
  if (btnShowModal) {
    btnShowModal.addEventListener('click', () => {
    modalHelpReport.style.display = 'block';
    document.body.style.overflow = 'hidden';
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
    modalHelpReport.style.display = 'none';
    document.body.style.overflow = 'visible';
  });
  }

  window.addEventListener('click', (e) => {
      if (e.target === modalHelpReport) modalHelpReport.style.display = 'none';
      document.body.style.overflow = 'visible';
  });

  if (btnCloseMessage) {

      var validatorMsg = alertCloseMessage.getAttribute('class').includes('msgFlashActive')
      if (validatorMsg) {
        setTimeout(() => {
          alertCloseMessage.classList.add('msgFlashHidden');
          // Opcional: ocultar completamente después de la animación
          setTimeout(() => {
            alertCloseMessage.style.display = 'none';
          }, 600); // mismo tiempo que la transición
        
        }, 5000);
      }

      btnCloseMessage.addEventListener('click', () => {
        alertCloseMessage.style.display = 'none';
      });
    }
});