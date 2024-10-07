const socket = new WebSocket('ws://localhost:3000');    //TU CHECK

//połączenie z serwerem
    socket.addEventListener('open', (event) => {
        console.log('Server connected at mainpage');
    });


socket.addEventListener('message', (event) => {   
        console.log("at pacy");       
        console.log(`Message from server: ${event.data}`);
        try{
            const dane = JSON.parse(event.data);
            console.log("unjsoning done mainpage");

            switch(dane.type){
              case 'zalogowano':
                    window.location.href="selection.html";
                break;
            }
        }
        catch (error) {console.log("try in mainpage -> "+error);}
});


//rozłączenie, jakieś errory z serwera
    socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
    });

    socket.addEventListener('error', (error) => {
        console.log(`WebSocket error: ${error}`);
    });

 $('#form_log_node').submit((event) => {
     event.preventDefault();
     var username = $('#name').val();
     $('#name').val("");
     var userpass = $('#pass').val();
     $('#pass').val("");
   socket.send(JSON.stringify({type: 'log_in_check', pass: userpass, name: username}));
 });
