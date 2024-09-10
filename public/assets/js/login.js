import { auth } from "./inicializacaofirebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getCurrentUser, setCurrentUser } from "./deteccaousuario.js";
import { getUserType, setUserType } from "./usertype.js";

function showErrorMessage(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = message;
  }
}

function clearErrorMessages() {
  document.querySelectorAll('.error-message').forEach(element => {
    element.innerText = "";
  });
}


document.getElementById("form-login").addEventListener("submit", async (event)=>{
  event.preventDefault();
  clearErrorMessages();

  const emailLogin = document.getElementById("email-login").value;
  const passwordLogin = document.getElementById("password-login").value;
  
  try{
    const userCredential = await signInWithEmailAndPassword(auth, emailLogin, passwordLogin);
    const user = userCredential.user;
    await setUserType(user.uid);

    if (user.emailVerified || getUserType() == 'usersONG') {
      window.location.href = '../../perfil';
    } else {
      alert("Por favor, verifique seu email antes de continuar.");
      localStorage.clear();
      await signOut(auth);
      setCurrentUser(null);
    }
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-credential":
        showErrorMessage('email-error-login', 'Email/senha incorretos');
        break;
      default:
        showErrorMessage('email-error-login', error.code);
    }
  }    
});

// Event listener para o link de perfil all pages
document.addEventListener('DOMContentLoaded', () => {
  const profileLink = document.getElementById('profile-link');
  if (profileLink) {
    profileLink.addEventListener('click', async () => {
      if (getCurrentUser()) {
        window.location.href = '../../perfil';
      } else {
        alert('Faça login para continuar');
      }
    });
  }
});

document.getElementById('submit-redefinir-senha').addEventListener( "click", async (event) => {
  event.preventDefault();
  try {
    const actionCodeSettings = {
      url: 'https://adoteumafamilia.org/', // Página de redirecionamento após verificação
      handleCodeInApp: false,
    };

    const email = document.getElementById('reset-password').value;
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error) {
  }
});