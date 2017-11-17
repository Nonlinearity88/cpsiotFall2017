var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http);
var fs = require("fs");



function handler(req, res) {
    fs.readFile(__dirname + "/example12.html",
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


var board = new firmata.Board("/dev/ttyACM0", function() { // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connected to Arduino");
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
    board.pinMode(3, board.MODES.PWM); // PWM of motor i.e. speed of rotation
    board.pinMode(4, board.MODES.OUTPUT); // direction DC motor
    board.digitalWrite(2,1); // initialization of digital pin 2 to rotate Left on start
    board.digitalWrite(4,0); // initialization of digital pin 2 to rotate Left on start
});



board.on("ready", function() {
    
    io.sockets.on("connection", function(socket) {
        console.log("Socket id: " + socket.id);
        socket.emit("messageToClient", "Srv connected, board OK");
        
        socket.on("sendPWM", function(pwm) {
            console.log("pwm");
            board.analogWrite(3,pwm);
            socket.emit("messageToClient", "PWM set to: " + pwm);        
        });
    
        socket.on("left", function(value) {
            console.log("left");
            board.digitalWrite(2,value.AIN1);
            board.digitalWrite(4,value.AIN2);
            socket.emit("messageToClient", "Direction: left");
        });
    
        socket.on("right", function(value) {
            console.log("right");
            board.digitalWrite(2,value.AIN1);
            board.digitalWrite(4,value.AIN2);
            socket.emit("messageToClient", "Direction: right");
        });
    
        socket.on("stop", function(value){
            console.log("stop");
            board.analogWrite(3,value);
            socket.emit("messageToClient", "STOP");
        });
    });
});
    
    
    


