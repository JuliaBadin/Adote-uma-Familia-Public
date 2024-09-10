import { firebaseInitialized } from './inicializacaofirebase.js';
import { getUserType } from './usertype.js';

var profileContent = '';
var profileScripts = [];

async function loadProfileContent() {
    try {
        await firebaseInitialized;
        const userType = getUserType();
        
        if(!userType){
            alert('Faça login para acessar essa página');
            window.location.href = "../../inicio";
        }

        switch(userType) {
        case 'usersFamily':
            profileContent = '../../profile-family.html';
            profileScripts = [
                'assets/js/modificarperfilfamilia.js',
                'assets/js/infosperfilfamilia.js',
                'assets/js/logout.js'
            ];
            break;
        case 'usersDonors':
            profileContent = '../../profile-donor.html';
            profileScripts = [
                'assets/js/modificarperfildoador.js',
                'assets/js/infosperfildoador.js',
                'assets/js/algoritmo.js',
                'assets/js/logout.js'
            ];
            break;
        case 'usersONG':
            profileContent = '../../profile-ong.html';
            profileScripts = [
                'assets/js/infosperfilong.js',
                'assets/js/cadastraremailfamilia.js',
                'assets/js/logout.js'
            ];
            break;
        default:
            alert('Faça login para acessar essa página');
        }

        // Carrega o HTML de cada tipo de usuário
        const response = await fetch(profileContent);
        const htmlContent = await response.text();
        document.getElementById('profile-content').innerHTML = htmlContent;

        document.body.style.display = 'block';
    } catch (error) {
        window.location.href = "../../inicio";
    }
}

async function loadScripts(){
    try {
        await loadProfileContent();
        // Carrega os scripts específicos de cada usuário
        profileScripts.forEach(scriptUrl => {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.type = 'module';
            document.body.appendChild(script);
        });
    } catch (error) {
    }
}

loadScripts();