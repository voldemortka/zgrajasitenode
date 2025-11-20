var nick, jest_nick;
var klucz = "zgraja_nick";
var klucz_id = "zgraja_id";

const socket = new WebSocket('ws://localhost:3000');

//połączenie z serwerem
    socket.addEventListener('open', (event) => {
        console.log('Server connected zgraja');
    });

    socket.addEventListener('message', (event) => {
        console.log(`Message from server: ${event.data}`);
        try{
            const dane = JSON.parse(event.data);
            switch(dane.type){
                case 'data_zgraja_main':
                    localStorage.setItem(klucz_id, dane.id);
                    break;
                default: console.log("UFO zgaraja");
            }
        }catch (error) {console.log("error zgraja -> "+error);}
    });

    socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
    });

    socket.addEventListener('error', (error) => {
        console.log(`WebSocket error: ${error}`);
    });

function remove(){
    localStorage.removeItem(klucz);
}

function inizial(){
    console.log("in");
    nick = localStorage.getItem(klucz);
    if(nick==null){
        jest_nick=false;
        console.log("OK");
        $('#set_nick').html(`<h5>Jak chcesz być nazywanym?</h5>
            <div class="little">Inni gracze mają na tej podstawie umieć rozpoznać, że ta postać to ty</div>
            <form id="nick_set" method='post'>
                <input type="text" name="nick" id="nick">
                <div class="submits" onclick="send_form_nick()">Zatwierdź</div>
            </form>`);
    } else {
        jest_nick=true;
        $('#set_nick').html(`<h5>Twoja aktualna nazwa:</h5>
            <div id="your_name">`+nick+`</div>
            <div class="submits" onclick="edit_name()">edytuj</div>`);
    }
    
}

function edit_name(){
    $('#set_nick').html(`<h5>Jak chcesz być nazywanym?</h5>
        <div class="little">Inni gracze mają na tej podstawie umieć rozpoznać, że ta postać to ty</div>
        <form id="nick_set">
            <input type="text" name="nick" id="nick" value=`+nick+`>
            <div class="submits" onclick="send_form_nick()">Zatwierdź</div>
        </form>`);
}

//$('#nick_set').on('submit', function(event) {
//document.getElementById('nick_set').addEventListener('submit', function(event) {
function send_form_nick(){
    //event.preventDefault();
    nick = $('#nick').val();
    localStorage.setItem(klucz, nick);
    jest_nick=true;
    socket.send(JSON.stringify({type: 'data_zgraja_main', nick: nick}));
    $('#set_nick').html(`<h5>Twoja aktualna nazwa:</h5>
        <div id="your_name">`+nick+`</div>
        <div class="submits" onclick="edit_name()">edytuj</div>`);
}//);