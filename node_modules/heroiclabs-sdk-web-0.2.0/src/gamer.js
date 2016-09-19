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

import {AccountsRequest} from './request';

/**
 * Get the account and linked profile information for the Gamer identified by the given Session.
 */
export class GamerGetRequest extends AccountsRequest {
  /**
   * @param  {Session} session Session identifying the account making this request.
   * @return {GamerGetRequest} An instance of this object.
   */
  constructor(session) {
    super('GET', '/v0/gamer', session);
  }
}

/**
 * Update account metadata, such as nickname.
 */
export class GamerUpdateRequest extends AccountsRequest {
  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} nickname The nickname to assign to the gamer.
   * @return {GamerUpdateRequest} An instance of this object.
   */
  constructor(session, nickname) {
    var body = {'nickname': nickname};
    super('POST', '/v0/gamer', session, body);
  }
}
