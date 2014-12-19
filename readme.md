An Azure Event Hub client that is easy to use and performs well. From a local machine, I'm able to sustain **~300** messages per second from a single client. When running in an Azure VM in the same region as the Event Hubs instance, I was able to send **~400** messages per second. From a Raspberry PI, I was able to send **~40** messages per second.

### Simplest Usage

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

### Other Usages

When you initialize the event hubs client, it's advisable to use a SAS token in a production environment. This is a revokable key that is unique to the device. You can generate a token programatically, or [online using this form](http://eventhubssasgenerator.azurewebsites.net/).

    eventHubs.init({
        hubNamespace: eventHubsNamespace,
        hubName: eventHubsHubName,
        sasToken: sasToken
    });

### Installation

	npm install eventhubs-js

Don't forget to update your `package.json` file.

### Performance Optimizations

Performance was optimized in a number of ways:

1. Setting `http.globalAgent.maxSockets = 50;` increases the HTTP connection pool, which allows us to create more connections to serve messages that need sent. If you don't send a large volume of messages, no problem, the pool will remain relatively empty.
1. Caching the SAS Tokens. I haven't tested the performance of the node.js crypto libraries and moment time calculations, but it was easy enough to cache the generated SAS tokens to avoid recalcuating on each message.

### Examples & Promises

Promises allow you to chain calls without "callback hell":

    eventHubs.sendMessage({
        message: deviceMessage,
        deviceId: 1,
    }).then(function() {
		console.log('Message Sent!');
	});

Promises also allow us to kick of multiple send requests simultaneously, and easily manage the results:

	var promise, promises;
    
	for (i = 0; i < iterations; i++) {
        promise = eventHubs.sendMessage({
        	message: deviceMessage,
			deviceId: 1,
    	});

        promises.push(promise);
    }
    Q.allSettled(promises).then(function () {
        console.log('All Messages Sent!');
    });

### Alternative Clients

* [https://git.allseenalliance.org/cgit/core/alljoyn-js.git/tree/](https://git.allseenalliance.org/cgit/core/alljoyn-js.git/tree/)
* [https://github.com/noodlefrenzy/event-hub-client](https://github.com/noodlefrenzy/event-hub-client)

# License

Microsoft Developer Experience & Evangelism

Copyright (c) Microsoft Corporation. All rights reserved.

THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.

The example companies, organizations, products, domain names, e-mail addresses, logos, people, places, and events depicted herein are fictitious. No association with any real company, organization, product, domain name, email address, logo, person, places, or events is intended or should be inferred.
