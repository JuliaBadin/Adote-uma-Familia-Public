import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./inicializacaofirebase.js"
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getUserType } from "./usertype.js";

let currentUser = null;

export async function setCurrentUser(user){
  currentUser = user;
  
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } })); //garante que o user vai estar logado antes de fazer alteracoes em outros scripts, por exemplo mostrar as infos do user logado
  updateNavbar();
};

function updateNavbar(){
  if (currentUser) {
    ['navbar-sign-up-donor', 'navbar-sign-up-family', 'navbar-sign-up-ong', 'navbar-login'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add("d-none");
    });
    ['navbar-profile', 'navbar-logout'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.remove("d-none");
    });
  } else {
    ['navbar-profile', 'navbar-logout'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add("d-none");
    });
    ['navbar-sign-up-donor', 'navbar-sign-up-family', 'navbar-sign-up-ong', 'navbar-login'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.remove("d-none");
    });
  }
}

onAuthStateChanged(auth, async (user)=>{
  setCurrentUser(user);
  if (user){
    if (user.emailVerified) {
      const usertype = getUserType();
      const userDoc = doc(db, usertype, user.uid);

      if (localStorage.getItem('emailVerified') === "false") {
        await updateDoc(userDoc, { emailVerified: true });
        localStorage.setItem('emailVerified', "true");
      }
    }
  }
});

export function getCurrentUser(){
  return currentUser;
};