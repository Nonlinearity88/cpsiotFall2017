var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http);
var fs = require("fs");


var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
});


function handler(req, res) {
    fs.readFile(__dirname + "/example04.html",
    function (error, data) {
        if (error) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end("Error loading html page.");
        }
        res.writeHead(200);
        res.end(data);
    })
}

// initializing timer
var timer1;
var timer2;
var timer3;
var timer4;
var timer5;
var timer6;
var timer7;
var timer8;
var timer9;
// add listner
http.listen(8080);

io.sockets.on("connection", function(socket) {
   socket.on("commandToArduino", function(commandNo) {
       if (commandNo == "1") {
           board.digitalWrite(13, board.HIGH);
       }
       if (commandNo == "0") {
           board.digitalWrite(13, board.LOW);
       }
       if (commandNo == "3") {
           board.digitalWrite(8, board.HIGH);
       }
       if (commandNo == "2") {
           board.digitalWrite(8, board.LOW);
       }
       if (commandNo == "5") {
           board.digitalWrite(7, board.HIGH);
       }
       if (commandNo == "4") {
           board.digitalWrite(7, board.LOW);
       }
       if (commandNo == "7") {
           board.digitalWrite(12, board.HIGH);
       }
       if (commandNo == "6") {
           board.digitalWrite(12, board.LOW);
       }
       if (commandNo == "9") {
           board.digitalWrite(12, board.HIGH);
           board.digitalWrite(13, board.HIGH);
           board.digitalWrite(8, board.HIGH);
           board.digitalWrite(7, board.HIGH);
       }
       if (commandNo == "8") {
           board.digitalWrite(12, board.LOW);
           board.digitalWrite(13, board.LOW);
           board.digitalWrite(8, board.LOW);
           board.digitalWrite(7, board.LOW);
       }
   });
    socket.on("blinkOn", function() {
        timer1 = setInterval(function blink() {
            timer2 = setTimeout(function () {board.digitalWrite(13, board.HIGH);}, 100);
            timer3 = setTimeout(function () {board.digitalWrite(13, board.LOW);}, 200);
            timer4 = setTimeout(function () {board.digitalWrite(7, board.HIGH);}, 300);
            timer5 = setTimeout(function () {board.digitalWrite(7, board.LOW);}, 400);
            timer6 = setTimeout(function () {board.digitalWrite(12, board.HIGH);}, 500);
            timer7 = setTimeout(function () {board.digitalWrite(12, board.LOW);}, 600);
            timer8 = setTimeout(function () {board.digitalWrite(8, board.HIGH);}, 700);
            timer9 = setTimeout(function () {board.digitalWrite(8, board.LOW);}, 800);
            return blink;
        }(), 1000);
    });
    socket.on("blinkOff", function() {
        board.digitalWrite(13, board.LOW);
        board.digitalWrite(12, board.LOW);
        board.digitalWrite(7, board.LOW);
        board.digitalWrite(8, board.LOW);
        clearInterval(timer1);
        clearInterval(timer2);
    });
});