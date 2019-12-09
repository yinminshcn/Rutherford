cordova.define("cordova-plugin-networkinterface.networkinterface", function(require, exports, module) {
var networkinterface = function() {
};

networkinterface.getWiFiIPAddress = function( success, fail ) {
    cordova.exec( success, fail, "networkinterface", "getWiFiIPAddress", [] );
};

networkinterface.getCarrierIPAddress = function( success, fail ) {
    cordova.exec( success, fail, "networkinterface", "getCarrierIPAddress", [] );
};

networkinterface.getHttpProxyInformation = function(url, success, fail ) {
    cordova.exec( success, fail, "networkinterface", "getHttpProxyInformation", [url] );
};

networkinterface.onRequest = function(success_callback) {
    cordova.exec( success_callback, function (error) {
    	console.error(error);
    }, "networkinterface", "onRequest", []);
};

networkinterface.sendResponse = function(requestId, params, success_callback, error_callback) {
    cordova.exec( success_callback, error_callback, "networkinterface", "sendResponse", [requestId, params]);
};

module.exports = networkinterface;

});
