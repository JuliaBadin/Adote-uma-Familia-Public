import { getLocalStorage } from "./usertype.js";
import { db } from "./inicializacaofirebase.js";
import { getDocs, query, where, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadUserProfile() {
    try {
        const currentUserData = getLocalStorage();

        document.getElementById('user-name').textContent = currentUserData.name || 'Nome da ONG';
        document.getElementById('email').textContent = currentUserData.email || 'exemplo@email.com';
        document.getElementById('city').textContent = currentUserData.city || 'Nome da cidade';
        document.getElementById('phone').textContent = currentUserData.phone || '+55 51 99999-9999';
        document.getElementById('numfamilies').textContent = currentUserData.numfamilies || '0';
        

        // Exibir foto do perfil do usuário, ou uma foto padrão se não houver foto cadastrada
            const userPhoto = document.getElementById('user-photo');
            try {
                userPhoto.src = currentUserData.photoURL;
            } catch (error) {
                userPhoto.src = 'assets/img/default-user.png'; 
            }
    } catch (error) {
    }
}
document.addEventListener('authStateChanged', loadUserProfile);


// Verifica se email da família já está cadastrado
document.querySelector(".submit-search-icon").addEventListener("click", function() {
    const emailORphone = document.getElementById('search-family-input').value;
    pesquisarFamilia(emailORphone);
  });
  // Verifica se o email da família existe na database
  async function pesquisarFamilia(emailORphone) {
    try {
      let querySnapshot = await getDocs(query(collection(db, "usersFamily"), where("email", "==", emailORphone)));
      if (querySnapshot.empty){
          querySnapshot = await getDocs(query(collection(db, "usersFamily"), where("phone", "==", emailORphone)));
      }
      if (!querySnapshot.empty) {
        alert("Essa família já está cadastrada!");
      } else {
        alert("Essa família ainda não está cadastrada!");
      }
      document.getElementById('search-family-input').value=''; // Limpa o campo
    } catch (error) {
    }
  }