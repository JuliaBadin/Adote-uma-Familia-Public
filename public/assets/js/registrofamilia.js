import { auth, db, storage } from "./inicializacaofirebase.js";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { setCurrentUser } from './deteccaousuario.js'

// Event listener pra atualizar contagem de caracteres da bio
document.getElementById('description').addEventListener('input', function() {
  const charCount = this.value.length;
  const maxCharCount = 300;
  document.getElementById('charCount').innerText = `${charCount} / ${maxCharCount}`;
});

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

// Função para incrementar a contagem de famílias da ONG
async function incrementOngFamilyCount(ongId) {
  const ongRef = doc(db, "usersONG", ongId);

  try {
    // Obtém o número atual de famílias
    const ongDoc = await getDoc(ongRef);
    const currentCount = ongDoc.data().numfamilies;

    await updateDoc(ongRef, { numfamilies: currentCount + 1 });

  } catch (error) {
    return null;
  }
}

document.getElementById("form-sign-up-family").addEventListener("submit", async (event) => {
  event.preventDefault(); 
  clearErrorMessages();

  const submitButton = document.getElementById("submit-sign-up-family");
  submitButton.disabled = true; // Desabilita o botão de envio, evita erro quando user clica + de 1 vez

  const nameSignUpFamily = document.getElementById("name-sign-up-family").value;
  const emailSignUpFamily = document.getElementById("email-sign-up-family").value;
  const passwordSignUpFamily = document.getElementById("password-sign-up-family").value;
  const phoneSignUpFamily = document.getElementById("phone-sign-up-family").value;
  const citySignUpFamily = document.getElementById("city").value;
  const photoSignUpFamily = document.getElementById("photo-sign-up-family").files[0];
  const description = document.getElementById("description").value;

  // Checa se os inputs estão corretos
  const isValid = validateAllComplete(nameSignUpFamily, citySignUpFamily, description) &&
                  validatePassword(passwordSignUpFamily) &&
                  validateEmail(emailSignUpFamily) &&
                  validatePhone(phoneSignUpFamily);

  if (!isValid){
    submitButton.disabled = false; // Reabilita o botão se a validação falhar
    return;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const ongId = urlParams.get('ongId')

    if (!ongId) throw new Error("ONG ID não encontrada");

    const userCredential = await createUserWithEmailAndPassword(auth, emailSignUpFamily, passwordSignUpFamily);
    const user = userCredential.user;
    const docReference = doc(db, "usersFamily", user.uid);

    const userData = {
      name: nameSignUpFamily,
      email: emailSignUpFamily,
      phone: phoneSignUpFamily,
      city: citySignUpFamily,
      description: description,
      lastUpdated: null,
      emailVerified: false,
      connectedDonors: [],
      random: getRandomToken(),
    };

    if (photoSignUpFamily && validateFile(photoSignUpFamily)) {
      const fileReference = ref(storage, `usersFamilyPhotos/${user.uid}/${photoSignUpFamily.name}`);
      await uploadBytes(fileReference, photoSignUpFamily);
      const downloadURL = await getDownloadURL(fileReference);
      userData.photoURL = downloadURL;
    }

    await setDoc(docReference, userData);

    await incrementOngFamilyCount(ongId);

    const actionCodeSettings = {
    url: 'https://adoteumafamilia.org/index.html', // Página de redirecionamento após verificação
    handleCodeInApp: false,
    };

    await sendEmailVerification(user, actionCodeSettings);

    alert("Por favor verifique sua conta através do email que lhe enviamos.");

    localStorage.clear();
    await signOut(auth);
    setCurrentUser(null);

    window.location.href = '/inicio';
      
  } catch (error) {
    submitButton.disabled = false; // Reabilita o botão em caso de erro
    switch (error.code) {
      case "auth/email-already-in-use": 
        showErrorMessage('email-error', 'Email já está em uso');
      default: alert('Um erro aconteceu durante o cadastro, aguarde um instante e tente novamente');
    }
  }
});

function getRandomToken() {
  return Math.floor(Math.random() * 100000); // Gera um número aleatório entre 0 e 99999
}