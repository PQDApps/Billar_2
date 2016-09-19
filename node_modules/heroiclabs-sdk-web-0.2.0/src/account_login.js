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
import {Session} from './session';

class LoginRequest extends AccountsRequest {
  constructor(accessToken, provider) {
    var body = {'access_token': accessToken};
    var url = '/v0/gamer/login/' + provider;
    super('POST', url, null, body);
    this._responseCallback = function (xhr) {
      var body = JSON.parse(xhr.responseText);
      var session = new Session(body.token);
      Object.freeze(session);
      return session;
    };
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {LoginRequest} Current instance of this object, can be used to chain function calls.
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
 * Perform a login with a Tango access token.
 */
export class LoginTangoRequest extends LoginRequest {

  /**
   * @param  {String} accessToken The Tango access token to login with.
   * @return {LoginTangoRequest} An instance of this object.
   */
  constructor(accessToken) {
    super(accessToken, 'tango');
  }
}

/**
 * Perform a login with a Facebook OAuth access token.
 */
export class LoginFacebookRequest extends LoginRequest {

  /**
   * @param  {String} accessToken The Facebook OAuth access token to login with.
   * @return {LoginFacebookRequest} An instance of this object.
   */
  constructor(accessToken) {
    super(accessToken, 'facebook');
  }
}

/**
 * Perform a login with a Google OAuth access token.
 */
export class LoginGoogleRequest extends LoginRequest {

  /**
   * @param  {String} accessToken The Google OAuth access token to login with.
   * @return {LoginGoogleRequest} An instance of this object.
   */
  constructor(accessToken) {
    super(accessToken, 'google');
  }
}

/**
 * Perform a login with a given anonymous ID.
 */
export class LoginAnonymousRequest extends AccountsRequest {

  /**
   * @param  {String} id The anonymous profile identifier to login with.
   * @return {LoginAnonymousRequest} An instance of this object.
   */
  constructor(id) {
    var body = {'id': id};
    var url = '/v0/gamer/login/anonymous';
    super('POST', url, null, body);
    this._responseCallback = function (xhr) {
      var body = JSON.parse(xhr.responseText);
      var session = new Session(body.token);
      Object.freeze(session);
      return session;
    };
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {LoginAnonymousRequest} Current instance of this object, can be used to chain function calls.
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
 * Perform a login with a given email address and password.
 */
export class LoginEmailRequest extends AccountsRequest {

  /**
   * @param  {String} email The email to login with.
   * @param  {String} password The corresponding password to login with.
   * @return {LoginEmailRequest} An instance of this object.
   */
  constructor(email, password) {
    var body = {'email': email, 'password': password};
    var url = '/v0/gamer/login/email';
    super('POST', url, null, body);
    this._responseCallback = function (xhr) {
      var body = JSON.parse(xhr.responseText);
      var session = new Session(body.token);
      Object.freeze(session);
      return session;
    };
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {LoginEmailRequest} Current instance of this object, can be used to chain function calls.
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
 * Create a new email profile, attach it to an existing gamer if a Session is provided.
 */
export class CreateEmailRequest extends AccountsRequest {

  /**
   * @param  {String} email The email address create a profile for.
   * @param  {String} password The password to use.
   * @param  {String} confirmPassword Password confirmation field.
   * @return {LoginEmailRequest} An instance of this object.
   */
  constructor(email, password, confirmPassword) {
    var body = {'email': email, 'password': password, 'confirm_password': confirmPassword};
    var url = '/v0/gamer/account/email/create';
    super('POST', url, null, body);
    this._responseCallback = function (xhr) {
      var body = JSON.parse(xhr.responseText);
      var session = new Session(body.token);
      Object.freeze(session);
      return session;
    };
  }

  /**
   * Set a real name to attach to the account.
   * @param  {String} name A real name to use.
   * @return {CreateEmailRequest} Current instance of this object, can be used to chain function calls.
   */
  name(name) {
    this._body.name = name;
    return this;
  }

  /**
   * Explicitly choose a nickname for the account.
   * If this is not set, the service will assign an auto-generated nickname to the account.
   * @param  {String} nickname The nickname string to use.
   * @return {CreateEmailRequest} Current instance of this object, can be used to chain function calls.
   */
  nickname(nickname) {
    this._body.nickname = nickname;
    return this;
  }

  /**
   * Set a Session to use as part of the request.
   * @param  {Session} session Session identifying the account making this request.
   * @return {CreateEmailRequest} Current instance of this object, can be used to chain function calls.
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
 * Send a password reset email for the given email address.
 */
export class EmailPasswordResetRequest extends AccountsRequest {

  /**
   * @param  {String} email The email address to send a reset password email for.
   * @return {EmailPasswordResetRequest} An instance of this object.
   */
  constructor(email) {
    var body = {'email': email};
    var url = '/v0/gamer/account/email/reset/send';
    super('POST', url, null, body);
  }
}
