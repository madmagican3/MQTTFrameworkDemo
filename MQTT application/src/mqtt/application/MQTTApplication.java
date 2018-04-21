/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mqtt.application;

import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.fusesource.mqtt.client.BlockingConnection;
import org.fusesource.mqtt.client.MQTT;
import org.fusesource.mqtt.client.Message;
import org.fusesource.mqtt.client.QoS;
import org.fusesource.mqtt.client.Topic;
import org.json.*;

/**
 *
 * @author Bomie
 */
public class MQTTApplication implements Runnable {

    /**
     * The running instance of the form in order to manipulate elements
     */
    private MQTTController form;
    /**
     * The last temperateure which was recorded
     */
    private Integer lastVal;
    /**
     * An instance connected to the settings of the temperature (temperature
     * straight val){"temp":3}
     */
    private BlockingConnection settingsConnector;
    /**
     * This is a connection instance to the controls of the temperature (time
     * changing temperatures) {"time":"20:30","temp":3}
     */
    private BlockingConnection controlConnector;

    /**
     * takes the form instance
     *
     * @param aThis The form instance
     */
    MQTTApplication(MQTTController aThis) {
        form = aThis;
    }

    /**
     * Calls itself recursively to check if there have been any new temperatures
     * or temperature controls created, if there are updates the ui to include
     * them
     */
    @Override
    public void run() {
        try {
            initialize();
        } catch (Exception ex) {
            Logger.getLogger(MQTTApplication.class.getName()).log(Level.SEVERE, null, ex);
        }
        while (true) {
            try {
                Message returnedMessage = controlConnector.receive();
                Message arrayReturn = settingsConnector.receive();                

                JSONObject val = new JSONObject(new String(returnedMessage.getPayload()));
                System.out.println(val);
                Integer temp = Integer.parseInt(val.get("temp").toString());
                form.tempValue.setValue(temp);
                String tempString = new String(arrayReturn.getPayload());
                System.out.println(tempString);
                JSONArray valArray = new JSONArray(tempString);
                form.controls = valArray;
                form.updateList();
            } catch (URISyntaxException ex) {
                Logger.getLogger(MQTTController.class.getName()).log(Level.SEVERE, null, ex);
            } catch (Exception ex) {
                Logger.getLogger(MQTTController.class.getName()).log(Level.SEVERE, null, ex);
            }
//            try {
//                Thread.sleep(1000);
//            } catch (InterruptedException ex) {
//                Logger.getLogger(MQTTApplication.class.getName()).log(Level.SEVERE, null, ex);
//            }
        }
    }

    /**
     * subscribes to 2 seperate topics with 2 different connections
     *
     * @throws Exception
     */
    public void initialize() throws Exception {
        try {
            MQTT mqtt = new MQTT();
            mqtt.setHost("tcp://80.240.137.162:1883");
            controlConnector = mqtt.blockingConnection();
            settingsConnector = mqtt.blockingConnection();
            controlConnector.connect();
            settingsConnector.connect();

            Topic[] subscribers = {new Topic("TemperatureControl", QoS.AT_LEAST_ONCE)};
            controlConnector.subscribe(subscribers);

            Topic[] subscriber = {new Topic("TemperatureSettings", QoS.AT_LEAST_ONCE)};
            settingsConnector.subscribe(subscriber);
        } catch (URISyntaxException ex) {
            Logger.getLogger(MQTTApplication.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

}
