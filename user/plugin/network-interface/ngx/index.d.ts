import { IonicNativePlugin } from '@ionic-native/core';
import { Observable } from 'rxjs';
export interface Response {
    status: number;
    body: string;
    headers: {
        [key: string]: string;
    };
}
export interface Request {
    requestId: string;
    body: string;
    headers: string;
    method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    query: string;
}
/**
 * @name Network Interface
 * @description
 * Network interface information plugin for Cordova/PhoneGap that supports Android, Blackberry 10, Browser, iOS, and Windows Phone 8.
 *
 * @usage
 * ```typescript
 * import { NetworkInterface } from '@ionic-native/network-interface/ngx';
 *
 * constructor( private networkInterface: NetworkInterface ) {
 *
 *   this.networkInterface.getWiFiIPAddress()
 *     .then(address => console.info(`IP: ${address.ip}, Subnet: ${address.subnet}`))
 *     .catch(error => console.error(`Unable to get IP: ${error}`));
 *
 *   this.networkInterface.getCarrierIPAddress()
 *     .then(address => console.info(`IP: ${address.ip}, Subnet: ${address.subnet}`))
 *     .catch(error => console.error(`Unable to get IP: ${error}`));
 *
 *   const url = 'www.github.com';
 *   this.networkInterface.getHttpProxyInformation(url)
 *     .then(proxy => console.info(`Type: ${proxy.type}, Host: ${proxy.host}, Port: ${proxy.port}`))
 *     .catch(error => console.error(`Unable to get proxy info: ${error}`));
 * }
 * ```
 */
export declare class NetworkInterface extends IonicNativePlugin {
    /**
     * Gets the WiFi IP address
     * @return {Promise<any>} Returns a Promise that resolves with the IP address information.
     */
    getWiFiIPAddress(): Promise<any>;
    /**
     * Gets the wireless carrier IP address
     * @return {Promise<any>} Returns a Promise that resolves with the IP address information.
     */
    getCarrierIPAddress(): Promise<any>;
    /**
     * Gets the relevant proxies for the passed URL in order of application
     * @param {url} message  The message to display.
     * @return {Promise<any>} Returns a Promise that resolves with the proxy information.
     */
    getHttpProxyInformation(url: string): Promise<any>;
    /**
     * This method returns an observable that streams HTTP requests to an observer.
     * @return {Observable<Request>} Returns an observable to resolve as a Request object
     */
    onRequest(): Observable<Request>;
    /**
     * This method sends a response to a request.
     * @param requestId {string} Request ID to respond to
     * @param responseObject {Response} Response object
     * @return {Promise<any>} Returns a promise that resolves when something happens
     */
    sendResponse(requestId: string, responseObject: Response): Promise<any>;
}
