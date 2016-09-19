/*
 * Copyright 2016 Heroic Labs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * [HEROICLABS_API API server URL.]
 * @type {String}
 */
const HEROICLABS_API = 'api.heroiclabs.com';

/**
 * [HEROICLABS_ACCOUNTS Accounts server URL.]
 * @type {String}
 */
const HEROICLABS_ACCOUNTS = 'accounts.heroiclabs.com';

/**
 * Client responsible for making requests to the Heroic Labs service.
 */
export class Client {

  /**
   * @param  {String} apikey API key used in all requests made by this client.
   * @return {Client} An instance of this object.
   */
  constructor(apikey) {
    this._apikey = apikey;
    this._apiUrl = HEROICLABS_API;
    this._accountsUrl = HEROICLABS_ACCOUNTS;
  }

  setApiServer(apiUrl) {
    this._apiUrl = apiUrl;
    return this;
  }

  setAccountsServer(accountsUrl) {
    this._accountsUrl = accountsUrl;
    return this;
  }

  /**
   * Execute a given request.
   * @param  {Request} request The request to execute.
   * @return {Promise} A deferred promise object which will resolve into a Response object.
   */
  execute(request) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      var uri;
      var gamerToken = '';

      uri = this._apiUrl + request._url;
      if (request._type === 'accounts') {
        uri = this._accountsUrl + request._url;
      }
      uri = 'https://' + uri;

      if (request._session != null) {
        gamerToken = request._session._token;
      }

      if (request._queryParams) {
        uri += '?';
        let counter = 0;
        let keys = Object.keys(request._queryParams);
        for (let key of keys) {
          uri += encodeURIComponent(key) + '=' + encodeURIComponent(String(request._queryParams[key]));
          counter++;
          if (counter < keys.length) {
            uri += '&';
          }
        }
      }

      xhr.timeout = 5000;
      xhr.onreadystatechange = () => {
        xhr.onload = () => {
          let response = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            if (request._responseCallback != null) {
              response = new Response(xhr, request, request._responseCallback(xhr));
            } else {
              response = new Response(xhr, request);
            }
            Object.freeze(response);
            resolve(response);
          } else {
            response = new Response(xhr, request);
            Object.freeze(response);
            reject(response);
          }
        };
        xhr.onerror = function () {
          let response = new Response(xhr, request);
          Object.freeze(response);
          reject(response);
        };
        xhr.ontimeout = function () {
          let response = new Response(xhr, request);
          Object.freeze(response);
          reject(response);
        };
      };

      xhr.open(request._method, uri, true);

      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this._apikey + ':' + gamerToken));
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xhr.setRequestHeader('Accept', 'application/json');
      // xhr.setRequestHeader('User-Agent', '');

      xhr.send(JSON.stringify(request._body));
    });
  }
}

/**
 * Response from the Heroic Labs service.
 */
export class Response {
  constructor(jsXHR, request, body) {
    /**
     * [xhr Original XHR]
     * @type {XMLHttpRequest}
     */
    this.xhr = jsXHR;

    /**
     * [request Original sent request.]
     * @type {Request}
     */
    this.request = request;

    /**
     * [status HTTP Status]
     * @type {Integer}
     */
    this.status = jsXHR.status;

    /**
     * [message HTTP Status Message]
     * @type {String}
     */
    this.message = jsXHR.statusText;

    /**
     * [body Body of the Response. Could be different to the XHR Body.]
     * @type {Object}
     */
    this.body = null;

    if (body != null) {
      this.body = body;
    } else if (jsXHR.responseText !== null && jsXHR.responseText.length > 0) {
      this.body = JSON.parse(jsXHR.responseText);
    }
  }
}
