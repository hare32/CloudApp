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
}

function handleResponse(loginResponse) {
    if (loginResponse !== null) {
        const username = loginResponse.account.username;
        // Użytkownik jest zalogowany, możemy teraz stworzyć kontener dla użytkownika
        createContainerForUser(username).then(containerUrl => {
            console.log('Container URL:', containerUrl);
            // Przekieruj użytkownika do dashboard.html z tym kontenerem URL
            window.location.href = `dashboard.html?containerUrl=${encodeURIComponent(containerUrl)}`;
        }).catch(error => {
            console.error('Error during container creation:', error);
        });
    } else {
        // Użytkownik nie jest zalogowany, możesz wyświetlić interfejs logowania
        // Możliwe, że będziesz musiał obsłużyć to inaczej, na przykład pokazując komunikat
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

async function createContainerForUser(username) {
    const response = await fetch('/create-container', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
    });
    const data = await response.json();
    if (response.ok) {
        return data.containerUrl;
    } else {
        throw new Error(data.message);
    }
}