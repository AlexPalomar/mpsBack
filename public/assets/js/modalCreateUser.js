document.addEventListener('DOMContentLoaded', () => {
  const btnCreate = document.getElementById('btn-create');
  const closeBtnAlert = document.querySelector('#close');
  const modalAlert = document.getElementById('createModal');

  if(btnCreate){
    btnCreate.addEventListener('click', (e) => {
      modalAlert.style.display = 'block';
    });
  }

  if(closeBtnAlert){
    closeBtnAlert.addEventListener('click', () => {
      modalAlert.style.display = 'none';
    });
  }
  window.addEventListener('click', (e) => {
    if (e.target === modalAlert) modalAlert.style.display = 'none';
  });

  var viewPass = document.getElementById('viewPass');
  var inputPassword = document.getElementById("createPassword");
  var viewPassConfirm = document.getElementById('viewPassConfirm');
  var confirmPassword = document.getElementById("confirmPassword");
  if(viewPass){
      viewPass.addEventListener('click', () =>{ 

    if(inputPassword.type == "password"){
          inputPassword.type = "text";
          confirmPassword.type = "text";
      }else{
          inputPassword.type = "password";
          confirmPassword.type = "password";
      }
  });
  }
      
});
    