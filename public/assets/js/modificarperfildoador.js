import { storage, db } from "./inicializacaofirebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getCurrentUser } from "./deteccaousuario.js";
import { getLocalStorage } from "./usertype.js";

// Função para alternar entre o modo de edição e visualização
function toggleEditMode(isEditMode) {
  const editableFields = document.querySelectorAll('.editable'); // Seleciona todos os elementos que possuem a classe 'editable'
  editableFields.forEach(field => {
      field.disabled = !isEditMode; // Add/remove 'disabled' dos campos baseado no valor de 'isEditMode'
  });
  // Alterna a visibilidade dos botões 'Atualizar perfil' e 'Salvar'
  document.getElementById('edit-button').style.display = isEditMode ? 'none' : 'inline-block';
  document.getElementById('save-button').style.display = isEditMode ? 'inline-block' : 'none';  

  // Alterna a classe 'edit-mode' para ativar/desativar botão de upload
  const profileSection = document.querySelector('.profile-section');
  const button = document.getElementById('photo-upload-button')
  if (isEditMode) {
    profileSection.classList.add('edit-mode');
    button.classList.remove('d-none');
  } else {
    profileSection.classList.remove('edit-mode');
    button.classList.add('d-none');
  }
}


// Event listener para quando o botão de editar perfil for clicado
document.getElementById('edit-button').addEventListener('click', function() {
  const now = Date.now();
  const currentUserData = getLocalStorage();
  const lastUpdated = currentUserData.lastUpdated || 0;
  if (now - lastUpdated < 24 * 60 * 60 * 1000) {
    alert('Você só pode atualizar seus dados uma vez a cada 24 horas.');
    return;
  }
  toggleEditMode(true); // Ativa o modo de edição
});


// Event listener para quando o botão de salvar for clicado
document.getElementById('save-button').addEventListener('click', async function(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  const currentUserData = getLocalStorage();
  const userRef = doc(db, "usersDonors", currentUser.uid);

  const newName = document.getElementById("user-name").value || currentUserData.name;
  const newCity = document.getElementById("city").value || currentUserData.city;
  const newPhone = document.getElementById("phone").value || currentUserData.phone;
  const newPhotoFile = document.getElementById("photo-upload").files[0];

  const newUserData = {};

  if(!validatePhone(newPhone)) return;

  try {
    if (newName) newUserData.name = newName;
    if (newCity) newUserData.city = newCity;
    if (newPhone) newUserData.phone = newPhone;

    if (newPhotoFile && validateFile(newPhotoFile)) {
      const fileRef = ref(storage, `usersDonorsPhotos/${currentUser.uid}/${newPhotoFile.name}`);
      await uploadBytes(fileRef, newPhotoFile);

      const downloadURL = await getDownloadURL(fileRef);
      await updateDoc(userRef, { photoURL: downloadURL });

      newUserData.photoURL = downloadURL;
      document.getElementById('user-photo').src = downloadURL;
    }

    if (Object.keys(newUserData).length > 0) {
      newUserData.lastUpdated = Date.now();
      await updateDoc(userRef, newUserData); // Atualiza os dados do usuário no Firestore

      // Atualizar o localStorage
      for (const key in newUserData) {
        localStorage.setItem(key, JSON.stringify(newUserData[key]));
      }
      localStorage.setItem("lastUpdated", Date.now());
    }
    
    location.reload();

  } catch (error) {
  } finally {
      toggleEditMode(false); // Desabilita o modo de edição após salvar
  }
});

function validateFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!file) {
    alert('Nenhum arquivo selecionado.');
    return false;
  }

  if (file.size > maxSize) {
    alert('O arquivo deve ter menos de 5MB.');
    return false;
  }

  if (!file.type.startsWith('image/')) {
    alert('O arquivo deve ser uma imagem.');
    return false;
  }

  return true;
}

function validatePhone(phone){
  const telefoneRegex = /^\(?\d{2}\)?[-.\s]?\d{5}[-.\s]?\d{4}$/;
  if (!telefoneRegex.test(phone)) {
    const element = document.getElementById('phone-error');
    if (element) {
      element.innerText = "Telefone Inválido";
    }
    return false;
  }
  return true;
};