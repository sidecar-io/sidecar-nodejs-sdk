<b>Sidecar Javascript Client and User Console</b>

The open source Sidecar javascript client wraps the <a href="https://api.sidecar.io/docs">Sidecar REST API</a> and handles event ingestion, authenticaion and queries. 

The User Console provides a bootstrap nodejs app to help manage user and devices.

<b>What is Sidecar?</b>

Sidecar is a data platform purpose built to consume and analyze sensor-based data streams so that the owners and developers of IoT hardware do not need to be concerned with the large infrastructure and development overhead associated with the long term persistence and meaningful computation of that data.  Once device data is stored in Sidecar, the platform is capable of:

<ul>
<li>Returning the raw source data
<li>Generating Insights 
<li>Propagating notifications that are executed based on rules defined by device owners
<li>Aggregation of inbound data sources
<li>Allowing developers to write interactive ad hoc queries whose results can be used in reporting web and mobile applications
</ul>


<b>Quickstart Guide: Using Sidecar with Node.js</b>

This Quickstart guide will help you connect your Device Sensor to Sidecar using Node.js in order to send and store data in the Cloud.

Sidecar is a data platform purpose built to consume and analyze sensor-based data streams so that you, owners, developers and inventors, of IoT hardware do not need to be concerned with the large infrastructure and development overhead associated with the long-term persistence and meaningful computation of your data. Sidecar makes it easy to connect your hardware to the cloud and manage your data collection.

In this Quickstart Guide you will be using Node.js, the “open-source, cross-platform runtime environment for developing server-side web applications”. [1]. Likewise, we welcome you to check other language implementations in our GitHub Open Source repositories (insert link). 

In order to enable your hardware to send data to the cloud we will be using the Sidecar Device Firmware. This will simplify all the implementation steps required to achieve this and will allow you and your Device Sensor (either a Raspberry Pi, a BeagleBone, a laptop or any embedded computer / node.js compatible hardware) to push data to Sidecar in less than 8 minutes -from now-. Just by following these simple steps:

<b>1) Download your custom-built Sidecar Device Firmware</b>

The Sidecar Device Firmware, in this instance, is a Node.js app that allows your Device Sensor to send data to Sidecar. This firmware can be generated and downloaded from your Admin Dashboard (link). The custom-built firmware is based on your own Sidecar Access Keys and latest registered UUID Device. Feel free to unzip the firmware to a preferred location in your Device Sensor.

<b>2) Node.js</b>

Make sure you have installed Node.js in your hardware. From your Terminal you can run this command:

```
node --version 
```

This will check if you have Node.js installed. Otherwise, you will need to install it. For more information please visit the Official Node.js site at https://nodejs.org/en/download/.

<b>3) Install modules for your Sidecar Device Firmware</b>

In order to run the Sidecar Device Firmware in your hardware, you need to install the modules required by it. To achieve this, from your terminal and inside the directory where your Sidecar Device Firmware is, you can run the following command:

```
sudo npm install
```

<b>4) Pushing data to the Sidecar Cloud</b>

Run the following command to start pushing data to Sidecar:

```
sudo node app.js
```

And that’s all. By now, your Device Sensor is sending data to the Sidecar Cloud.


<b>Sending my own data sensors:</b>

In the previous firmware/app model, two random variables are sent to the Sidecar Cloud. You can send your own data sensors by modifying the following lines of code in the app.js file and adding your own data from your sensors:
```
//Replace this with your own sensor data 1
sensorData1 = Math.floor((Math.random() * 39) + 25); 

//Replace this with your own sensor data 2
sensorData2 = Math.floor((Math.random() * 32) + 23); 
```

This has concluded the Sidecar Node.js Quickstart Guide. Happy clouding.

For more information visit the <a href="http://www.sidecar.io">Sidecar website</a>.
