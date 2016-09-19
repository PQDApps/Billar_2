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

import {ApiRequest} from './request';

/**
 * Ping the service to check that it's available, reachable, the client API key is valid,
 * and the given Session (if any) is valid.
 */
export class PingRequest extends ApiRequest {

  /**
   * @return {PingRequest} An instance of this object.
   */
  constructor() {
    super('GET', '/v0/');
  }

  /**
   * Set a Session to use as part of the request and checks for validity of the Session.
   * @param  {Session} session Session identifying the account making this request.
   * @return {PingRequest} Current instance of this object, can be used to chain function calls.
   */
  session(session) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    this._session = session;
    return this;
  }
}
