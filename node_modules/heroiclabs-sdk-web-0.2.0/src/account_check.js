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

class CheckRequest extends AccountsRequest {
  constructor(accessToken, provider) {
    var body = {'access_token': accessToken};
    var url = '/v0/gamer/check/' + provider;
    super('POST', url, null, body);
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {CheckRequest} Current instance of this object, can be used to chain function calls.
   */
  session(session) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    this._session = session;
    return this;
  }
}

/**
 * Check if a given Tango account, identified by an access token is currently associated to an account.
 */
export class CheckTangoRequest extends CheckRequest {

  /**
   * @param  {String} accessToken The Tango access token to use to check.
   * @return {CheckTangoRequest} An instance of this object.
   */
  constructor(accessToken) {
    super(accessToken, 'tango');
  }
}

/**
 * Check if a given Facebook account, identified by an access token is currently associated to an account.
 */
export class CheckFacebookRequest extends CheckRequest {

  /**
   * @param  {String} accessToken The Facebook OAuth access token to use to check.
   * @return {CheckTangoRequest} An instance of this object.
   */
  constructor(accessToken) {
    super(accessToken, 'facebook');
  }
}

/**
 * Check if a given Google account, identified by an access token is currently associated to an account.
 */
export class CheckGoogleRequest extends CheckRequest {

  /**
   * @param  {String} accessToken The Google OAuth access token to use to check.
   * @return {CheckTangoRequest} An instance of this object.
   */
  constructor(accessToken) {
    super(accessToken, 'google');
  }
}

/**
 * Check if a given anonymous ID is currently associated to an account.
 */
export class CheckAnonymousRequest extends AccountsRequest {

  /**
   * @param  {String} id The anonymous profile identifier to check.
   * @return {CheckAnonymousRequest} An instance of this object.
   */
  constructor(id) {
    var body = {'id': id};
    var url = '/v0/gamer/check/anonymous';
    super('POST', url, null, body);
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {CheckAnonymousRequest} Current instance of this object, can be used to chain function calls.
   */
  session(session) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    this._session = session;
    return this;
  }
}

/**
 * Check if a given email address is currently associated to an account.
 */
export class CheckEmailRequest extends AccountsRequest {

  /**
   * @param  {String} email The email address to check.
   * @return {CheckAnonymousRequest} An instance of this object.
   */
  constructor(email) {
    var body = {'email': email};
    var url = '/v0/gamer/check/email';
    super('POST', url, null, body);
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {CheckEmailRequest} Current instance of this object, can be used to chain function calls.
   */
  session(session) {
    if (session != null && !session.hasOwnProperty('_token')) {
      throw new Error('Invalid Session Object');
    }

    this._session = session;
    return this;
  }
}
