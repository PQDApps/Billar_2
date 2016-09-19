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
 * Get the value stored in Cloud Storage under a particular key.
 */
export class StorageGetRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} key The key to get the corresponding value for.
   * @return {StorageGetRequest} An instance of this object.
   */
  constructor(session, key) {
    super('GET', '/v0/gamer/storage/' + key, session);
    this._responseCallback = function (xhr) {
      var body = JSON.parse(xhr.responseText);
      if (body.content_type === 'application/json') {
        body.value = JSON.parse(body.value);
      }
      return body;
    };
  }
}

/**
 * Create or replace the Cloud Storage value for the given key with the given value.
 */
export class StoragePutRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} key The key to create or replace the value for.
   * @param  {Object} data The entity that will be stored under that key.
   * @return {StoragePutRequest} An instance of this object.
   */
  constructor(session, key, data) {
    super('PUT', '/v0/gamer/storage/' + key, session, data);
  }
}

/**
 * Delete the data stored in Cloud Storage under a particular key, if any.
 */
export class StorageDeleteRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} key The key to delete the corresponding value for.
   * @return {StorageDeleteRequest} An instance of this object.
   */
  constructor(session, key) {
    super('DELETE', '/v0/gamer/storage/' + key, session);
  }
}
