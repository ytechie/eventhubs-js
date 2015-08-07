var Q = require("q");
var easyConfig = require('easy-config');
var eventHubs = require('./client.js');

// Full Event Hub publisher URI
var config;
var eventHubsUri;
var sasToken;

var config = easyConfig.loadConfig();

if (!config.EventHubsNamespace) {
    throw new Error("Config file not found, or you forgot to set the namespace in the config.");
}

var eventHubsNamespace = config.EventHubsNamespace,
    eventHubsHubName = config.EventHubsHubName,
    eventHubsKeyName = config.EventHubsKeyName,
    eventHubsKey = config.EventHubsKey,
    sasToken = config.SasToken,
    deviceId = config.DeviceName;

testSendContinuous();
//testSendPerformance();
//example1();
//exampleWithSasToken();

function sendRandomData(silent) {
    var deferral = Q.defer();
    
    var payload = {
        Temperature: (Math.random() * 100) + 1,
        Humidity: Math.random()
    }
    
    eventHubs.sendMessage({
        message: payload,
        deviceId: deviceId,
    }).then(function () {
        if (!silent) console.log('Sent ' + JSON.stringify(payload));
        deferral.resolve();
    }).catch(function (error) {
        if (!silent) console.log('Error sending message: ' + error);
        deferral.reject(error);
    })
        .done();
    
    return deferral.promise;
}

function testSendContinuous() {
    eventHubs.init({
        hubNamespace: eventHubsNamespace,
        hubName: eventHubsHubName,
        keyName: eventHubsKeyName,
        key: eventHubsKey
    });

    setInterval(sendRandomData, 1000);
}

function testSendPerformance() {
    eventHubs.init({
        hubNamespace: eventHubsNamespace,
        hubName: eventHubsHubName,
        keyName: eventHubsKeyName,
        key: eventHubsKey
    });

    //warm-up
    sendRandomData(true);
    sendRandomData(true);
    sendRandomData(true);
    sendRandomData(true);
    sendRandomData(true);
    
    var i,
        start = new Date(),
        end,
        promise,
        promises = [],
        iterations = 1000;
    
    for (i = 0; i < iterations; i++) {
        promise = sendRandomData(true);
        promises.push(promise);
    }
    Q.allSettled(promises).then(function () {
        end = new Date();
        var elapsed = end.getTime() - start.getTime();
        console.log('Test Complete. Took ' + elapsed + 'ms to send ' + iterations + 'messages');
        console.log(elapsed / iterations + 'ms / message');
        console.log(1000 / (elapsed / iterations) + ' messages / second');
    });
}

function example1() {
    eventHubs.init({
        hubNamespace: eventHubsNamespace,
        hubName: eventHubsHubName,
        keyName: eventHubsKeyName,
        key: eventHubsKey
    });

    var deviceMessage = {
        Temperature: 45.2,
        Pressure: 23.7
    }

    eventHubs.sendMessage({
        message: deviceMessage,
        deviceId: 1,
    });
}

function exampleWithSasToken() {
    eventHubs.init({
        hubNamespace: eventHubsNamespace,
        hubName: eventHubsHubName,
        sasToken: sasToken
    });
    
    var deviceMessage = {
        Temperature: 45.2,
        Pressure: 23.7
    }
    
    eventHubs.sendMessage({
        message: deviceMessage,
        deviceId: 1,
    });
}