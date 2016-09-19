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

class LinkRequest extends AccountsRequest {
  constructor(session, accessToken, provider) {
    var body = {'access_token': accessToken};
    var url = '/v0/gamer/link/' + provider;
    super('POST', url, session, body);
  }
}

/**
 * Link a given Tango profile to an account.
 */
export class LinkTangoRequest extends LinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} accessToken Tango access token identifying the profile to link.
   * @return {LinkTangoRequest} An instance of this object.
   */
  constructor(session, accessToken) {
    super(session, accessToken, 'tango');
  }
}

/**
 * Link a given Facebook profile to an account.
 */
export class LinkFacebookRequest extends LinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} accessToken Facebook OAuth access token identifying the profile to link.
   * @return {LinkFacebookRequest} An instance of this object.
   */
  constructor(session, accessToken) {
    super(session, accessToken, 'facebook');
  }
}

/**
 * Link a given Google profile to an account.
 */
export class LinkGoogleRequest extends LinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} accessToken Google OAuth access token identifying the profile to link.
   * @return {LinkGoogleRequest} An instance of this object.
   */
  constructor(session, accessToken) {
    super(session, accessToken, 'google');
  }
}

/**
 * Link a given anonymous ID to an account.
 */
export class LinkAnonymousRequest extends AccountsRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} id The anonymous profile identifier to link.
   * @return {LinkAnonymousRequest} An instance of this object.
   */
  constructor(session, id) {
    var body = {'id': id};
    var url = '/v0/gamer/link/anonymous';
    super('POST', url, session, body);
  }
}
