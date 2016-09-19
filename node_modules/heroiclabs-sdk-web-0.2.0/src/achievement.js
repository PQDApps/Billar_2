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
 * List all achievements, along with progress and unlock status if a Sesion is given.
 */
export class AchievementListRequest extends ApiRequest {

  /**
   * @return {AchievementListRequest} An instance of this object.
   */
  constructor() {
    super('GET', '/v0/game/achievement');
  }

  /**
   * Set a Session to use with this request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {AchievementListRequest} Current instance of this object, can be used to chain function calls.
   */
  session(session) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    this._session = session;
    this._url = '/v0/gamer/achievement';
    return this;
  }
}

/**
 * Update an achievement's progress for a particular account.
 */
export class AchievementUpdateRequest extends ApiRequest {

  /**
   * @param {String} achievementId The achievement ID to update.
   * @param {Integer} count The progress to report towards the given achievement.
   * @return {AchievementListRequest} An instance of this object.
   */
  constructor(session, achievementId, count) {
    var body = {'count': count};
    super('POST', '/v0/gamer/achievement/' + achievementId, session, body);
  }
}
