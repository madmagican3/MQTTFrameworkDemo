var serialport = require('serialport');
var Readline = serialport.parsers.Readline;

var portName = '/dev/ttyACM0';

var myPort = new serialport(portName, {
  baudRate: 9600
});

var parser = new Readline();
myPort.pipe(parser);

module.exports = {
    serverConnect : function serverConnect(){
        myPort.on('open', onOpen);
        parser.on('data', onData);
    },
    sendMessage : function sendMessage(i){
        console.log('here: ' + i);
        myPort.write(i);
    }    
}

function onOpen() {
    console.log('Open connection on port ' + portName + '!');
}

function onData(data) {
    console.log('on Data ' + data);
}
