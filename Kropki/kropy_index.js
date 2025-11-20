//WebSocket
const socket = new WebSocket('ws://localhost:3000');
var name=""; var id=0, hex='', nr; var index=true;
function rgbToHex(rgb) {
    let result = rgb.match(/\d+/g);
    let hex = ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1).toLowerCase();
    return hex;
}



//połączenie z serwerem
    socket.addEventListener('open', (event) => {
        console.log('Server connected at kropki');
        socket.send(JSON.stringify({type: 'take_token'}));

    });

    socket.addEventListener('message', async (event) => {   
        console.log(`Message from server: ${event.data}`);

        if (event.data instanceof Blob) {
            console.log("aaa");
            // Jeśli wiadomość jest typu Blob, konwertujemy ją na tekst
            const textData = await event.data.text();
            var dane = JSON.parse(textData);
        } else {var dane = JSON.parse(event.data);}
        try{
            switch(dane.type){
                case 'mess_sent_dot':
                    $('#messages_list').append("<div class='last_mess'><div class='last_name'>"+dane.name+"</div><div class='last_tekst'>"+dane.tresc+"</div></div>");
                    break;

                case 'request_token':
                    console.log("xxx");
                    // Odczyt tokenu z localStorage
                    var token;
                    if(index) {token = localStorage.getItem('kropki1_token'); socket.send(JSON.stringify({ type: 'send_token1', token }));}
                    else {token = localStorage.getItem('kropki2_token'); socket.send(JSON.stringify({ type: 'send_token2', token }));}
                    // Wysłanie tokenu do serwera Node.js
                    
                    break;

                case 'token_received':
                    name = dane.name;
                    hex = dane.hex;
                    id = dane.id;
                    if(index) nr = dane.nr;
                    console.log("everything done: "+name+", "+id+", "+hex);

                    if(index){
                        $('#w'+nr).html(name);
                        $('#w'+nr).attr('class', 'wait_tak');
                    }

                    if(index){
                        socket.send(JSON.stringify({type: 'new_in_lobby_kropki', nr: nr, name: name}));
                    } else {
                        socket.send(JSON.stringify({type: 'take_true_nr_kropki', id: id}));
                    }
            
                    break;

                case 'kropy_started':
                    window.location.href='kropy.html';
                    break;

                case 'added':
                    $('#i'+dane.nr).css('background-color', "#"+dane.hex);
                    $('#i'+dane.nr).css('opacity', '100%');
                    break;

                case 'next_in_queue':
                    if(dane.next == id){
                        $('#tura').html("Tura:<br>T W O J A !");
                    }
                    break;

                case 'kropki_has_been_finished':
                    window.location.href = "http://localhost/mine/Zgraja%20site/trans_return_dot.php";
                    break;

                case 'new_in_lobby_kropki':
                    $('#w'+dane.nr).html(dane.name);
                    $('#w'+dane.nr).attr('class', 'wait_tak');
                    break;

                case 'lobby_left_kropki':
                    for(i=dane.nr;i<9;i++){
                        $('#w'+i).html( $('#w'+(i+1)).html() );
                        if($('#w'+i).html()=="Waiting...") $('#w'+i).attr('class', 'wait_nie');
                        if($('#w'+(i+1)).html()==name) nr--;
                    }
                    if(dane.nr==9){
                        $('#w'+dane.nr).html("Waiting...");
                        $('#w'+dane.nr).attr('class', 'wait_nie');
                    }
                    break;

                case 'take_true_nr_kropki':
                    nr = dane.nr;
                    if(nr==0){
                        $('#tura').html("Tura:<br>T W O J A !");
                    }

                    for(i=0;i<dane.spis.length;i++){
                        $('#spis_ludnosci').append(`<div class="spis_dets">${dane.spis[i]['name']}<div class='spis_col' style="background-color: #${dane.spis[i]['hex']}"></div></div>`);
                    }

                    break;
    
                default: console.log("UFO at kropy");
            }
        }
        catch (error) {
            console.log("Sth wrong in kropy -> "+error);
        }
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
    $('#messages_list').append("<div class='last_mess'><div class='last_name'>"+name+"</div><div class='last_tekst'>"+tresc+"</div></div>");
    socket.send(JSON.stringify({type: 'mess_sent_dot', name: name, id: id, tresc: tresc}));
});    



// INDEX
function loaded(){
    index = true;
    console.log("yeah, it's index");
}

function start_game(){
    socket.send(JSON.stringify({type: 'kropy_started', id: id}));
    window.location.href='kropy.html';
}

function leave_lobby(){
    socket.send(JSON.stringify({type: 'lobby_left_kropki', id: id, nr: nr}));
    window.location.href = "http://localhost/mine/Zgraja%20site/transform.php";
}

// KROPY ITSELF

function selected(n){
    console.log("selected");
    if($('#tura').html()=="Tura:<br>NIE twoja") return;
    console.log("OK");
    let xrgb = $('#i'+n).css('background-color');
    console.log(xrgb);
    let x = rgbToHex(xrgb);
    console.log(x);
    if(x=="add8e6" || x=="ffffff"){
        console.log('i can');
        $('#i'+n).css('background-color', "#"+hex);
        $('#i'+n).css('opacity', "100%");
        socket.send(JSON.stringify({type: 'added', hex: hex, id: id, nr: n }));
    }
}

function complete(){
    $('#tura').html("Tura:<br>NIE twoja");
    socket.send(JSON.stringify({type: 'next_in_queue', id: id}));
}

function finish_game(){
    socket.send(JSON.stringify({type: 'kropki_has_been_finished'}));
    window.location.href = "http://localhost/mine/Zgraja%20site/trans_return_dot.php";
}

function leave_game(){
    socket.send(JSON.stringify({type: 'sb_left_kropki', id: id}));
    window.location.href = "http://localhost/mine/Zgraja%20site/transform.php";
}



function loaded_kropy(){
    let item = 0;

    for (i = 0; i < 16; i++) {  //row
        for (j = 0; j < 27; j++) {  //column
            // Kontener na jedną kratkę
            const $cell = $('<div class="cell"></div>');

            // Linie poziome i pionowe
            const $lineHorizontal = $('<div class="line-horizontal1" id="i'+item+'" onclick="selected('+item+')"></div><div class="line-horizontal2" id="i'+(item+1)+'" onclick="selected('+(item+1)+')"></div>'); item+=2;
            const $lineVertical = $('<div class="line-vertical1" id=i'+item+' onclick="selected('+item+')"></div><div class="line-vertical2" id="i'+(item+1)+'" onclick="selected('+(item+1)+')"></div>'); item+=2;

            // Linie skośne
            const $diagonal1 = $('<div class="diagonal-1A" id="i'+item+'" onclick="selected('+item+')"></div><div class="diagonal-1B" id="i'+(item+1)+'" onclick="selected('+(item+1)+')"></div>'); item+=2;
            const $diagonal2 = $('<div class="diagonal-2A" id="i'+item+'" onclick="selected('+item+')"></div><div class="diagonal-2B" id="i'+(item+1)+'" onclick="selected('+(item+1)+')"></div>'); item+=2;

            // Kropka na środku
            const $dot = $('<div class="dot" id="i'+item+'" onclick="selected('+item+')"></div>'); item++;

            // Dodanie elementów do kratki
            $cell.append($lineHorizontal, $lineVertical, $diagonal1, $diagonal2, $dot);

            // Dodanie kratki do planszy
            $('#board').append($cell);
        }
    }
}

