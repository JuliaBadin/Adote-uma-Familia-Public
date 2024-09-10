import { db } from "./inicializacaofirebase.js";
import { collection, query, where, doc, getDocs, limit, updateDoc, arrayUnion, orderBy, startAt } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getCurrentUser } from "./deteccaousuario.js";
import { getLocalStorage } from "./usertype.js";

async function getFamilies() {
  const currentUser = getCurrentUser();
  const userData = getLocalStorage();

  // Lógica do algoritmo
  // A preferência de busca é para a cidade escolhida do doador
  // Se a familia ainda não verificou o email ela é exluída da busca
  // Cada familia tem um campo random com um token aleatorio de 0 a 99999, a busca é ordenada por ele
  // É gerado outro token para ser o início da busca
  // Caso resulte em menos de 3 famílias, por ex, não tiver 3 familias com o valor de random maior que o token, é gerado outro token e feito a busca novamente

  if (currentUser){
    try {
      let randomToken = getRandomToken();
      let pesquisa = [];
      let families = [];
      let remainingCount = 3;

      let cityFamiliesSnapshot = null;
      let otherFamiliesSnapshot = null;
      let allFamiliesSnapshot = null;

      // Se doador escolheu uma cidade de preferência
      if (userData.city) {
        pesquisa = query(
          collection(db, 'usersFamily'),
          where("city", "==", userData.city),
          where("emailVerified", '==', true),
          orderBy("random"),
          startAt(randomToken),
          limit(3)
        );

        cityFamiliesSnapshot = await getDocs(pesquisa);
        remainingCount -= cityFamiliesSnapshot.size;
        families = [...families, ...cityFamiliesSnapshot.docs];

        // Se tem menos de 3 famílias naquela cidade
        if (remainingCount > 0){ 

          pesquisa = query(
            collection(db, 'usersFamily'),
            where("emailVerified", '==', true),
            orderBy("random"),
            startAt(randomToken),
            limit(remainingCount)
          );

          otherFamiliesSnapshot = await getDocs(pesquisa);
          remainingCount -= otherFamiliesSnapshot.size;
          families = [...families, ...otherFamiliesSnapshot.docs];
        }
      }

      // Busca adicional caso ainda haja menos de 3 famílias
      while (remainingCount > 0){ 
        randomToken = getRandomToken();

        pesquisa = query(
          collection(db, 'usersFamily'),
          where("emailVerified", '==', true),
          orderBy("random"),
          startAt(randomToken),
          limit(remainingCount)
        );

        allFamiliesSnapshot = await getDocs(pesquisa);
        remainingCount -= allFamiliesSnapshot.size;
        families = [...families, ...allFamiliesSnapshot.docs];

        // Evitar loop infinito caso não haja mais famílias para buscar
        if (allFamiliesSnapshot.size == 0) {
          break;
        }
      }

      showFamilies(families);

    } catch (error) {
      console.error(error.message);
    }
  }
};


function getRandomToken() {
  return Math.floor(Math.random() * 99998); // Gera um número aleatório entre 0 e 99997
}


function showFamilies(families) { //Injeta divs no modal de selecionar família
  const container = document.getElementById('select-families-list');
  removeAllChildren(container); //Limpa o HTML

  families.forEach(doc => {
    const familyData = doc.data();

    const familyDiv = document.createElement('div');
    familyDiv.classList.add('col-lg-4');
    familyDiv.classList.add('col-sm-12');

    familyDiv.innerHTML = `
      <div class="card-box">
        <div><img src="${familyData.photoURL || 'assets/img/default-user.png'}" class="family-photo"></div>
        <div>
          <h4>${familyData.name || 'Usuário ainda não completou o cadastro'}</h4>
          <p>${familyData.city || 'Cidade não disponível'}</p>
          <p class="text-muted">${familyData.description || 'Biografia ainda não escrita'} </p>
        </div>

        <button type="button" class="btn btn-message" data-family-email="${familyData.email}" id="select-family">Quero ajudar</button>
      </div>
      `
      container.appendChild(familyDiv);
  });

  document.querySelectorAll('#select-family').forEach(button => {
    button.addEventListener('click', async (event) => {
      const familyEmail = event.target.getAttribute('data-family-email');
      await connectDonorToFamily(familyEmail);
      ;
    });
  });

  function removeAllChildren(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
};


async function getFamilyUIDByEmail(email) {
  try {
    const querySnapshot = await getDocs(query((collection(db, "usersFamily")), where("email", "==", email)));
    
    if (!querySnapshot.empty) {
      const familyDoc = querySnapshot.docs[0];
      return familyDoc.id; 
    } else {
      return null;
    }
  } catch (error) {
  }
}


async function connectDonorToFamily(familyEmail) {
  const currentUser = getCurrentUser();

  if (!currentUser) return;

  try {
    const familyUID = await getFamilyUIDByEmail(familyEmail);
    const donorRef = doc(db, "usersDonors", currentUser.uid);
    const familyRef = doc(db, "usersFamily", familyUID);

    // Atualiza o Firestore
    await updateDoc(donorRef, {
      connectedFamilies: arrayUnion(familyUID)
    });
    await updateDoc(familyRef, {
      connectedDonors: arrayUnion(currentUser.uid)
    });
  
    // Atualiza o localStorage
    const connectedFamilies = JSON.parse(localStorage.getItem('connectedFamilies')) || [];
    if (!connectedFamilies.includes(familyUID)) {
      connectedFamilies.push(familyUID);
      localStorage.setItem('connectedFamilies', JSON.stringify(connectedFamilies));
    }

    window.location.href = '../../perfil.html';
  } catch (error) {
  }
}


document.getElementById('reload-families').addEventListener('click', async () => {
  await getFamilies();
});
document.getElementById('load-families').addEventListener('click', async () => {
  await getFamilies();
});