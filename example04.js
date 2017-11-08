var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http);
var fs = require("fs");


var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
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
   });
});