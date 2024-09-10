import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./inicializacaofirebase.js";
import { loadCities } from "./loadCities.js";
import { getLocalStorage } from "./usertype.js";
import { getCurrentUser } from "./deteccaousuario.js";

async function loadUserProfile() {
  try {
    const currentUserData = getLocalStorage();

    document.getElementById('user-name').placeholder = currentUserData.name || 'Nome de usuário';
    document.getElementById('email').textContent = currentUserData.email || 'exemplo@email.com';
    document.getElementById('phone').placeholder = currentUserData.phone || '+55 51 99999-9999';
    loadCities(currentUserData.city);

    const userPhoto = document.getElementById('user-photo');
    if (currentUserData.photoURL) {
        userPhoto.src = currentUserData.photoURL;
    } else {
        userPhoto.src = 'assets/img/default-user.png';
    }
  } catch (error) {
  }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function getConnectedFamilies() {
  const currentUserData = getLocalStorage();
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    try {
      if (currentUserData.connectedFamilies.length > 0) {
        const familyList = document.getElementById('connected-family-list');
        familyList.innerHTML = '';

        for (const familyUID of currentUserData.connectedFamilies) {
          if (familyUID != " "){
            const familyRef = doc(db, "usersFamily", familyUID);
            const familyData = (await getDoc(familyRef)).data();

            const contactMethod = isMobileDevice() ? `tel:${familyData.phone || ''}` : `mailto:${familyData.email || ''}`;

            const familyCard = `
              <div class="col-lg-4">
                <div class="card-box">
                  <div><img src="${familyData.photoURL || 'assets/img/default-user.png'}" class="family-photo"></div>
                  <div>
                    <h4>${familyData.name || 'Nome não disponível'}</h4>
                    <p>${familyData.city || 'Cidade não disponível'}</p>
                  </div>
                  <button type="button" class="btn btn-message" onclick="window.location.href='${contactMethod}'">Mandar mensagem</button>
                  <div>
                    <p>Email: ${familyData.email || 'Email não disponível'}</p>
                    <p>Telefone: ${familyData.phone || 'Telefone não disponível'}</p>
                  </div>
                </div>
              </div>
            `;

            familyList.innerHTML += familyCard;
          }
        }
      }
    } catch (error) {
    }
  }
}

document.addEventListener('authStateChanged', loadUserProfile);
document.addEventListener('authStateChanged', getConnectedFamilies);