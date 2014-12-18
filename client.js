var Q = require("q"),
    http = require('https'),
	https = require('https'),
	crypto = require('crypto'),
	moment = require('moment');

var namespace,
	hubName,
	keyName,
	key,
	sasTokens = {}; //key=uri, value=SAS token

function getSasToken(uri) {
    var expiration,
        toSign,
		hmac,
		encodedHmac,
		sasToken;

	//Cache tokens to avoid recalculations
	sasToken = sasTokens[uri];
	if(sasToken) {
		return sasToken;
	}

    expiration = moment().add(15, 'minutes').unix();
    
    toSign = encodeURIComponent(uri) + '\n' + expiration;
    hmac = crypto.createHmac('sha256', key);
    hmac.update(toSign);
	encodedHmac = hmac.digest('base64');

	sasToken = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(encodedHmac) + '&se=' + expiration + '&skn=' + keyName;

	sasTokens[uri] = sasToken;

	return sasToken;
}

function getDeviceUri(deviceId) {
	return 'https://' + namespace
	+ '.servicebus.windows.net' + '/' + hubName
	+ '/publishers/' + encodeURIComponent(deviceId) + '/messages';
}


function init(eventHubsNamespace, eventHubsHubName, eventHubsKeyName, eventHubsKey) {
	namespace = eventHubsNamespace;
	hubName = eventHubsHubName;
	keyName = eventHubsKeyName;
    key = eventHubsKey;

    //Allow the connection pool to grow larger. This improves performance
    //by a factor of 10x in my testing
    http.globalAgent.maxSockets = 50;
}

function sendMessage(options) {
	var message = options.message,
		deviceId = options.deviceId,
		deferral,
		requestOptions,
		deviceUri,
        sasToken,
        payload,
        req,
        responseData = '';

	deferral = Q.defer();

	deviceUri = getDeviceUri(deviceId);
    sasToken = getSasToken(deviceUri);
    
    if (typeof message === 'string') {
        payload = message;
    } else {
        //This allows us to send in a POJSO
        payload = JSON.stringify(message);
    }

	requestOptions = {
        hostname: namespace + '.servicebus.windows.net',
        port: 443,
        path: '/' + hubName + '/publishers/' + deviceId + '/messages',
        method: 'POST',
        headers: {
            'Authorization': sasToken,
            'Content-Length': payload.length,
            'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
        }
    }

    
    req = https.request(requestOptions, function (res) {
        res.on('data', function(data) {
            responseData += data;
        }).on('end', function () {
            if (res.statusCode !== 201) {
                deferral.reject(new Error("Invalid server status: " + res.statusCode + "Message: " + responseData));
                return;
            }

            deferral.resolve();
        }).on('error', function(e) {
            deferral.reject(e);
        });
    });

    req.setSocketKeepAlive(true);
	req.write(payload);
	req.end();

    return deferral.promise;
}

exports.init = init;
exports.sendMessage = sendMessage;