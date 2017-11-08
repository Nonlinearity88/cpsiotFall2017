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
    fs.readFile(__dirname + "/example7.html",
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
    
    
    
    board.digitalRead(2, function(value) {
        

        if (value == 0) {
            console.log("LED off");
            board.digitalWrite(13, board.LOW);
            sendValueViaSocket(0);
        }
        if (value == 1) {
            console.log("LED on");
            board.digitalWrite(13, board.HIGH);
            sendValueViaSocket(1);
        }
    });
    
    
    
});


