An Azure Event Hub client that is easy to use and performs well. From a local machine, I'm able to sustain 200-300 messages per second from a single client. Performance if running in Azure should be even better.

### Simplest Usage

    eventHubs.init(eventHubsNamespace, eventHubsHubName, eventHubsKeyName, eventHubsKey);

    var deviceMessage = {
        Temperature: 45.2,
        Pressure: 23.7
    }

    eventHubs.sendMessage({
        message: deviceMessage,
        deviceId: 1,
    });

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
