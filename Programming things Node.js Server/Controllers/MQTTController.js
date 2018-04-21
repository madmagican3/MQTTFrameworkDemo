var mqtt = require('mqtt');

var portControl = require("./SerialPortController");
var client = mqtt.connect('msqtt://PLEASE INSERT YOUR OWN MQTT SERVER HERE');

/**
 * local instances of the controls and temperature
 */
var controls;
var temp;

module.exports = {
    /**
     * constructs the new instance of mqtt
     * @param ipToConnectTo The mqtt ip
     * @param listOfSubscribers What we want to subscribe too on the broker
     * @param onMessage What we want to do on the message
     */
    Construct : function construct (ipToConnectTo,listOfSubscribers, onMessage){
        client = mqtt.connect(ipToConnectTo);//Connect to the specified ip

        client.on('connect', function(){ //Connect to each subscriber
            console.log("Connected to the mqtt server");
            listOfSubscribers.forEach(function (subscriber){
                client.subscribe(subscriber);
            })
        });

        client.on('message', onMessage); //let them specify the method they want to use on message recieved
    },

    getControls : function getControls (callback){
        callback(controls);
    },
    setControls : function setControls (newControls){
        controls = newControls
    },
    getTemp : function getTemp(callback){
        callback(temp);
    },
    setTemp : function setTemp(newTemp){
        console.log("new temp : " + newTemp);

        portControl.sendMessage(newTemp);
        temp = newTemp;
    },
    /**
     * publishes the new json to the temperature settings with the retain flag set to true
     */
    publish : function publish(newJson){
        client.publish("TemperatureSettings", JSON.stringify(newJson), {retain:true});
    },
    /**
     * Publishes the new temp with the retain flag set to true
     */
    updateTemp : function updateTemp(temp){
        client.publish("TemperatureControl", JSON.stringify(temp), {retain:true});
    }
}