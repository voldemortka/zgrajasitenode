var nick;

const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', (event) => {
        console.log('Server connected in ships');
        nick = getCookie("Name");
        if(nick==null) document.location.href="setname.html";
        let file = window.location.pathname.split("/").pop();
        socket.send(JSON.stringify({type: 'user_start', nick}));
        if(file=="lobby.html") inizial_lobby();
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
            <p>Your name:</p>
            <p>${nick}</p>    
        `);
    }
    
}

function inizial_lobby(){
    nick = getCookie("Name");
    code = getCookie("game_code");
    $('#show_game_code').append(code);
    socket.send(JSON.stringify({type: 'just_joined', game_code: code}));

}


function create_game(){
    $('main').append("<p>Creating game...</p>");
    socket.send(JSON.stringify({type: 'create_new_game', nick, game_name: "SHI"}));
}








// SOCKETYYY



    socket.addEventListener('message', (event) => {
        console.log(`Message from server: ${event.data}`);
        try{
            const dane = JSON.parse(event.data);
            switch(dane.type){

                // GENERAL

                case "just_joined":
                    $('#curr_people').html(dane.il);
                    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
                    async function write_waiting() {
                        $('#comments').append("Welcome to the lobby of battleships");
                        await sleep(1000);
                        $('#comments').append("<br>You can see the code for your game at the top of your screen");
                        await sleep(1000);
                        $('#comments').append("<br>Give it to your friends if you want to play");
                        await sleep(1000);
                        $('#comments').append("<br>Unless you have friends - well, just find them");
                        await sleep(1000);
                        $('#comments').append("<br><br><br>Little instruction how to start the game:");
                        await sleep(1000);
                        $('#comments').append("<ul><li>Find a friend</li>");
                        await sleep(2000);
                        $('#comments').append("<li>Give them the code from your screen</li>");
                        $('#comments').append("<li>Make them hit the 'join an existing game' button on the main sceen of this website</li>");
                        $('#comments').append("<li>Tell them to type there your code</li>");
                        $('#comments').append("<li>Now they should hit the 'confirm' button</li>");
                        await sleep(1000);
                        $('#comments').append("<li>Here you are</li></ul>");
                        await sleep(1000);
                        if(dane.il>1){
                            $('#comments').append(`<br><br>Currently there are ${dane.il} people here. If this is enough:`);
                        } else {
                            $('#comments').append(`<br><br>When any of your friends join, you'll be able to use this:`);
                        }
                        await sleep(1000);
                        $('#comments').append("<br>When it comes to the battleships - you can play only with one of your friends, so when your friend'll join, the game should automatically start");
                        await sleep(1000);
                        $('#comments').append("<br>When it comes to any other game - it'll start automatically when the lobby is full, but you can start the game earlier too. Just hit the 'start the game' button on your screen");
                        await sleep(1000);
                        $('#comments').append("<br><br>Waiting for othr players...");

                    } write_waiting();
                    break;

                case "show_error":
                    $('main').append(`<div class='error_from_server'>${dane.text}</div>`);
                    break;

                case "game_code_created":
                    code=dane.game_code;
                    let max_age = 24*60*60;
                    document.cookie = `game_code=${code}; path=/; max-age=${max_age}`;
                    $('main').append("<br>Moving you into the lobby...");
                    document.location.href="lobby.html";
                    break;

                case "new_player_arrived":
                    let il=+$('#curr_people').html();
                    il++;
                    $('#curr_people').html(il);
                    $('#comments').append(`<br><br>${dane.nick} has just joined!!`);
                    break;

                case "game_started":
                    $('#commenst').append("<br>Moving you into the game...");
                    document.location.href="game.html";
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