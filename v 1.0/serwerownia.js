var WebSocket = require('ws');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
const { Client } = require('pg');

var server = new WebSocket.Server({ port: 3000 });

let users = []; //tablica, w której mamy info o podłączonych do strony userach

/*
const client = new Client({
    host: "aws-0-eu-central-1.pooler.supabase.com",
    user: "postgres.hikyvsglbjlwjdnqtlgj",
    password: "SlytherV35!",
    database: "postgres",
    port: 6543,
}); */
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zgraja'
}); 

db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
}); 
/*client.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
}); */

function send_to_everyone(ws, mess){
    users.forEach(user => {  //weź każdego usera po kolei
        if (user !== ws && user.readyState === WebSocket.OPEN) //jeśli nie jest wysyłającym, ale jest podłączony do serwera
            user.send(mess);
    });
}

server.on('connection', (ws) => {
    console.log('Client connected serwer');
    //weszło -> nowa osoba się zalogowała
    users.push(ws); //ws posiada info o danym userze, kto to i co to: WS TO TO KONTO, Z TEGO KONKRETNEGO KOMPUTERA cały czas

    ws.on('message', (message) => {   //info o userze, dostep do tego kompuera przez 'ws' i otrzymujemy wiadomość, dostajemy dane do niej w nawiasie
        //tutaj wchodzi WSZYSTKO, co przyjdzie od userów
        try{
            console.log("Zaktualizowałem się wreszcie");
            var dane = JSON.parse(message);
            console.log("unjsoning done serwer");
            console.log("type: "+dane.type);

            switch(dane.type){
                case 'mess_sent': 
                    console.log('sending...');
                    let sql = "insert into mess (id,nadawca,odbiorca,tresc) values (NULL,"+dane.id1+","+dane.id2+",'"+dane.tresc+"')";
                    db.query(sql, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                    send_to_everyone(ws, JSON.stringify({type: "mess_sent", tresc: dane.tresc, name2: dane.name2 }));
                    break;

                case 'data_zgraja_main':
                    var sql201 = "";
                    break;

            //MESSENGER
            case 'take_token_mess':
                ws.send(JSON.stringify({ type: 'request_token' })); 
                break;

                case 'send_token_mess':
                    var tokenW = dane.token;
                    console.log("ok, we've got token");
                    if(tokenW) {
                        // Dekodowanie tokenu JWT
                        var decoded = jwt.verify(tokenW, 'zgrajasite_mess');
                        console.log("x");
                        var { name, id, name2, id2 } = decoded.data;
                        console.log('Token received');
    
                        var sql01 = "select tresc, nadawca from mess where (nadawca="+id+" and odbiorca="+id2+") or (nadawca="+id2+" and odbiorca="+id+") order by id";
                        db.query(sql01, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                            var tab = [];
                            for(i=0;i<res.length;i++){
                                tab.push({nadawca: res[i].nadawca, tresc: res[i].tresc});
                            }
                            ws.send(JSON.stringify({ type: 'token_received', name, id, name2, id2, tab }));
                        });
                        // Potwierdzenie odebrania tokenu
                    } else console.log("Token is broken");
                    break;



                //wonsz 3.0
                case 'take_token_wonsz':
                    ws.send(JSON.stringify({ type: 'request_token' })); 
                    break;
    
                    case 'send_token1_wonsz':
                        var tokenW = dane.token;
                        console.log("ok, we've got token");
                        if(tokenW) {
                            // Dekodowanie tokenu JWT
                            var decoded = jwt.verify(tokenW, 'zgrajasite_snake1');
                            console.log("x");
                            var { name, id, hex, nr, kolory, barwy, spis } = decoded.data;
                            console.log('Token received');
        
                            // Potwierdzenie odebrania tokenu
                            console.log(0);
                            ws.send(JSON.stringify({ type: 'token_received', name, id, hex, nr, kolory, barwy, spis }));
                            console.log(1);
                        } else console.log("Token is broken");
                        break;
    
                        case 'send_token2_wonsz':
                            var token2W = dane.token;
                            if(token2W) {
                                // Dekodowanie tokenu JWT
                                var decoded = jwt.verify(token2W, 'zgrajasite_snake2');
                                var { name, id, hex, nr } = decoded.data;
                                console.log('Token received');
                
                                // Potwierdzenie odebrania tokenu
                                console.log(0);
                                ws.send(JSON.stringify({ type: 'token_received', name, id, hex, nr}));
                                console.log(1);
                            }
                            break;
    
                    case 'kolor_changed':
                        var sql1 = "update aktualne set kolor="+dane.id_kol+" where kto="+dane.id;
                        db.query(sql1, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                        var send_kol = JSON.stringify({type: dane.type, name: dane.name, hex: dane.hex, hex_old: dane.hex_old});
                        send_to_everyone(ws, send_kol);
                        break;
    
                    case 'game_started':
                        var sql2 = "update aktualne set in_game=1 where gra=3";
                        db.query(sql2, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                        var sql3 = "insert into ruch (id, gra, kto, action) values (NULL, 3, "+dane.id+", 4)";
                        db.query(sql3, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                        send_to_everyone(ws, JSON.stringify({type: dane.type}));
                        break;
    
                    case 'someone_left_lobby':
                        var sql4 = "delete from aktualne where gra=3 and kto=".dane.id;
                        db.query(sql4, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                        send_to_everyone(ws, JSON.stringify({type: dane.type, nr: dane.nr}));
                        break;
    
                    case 'new_player':
                        send_to_everyone(ws, JSON.stringify({type: dane.type, nr: dane.nr, name: dane.name, hex: dane.hex}));
                        break;
    
                    case 'mess_sent_wonsz': 
                        var sql16 = "insert into ruch (id,gra,kto,action,tekst) values (NULL,3,"+dane.id+",8,'"+dane.tresc+"')";
                        db.query(sql16, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                        var to_send = JSON.stringify({type: dane.type, name: dane.name, tresc: dane.tresc});
                        send_to_everyone(ws, to_send);
                        break;
                    case 'load_mess_wonsz3':
                        var sql17 = "Select ruch.tekst as tekst, konto.name as name from konto inner join ruch on konto.id=ruch.kto where gra=7 and action=8 Order by ruch.id limit 10";
                        db.query(sql17, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                            var tab = [];
                            for(i=0;i<res.length;i++){
                                tab.push({'name': res[i].name, 'tekst': res[i].tekst});
                            }
                            ws.send(JSON.stringify({type: 'load_mess', tab: tab}));
                        });
                        break;
    
                    case 'new_robal':
                        send_to_everyone(ws, JSON.stringify({type: dane.type, where: dane.where}));
                        break;
    
                    case 'dodaj':
                        send_to_everyone(ws, JSON.stringify({type: dane.type, where: dane.where, hex: dane.hex}));
                        break;
    
                    case 'usun':
                        send_to_everyone(ws, JSON.stringify({type: dane.type, where: dane.where}));
                        break;
    
                    case 'death':
                        var sql5 = "update aktualne set alive=0, pkt="+dane.pkt+" where gra=3 and kto="+dane.id;
                        db.query(sql5, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                            var sql13 = "select id from aktualne where gra=3 and alive=1";
                            db.query(sql13, (err,res13) => { if(err) console.log('error sql in mess: '+err); 
                                if(res13.length==0){
                                    //koniec gry, został max 1 wonsz na planszy
                                    var info_end = JSON.stringify({type: 'everyone_is_dead'});
                                    users.forEach(user => {  //weź każdego usera po kolei
                                        if (user.readyState === WebSocket.OPEN) //jeśli nie jest wysyłającym, ale jest podłączony do serwera
                                            user.send(info_end);
                                    });
                                
                                }
                            });
                        });
                        var sql7 = "insert into ruch(id, kto, action, gra) values (NULL,"+dane.id+", 6,3)";
                        db.query(sql7, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                        send_to_everyone(ws, JSON.stringify({type: dane.type, tab: dane.tab}));
                        break;
    
                    case 'game_has_been_finished':
                        var sql8 = "insert into ruch(id, action, gra) values (NULL, 12,3)";
                        db.query(sql8, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                        send_to_everyone(ws, JSON.stringify({type: dane.type}));
                        break;
    
                    case 'pobierz_pkt':
                        var sql6 = "update aktualne set pkt="+dane.pkt+" where gra=3 and kto="+dane.id;
                        db.query(sql6, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                        break;
    
                    case 'wykasuj_wszystkich':
                        var sql14 = "delete from ruch where gra=3";
                        var sql15 = "delete from aktualne where gra=3";         
                        db.query(sql14, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                            db.query(sql15, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                                var info_canceld = JSON.stringify({type: 'everyone_out'});
                                users.forEach(user => {  //weź każdego usera po kolei
                                    if (user.readyState === WebSocket.OPEN) //jeśli nie jest wysyłającym, ale jest podłączony do serwera
                                        user.send(info_canceld);
                                });
                            });
                        });
                        
                        break;


                //Pacman 2.0
                case 'take_token_pacy':
                    ws.send(JSON.stringify({ type: 'request_token' })); 
                    break;
    
                    case 'send_token1_pacy':
                        var tokenW = dane.token;
                        console.log("ok, we've got token");
                        if(tokenW) {
                            // Dekodowanie tokenu JWT
                            var decoded = jwt.verify(tokenW, 'zgrajasite_pacy1');
                            console.log("x");
                            var { name, id, nr, tab } = decoded.data;
                            console.log('Token received');
        
                            // Potwierdzenie odebrania tokenu
                            console.log(0);
                            ws.send(JSON.stringify({ type: 'token_received', name, id, nr, tab }));
                            console.log(1);
                        } else console.log("Token is broken");
                        break;
    
                        case 'send_token2_pacy':
                            var token2W = dane.token;
                            if(token2W) {
                                // Dekodowanie tokenu JWT
                                var decoded = jwt.verify(token2W, 'zgrajasite_pacy2');
                                var { id } = decoded.data;
                                console.log('Token received');

                                var sqlP1 = "select id from aktualne where kto="+id;
                                var sqlP3 = "select count(id) as il from aktualne where gra=7";
                                db.query(sqlP1, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                                    let id_akt_pacy = res[0].id;
                                    var sqlP2 = "select count(id) as il from aktualne where gra=7 and id<"+id_akt_pacy;
                                    db.query(sqlP2, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                                        var nrKL_pacy = res[0].il;
                                        db.query(sqlP3, (err,res) => { if(err) console.log('error sql in mess: '+err); 
                                            var il_graczy_pacy = res[0].il;
                                            ws.send(JSON.stringify({ type: 'token_received', id, il_graczy: il_graczy_pacy, nr: nrKL_pacy}));
                                        });
                                    });
                                });
                
                                // Potwierdzenie odebrania tokenu
                                console.log(0);
                                
                                console.log(1);
                            }
                            break;


                case 'mess_sent': 
                var sql20 = "insert into ruch (id,gra,kto,action,tekst) values (NULL,7,"+dane.id+",8,'"+dane.tresc+"')";
                db.query(sql20, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                var to_send_p = JSON.stringify({type: dane.type, name: dane.name, tresc: dane.tresc});
                send_to_everyone(ws, to_send_p);
                break;

            case 'new_player_loaded':
                var wiad_send = JSON.stringify({id: dane.id, name: dane.name, il: dane.il, type: dane.type});
                send_to_everyone(ws, wiad_send);
                break;

            case 'game_has_been_started':
                var sql22 = "insert into ruch (id, gra, kto, action) values (NULL, 7, "+dane.kto+", 4)";
                db.query(sql22, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                var start_end = JSON.stringify({type: 'game_has_been_started'});
                send_to_everyone(ws, start_end);
                break;

            case 'someone_left_game':
                var sql23 = "insert into ruch (id, gra, kto, action) values (NULL, 7, "+dane.kto+", 7)";
                db.query(sql23, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                break;

            case 'someone_left_lobby':
                var sql24 = "insert into ruch (id, gra, kto, action) values (NULL, 7, "+dane.id+", 7)";
                db.query(sql24, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                var sql25 = "delete from aktualne where kto="+dane.id;
                db.query(sql25, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                var left_send = JSON.stringify({type: dane.type, il: dane.il});
                send_to_everyone(ws, left_send);
                break;

            case 'move':
                var sql26 = "update aktualne set pole="+dane.dalle+" where gra=7 and kto="+dane.id;
                db.query(sql26, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                var move_send = JSON.stringify({type: dane.type, alle: dane.alle, dalle: dane.dalle, postac: dane.postac, opuszczone: dane.opuszczone});
                send_to_everyone(ws, move_send);
                break;

            case 'killing activated':
                var kill_act_send = JSON.stringify({type: dane.type});
                send_to_everyone(ws, kill_act_send);
                break;

            case 'killing desactivated':
                var kill_des_send = JSON.stringify({type: dane.type});
                send_to_everyone(ws, kill_des_send);
                break;

            case 'dead':
                var sql27 = "update aktualne set pole=-1, alive=0 where gra=7 and kto="+dane.id;
                db.query(sql27, (err,res) => { 
                    if(err) console.log('error sql in starting: '+err); 
                    //zostało ustawione w bazie, że ten tu umarł, więc:
                    //sprawdź, czy to już koniec
                    var sql31 = "select id from aktualne where gra=7 and typ_postaci='ghost' and alive=1"; //ile duchów żywych
                    var sql32 = "select id from aktualne where gra=7 and typ_postaci='pacman' and alive=1"; //ile pacych żywych
                    db.query(sql31, (err,res31) => {
                        console.log("ny ma pacmanów");
                        if(err) console.log('error sql in starting: '+err); 
                        if(res31.length==0) {
                            var sql28 = "delete from aktualne where gra=7";
                            var sql29 = "delete from ruch where gra=7";
                            db.query(sql28, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                            db.query(sql29, (err,res) => { if(err) console.log('error sql in starting: '+err); }); 
                                       
                            send_to_everyone("", JSON.stringify({type: 'game_has_finished', kto: 'pacmany'}));
                        }
                    });
                    db.query(sql32, (err,res32) => { 
                        console.log("ny ma duszków");
                        if(err) console.log('error sql in starting: '+err); 
                        if(res32.length==0) {
                            var sql28 = "delete from aktualne where gra=7";
                            var sql29 = "delete from ruch where gra=7";
                            db.query(sql28, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                            db.query(sql29, (err,res) => { if(err) console.log('error sql in starting: '+err); });
        
                            send_to_everyone("", JSON.stringify({type: 'game_has_finished', kto: 'duszki'}));
                        }
                    });

                });
                var dead_send = JSON.stringify({type: dane.type, del_from: dane.del_from, opuszczone: dane.opuszczone})
                send_to_everyone(ws, dead_send);

                break;

            case 'u_might_have_been_my_dinner...':
                var eaten_send = JSON.stringify({type: dane.type, pole: dane.pole, who_u_were: dane.who_u_were});
                send_to_everyone(ws, eaten_send);
                break;

            case 'pkt_aktualizacja':
                send_to_everyone(ws, JSON.stringify({type: dane.type, pkt: dane.pkt}));
                break;

            case 'game_has_finished':
                //skasuj wszystko z serwera
                var sql28 = "delete from aktualne where gra=7";
                var sql29 = "delete from ruch where gra=7";
                db.query(sql28, (err,res) => { if(err) console.log('error sql in starting: '+err); });
                db.query(sql29, (err,res) => { if(err) console.log('error sql in starting: '+err); });

                send_to_everyone(ws, JSON.stringify({type: dane.type, kto: dane.kto}));
                break;

            case 'set_charakter':
                var sql30 = "update aktualne set typ_postaci='"+dane.postac+"' where gra=7 and kto="+dane.id;
                db.query(sql30, (err,res) => { if(err) console.log('error sql in setting: '+err); });
                break;


            // KROPKI VERSJA DRUGA

            case 'take_token':
                ws.send(JSON.stringify({ type: 'request_token' }));
                break;

                case 'send_token1':
                    var token = dane.token;
                    console.log("ok, we've got token");
                    if(token) {
                        // Dekodowanie tokenu JWT
                        var decoded = jwt.verify(token, 'zgrajasite_kropki1');
                        console.log("x");
                        var { name, id, hex, nr } = decoded.data;
                        console.log(`Token received. Name: ${name}, ID: ${id}, HEX: ${hex}, nr: ${nr}`);

                        ws.name = name;
                        ws.id = id;
                        ws.hex = hex;
                        ws.nr = nr;

                        // Potwierdzenie odebrania tokenu
                        console.log(0);
                        console.log("test: "+JSON.stringify({ type: 'token_received', name, id, hex, nr }));
                        ws.send(JSON.stringify({ type: 'token_received', name, id, hex, nr }));
                        console.log(1);
                    } else console.log("Token is broken");
                    break;

                    case 'send_token2':
                        var token2 = dane.token;
                        if(token2) {
                            // Dekodowanie tokenu JWT
                            var decoded = jwt.verify(token2, 'zgrajasite_kropki2');
                            var { name, id, hex, nr } = decoded.data;
                            console.log(`Token received. Name: ${name}, ID: ${id}, HEX: ${hex}`);
    
                            // Przechowywanie danych na serwerze lub dalsza logika
                            ws.name = name;
                            ws.id = id;
                            ws.hex = hex;
                            ws.nr = nr;
    
                            // Potwierdzenie odebrania tokenu
                            console.log(0);
                            ws.send(JSON.stringify({ type: 'token_received', name, id, hex}));
                            console.log(1);
                        }
                        break;

            case 'kropy_started':
                var sql40 = 'insert into ruch (id, kto, action) values (NULL, '+dane.id+', 4)';
                db.query(sql40, (err,res) => { if(err) console.log('error sql in setting: '+err); });
                send_to_everyone(ws, JSON.stringify({type: dane.type}));
                break;

            case 'new_in_lobby_kropki':
                send_to_everyone(JSON.stringify({type: dane.type, nr: dane.nr}))
                break;

            case 'lobby_left_kropki':
                var sql45 = "delete from aktualne where gra=6 and kto="+dane.id;
                db.query(sql45, (err,res) => { if(err) console.log('error sql in setting: '+err); });
                send_to_everyone(ws, JSON.stringify({type: dane.type, nr: dane.nr}));
                break;

            case 'added':
                send_to_everyone(ws, JSON.stringify({type: dane.type, nr: dane.nr, hex: dane.hex}));
                break;

            case 'next_in_queue':
                var sql41 = "select id from aktualne where gra=6 and kto="+dane.id; //ws's id
                db.query(sql41, (err,res41) => { if(err) console.log('error sql in setting: '+err); 
                    var id_aktualne_kropki = res41[0].id; 
                    var sql42 = "select kto from aktualne where gra=6 and id>"+id_aktualne_kropki+" limit 1"; //większe id -> next person in queue
                    db.query(sql42, (err,res42) => { if(err) console.log('error sql in setting: '+err); 
                        if(res42.length==0){
                            var sql43 = "select kto from aktualne where gra=6 order by id limit 1"; //ostatni? To pierwsza osoba again
                            db.query(sql43, (err,res43) => { if(err) console.log('error sql in setting: '+err); 
                                var next_person = res43[0].kto; 
                                if(next_person == dane.id) ws.send(JSON.stringify({type: dane.type, next: next_person }));
                                else send_to_everyone(JSON.stringify({type: dane.type, next: next_person }));
                            });
                        } else {
                            var next_person = res42[0].kto; 
                            console.log(next_person);
                            if(next_person == dane.id) ws.send(JSON.stringify({type: dane.type, next: next_person }));
                            else send_to_everyone(JSON.stringify({type: dane.type, next: next_person }));
                        }
                    });
                });
                break;
            
            case 'take_true_nr_kropki':
                console.log("2");
                var sql46 = "select id from aktualne where gra=6 and kto="+dane.id+" limit 1;";
                console.log(sql46);
                db.query(sql46, (err,res46) => { if(err) console.log('error sql in setting: '+err); 
                    var id_akt_kr = res46[0].id;
                    var sql47 = "select count(id) as il from aktualne where gra=6 and id<"+id_akt_kr;
                    console.log(sql47);
                    db.query(sql47, (err,res47) => { if(err) console.log('error sql in setting: '+err); 
                        var nr = res47[0].il;

                        var sql48 = "select konto.name as name, kolor.hex as hex from konto inner join (kolor inner join aktualne on kolor.id=aktualne.kolor) on konto.id=aktualne.kto where aktualne.gra=6";
                        db.query(sql48, (err,res48) => { if(err) console.log('error sql in setting: '+err); 
                            var tab = [];
                            for(i=0;i<res48.length;i++){
                                tab.push({name: res48[i].name, hex: res48[i].hex});
                            }
                            ws.send(JSON.stringify({type: dane.type, nr: nr, spis: tab}));
                        });
                        
                    });
                });
                break;

            case 'kropki_has_been_finished':
                send_to_everyone(JSON.stringify({type: dane.type}));
                break;

            case 'sb_left_kropki':
                var sql44 = "delete from aktualne where gra=6 and kto="+dane.id;
                db.query(sql44, (err,res) => { if(err) console.log('error sql in setting: '+err); });
                break;

            case 'mess_sent_dot': 
                var sql16 = "insert into ruch (id,gra,kto,action,tekst) values (NULL,6,"+dane.id+",8,'"+dane.tresc+"')";
                db.query(sql16, (err,res) => { if(err) console.log('error sql in mess: '+err); });
                var to_send = JSON.stringify({type: dane.type, name: dane.name, tresc: dane.tresc});
                send_to_everyone(ws, to_send);
                break;


    
    
                default: 
                    console.log('another type in switch, UFOOOO: '+dane.tresc);
            }

        } catch {console.log("error caught serwer");}

        

    });

    //wychodzi? Osoba się wylogowała
    ws.on('close', () => {
        console.log('Client disconnected serwer');
    });
});

console.log('WebSocket server is running on ws://localhost:3000 or jakimś wss/talala_cokolwiek');
