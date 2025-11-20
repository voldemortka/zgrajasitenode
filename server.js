var WebSocket = require('ws');
//var mysql = require('mysql');
//var jwt = require('jsonwebtoken');
//const { Client } = require('pg');
//const { use } = require('react');


var sql;
var game_code;


// battleships - SHI
// wonsz 3.0 - WON
// Pacman 2.0 - PAC
// Pacman 4.0 - MAZ
// Kropki - KRO


var server = new WebSocket.Server({ port: 3000 });

// nick -> ws
let users = new Map();

// id rozgrywki -> nicki userów
let rooms = new Map();

//nick -> kod rozgrywki
let whereami = new Map();

//gry oczekujące na graczy -> kody gier
let waiting_games = new Set();

//kody rozgrywek, których gracze jeszcze cos ustawiają -> kolory, statki na planszy...
let setting_games = new Map();




//POŁĄCZENIE Z BAZĄ - OBY NIE BYŁO POTRZEBNE XD
/* var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ships'
}); 

db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});  */


function send_to_everyone(mess){
    for(let user of users.values()){
        if (user !== ws && user.readyState === WebSocket.OPEN) 
            user.send(mess);
    }
}

function send_to_game(game_code, mess){
    rooms.get(game_code).forEach( (user)=>{
        console.log(user);
        let userws = users.get(user);
        userws.send(mess);
    } );
}

function send_to_my_game(nick, mess){
    let game_code = whereami.get(nick);
    send_to_game(game_code,mess);
}

function send_to_user(nick, mess){
    if(!users.has(nick)) {ws.send(JSON.stringify({type: "show_error", text: "Message couldn't be send to user. They're popably not logged in at the moment."}))}
    let user = users.get(nick);
    user.send(mess);
}

function create_code_for_game(game_name, nickname){
    let d = new Date();
    let day    = String(d.getDate()).padStart(2, "0");        // dd
    let month  = String(d.getMonth() + 1).padStart(2, "0");   // mm
    let year   = String(d.getFullYear()).slice(-2);           // rr (ostatnie dwie cyfry)
    let hour   = String(d.getHours()).padStart(2, "0");       // gg
    let minute = String(d.getMinutes()).padStart(2, "0");     // mm
    let second = String(d.getSeconds()).padStart(2, "0");     // ss

    let code = day + month + year + hour + minute + second;

    //code = nickname.substring(0,3)+code;
    code = nickname+code;

    code = game_name.substring(0,3)+code; //nazwa gry, jakis kod

    console.log(code);
    return code;
}


function amount_players(game_code, x){  //x = max || min
    var wyn=-1;
    switch(game_code.substring(0,3)){
        case "SHI":
            wyn = x=='max' ? 2 : 2;
            break;
        case "WON":
            wyn = x=='max' ? 10 : 2;
            break;
        case "PAC":
            wyn = x=='max' ? 6 : 3;
            break;
        case "MAZ":
            wyn = x=='max' ? 8 : 4;
            break;
        case "KRO":
            wyn = x=='max' ? 10 : 2;
            break;
        default:
            console.log("There's no such game UFOOOO in amount_players");
    }
    return wyn;
}


server.on('connection', (ws) => {
    console.log('Client connected serwer');

    ws.on('message', (message) => {  
        try{
            var dane = JSON.parse(message);
            console.log("unjsoning dome at server. The message: ", dane);

            switch(dane.type){

                /* general */

                case "user_start":
                    users.set(dane.nick, ws);
                    break;

                case "user_active":
                    users.set(dane.nick, ws);
                    whereami.set(dane.nick, "none");
                    break;

                case "user_disconnected":
                    console.log("User removed from everywhere");
                    game_code = whereami.get(dane.nick);
                    if(game_code!="none") rooms.get(game_code).remove(ws);
                    users.delete(dane.nick);
                    whereami.delete(dane.nick);
                    break;

                case "create_new_game":
                    game_code = create_code_for_game(dane.game_name, dane.nick);
                    rooms.set(game_code, new Set() );
                    rooms.get(game_code).add(dane.nick);
                    whereami.set(dane.nick,game_code);
                    waiting_games.add(game_code);
                    ws.send(JSON.stringify({type: "game_code_created", game_code}));
                    break;

                case "add_to_game":
                    if(!waiting_games.has(dane.game_code)) {ws.send(JSON.stringify({type: 'show_error', text: 'The game you want to join to has already started' })); break;}
                    rooms.get(dane.game_code).add(dane.nick);
                    whereami.set(dane.nick, dane.game_code);
                    if( rooms.get(dane.game_code).size >= amount_players(dane.game_code, 'max') ){
                        console.log("Game should start"); ///////
                        waiting_games.delete(dane.game_code);
                        send_to_game(dane.game_code, JSON.stringify({type: 'game_started', game_code: dane.game_code}));
                    } else {
                        send_to_my_game(dane.nick, JSON.stringify({type: 'new_player_arrived', nick: dane.nick}));
                        ws.send(JSON.stringify({type: 'added_to_game', game_code: dane.game_code}));
                    }                    
                    break;

                case "just_joined":
                    let il = rooms.get(dane.game_code).size;
                    ws.send(JSON.stringify({type: dane.type, il}));
                    break; 

                case "remove_from_game":
                    rooms.get(dane.game_code).delete(dane.nick);
                    whereami.set(dane.nick, "none");
                    if(rooms.get(dane.game_code).size==0) rooms.delete(dane.game_code); //usuwanie gry if pusto
                    break;

                case "start_game":
                    if( rooms.get(dane.game_code).size >= max_players(dane.game_code, 'min') ){
                        waiting_games.delete(dane.game_code);
                        send_to_game(dane.game_code, JSON.stringify({type: 'game_started'}));
                    } else {
                        ws.send(JSON.stringify({type: 'show_error', text: "There's too little players to start this game"}));
                    }
                    break;

                case "start_setting":
                    setting_games.set(dane.game_code, new Set());
                    break;

                case "settings_confirm":
                    setting_games.get(dane.game_code).add(dane.nick);
                    if(setting_games.get(dane.game_code).size >= rooms.get(dane.game_code).size){
                        //wszyscy zatwierdzili ustawienia
                        setting_games.remove(dane.game_code);
                        send_to_game(dane.game_code, JSON.stringify({type: 'all_settings_confirmed'}));
                    }
                    break;

                case "give_arr_players_turowa":
                    let players = [];
                    rooms.get(dane.game_code).forEach((v)=>{
                        let w = users.get(v);
                        if(w==ws) players.push("tojaaaa_hejjjj");
                        else players.push(w);
                    });
                    ws.send(JSON.stringify({type: 'take_arr_players', players}));
                    break;

                case "end_game_earlier":
                    rooms.get(dane.game_code).forEach((v)=>{
                        users.get(v).send(JSON.stringify({type: 'game_ended_earlier'}));
                    });
                    rooms.delete(dane.game_code);
                    break;

                case "game_ended_earlier":
                    whereami.set(dane.nick, "none");
                    break;


                //STATKI

                case "sq_hit_ships":
                    dane.ws2.send(JSON.stringify({type: dane.type, n: dane.n}));
                    break;

                case "my_sq_color_reply":
                    dane.ws2.send(JSON.stringify({type: dane.type, color: dane.color, n: dane.n, total: dane.total, elem: dane.elem}));
                    break;
                


                default: 
                    console.log('undefinded flying data type in sever: '+dane.type);
            }

        } catch(error) {console.log("error caught serwer"+error);}

        

    });

    ws.on('close', () => {
        console.log('Client disconnected serwer');
    });
});

console.log('WebSocket server is running on ws://localhost:3000');
