import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./inicializacaofirebase.js";

export async function setUserType(uid) {
  try {
    const collections = ['usersFamily', 'usersDonors', 'usersONG'];

    for (const collection of collections) {
      const userDoc = await getDoc(doc(db, collection, uid));

      if (userDoc.exists()) {

        const userData = userDoc.data();
        localStorage.setItem('userType', collection);

        for (const key in userData) {
          localStorage.setItem(key, JSON.stringify(userData[key]));
        }
        localStorage.setItem('firstLoad', 'false');

        return;
      }
    }
  } catch (error) {
  }
}

export function getUserType(){
  return localStorage.getItem('userType');
}

export function getLocalStorage(){
  let currentUserData = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== 'userType' && key !== 'debug') {
      try {
        currentUserData[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
      }
    }
  }

  return currentUserData;
}