const msalConfig = {
    auth: {
        clientId: "d3a8cec7-9a81-4676-bf1f-4b67735d63dc",
        authority: "https://login.microsoftonline.com/67ea5955-9b5c-4693-a8f9-960f2a3b49bb",
        redirectUri: "https://hare32.github.io/CloudApp/dashboard.html", // Zaktualizuj to do twojego publicznego URL
    }
};

const myMSALObj = new msal.PublicClientApplication(msalConfig);

function signIn() {
    myMSALObj.loginRedirect({
        scopes: ["user.read"],
        prompt: "select_account"
    });
    // Nie ma potrzeby używania .then() po loginRedirect
}

function handleResponse(loginResponse) {
    if (loginResponse !== null) {
        // Zalogowany użytkownik, przekierowanie do dashboard.html
        window.location.href = 'dashboard.html';
    } else {
        // Użytkownik nie jest zalogowany, możesz wyświetlić interfejs logowania
    }
}

myMSALObj.handleRedirectPromise().then(handleResponse).catch((error) => {
    console.error(error);
});

function signOut() {
    myMSALObj.logout();
}

// Wywołaj handleResponse na początku, aby obsłużyć przypadki, gdy użytkownik wraca po przekierowaniu
if (window.location.href.indexOf("dashboard.html") === -1) {
    // Tylko jeśli nie jesteśmy już na stronie dashboard.html
    myMSALObj.handleRedirectPromise().then(handleResponse).catch((error) => {
        console.error(error);
    });
}
