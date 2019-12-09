var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { IonicNativePlugin, cordova } from '@ionic-native/core';
var NetworkInterfaceOriginal = /** @class */ (function (_super) {
    __extends(NetworkInterfaceOriginal, _super);
    function NetworkInterfaceOriginal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NetworkInterfaceOriginal.prototype.getWiFiIPAddress = function () { return cordova(this, "getWiFiIPAddress", {}, arguments); };
    NetworkInterfaceOriginal.prototype.getCarrierIPAddress = function () { return cordova(this, "getCarrierIPAddress", {}, arguments); };
    NetworkInterfaceOriginal.prototype.getHttpProxyInformation = function (url) { return cordova(this, "getHttpProxyInformation", {}, arguments); };
    NetworkInterfaceOriginal.prototype.onRequest = function () { return cordova(this, "onRequest", { "callbackOrder": "reverse", "observable": true, "clearFunction": "stop" }, arguments); };
    NetworkInterfaceOriginal.prototype.sendResponse = function (requestId, responseObject) { return cordova(this, "sendResponse", {}, arguments); };
    NetworkInterfaceOriginal.pluginName = "NetworkInterface";
    NetworkInterfaceOriginal.plugin = "cordova-plugin-networkinterface";
    NetworkInterfaceOriginal.pluginRef = "networkinterface";
    NetworkInterfaceOriginal.repo = "https://github.com/salbahra/cordova-plugin-networkinterface";
    NetworkInterfaceOriginal.platforms = ["Android", "BlackBerry 10", "Browser", "iOS", "Windows", "Windows Phone"];
    return NetworkInterfaceOriginal;
}(IonicNativePlugin));
var NetworkInterface = new NetworkInterfaceOriginal();
export { NetworkInterface };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvQGlvbmljLW5hdGl2ZS9wbHVnaW5zL25ldHdvcmstaW50ZXJmYWNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLDhCQUFzQyxNQUFNLG9CQUFvQixDQUFDOztJQW9DbEMsb0NBQWlCOzs7O0lBT3JELDJDQUFnQjtJQVNoQiw4Q0FBbUI7SUFVbkIsa0RBQXVCLGFBQUMsR0FBVzs7Ozs7OzJCQS9EckM7RUFxQ3NDLGlCQUFpQjtTQUExQyxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb3Jkb3ZhLCBJb25pY05hdGl2ZVBsdWdpbiwgUGx1Z2luIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9jb3JlJztcblxuLyoqXG4gKiBAbmFtZSBOZXR3b3JrIEludGVyZmFjZVxuICogQGRlc2NyaXB0aW9uXG4gKiBOZXR3b3JrIGludGVyZmFjZSBpbmZvcm1hdGlvbiBwbHVnaW4gZm9yIENvcmRvdmEvUGhvbmVHYXAgdGhhdCBzdXBwb3J0cyBBbmRyb2lkLCBCbGFja2JlcnJ5IDEwLCBCcm93c2VyLCBpT1MsIGFuZCBXaW5kb3dzIFBob25lIDguXG4gKlxuICogQHVzYWdlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBOZXR3b3JrSW50ZXJmYWNlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9uZXR3b3JrLWludGVyZmFjZS9uZ3gnO1xuICpcbiAqIGNvbnN0cnVjdG9yKCBwcml2YXRlIG5ldHdvcmtJbnRlcmZhY2U6IE5ldHdvcmtJbnRlcmZhY2UgKSB7XG4gKlxuICogICB0aGlzLm5ldHdvcmtJbnRlcmZhY2UuZ2V0V2lGaUlQQWRkcmVzcygpXG4gKiAgICAgLnRoZW4oYWRkcmVzcyA9PiBjb25zb2xlLmluZm8oYElQOiAke2FkZHJlc3MuaXB9LCBTdWJuZXQ6ICR7YWRkcmVzcy5zdWJuZXR9YCkpXG4gKiAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBnZXQgSVA6ICR7ZXJyb3J9YCkpO1xuICpcbiAqICAgdGhpcy5uZXR3b3JrSW50ZXJmYWNlLmdldENhcnJpZXJJUEFkZHJlc3MoKVxuICogICAgIC50aGVuKGFkZHJlc3MgPT4gY29uc29sZS5pbmZvKGBJUDogJHthZGRyZXNzLmlwfSwgU3VibmV0OiAke2FkZHJlc3Muc3VibmV0fWApKVxuICogICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGBVbmFibGUgdG8gZ2V0IElQOiAke2Vycm9yfWApKTtcbiAqXG4gKiAgIGNvbnN0IHVybCA9ICd3d3cuZ2l0aHViLmNvbSc7XG4gKiAgIHRoaXMubmV0d29ya0ludGVyZmFjZS5nZXRIdHRwUHJveHlJbmZvcm1hdGlvbih1cmwpXG4gKiAgICAgLnRoZW4ocHJveHkgPT4gY29uc29sZS5pbmZvKGBUeXBlOiAke3Byb3h5LnR5cGV9LCBIb3N0OiAke3Byb3h5Lmhvc3R9LCBQb3J0OiAke3Byb3h5LnBvcnR9YCkpXG4gKiAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBnZXQgcHJveHkgaW5mbzogJHtlcnJvcn1gKSk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuQFBsdWdpbih7XG4gIHBsdWdpbk5hbWU6ICdOZXR3b3JrSW50ZXJmYWNlJyxcbiAgcGx1Z2luOiAnY29yZG92YS1wbHVnaW4tbmV0d29ya2ludGVyZmFjZScsXG4gIHBsdWdpblJlZjogJ25ldHdvcmtpbnRlcmZhY2UnLFxuICByZXBvOiAnaHR0cHM6Ly9naXRodWIuY29tL3NhbGJhaHJhL2NvcmRvdmEtcGx1Z2luLW5ldHdvcmtpbnRlcmZhY2UnLFxuICBwbGF0Zm9ybXM6IFsnQW5kcm9pZCcsICdCbGFja0JlcnJ5IDEwJywgJ0Jyb3dzZXInLCAnaU9TJywgJ1dpbmRvd3MnLCAnV2luZG93cyBQaG9uZSddLFxufSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOZXR3b3JrSW50ZXJmYWNlIGV4dGVuZHMgSW9uaWNOYXRpdmVQbHVnaW4ge1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBXaUZpIElQIGFkZHJlc3NcbiAgICogQHJldHVybiB7UHJvbWlzZTxhbnk+fSBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIElQIGFkZHJlc3MgaW5mb3JtYXRpb24uXG4gICAqL1xuICBAQ29yZG92YSgpXG4gIGdldFdpRmlJUEFkZHJlc3MoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgd2lyZWxlc3MgY2FycmllciBJUCBhZGRyZXNzXG4gICAqIEByZXR1cm4ge1Byb21pc2U8YW55Pn0gUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBJUCBhZGRyZXNzIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgQENvcmRvdmEoKVxuICBnZXRDYXJyaWVySVBBZGRyZXNzKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJlbGV2YW50IHByb3hpZXMgZm9yIHRoZSBwYXNzZWQgVVJMIGluIG9yZGVyIG9mIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSB7dXJsfSBtZXNzYWdlICBUaGUgbWVzc2FnZSB0byBkaXNwbGF5LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPGFueT59IFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcHJveHkgaW5mb3JtYXRpb24uXG4gICAqL1xuICBAQ29yZG92YSgpXG4gIGdldEh0dHBQcm94eUluZm9ybWF0aW9uKHVybDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm47XG4gIH1cblxufVxuIl19
