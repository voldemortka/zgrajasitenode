var id_wb; var name_wb; var il_wb; var wpisany=1; var connected=0; var nr_wb; var il_graczy;
var in_pacman=0;
var index=true;

const socket = new WebSocket('ws://localhost:3000');

//połączenie z serwerem
    socket.addEventListener('open', (event) => {
        console.log('Server connected at pacy');
        connected=1;
        console.log(wpisany+" | s "+connected);
        socket.send(JSON.stringify({type: "take_token_pacy"}));
        //if(!wpisany) {console.log("sendning połączenie"); socket.send(JSON.stringify({id: id_wb, name: name_wb, il: il_wb, type: "new_player_loaded"})); wpisany=1;}
        if(in_pacman) socket.send(JSON.stringify({type: 'set_charakter', postac: postac, id: id_wb}));
    });


//wszystkie wiadomości od serera idące, wszytko od innych graczy; typ ten sam co wiadomosci, która wyszła
    socket.addEventListener('message', (event) => {   
        console.log("at pacy");       
        console.log(`Message from server: ${event.data}`);
        try{
            const dane = JSON.parse(event.data);
            console.log("unjsoning done pacy");

            switch(dane.type){
                case 'request_token':
                    console.log("xxx");
                    // Odczyt tokenu z localStorage
                    var token;
                    if(index) {token = localStorage.getItem('pacy1_token'); socket.send(JSON.stringify({ type: 'send_token1_pacy', token }));}
                    else {token = localStorage.getItem('pacy2_token'); socket.send(JSON.stringify({ type: 'send_token2_pacy', token }));}
                    // Wysłanie tokenu do serwera Node.js
                    
                    break;

                case 'token_received':
                    if(index){
                        console.log("in index, in received");
                        name_wb = dane.name;
                        id_wb = dane.id;
                        il_wb = dane.nr;
                        let tab = dane.tab;
                        socket.send(JSON.stringify({id: id_wb, name: name_wb, il: il_wb, type: "new_player_loaded"}));
                        let il=0;
                        for(i=0;i<tab.length;i++) {$('#poczekalnia').append("<div class='pocz_tak' id='pocz"+il+"'>"+il+"</br><div class='names' id='n"+il+"'>"+tab[i]+"</div></div>"); il++;}
                        for(i=il;i<6;i++) $('#poczekalnia').append("<div class='pocz_nie' id='pocz"+i+"'>"+i+"</br><div class='names' id='n"+i+"'>Waiting...</div></div>");        
                    } else {
                        id_wb = dane.id;
                        il_wb = dane.nr;
                        il_graczy = dane.il_graczy;
                        //plansza
                        let nr=0;
                        for(i=0;i<20;i++){ //0,5 x 0,5 cm -> 25x25 px
                            for(j=0;j<30;j++)
                                {$('#plansza').append("<div class='kafelki' id='p"+nr+"'><img src='img/point.png'></div>"); nr++;}
                        }
        
                        ustaw(il_wb, id_wb, il_graczy);
                    }
                    break;
                case 'mess_sent':
                    $('#messages_list').append("<div class='last_mess'><div class='last_name'>"+dane.name+"</div><div class='last_tekst'>"+dane.tresc+"</div></div>");
                    break;

                case 'new_player_loaded':
                    console.log("OK, I took it");
                    console.log(dane);
                    //$('#poczekalnia').append("<div class='pocz_tak' id='pocz"+dane.il+"'>"+dane.$id+"</br><div class='names' id='n"+dane.il+"'>"+dane.name+"</div></div>");
                    $('#pocz'+dane.il).html(dane.il+"</br><div class='names' id='n"+dane.il+"'>"+dane.name+"</div>");
                    $('#pocz'+dane.il).attr('class', "pocz_tak");
                    break;
                
                case 'game_has_been_started':
                    window.location.href = 'pacy.html';
                    break;

                case 'someone_left_lobby':
                    for(i=dane.il;i<6;i++){
                        console.log(i);
                        let zawartosc = $('#n'+i).html; //name z tego pola
                        if(zawartosc==name_wb) il_wb--; //poprawka numeru obozowego, if needed
                        let next_nr = i+1;
                        $next_name = $('#n'+next_nr).html();
                        $('#n'+i).html($next_name);
                        console.log($next_name+" "+i);
                        if($next_name=='Waiting...') {$('#pocz'+i).attr('class', "pocz_nie"); break;}
                    }
                    break;

                case 'move':
                    if(dane.postac=='p1' || dane.postac=='p2'){
                        $('#p'+dane.alle).html("<img src='img/ok.png'>");
                        $('#p'+dane.dalle).html("<img src='img/Right.jpg'>");
                    } else {
                        switch(dane.opuszczone){
                            case 'ok': console.log("1"); $('#p'+dane.alle).html("<img src='img/ok.png'>"); break;
                            case 'kill': $('#p'+dane.alle).html("<img src='img/killpoint.png'>"); break;
                            case 'point': console.log("3"); $('#p'+dane.alle).html("<img src='img/point.png'>"); break;
                        }
                        $('#p'+dane.dalle).html("<img src='img/"+dane.postac+".png'>");
                    }
                    break;

                case 'killing activated':
                    kto_na_obiad = 'ghost';
                    $('#kto_na_obiad').html("Aktualnie jedzeni: Duszki");
                    break;

                case 'killing desactivated':
                    kto_na_obiad='pacy';
                    $('#kto_na_obiad').html("Aktualnie jedzeni: Pacmany");
                    break;

                case 'dead':
                    $('#p'+dane.del_from).html("<img src='img/ok.png'>");
                    break;

                case 'u_might_have_been_my_dinner...':
                    if(dane.who_u_were==postac && dane.pole==pos){
                        $('#if_dead').html("DEAD");
                        alive=false;
                        socket.send(JSON.stringify({type: 'dead', id: id_wb, del_from: pos}));
                       // if(postac=='ghost') $('#plansza').html("KONIEC GRY!</br></br>Wygrana: Pacmany");
                       // else $('#plansza').html("KONIEC GRY!</br></br>Wygrana: Duszki");
                       // $('#plansza').attr('class', 'koniec_gry_info');
                    }
                    break;

                case 'pkt_aktualizacja':
                    $('#aktual_pkt').html(dane.pkt);
                    break;

                case 'game_has_finished':
                    console.log("Gra zakończona");
                    $('#plansza').html("KONIEC GRY!</br></br>Wygrana: "+dane.kto);
                    $('#plansza').attr('class', 'koniec_gry_info');
                    break;

                default:
                    console.log('UFO in user!');
            }

        } catch(error) {console.log("bad unjsoning pacy -> "+error);}
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
        socket.send(JSON.stringify({type: 'mess_sent', name: name_wb, id: id_wb, tresc: tresc}));
    });    


//gra
    //var ustaw=true;
    var il_graczy=6; //to dolecowo pobieramy z bazy
    var p1, p2, d1,d2,d3,d4;
    var ja; var pos;
    var where;
    var alive=true;
    var kto_na_obiad;  //pacy / ghost
    var killp = [];
    var il_przejsc;
    var licznik; // dla killpointów
    var opuszczone; //ok / point / kill
    var postac; //pacman / ghost
    var il_points; //maksymalna
    var pkt;

    var walls = [
    211,241,271,242,
    281,287,  251,252,253,255,256,257,  311,312,313,314,315,316,317,
    32,62,92,122,152, 193,194,195,191,197, 94,124,154,184, 190,188,158,128,98, 160,161,163,164,165, 137,138, 156,186,
    171,201, 198,199,200,139, 218,248,278,308,338,368, 279,309,339, 371,372,373,374,375,376, 233,234,235,236,
    95,96,97,100,101,103,104,105,106,107,108,109,110,111,113,114,115,116,117,118, 173,174,175,176,
    567,537,507,477,447,417, 358, 323,324,325,326, 289,290,319,320,
    496,497,498,499,500,501,502,503,505,506, 533, 409,410,411,412,413,414,415, 382, 245,275,305,335,303,304,366,
    434,435,436,464,494,524, 442, 422,423,424,425,426,427, 429,430,431, 462,492,491,520,521
    ];    

function ustaw_plansze(){
    for(i=0;i<walls.length;i++) $('#p'+walls[i]).html("<img src='img/wall.png'>");
    for(i=0;i<30;i++){walls.push(i); $('#p'+i).html("<img src='img/wall.png'>");}
    for(i=570;i<600;i++){walls.push(i); $('#p'+i).html("<img src='img/wall.png'>");}
    for(i=30;i<570;i+=30){walls.push(i); $('#p'+i).html("<img src='img/wall.png'>");}
    for(i=59;i<570;i+=30){walls.push(i); $('#p'+i).html("<img src='img/wall.png'>");}
}

function strzalki(event){
    switch(event.code){
        case "ArrowUp": {where='g'; break;}
        case "ArrowDown": {where='d'; break;}
        case "ArrowLeft": {where='l'; break;}
        case "ArrowRight": {where='p'; break;}
        case "KeyW": {where='g'; break;}
        case "KeyS": {where='d'; break;}
        case "KeyA": {where='l'; break;}
        case "KeyD": {where='p'; break;}
    }
}
document.addEventListener("keydown", strzalki);

function ustaw(numer_obozowy, id, ilosc_grajacych/*, pola_graczy*/){
    in_pacman=1;
        ustaw_plansze();
        alive=true;
        kto_na_obiad='pacy';
        il_przejsc = 0;
        opuszczone="point";
        il_graczy=ilosc_grajacych;

        //gracze na pozycje startowe
        p1=31;
        if(il_graczy<4) p2=-1; else p2=568;
        d1=282; d2=283; d3=285; d4=286;
        if(il_graczy==2) {d2=-1; d3=-1; d4=-1;}
        if(il_graczy==3 || il_graczy==4) {d2=-1; d3=-1;}
        if(il_graczy==5) {d2=-1;}

        il_points = 30*20 - walls.length; 
        //minus Pacmany i 4 killpointy
        if(p2==-1) il_points-=5; else il_points-=6;
        $('#max_pkt').html("/  "+il_points);

        //NIE USUWAJJJJJ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        /* 
        //poprawiamy postaci
        for(i=0;i<pola_graczy.length;i++){
            if(pola_graczy[i]['gdzie']!=-1){
                switch(pola_graczy[i]['kto']){
                    case 1: p1=pola_graczy[i]['gdzie']; break;
                    case 2: d1=pola_graczy[i]['gdzie']; break;
                    case 3: d2=pola_graczy[i]['gdzie']; break;
                    case 4: d3=pola_graczy[i]['gdzie']; break;
                    case 5: d4=pola_graczy[i]['gdzie']; break;
                    case 6: p2=pola_graczy[i]['gdzie']; break;
                }
            }
        } */

        //ustaw wszystkich na planszy
        $('#p'+p1).html("<img src='img/Right.jpg'>");
        if(p2!=-1) $('#p'+p2).html("<img src='img/Right.jpg'>");
        $('#p'+d1).html("<img src='img/d1.png'>");
        if(d2!=-1) $('#p'+d2).html("<img src='img/d2.png'>");
        if(d3!=-1) $('#p'+d3).html("<img src='img/d3.png'>");
        if(d4!=-1) $('#p'+d4).html("<img src='img/d4.png'>");

        //who am I?
        console.log("KL Aushwitz nr: "+numer_obozowy);
        console.log("Graczy "+il_graczy);
        switch(numer_obozowy){
            case 0: ja='p1'; break;
            case 1: {
                if(il_graczy<4) ja='d1'; else ja='p2'; break;
            }
            case 2: {
                if(il_graczy<4) ja='d2'; else ja='d1'; break;
            }
            case 3: ja='d2'; break;
            case 4: ja='d3'; break;
            case 5: ja='d4'; break;
        }
        console.log("soł I am "+ja);
        
        switch(ja){
            case "p1": pos=p1; postac='pacman'; $('#who_am_i').html("Twoja postać: Pacman"); p1=-1; break;
            case "p2": pos=p2; postac='pacman'; $('#who_am_i').html("Twoja postać: Pacman");  p2=-1; break;
            case "d1": pos=d1; postac='ghost'; $('#who_am_i').html("Twoja postać: Duch"); d1=-1; break;
            case "d2": pos=d2; postac='ghost'; $('#who_am_i').html("Twoja postać: Duch"); d2=-1; break;
            case "d3": pos=d3; postac='ghost'; $('#who_am_i').html("Twoja postać: Duch"); d3=-1; break;
            case "d4": pos=d4; postac='ghost'; $('#who_am_i').html("Twoja postać: Duch"); d4=-1; break;
        }

        if(ja=='p1') where='d';
        else if(ja=='p2') where='g';
        else where='d';

        //killpointy
        killp = [88,461,126,284];
        for(i=0;i<killp.length;i++) $('#p'+killp[i]).html("<img src='img/killpoint.png'>");
}


function GAME_FINISHED(kto){ //pacmany / duchy
    socket.send(JSON.stringify({type: 'game_has_finished', wygrana: kto}));
    $('#plansza').html("KONIEC GRY!</br>Wygrana: "+kto);
}

function dla_duszków_najechanych(d, x){
    //duch -> nie żryj swego brata
    if(postac=='pacman'){
        if(kto_na_obiad=='ghost'){
            //obiadeeeekkkk
            socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: ""}));
            socket.send(JSON.stringify({type: 'u_might_have_been_my_dinner...', pole: x, who_u_were: 'ghost'}));
            $('#p'+pos).html("<img src='img/ok.png'>");
            pos=x;
            $('#p'+pos).html("<img src='img/Right.jpg'>");
        }else{
            //rip, pacy
            socket.send(JSON.stringify({type: 'dead', id: id_wb, postac: ja, del_from: pos, opuszczone: ""}));
            $('#p'+pos).html("<img src='img/ok.png'>");
            $('#if_dead').html("DEAD");
            alive=false;
        }
    }
}

function stala(){
    //console.log(il_przejsc);
    if(alive){
        if(il_przejsc == licznik){
            //killing duszów zakończony
            kto_na_obiad='pacy';
            $('#kto_na_obiad').html("Aktualnie jedzeni: Pacmany");
            socket.send(JSON.stringify({type: 'killing desactivated'}));
        }

        let x;
        //ruch
        switch(where){
            case 'g': {x=pos-30;  break;}
            case 'd': {x=pos+30;  break;}
            case 'p': {x=pos+1;  break;}
            case 'l': {x=pos-1;  break;}
        }

        let next = $('#p'+x).html().trim(); console.log("+"+next+"+");
        switch(next){
            case '<img src="img/point.png">': {
                console.log("OK");
                switch(postac){
                    case 'pacman': 
                    //pacy -> weż kropkę i idź
                        $('#p'+pos).html("<img src='img/ok.png'>");
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: ""}));
                        pos=x;
                        $('#p'+pos).html("<img src='img/Right.jpg'>");

                        let akt_pkt = $('#aktual_pkt').html();
                        let aktualne_pkt = parseInt(akt_pkt,10);
                        console.log(aktualne_pkt);
                        $('#aktual_pkt').html(aktualne_pkt+1);
                        socket.send(JSON.stringify({type: 'pkt_aktualizacja', pkt: aktualne_pkt+1}));
                        if(aktualne_pkt+1 == il_points) GAME_FINISHED('pacmany');
                    break;
                    case 'ghost': 
                    //duszek -> zostaw co było i idź
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: opuszczone}));
                        switch(opuszczone){
                            case 'ok': $('#p'+pos).html("<img src='img/ok.png'>"); break;
                            case 'kill': $('#p'+pos).html("<img src='img/killpoint.png'>"); break;
                            case 'point': $('#p'+pos).html("<img src='img/point.png'>"); break;
                        }
                        pos=x;
                        $('#p'+pos).html("<img src='img/"+ja+".png'>");
                    break;
                }
            }
            opuszczone='point';
            break;

            case '<img src="img/killpoint.png">': {
                switch(postac){
                    case 'pacman': 
                        //pacy -> duszki killing activated i ustaw go na tym polu
                        socket.send(JSON.stringify({type: 'killing activated'}));
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: ""}));
                        $('#p'+pos).html("<img src='img/ok.png'>");
                        pos=x;
                        $('#p'+pos).html("<img src='img/Right.jpg'>");

                        $('#kto_na_obiad').html("Aktualnie jedzeni: Duszki");
                        kto_na_obiad='ghost';
                        licznik = il_przejsc + 200;          
                    break;
                    case 'ghost': 
                        //duszek? nic, idź dalej
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: opuszczone}));
                        switch(opuszczone){
                            case 'ok': $('#p'+pos).html("<img src='img/ok.png'>"); break;
                            case 'kill': $('#p'+pos).html("<img src='img/killpoint.png'>"); break;
                            case 'point': $('#p'+pos).html("<img src='img/point.png'>"); break;
                        }
                        pos=x;
                        $('#p'+pos).html("<img src='img/"+ja+".png'>");
                    break;
                }
            }
            opuszczone='kill';
            break;

            case '<img src="img/ok.png">': {
                //idź, kimkolwiek jesteś
                switch(postac){
                    case 'pacman': 
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: ""}));
                        $('#p'+pos).html("<img src='img/ok.png'>");
                        pos=x;
                        $('#p'+pos).html("<img src='img/Right.jpg'>");
                    break;
                    case 'ghost': 
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: opuszczone}));
                        switch(opuszczone){
                            case 'ok': $('#p'+pos).html("<img src='img/ok.png'>"); break;
                            case 'kill': $('#p'+pos).html("<img src='img/killpoint.png'>"); break;
                            case 'point': $('#p'+pos).html("<img src='img/point.png'>"); break;
                        }
                        pos=x;
                        $('#p'+pos).html("<img src='img/"+ja+".png'>");
                    break;
                }
            }
            opuszczone='ok';
            break;
            case '<img src="img/wall.png">': break; //stój, nie ruszaj się kimbyś nie był
            case '<img src="img/Right.jpg">': {
                //pacman? nie tykaj swego brata
                if(postac=='ghost'){
                    //zjedz lub zostań zjedzonym
                    if(kto_na_obiad=='pacy'){
                        //oooobiadddd
                        socket.send(JSON.stringify({type: 'move', postac: ja, alle: pos, dalle: x, id: id_wb, opuszczone: opuszczone}));
                        socket.send(JSON.stringify({type: 'u_might_have_been_my_dinner...', pole: x, who_u_were: 'pacman'}));
                        switch(opuszczone){
                            case 'ok': $('#p'+pos).html("<img src='img/ok.png'>"); break;
                            case 'kill': $('#p'+pos).html("<img src='img/killpoint.png'>"); break;
                            case 'point': $('#p'+pos).html("<img src='img/point.png'>"); break;
                        }
                        pos=x;
                        opuszczone='ok';
                        $('#p'+pos).html("<img src='img/"+ja+".png'>");
                    }else{
                        //rip
                        socket.send(JSON.stringify({type: 'dead', id: id_wb, postac: ja, del_from: pos, opuszczone: opuszczone}));
                        alive=false;
                        $('#p'+pos).html("<img src='img/ok.png'>");
                        $('#if_dead').html("DEAD");
                    }
                }
            }break;
            case '<img src="img/d1.png">': dla_duszków_najechanych(d1, x); break;
            case '<img src="img/d2.png">': dla_duszków_najechanych(d2, x); break;
            case '<img src="img/d3.png">': dla_duszków_najechanych(d3, x); break;
            case '<img src="img/d4.png">': dla_duszków_najechanych(d4, x); break;
        }


    }//alive

    //nowe pole -> roześnij innym

    il_przejsc++;
    setTimeout("stala()",100);
}

function add_player(id, name, il, czy_wpisany){
    id_wb = id;
    name_wb = name;
    il_wb = il;
    console.log(czy_wpisany);
    wpisany=czy_wpisany;
    console.log("pobrano");
    console.log(wpisany+" | s "+connected);

    if(!wpisany && connected) {console.log("addplayer sending"); socket.send(JSON.stringify({id: id_wb, name: name_wb, il: il_wb, type: "new_player_loaded"})); wpisany=1;}
}
function index_load(){index_load=true;}

function start_game(){
    socket.send(JSON.stringify({type: 'game_has_been_started', kto: id_wb}));
    window.location.href = 'pacy.html';
}

function leave_lobby(){
    socket.send(JSON.stringify({type: 'someone_left_lobby', id: id_wb, il: il_wb}));
    window.location.href = 'http://localhost/mine/Zgraja%20site/transform.php';
}