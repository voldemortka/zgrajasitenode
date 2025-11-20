var name_wb, nr_wb, id_wb, wpisany=true, hex_wb, index=true;
var sent_socekt=false; var sent_normal=false;
var kolory = [];

const socket = new WebSocket('ws://localhost:3000');

//połączenie z serwerem
    socket.addEventListener('open', (event) => {
        console.log('Server connected | index wonsz');
        connected=1;
        console.log(wpisany+" | s "+connected);
        socket.send(JSON.stringify({type: 'take_token_wonsz'}));
          //  socket.send(JSON.stringify({type: 'new_player', nr: nr_wb, name: name_wb, hex: hex_wb}));
       //if(!wpisany) {console.log("sendning połączenie"); socket.send(JSON.stringify({id: id_wb, name: name_wb, il: il_wb, type: "new_player_loaded"})); wpisany=1;}
        //if(in_pacman) socket.send(JSON.stringify({type: 'set_charakter', postac: postac, id: id_wb}));
    });


//wszystkie wiadomości od serera idące, wszytko od innych graczy; typ ten sam co wiadomosci, która wyszła
    socket.addEventListener('message', (event) => {   
        console.log("at pacy");       
        console.log(`Message from server: ${event.data}`);
        try{
            const dane = JSON.parse(event.data);
            console.log("unjsoning done pacy");

            switch(dane.type){
                case 'kolor_changed':
                    $('#k'+dane.hex).css('border', '2px solid white');
                    $('#k'+dane.hex).css('cursor', 'default');
                    $('#kolor_name_'+dane.hex).html(dane.name);     
                    
                    $('#k'+dane.hex_old).css('border', '2px solid #041124');
                    $('#k'+dane.hex_old).css('cursor', 'pointer');
                    $('#kolor_name_'+dane.hex_old).html("...");     
                    break;

                case 'game_started':
                    window.location.href = 'wonsz.html';
                    break;

                case 'someone_left_lobby':
                    for(i=dane.nr; i<10; i++){
                        let next_pole = $('#pocz'+(i+1)).html();  //???
                        $('#pocz'+i).html(next_pole);
                        if(next_pole=='poczing...'){
                            $('#pocz'+i).attr('class', 'pocz_nie');
                            break;
                        }
                        if(next_pole==name_wb) nr_wb--;
                    }
                    break;

                case 'new_player':
                    $('#pocz'+dane.nr).html(dane.name);
                    $('#pocz'+dane.nr).attr('class', 'pocz_tak');

                    $('#k'+dane.hex).css('border', '2px solid white');
                    $('#k'+dane.hex).css('cursor', 'default');
                    $('#kolor_name_'+dane.hex).html(dane.name);                
                    break;

                case 'mess_sent_wonsz':
                    $('#messages_list').append("<div class='last_mess'><div class='last_name'>"+dane.name+"</div><div class='last_tekst'>"+dane.tresc+"</div></div>");
                    break;


                //SAMA GRA--------------
                case 'death':
                    for(i=0;i<dane.tab.length;i++){
                        $('#p'+dane.tab[i]).css('background-color', '#041037');
                        $('#p'+dane.tab[i]).css('background-image', '');
                    }        
                    break;
                
                case 'dodaj':
                    $('#p'+dane.where).css('background-color', '#'+dane.hex);
                    break;

                case 'new_robal':
                    $('#p'+dane.where).css('background-image', "url('bug2.png')");
                    $('#p'+dane.where).css('background-color', '#ff8282');
                    break;

                case 'usun':
                    $('#p'+dane.where).css('background-color', '#041037');
                    $('#p'+dane.where).css('background-image', '');
                    break;

                case 'game_has_been_finished':
                    let punkty = $('#licznik').html();
                    socket.send(JSON.stringify({type: 'pobierz_pkt', pkt: punkty, id: id_wb}));
                    window.location.href = 'http://localhost/mine/Zgraja%20site/trans_return_snake.php';                
                    break;

                case 'everyone_is_dead':
                    let punktyx = $('#licznik').html();
                    socket.send(JSON.stringify({type: 'pobierz_pkt', pkt: punktyx, id: id_wb}));
                    window.location.href = 'http://localhost/mine/Zgraja%20site/trans_return_snake.php';                
                    break;

                case 'everyone_out':
                    $('#end_definitely').html('');
                    $('#end_definitely').css('border', '');
                    $('#end_definitely').attr('class', 'end_def2');
                    window.location.href = '../zgraja.php'; 
                    break;

                // dane startowe ---
                    case 'request_token':
                        console.log("xxx");
                        // Odczyt tokenu z localStorage
                        var token;
                        if(index) {token = localStorage.getItem('snake1_token'); socket.send(JSON.stringify({ type: 'send_token1_wonsz', token }));}
                        else {token = localStorage.getItem('snake2_token'); socket.send(JSON.stringify({ type: 'send_token2_wonsz', token }));}
                        // Wysłanie tokenu do serwera Node.js
                        
                        break;
    
                    case 'token_received':
                        if(index){
                            id_wb = dane.id;
                            name_wb = dane.name;
                            nr_wb = dane.nr;
                            kolory = dane.kolory;
                            hex_wb = dane.hex; //only startowy for now
                            var spis_ludnosci = dane.spis;
                            var barwy = dane.barwy;
                        } else {
                            id_wb = dane.id;
                            name_wb = dane.name;
                            hex_wb = dane.hex;
                            nr_wb = dane.nr;
                        }
                                            
                        console.log(`everything done: ${id_wb}, ${name_wb}, ${nr_wb}, ${hex_wb}`);
                        console.log("index"+index);
    
                        if(index){
                            let il = 0;
                            for(i=0;i<spis_ludnosci.length;i++){
                                $('#poczekalnia').append("<div class='pocz_tak' id='pocz"+i+"'>"+spis_ludnosci[i]+"</div>");
                                il++; if(i==4) $('#poczekalnia').append("<br>");
                            }
                            for(i=il;i<10;i++){
                                $('#poczekalnia').append("<div class='pocz_nie' id='pocz"+i+"'>Waiting...</div>");
                                if(i==4) $('#poczekalnia').append("<br>");
                            }
                        
                            
                            for(i=0;i<barwy.length;i++){
                                const click = '"'+barwy[i]['hex']+'", '+barwy[i]['id'];
                                console.log(i+" -  "+click);
                                $('#kolory').append("<div class='kolor_box' id='k"+barwy[i]['hex']+"' onclick='kolor_clicked("+click+")'><div class='kolor_id' id='kol_id_"+barwy[i]['hex']+"'>"+barwy[i]['id']+"</div><div class='kolor_hex' style='background-color: #"+barwy[i]['hex']+"'></div><div class='kolor_name' id='kolor_name_"+barwy[i]['hex']+"'>...</div></div>");
                            }
                            console.log(0);

                            for(i=0;i<kolory.length;i++){
                                $('#kolor_name_'+kolory[i]['hex']).html(kolory[i]['name']);
                                $('#k'+kolory[i]['hex']).css('border', '2px solid white');
                                $('#k'+kolory[i]['hex']).css('cursor', 'default');
                            }          
                            
                            socket.send(JSON.stringify({type: 'new_player', nr: nr_wb, name: name_wb, hex: hex_wb}));
                            socket.send(JSON.stringify({type: 'load_mess_wonsz3'}));

                        } else load_snake();
    
                        break;

                case 'load_mess':
                    for(i=0;i<dane.tab.length;i++){
                        $('#messages_list').append("<div class='last_mess'><div class='last_name'>"+dane.tab[i]['name']+"</div><div class='last_tekst'>"+dane.tab[i]['tekst']+"</div></div>");
                    }
                    break;
    
    

                default:
                    console.log('UFO in user!');
            }

        } catch (error) {console.log("bad unjsoning pacy -> "+error);}
    });


//rozłączenie, jakieś errory z serwera
    socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
    });

    socket.addEventListener('error', (error) => {
        console.log(`WebSocket error: ${error}`);
    });


//chat
    $('#message_form').submit((event) => {
        event.preventDefault();
        const tresc = $('#new_mess').val();
        $('#new_mess').val("");
        $('#messages_list').append("<div class='last_mess'><div class='last_name'>"+name_wb+"</div><div class='last_tekst'>"+tresc+"</div></div>");
        socket.send(JSON.stringify({type: 'mess_sent_wonsz', name: name_wb, id: id_wb, tresc: tresc}));
    });    



    function rgbToHex(rgb) {
        let result = rgb.match(/\d+/g);
        let hex = ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1).toLowerCase();
        return hex;
    }
    


function kolor_clicked(hex, id){
    console.log("in");
    //check czy nie jest zajęty
    if($('#kolor_name_'+hex).html() == "..."){
        //wcześniejszy kolor
        $('#k'+hex_wb).css('border', '2px solid #041124');
        $('#k'+hex_wb).css('cursor', 'pointer');
        $('#kolor_name_'+hex_wb).html("...");     

        //ustaw go
        $('#k'+hex).css('border', '2px solid white');
        $('#k'+hex).css('cursor', 'default');
        $('#kolor_name_'+hex).html(name_wb);
        let id_kol_1 = $('#kol_id_'+hex).html();
        let id_kol = parseInt(id_kol_1,10);
        socket.send(JSON.stringify({type: 'kolor_changed', hex: hex, name: name_wb, id: id, id_kol: id_kol, hex_old: hex_wb}));
        hex_wb = hex;
    }
}

function start_game(){
    socket.send(JSON.stringify({type: 'game_started', id: id_wb}));
    window.location.href = 'wonsz.html';
}

function leave_lobby(){
    socket.send(JSON.stringify({type: 'someone_left_lobby', id: id_wb, nr: nr_wb}));
    window.location.href = 'http://localhost/mine/Zgraja%20site/transform.php';
}

function loaded(){
    index=true;

    //const from_onload = JSON.parse(from_onload_1);

    /*const kolory = JSON.parse(kolory_1);
    console.log(kolory);
    name_wb = name;
    nr_wb = nr;
    id_wb = id;
    wpisany = wpisany_wb; */

    //kolory startowe
}



//WONSZ SAM W SOBIE
var teraz, where, kolor, alive, przejscia;
var wonsz = [];

function strzalki(event){
    switch(event.code){
        case "ArrowUp": if(where!='d') where='g'; break;
        case "ArrowDown": if(where!='g') where='d'; break;
        case "ArrowLeft": if(where!='p') where='l'; break;
        case "ArrowRight": if(where!='l') where='p'; break;
        case "KeyW": if(where!='d') where='g'; break;
        case "KeyS": if(where!='g') where='d'; break;
        case "KeyA": if(where!='p') where='l'; break;
        case "KeyD": if(where!='l') where='p'; break;
    }
}
document.addEventListener("keydown", strzalki);

function plansza(){
    let il=0;
    for(i=0;i<29;i++){
        for(j=0;j<45;j++){
            $('#plansza').append("<div class='pole' id='p"+il+"'><div class='eye' id='e"+il+"'></div><div class='eye' id='e"+il+"'></div><div style='clear: both;'></div><div class='ryj' id='r"+il+"'></div></div>");
            il++;
        }
        $('#plansza').append("</br>");
    }
}

function load_snake(){

        plansza();
        console.log("plansza done");

        kolor=hex_wb;
        alive=true;
        przejscia=0;
    
        switch(nr_wb){
            case 0: teraz=0; where='p'; break;
            case 1: teraz=1304; where='l'; break;
            case 2: teraz=44; where='l'; break;
            case 3: teraz=1260; where='p'; break;
            case 4: teraz=585; where='p'; break;
            case 5: teraz=629; where='l'; break;
            case 6: teraz=13; where='d'; break;
            case 7: teraz=1273; where='g'; break;
            case 8: teraz=28; where='d'; break;
            case 9: teraz=1288; where='g'; break;
        }
        wonsz = [teraz];
        console.log(teraz);
    
        $('#p'+teraz).css('background-color', '#'+kolor);
        $('#f'+teraz).css('background-color', '#ff0000');
        $('#e'+teraz).css('background-color', '#ffffff');
    
        socket.send(JSON.stringify({type: 'dodaj', hex: kolor, where: teraz}));
}

function check_pole(x){
    let next = $('#p'+x).css('background-color');
    next = rgbToHex(next);
    switch(next){
        //pusto
        case '041037':
            $('#p'+wonsz[ 0 ]).css('background-color', '#041037');
            socket.send(JSON.stringify({type: 'usun', where: wonsz[0]}));
            wonsz.splice(0, 1); //usuń ostatni element węża = just przesuwa się
            break;
        //robak
        case 'ff8282':
            $('#licznik').html(wonsz.length);
            $('#p'+x).css('background-image', '');
            break;
        //samobojstwo
        default:
            console.log("selfkilling");
            alive=false;
            let pkt1 = $('#licznik').html();
            let pkt = parseInt(pkt1, 10);
            socket.send(JSON.stringify({type: 'death', tab: wonsz, pkt: pkt, id: id_wb})); 
            $('f'+wonsz[0]).css('background-color', '');
            $('e'+wonsz[0]).css('background-color', '');
            for(i=0;i<wonsz.length;i++){
                $('#p'+wonsz[i]).css('background-color', '#041037');
            }
    }
}

function snake(){
    let next_nr;
    switch(where){
        case 'p':
            if(teraz%45==44) next_nr=teraz-44;
            else next_nr=teraz+1;
            break;
        case 'l':
            if(teraz%45==0) next_nr=teraz+44;
            else next_nr=teraz-1;
            break;
        case 'g':
            if(teraz<45) next_nr=teraz+1260;
            else next_nr=teraz-45;
            break;
        case 'd':
            if(teraz>1259) next_nr=teraz-1260;
            else next_nr=teraz+45;
            break;
    }

    check_pole(next_nr);

    console.log("alive: "+alive);
    if(alive){
        //TYLKO głowę przestawiamy:
        $('#f'+teraz).css('background-color', '');
        $('#e'+teraz).css('background-color', '');
        $('#f'+next_nr).css('background-color', '#ff0000');
        $('#e'+next_nr).css('background-color', '#ffffff');
        $('#p'+next_nr).css('background-color', '#'+kolor);
        socket.send(JSON.stringify({type: 'dodaj', where: next_nr, hex: kolor}));
        teraz=next_nr;
        wonsz.push(teraz); //dodajemy nowy klocek do wonsza (głowę)
    }

    if(przejscia%20==0){
        //dodaj robala
        var ran = Math.floor(Math.random()*1305);
        let ranrgb = $('#p'+ran).css('background-color');
        let ranhex = rgbToHex(ranrgb);
        if(ranhex == '041037'){
            socket.send(JSON.stringify({type: 'new_robal', where: ran}));
            $('#p'+ran).css('background-color', '#ff8282');
            $('#p'+ran).css("background-image", "url('bug2.png')");
        }
    }
    przejscia++;
    if(alive) setTimeout("snake()",80);
}

function game_finished(){
    let punkty = $('#licznik').html();
    socket.send(JSON.stringify({type: 'pobierz_pkt', pkt: punkty, id: id_wb}));
    socket.send(JSON.stringify({type: 'game_has_been_finished'}));
    window.location.href = 'http://localhost/mine/Zgraja%20site/trans_return_snake.php';
}

function end_defin(){
    socket.send(JSON.stringify({type: 'wykasuj_wszystkich'}));
    window.location.href = '../zgraja.php';
}