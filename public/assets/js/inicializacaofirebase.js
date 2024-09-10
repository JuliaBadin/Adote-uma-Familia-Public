import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

var secondaryAuth = getAuth(initializeApp(firebaseConfig, "Secondary")); // Usado para a ONG criar user familia sem deslogar automaticamente

// Garante que o firebase está iniciado antes de fazer algum evento em outro script
let firebaseInitialized = new Promise((resolve, reject) => {
  try {
      resolve(auth);
  } catch (error) {
      reject(error);
  }
});

export { auth, db, storage, firebaseInitialized, secondaryAuth };