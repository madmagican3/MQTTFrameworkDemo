var mqtt = require('mqtt');

//Connect to and listen too the MQTT server
var client;

module.exports = {
    Construct : function construct (ipToConnectTo,listOfSubscribers, onMessage){
        client = mqtt.connect(ipToConnectTo);//Connect to the specified ip

        client.on('connect', function(){ //Connect to each subscriber
            console.log("Connected to the mqtt server");
            listOfSubscribers.forEach(function (subscriber){
                client.subscribe(subscriber);
            })
        });

        client.on('message', onMessage); //let them specify the method they want to use on message recieved
    }
}
