const msalConfig = {
    auth: {
        clientId: "d3a8cec7-9a81-4676-bf1f-4b67735d63dc",
        authority: "https://login.microsoftonline.com/67ea5955-9b5c-4693-a8f9-960f2a3b49bb",
        redirectUri: "https://hare32.github.io/CloudApp/dashboard.html",
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
        // Uzyskaj nazwę użytkownika z odpowiedzi
        const username = loginResponse.account.username;
        localStorage.setItem('username', username);

        // Uzyskaj token dostępu
        myMSALObj.acquireTokenSilent({ scopes: ["user.read"] })
            .then(response => {
                // Przechowaj token dostępu
                localStorage.setItem('userToken', response.accessToken);

                // Dodatkowa logika, jeśli jest na stronie upload.html
                if (window.location.href.indexOf("upload.html") !== -1) {
                    document.getElementById('username').value = username;
                }

                // Tworzenie kontenera dla użytkownika i przekierowanie
                createContainerForUser(username).then(containerUrl => {
                    console.log('Container URL:', containerUrl);
                    window.location.href = `dashboard.html?containerUrl=${encodeURIComponent(containerUrl)}`;
                }).catch(error => {
                    console.error('Error during container creation:', error);
                });

            }).catch(error => {
                // Obsługa błędów związanych z uzyskaniem tokenu
                console.error('Error acquiring token:', error);
            });
    }
}

myMSALObj.handleRedirectPromise().then(handleResponse).catch((error) => {
    console.error(error);
});

function signOut() {
    myMSALObj.logout();
}

if (window.location.href.indexOf("dashboard.html") === -1) {
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