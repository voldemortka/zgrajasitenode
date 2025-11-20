var nick;

const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', (event) => {
        console.log('Server connected in ships');
        nick = getCookie("Name");
        if(nick==null) document.location.href="setname.html";
        socket.send(JSON.stringify({type: 'user_start', nick}));
    });



var code;
var game_started; //właściwie sth like 'my_ships_are_confirmend'
var is_it_my_trun;

var order=[];
var order_i;

var ws2;


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

function rgbToHex(rgb) {
    let result = rgb.match(/\d+/g); // wyciąga liczby
    if (!result || result.length < 3) return null;
    return '#' + result
        .slice(0,3)
        .map(x => parseInt(x).toString(16).padStart(2, '0'))
        .join('');
}


function inizial(){
    game_started=0;
    is_it_my_trun=0;

    
    code = getCookie("game_code");

    let lit=65;
    $('#mine_board').append("<div class='sq'></div>");
    for(let i=0;i<10;i++)  {$('#mine_board').append(`<div class='sq'>${String.fromCharCode(lit)}</div>`); lit++;}
   
    let n=0;
    for(let i=1;i<=10;i++){
        $('#mine_board').append(`<br><div class='sq'>${i}</div>`);
        for(let j=0;j<10;j++){
            $('#mine_board').append(`<div class='sq' id='s${n}' onclick='sq_hit(${n})'></div>`);
            n++;
        }
    }

    socket.send(JSON.stringify({type: 'start_setting', game_code: code}));
}

function confirm_conf(){
    game_started=1;
    $('#conf_ships').remove();
    socket.send(JSON.stringify({type: 'settings_confirm', game_code: code, nick}));
}



function sq_hit(n){
    console.log();
    let hex = rgbToHex( $(`#s${n}`).css('background-color') );
    if(!game_started){
        if(hex == '#120019') $(`#s${n}`).css('background-color', '#51560fff');
        else $(`#s${n}`).css('background-color', '#120019');
    }
}


function not_mine_sq_hit(n){
    if(!is_it_my_trun) return;
    socket.send(JSON.stringify({type: 'sq_hit_ships', ws2, n}));
}


function my_turn(){
    is_it_my_trun=1;
    $('#who_now').html("MINE TURN!!!!");
}

function not_my_turn(){
    is_it_my_trun=0;
    $('#who_now').html("NOT my turn");
}

var drown_elements=[];
function totally_drown(n){
    //is the ship with n absolutely drown?
    drown_elements=[]; //n of the drown ship pieces
    return false;
}

function end_game(){
    socket.send(JSON.stringify({type: 'end_game_earlier'}));
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

                case "game_ended_earlier":
                    socket.send(JSON.stringify({type: 'game_ended_earlier', nick}));
                    alert("The game has been ended by one of players");
                    document.location.href="../index.html";
                    break;

                case 'all_settings_confirmed':

                    $('#second_board').html("");

                    $('#second_board').css('width', '40vw');
                    $('#second_board').css('height', '40vw');
                    $('#second_board').css('position', 'relative');
                    $('#second_board').css('margin', '2vh 3vw');

                    let lit='A';
                    $('#second_board').append("<div class='sq'></div>");
                    for(let i=0;i<10;i++)  {$('#second_board').append(`<div class='sq'>${lit}</div>`); lit++;}
                
                    let n=0;
                    for(let i=1;i<=10;i++){
                        $('#second_board').append(`<br><div class='sq'>${i}</div>`);
                        for(let j=0;j<10;j++){
                            $('#second_board').append(`<div class='sq' id='s1${n}' onclick='not_mine_sq_hit(${n})'></div>`);
                            n++;
                        }
                    }

                    alert("Just hit the squares on the other player's board (it's the right one) (the right side is on the other side than the left side)");

                    socket.send(JSON.stringify({type: 'give_arr_players_turowa', game_code: code}));


                    break;

                case "take_arr_players":
                    order = dane.players;
                    order_i=0;
                    if(order[0]=="tojaaaa_hejjjj") {ws2  = order[1]; my_turn();}
                    else {$('#who_now').html("NOT mine turn"); ws2=order[0];}
                    break;


                case "sq_hit_ships":
                    let color = rgbToHex( $(`#s${dane.n}`).css('background-color') );
                    if(totally_drown(dane.n)) socket.send(JSON.stringify({type: 'my_sq_color_reply', color, ws2, n: dane.n, total: true, elem: drown_elements}));
                    else socket.send(JSON.stringify({type: 'my_sq_color_reply', color, ws2, n: dane.n, total: false, elem: []}));
                    var new_color;
                    switch(color){
                        case "#120019": //background
                            new_color="#015f71ff";
                            break;
                        case "#51560fff": //ship
                            new_color="#6d0000ff";
                            break;
                        case "#6d0000ff": //drown ship
                            new_color="#6d0000ff";
                            break;
                        case "#015f71ff": //earlier miss
                            new_color="#015f71ff";
                            break;
                    }
                    $(`#s${dane.n}`).css('background-color', new_color);
                    my_turn();
                    break;

                case "my_sq_color_reply":
                    if(dane.total){
                        dane.elem.forEach(n => {
                            $(`#s1${n}`).css('background-color', '#ff0000');
                        });
                    } else {
                        var new_color;
                        switch(dane.color){
                            case "#120019": //background
                                new_color="#015f71ff";
                                break;
                            case "#51560fff": //ship
                                new_color="#6d0000ff";
                                break;
                            case "#6d0000ff": //drown ship
                                new_color="#6d0000ff";
                                break;
                            case "#015f71ff": //earlier miss
                                new_color="#015f71ff";
                                break;
                        }
                        $(`#s1${dane.n}`).css('background-color', new_color);
                    }
                    not_my_turn();
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