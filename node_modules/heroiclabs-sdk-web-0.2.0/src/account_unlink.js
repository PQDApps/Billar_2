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

class UnlinkRequest extends AccountsRequest {
  constructor(session, id, provider) {
    var body = {'id': id};
    var url = '/v0/gamer/unlink/' + provider;
    super('POST', url, session, body);
  }
}

/**
 * Unlink a given Tango account ID from an account.
 */
export class UnlinkTangoRequest extends UnlinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} id Tango account ID to unlink.
   * @return {UnlinkTangoRequest} An instance of this object.
   */
  constructor(session, id) {
    super(session, id, 'tango');
  }
}

/**
 * Unlink a given Facebook account ID from an account.
 */
export class UnlinkFacebookRequest extends UnlinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} id Facebook account ID to unlink.
   * @return {UnlinkFacebookRequest} An instance of this object.
   */
  constructor(session, id) {
    super(session, id, 'facebook');
  }
}

/**
 * Unlink a given Google account ID from an account.
 */
export class UnlinkGoogleRequest extends UnlinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} id Google account ID to unlink.
   * @return {UnlinkGoogleRequest} An instance of this object.
   */
  constructor(session, id) {
    super(session, id, 'google');
  }
}

/**
 * Unlink a given anonymous ID from an account.
 */
export class UnlinkAnonymousRequest extends UnlinkRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} id The anonymous profile identifier to unlink.
   * @return {UnlinkAnonymousRequest} An instance of this object.
   */
  constructor(session, id) {
    super(session, id, 'anonymous');
  }
}

/**
 * Unlink a given email address from an account.
 */
export class UnlinkEmailRequest extends AccountsRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} email The email address to unlink.
   * @return {UnlinkEmailRequest} An instance of this object.
   */
  constructor(session, email) {
    var body = {'email': email};
    var url = '/v0/gamer/unlink/email';
    super('POST', url, session, body);
  }
}
