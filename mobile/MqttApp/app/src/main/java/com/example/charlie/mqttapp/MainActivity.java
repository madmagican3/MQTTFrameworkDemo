package com.example.charlie.mqttapp;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.*;
import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.*;
import org.json.*;
import java.util.*;

public class MainActivity extends AppCompatActivity {

    private static String MQTTHOST = "tcp://PLEASE INSERT YOUR OWN MQTT SERVER HERE";
    private static String TOPIC_TEMP_CONTROL = "TemperatureControl";
    private static String TOPIC_TEMP_SETTINGS = "TemperatureSettings";

    Button btnChangeTemp, btnCreate, btnDelete, btnUpdate, btnClear;
    EditText changeTemp, createTemp, createTime;
    ListView listView;

    MqttAndroidClient client;

    JSONArray jsonArray = new JSONArray();

    Integer selectedList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnChangeTemp = findViewById(R.id.btnChangeTemp);
        btnCreate = findViewById(R.id.btnCreate);
        btnDelete = findViewById(R.id.btnDelete);
        btnUpdate = findViewById(R.id.btnUpdate);
        btnClear = findViewById(R.id.btnClear);
        changeTemp = findViewById(R.id.eTTemp1);
        createTemp = findViewById(R.id.eTTemp2);
        createTime = findViewById(R.id.eTTime);
        listView = findViewById(R.id.lstView);

        client = new MqttAndroidClient(this.getApplicationContext(), MQTTHOST, MqttClient.generateClientId());

        try {
            client.connect().setActionCallback(new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Toast.makeText(MainActivity.this, "Connected", Toast.LENGTH_LONG).show();
                    setSubscriptions();
                }
                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Toast.makeText(MainActivity.this, "Connection Failed", Toast.LENGTH_LONG).show();
                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }

        client.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                Toast.makeText(MainActivity.this, "Connection Failed", Toast.LENGTH_LONG).show();
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                if(TOPIC_TEMP_CONTROL.compareTo(topic) == 0){
                    Log.d("mqtt", new String(message.getPayload()) + "");
                    JSONObject jsonObject = new JSONObject(new String(message.getPayload()));
                    Integer temperature = Integer.parseInt(jsonObject.get("temp").toString());
                    changeTemp.setText(Integer.toString(temperature));
                } else if(TOPIC_TEMP_SETTINGS.compareTo(topic) == 0) {
                    jsonArray = new JSONArray(new String(message.getPayload()));
                    listView.setAdapter(arrayToArrayAdapter());
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {

            }
        });

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                btnDelete.setEnabled(true);
                btnUpdate.setVisibility(View.VISIBLE);
                btnClear.setVisibility(View.VISIBLE);
                btnCreate.setVisibility(View.INVISIBLE);
                selectedList = i;
                String s = listView.getItemAtPosition(i).toString();
                try {
                    JSONObject obj = new JSONObject(jsonArray.get(i).toString());
                    Integer temperature = Integer.parseInt(obj.get("temp").toString());
                    Log.d("i", temperature + "");
                    createTemp.setText(Integer.toString(temperature));
                    createTime.setText(obj.get("time").toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                Toast.makeText(MainActivity.this, s, Toast.LENGTH_SHORT).show();
            }
        });

        btnDelete.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                jsonArray.remove(selectedList);
                setTempSettings();
                btnDelete.setEnabled(false);
                createTemp.setText("");
                createTime.setText("");
                btnUpdate.setVisibility(View.INVISIBLE);
                btnClear.setVisibility(View.INVISIBLE);
                btnCreate.setVisibility(View.VISIBLE);
                selectedList = null;
            }
        });

        btnUpdate.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                jsonArray.remove(selectedList);
                try {
                    publishControlTemperature(v);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        btnClear.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                btnUpdate.setVisibility(View.INVISIBLE);
                btnClear.setVisibility(View.INVISIBLE);
                btnCreate.setVisibility(View.VISIBLE);
                try {
                    listView.setAdapter(arrayToArrayAdapter());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                btnDelete.setEnabled(false);
                createTemp.setText("");
                createTime.setText("");
                selectedList = null;
            }
        });

    }

    private ArrayAdapter<String> arrayToArrayAdapter() throws JSONException{
        ArrayList<String> stringArray = new ArrayList<>();
        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject obj = new JSONObject(jsonArray.get(i).toString());
            stringArray.add("Temp: " + obj.get("temp")+ " Time: " + obj.get("time"));
        }
        return new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, stringArray);
    }


    public void publishTemperature(View view){
        String message = "{\"temp\":\""+ changeTemp.getText().toString() +"\"}";
        Log.d("mqtt", message);
        try {
            client.publish(TOPIC_TEMP_CONTROL, message.getBytes(), 1, true);
        } catch ( MqttException e) {
            e.printStackTrace();
        }
    }

    public void publishControlTemperature(View view) throws JSONException {
        String message = "{\"temp\":" + createTemp.getText().toString()
                + ",\"time\":\"" + createTime.getText().toString() + "\"}";
        jsonArray.put(new JSONObject(message));
        setTempSettings();
    }

    private void setTempSettings() {
        try {
            client.publish(TOPIC_TEMP_SETTINGS, jsonArray.toString().getBytes(), 1, true);
        } catch ( MqttException e) {
            e.printStackTrace();
        }
    }

    private void setSubscriptions(){
        try{
            client.subscribe(TOPIC_TEMP_CONTROL, 1);
            client.subscribe(TOPIC_TEMP_SETTINGS, 1);
        } catch ( MqttException e) {
            e.printStackTrace();
        }
    }
}
