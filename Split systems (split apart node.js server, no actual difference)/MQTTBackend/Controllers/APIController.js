var Serialport = require('serialport');
var MongoController = require('./MongoController');
var mqtt = require('mqtt');

var port = new Serialport('COM3');
var client = mqtt.connect("msqtt://PLEASE INSERT YOUR OWN MQTT SERVER HERE");

/**
 * This tells us when the system has opened the port to the arduino
 */
port.on('open', function() {
    console.log("Arduino port got opened");
});

/**
 * upon recieving data from the arduino
 */
port.on('readable', function () {
    console.log('Data:', port.read().toString());
});


module.exports = {
    /**
     * This sends data to the arduino
     * @param req Json in format {"temp":"int"}
     */
    changeTemp: function changeTemp(req) {
        port.write(req.temp + "");
    },
    /**
     * This inserts controllers for changing the temp at different times
     * @param req json in the format {temp:int, time:10:30}
     */
    insertTempControls : function insertTempControls(req){
        tempControls = req;
        MongoController.deleteAllControls();
        req.forEach(function (json){
            parseTime(json, function (date){
                MongoController.insertIntoDB("StoredVals", "TempControls", ({"time":date.getTime(),"temp":json.temp}));
            });
        });
    },
    /**
     * This will call itself every minute to check if it should change the temprature
     */
    changeTempController :function changeTempController(){

        MongoController.findMultipleFromDB("StoredVals", "TempControls", ({}), function (err,res){
            if (res != null)
                checkIfTempNeedsModifying(res);
        });
        //This will re-call itself every 1 minute to check if it should change the temperature
        setTimeout(changeTempController,30000)
    }
};


/**
 * if the date is less than the temp that needs modifying update the date and set the temprature
 */
function checkIfTempNeedsModifying(tempControls){
    if (tempControls)//TODO make sure this works, not certain it does
        tempControls.forEach(function (time){
            //if time is less than current time
            if (time.time < new Date().getTime()){
                updateTempFromControl(time.temp);
                var newTime = time.time + 86400000; //get set time + a day
                MongoController.updateDb("StoredVals","TempControls", {"_id":time._id}, {$set :{"time":newTime}}) //set that time to be the next time
            }
        });
}

/**
 * This updates the temperature by setting it on the mqtt publisher
 * @param temp The new temperature
 */
function updateTempFromControl (temp){
    console.log("updating time");
    var returnval = JSON.stringify({"temp":temp});
    console.log(returnval);
    client.publish("TemperatureControl", returnval, {retain:true});
}
/**
 * this parses the time recieved into javascript viable form
 * @param json The json recieved in format {"time":"03:02", "temp":4}
 * @param callback Ran after dealing with the date
 */
function parseTime(json, callback){
    var time = json.time.split(':');
    var hours = time[0];
    var minutes = time[1];
    var testDate = new Date();
    testDate.setMinutes(minutes);
    testDate.setHours(hours);
    if (testDate.getTime() < new Date().getTime()){
        testDate.setTime(testDate.getTime() + 86400000);
    }
    if (callback){
        callback(testDate);
    }
}