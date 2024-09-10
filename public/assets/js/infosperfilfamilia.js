import { getCurrentUser } from "./deteccaousuario.js"
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./inicializacaofirebase.js";
import { loadCities } from "./loadCities.js";
import { getLocalStorage } from "./usertype.js";

async function loadUserProfile() {
    try {
        const currentUserData = getLocalStorage();

        document.getElementById('user-name').placeholder = currentUserData.name || 'Nome Completo';
        document.getElementById('email').textContent = currentUserData.email || 'exemplo@email.com';
        document.getElementById('phone').placeholder = currentUserData.phone || '+55 99 99999-9999';
        document.getElementById('description').value = currentUserData.description || 'Conte sua história';
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
  
async function getConnectedDonors() {
    const currentUser = getCurrentUser();
    const currentUserData = getLocalStorage();
    if (currentUser) {
        try {
            if (currentUserData.connectedDonors.length > 0) {
                const donorsList = document.getElementById('connected-donors-list');
                donorsList.innerHTML = '';

                for (const donorUID of currentUserData.connectedDonors) {
                const donorRef = doc(db, "usersDonors", donorUID);
                const donorData = (await getDoc(donorRef)).data();

                const contactMethod = isMobileDevice() ? `tel:${donorData.phone || ''}` : `mailto:${donorData.email || ''}`;

                const donorCard = `
                    <div class="col-lg-4">
                        <div class="card-box">
                            <div><img src="${donorData.photoURL || 'assets/img/default-user.png'}" class="family-photo"></div>
                            <div>
                                <h4>${donorData.name || 'Nome não disponível'}</h4>
                            </div>
                                <button type="button" class="btn btn-message" onclick="window.location.href='${contactMethod}'">Mandar mensagem</button>
                            <div>
                                <p>Email: ${donorData.email || 'Email não disponível'}</p>
                                <p>Telefone: ${donorData.phone || 'Telefone não disponível'}</p>
                            </div>
                        </div>
                    </div>
                `;

                donorsList.innerHTML += donorCard;
                }
            }
        } catch (error) {
        }
    }
}

document.addEventListener('authStateChanged', loadUserProfile);
document.addEventListener('authStateChanged', getConnectedDonors);