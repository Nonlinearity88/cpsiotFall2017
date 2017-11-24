var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http);
var fs = require("fs");



function handler(req, res) {
    fs.readFile(__dirname + "/example15.html",
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


var factor = 0.1; // proportional factor that determines the speed of aproaching toward desired value
var controlAlgorihtmStartedFlag = 0; // flag in global scope to see weather ctrlAlg has been started
var intervalCtrl; // var for setInterval in global space
var pwm = 0;

var Kp = 0.55; // proportional factor
var Ki = 0.008; // integral factor
var Kd = 0.15; // differential factor
var pwm = 0;
var pwmLimit = 254;

var err = 0; // variable for second pid implementation
var errSum = 0; // sum of errors
var dErr = 0; // difference of error
var lastErr = 0; // to keep the value of previous error



var board = new firmata.Board("/dev/ttyACM0", function() { // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connected to Arduino");
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
    board.pinMode(3, board.MODES.PWM); // PWM of motor i.e. speed of rotation
    board.pinMode(4, board.MODES.OUTPUT); // direction DC motor
    board.digitalWrite(2,1); // initialization of digital pin 2 to rotate Left on start
    board.digitalWrite(4,0); // initialization of digital pin 2 to rotate Left on start
});

function controlAlgorithm () {
    err = desiredValue - actualValue; // error
  errSum += err; // sum of errors, like integral
  dErr = err - lastErr; // difference of error
  pwm = Kp*err + Ki*errSum + Kd*dErr;
  lastErr = err; // save the value for the next cycle
  if(pwm > pwmLimit) {pwm = pwmLimit}; // to limit the value for pwm / positive
  if(pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit the value for pwm / negative
  if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // določimo smer če je > 0
  if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // določimo smer če je < 0
  board.analogWrite(3, Math.abs(pwm));
};

function startControlAlgorithm () {
    if (controlAlgorihtmStartedFlag == 0) {
        controlAlgorihtmStartedFlag = 1; // set flag that the algorithm has started
        intervalCtrl = setInterval(function() {controlAlgorithm(); }, 30); // na 30ms klic
        console.log("Control algorithm started");
    }
};

function stopControlAlgorithm () {
    clearInterval(intervalCtrl); // clear the interval of control algorihtm
    board.analogWrite(3,0); // write 0 on pwm pin to stop the motor
    controlAlgorihtmStartedFlag = 0; // set flag that the algorithm has stopped
};

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
        
        socket.on("startControlAlgorithm", function(){
            startControlAlgorithm();
        });
    
        socket.on("stopControlAlgorithm", function(){
            stopControlAlgorithm();
        });

    });
});

var desiredValue = 0; // desired value var
var actualValue = 0; // variable for actual value (output value)

http.listen(8080); // server will listen on port 8080

board.on("ready", function() {
    
    board.analogRead(1, function(value){
        desiredValue = value; // continuous read of analog pin 0
    });
    board.analogRead(0, function(value) {
        actualValue = value; // continuous read of pin A1
    });
    
    startControlAlgorithm();
    
    io.sockets.on("connection", function(socket) {
        socket.emit("messageToClient", "Server connected, board ready.");
        setInterval(sendValues, 40, socket); // na 40ms we send message to client
    }); // end of sockets.on connection

}); // end board.digitalRead on pin 2

function sendValues (socket) {
    socket.emit("clientReadValues",
    { // json notation between curly braces
    "desiredValue": desiredValue,
    "actualValue": actualValue,
    "pwm": pwm
    });
    console.log(desiredValue);
};
    
    
    


