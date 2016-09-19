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
 * Execute a specified Script in the service.
 */
export class ExecuteScriptRequest extends ApiRequest {

  /**
   * @param  {String} scriptId The ID of the script to execute.
   * @return {ExecuteScriptRequest} An instance of this object.
   */
  constructor(scriptId) {
    var url = '/v0/game/script/' + scriptId;
    super('POST', url);
  }

  /**
   * Set a Session to use with this request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {ExecuteScriptRequest} Current instance of this object, can be used to chain function calls.
   */
  session(session) {
    this._session = session;
    return this;
  }

  /**
   * Set the script input. Input is empty by default.
   * @param  {Object} data The object to pass to the script as input.
   * @return {ExecuteScriptRequest} Current instance of this object, can be used to chain function calls.
   */
  data(data) {
    this._body = data;
    return this;
  }
}
