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

class Request {
  constructor(type, method, url, session, body, queryParams) {
    this._type = type;
    this._method = method;
    this._url = url;
    this._session = session;
    this._body = body;
    this._queryParams = queryParams;

    this._responseCallback = null; // response callback function;
  }
}

export class ApiRequest extends Request {
  constructor(method, url, session, body, queryParams) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    super('api', method, url, session, body, queryParams);
  }
}

export class AccountsRequest extends Request {
  constructor(method, url, session, body, queryParams) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    super('accounts', method, url, session, body, queryParams);
  }
}
