window.onload = function() {
    if(getCookie("user") == undefined && getCookie("login") != "true"){
        setCookie("login", true, 1)
        window.location.href = "/login";
    }else if(getCookie("user") == undefined && getCookie("login") == "true"){
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        let code = searchParams.get('code');
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
        "code": code
        });

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("http://192.168.1.22/login", requestOptions)
        .then(response => response.json())
        .then(result => {
            document.getElementById("username").innerText = result.user.username;
            document.getElementById("avatar").src = "https://cdn.discordapp.com/avatars/" + result.user.id + "/" + result.user.avatar + ".png";
            document.getElementById("premiumStatus").innerText = result.user.premiumStatus;
            document.getElementById("commandsRan").innerText = result.user.commandsRan + " Commands";
            setCookie("user", JSON.stringify(result.user), 1)
        })
        .catch(error => console.log('error', error));
    }if(getCookie("user") != undefined){
        let user = JSON.parse(getCookie("user"))
        document.getElementById("username").innerText = user.username;
        document.getElementById("avatar").src = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png";
        document.getElementById("premiumStatus").innerText = user.premiumStatus;
        document.getElementById("commandsRan").innerText = user.commandsRan + " Commands";
    }
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function logout(){
    eraseCookie("user")
    eraseCookie("login")
    window.location.href = "/";
}