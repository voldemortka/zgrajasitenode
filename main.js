var nick;

const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', (event) => {
        console.log('Server connected in ships');
        nick = getCookie("Name");
        if(nick==null) document.location.href="setname.html";
        socket.send(JSON.stringify({type: 'user_start', nick}));
    });




var code;

function getCookie(x) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === x) {
            return value;
        }
    }
    return null;
}


function inizial(){
    nick = getCookie("Name");
    if(nick==null) document.location.href="setname.html";
}

function inizial_index(){
    nick = getCookie("Name");
    if(nick==null){
       document.location.href="setname.html";
    } else {
        $('#show_nick').html(`
            <p>Your nick:</p>
            <p>${nick}</p>    
        `);
    }
    
}

function set_nickname(){
    nick = $('#nickname_new').val();
    let max_age=14*24*60*60;
    document.cookie = `Name=${nick}; path=/; max-age=${max_age}`;
    document.location.href="index.html";
}

function enter_code(){
    $('#comments').append("Checking the code...");
    let code2 = $('#type_code').val();
    console.log(code2);
    socket.send(JSON.stringify({type: "add_to_game", game_code: code2, nick}));
}



// SOCKETYYY



    socket.addEventListener('message', (event) => {
        console.log(`Message from server: ${event.data}`);
        try{
            const dane = JSON.parse(event.data);
            switch(dane.type){

                case "show_error":
                    $('main').append(`<div class='error_from_server'>${dane.text}</div>`);
                    break;

                case "added_to_game":
                    $('#comments').append("You're gonna be moved to your game...");
                    let game = dane.game_code.substring(0,3);
                    let code = dane.game_code;
                    let max_age = 24*60*60;
                    document.cookie = `game_code=${code}; path=/; max-age=${max_age}`;
                    switch(game){
                        case "SHI":
                            document.location.href="ships/lobby.html";
                            break;
                        case "WON":
                            document.location.href="";
                            break;
                        case "PAC":
                            document.location.href="";
                            break;
                        case "MAZ":
                            document.location.href="";
                            break;
                        case "KRO":
                            document.location.href="";
                            break;
                        
                    }
                    break;

                case "game_started":
                    let code2 = dane.game_code;
                    let max_age2 = 24*60*60;
                    document.cookie = `game_code=${code2}; path=/; max-age=${max_age2}`;
                    let gamen = dane.game_code.substring(0,3);
                    switch(gamen){
                        case "SHI":
                            document.location.href="ships/game.html";
                            break;
                        case "WON":
                            document.location.href="";
                            break;
                        case "PAC":
                            document.location.href="";
                            break;
                        case "MAZ":
                            document.location.href="";
                            break;
                        case "KRO":
                            document.location.href="";
                            break;
                        
                    }
                    break;

                default: console.log("undefinded flying data object in ships");
            }
        }catch (error) {console.log("error ships -> "+error);}
    });

    socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
    });

    socket.addEventListener('error', (error) => {
        console.log(`WebSocket error: ${error}`);
    });