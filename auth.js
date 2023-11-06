const msalConfig = {
    auth: {
        clientId: "d3a8cec7-9a81-4676-bf1f-4b67735d63dc", // Znajdziesz go w Azure portal po zarejestrowaniu aplikacji
        authority: "https://login.microsoftonline.com/67ea5955-9b5c-4693-a8f9-960f2a3b49bb", // Znajdziesz go w Azure portal
        redirectUri: "http://localhost:3000/dashboard.html", // Powinno odpowiadać URI przekierowania skonfigurowanemu w Azure
    }
};

const myMSALObj = new msal.PublicClientApplication(msalConfig);

function signIn() {
    myMSALObj.loginPopup({
        scopes: ["user.read"],
        prompt: "select_account"
    }).then((loginResponse) => {
        // Możesz teraz przekierować użytkownika do dashboard.html
        window.location.href = 'dashboard.html';
    }).catch((error) => {
        console.error(error);
    });
}

function signOut() {
    myMSALObj.logout();
}
