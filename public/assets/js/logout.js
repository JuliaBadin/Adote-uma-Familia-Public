import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./inicializacaofirebase.js";
import { setCurrentUser } from "./deteccaousuario.js";

document.getElementById('navbar-logout').addEventListener("click", async (event)=>{
    signOut(auth).then(() => {
        setCurrentUser(null);
        localStorage.clear();
        window.location.href = "../../inicio";
    }).catch((error) => {
    console.log(error);
    });
});