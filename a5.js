var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http);
var fs = require("fs");


var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Enabling Push Button on pin 2");
    board.pinMode(2, board.MODES.INPUT);
});


function handler(req, res) {
    fs.readFile(__dirname + "/a5.html",
    function (error, data) {
        if (error) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end("Error loading html page.");
        }
        res.writeHead(200);
        res.end(data);
    })
}

// add listner
http.listen(8080);


var sendValueViaSocket = function () {}


var date = new Date();
var millis;
var currentTime = date.getTime();
var gap = 0;


board.on("ready", function() {
    
    io.sockets.on("connection", function(socket) {
        console.log("Socket id: " + socket.id);
        socket.emit("messageToClient", "Srv connected, board OK")
        
        sendValueViaSocket = function(value) {
            socket.emit("messageToClient", value);
        }
    
    });
    
    var lastValue = 0;
    var lastSent = 1;
    
    var timeout = false;
    
    board.digitalRead(2, function(value) { // this happens many times on digital input change of state 0->1 or 1->0
        if (timeout !== false) { // if timeout below has been started (on unstable input 0 1 0 1) clear it
	        clearTimeout(timeout); // clears timeout until digital input is not stable i.e. timeout = false
        }
        
        timeout = setTimeout(function() { // this part of code will be run after 50 ms; if in-between input changes above code clears it
        console.log("Timeout set to false");
        timeout = false;
        if (lastValue != lastSent) { // to send only on value change
        	if (value == 0) {
                console.log("LED OFF");
                board.digitalWrite(13, board.LOW);
                console.log("value = 0, LED OFF");
                sendValueViaSocket(0);
            }
            else if (value == 1) {
                console.log("LED ON");
                board.digitalWrite(13, board.HIGH);
                console.log("value = 1, LED ON");
                sendValueViaSocket(1);
            }
            
            
        }

        lastSent = lastValue;
    }, 50);
                
    lastValue = value; // this is read from pin 2 many times per s
                
}); // end board.digitalRead on pin 2
    
    
    
});


