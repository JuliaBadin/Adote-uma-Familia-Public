import { auth,  db, storage } from "./inicializacaofirebase.js";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

function validateEmail(email){
  const emailRegex = /^[\w-\+.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    showErrorMessage('email-error', 'Email Inválido');
    return false;
  }
  return true;
};

function validatePassword(password){
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    showErrorMessage('password-error', 'Senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial');
    return false;
  }
  return true;
};


function validatePhone(phone){
  const telefoneRegex = /^\(?\d{2}\)?[-.\s]?\d{5}[-.\s]?\d{4}$/;
  if (!telefoneRegex.test(phone)) {
    showErrorMessage('phone-error', 'Telefone Inválido');
    return false;
  }
  return true;
};

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

function validateAllComplete (...args) {
  let valid = true;
  args.forEach((arg, index) => {
    if (arg === "") {
      showErrorMessage(`field-${index}-error`, 'Preencha todos os campos');
      valid = false;
    }
  });
  return valid;
};

function showErrorMessage(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = message;
  } else {
  }
}

function clearErrorMessages() {
  document.querySelectorAll('.error-message').forEach(element => {
    element.innerText = "";
  });
}

document.getElementById("form-sign-up-donor").addEventListener("submit", async (event)=>{ 
  event.preventDefault(); 
  clearErrorMessages();

  const nameSignUpDonor = document.getElementById("name-sign-up-donor").value;
  const emailSignUpDonor = document.getElementById("email-sign-up-donor").value;
  const passwordSignUpDonor = document.getElementById("password-sign-up-donor").value;
  const phoneSignUpDonor = document.getElementById("phone-sign-up-donor").value;
  const citySignUpDonor = document.getElementById("city").value;
  const photoSignUpDonor = document.getElementById("photo-sign-up-donor").files[0];

  // Checa se os inputs estao corretos
  const isValid = validateAllComplete(nameSignUpDonor) &&
                  validateEmail(emailSignUpDonor) &&
                  validatePassword(passwordSignUpDonor) &&
                  validatePhone(phoneSignUpDonor);

  if (!isValid) return;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, emailSignUpDonor, passwordSignUpDonor);
    const user = userCredential.user;
    const docReference = doc(db, "usersDonors", user.uid);

    const userData={
      name: nameSignUpDonor,
      email: emailSignUpDonor,
      phone: phoneSignUpDonor,
      city: citySignUpDonor,
      lastUpdated: null,
      connectedFamilies: [],
      emailVerified: false
    };

    if (photoSignUpDonor && validateFile(photoSignUpDonor)) {
      const fileReference = ref(storage, `usersDonorsPhotos/${user.uid}/${photoSignUpDonor.name}`);
      await uploadBytes(fileReference, photoSignUpDonor);
      const downloadURL = await getDownloadURL(fileReference);
      userData.photoURL = downloadURL;
    }

    await setDoc(docReference, userData);

    const actionCodeSettings = {
      url: 'https://adoteumafamilia.org/index.html', // Página de redirecionamento após verificação
      handleCodeInApp: false,
    };

    await sendEmailVerification(user, actionCodeSettings);

    alert("Por favor verifique sua conta através do email que lhe enviamos.");

    localStorage.clear();
    await signOut(auth);
    location.reload();
          
    document.getElementById("fundo-modal-cadastro-doador").classList.toggle("hide");

  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        showErrorMessage('email-error', 'Email já está em uso');
        break;
      default:
        alert(error.message);
    }
  }    
});