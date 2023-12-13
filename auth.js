const msalConfig = {
    auth: {
        clientId: "47a40c2b-2f15-40b4-ab97-b2c00dd5eb00",
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
