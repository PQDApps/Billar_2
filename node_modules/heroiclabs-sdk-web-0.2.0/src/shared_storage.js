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
 * Get the value stored in Shared Storage under a particular key.
 */
export class SharedStorageGetRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} key The key to get the corresponding value for.
   * @return {SharedStorageGetRequest} An instance of this object.
   */
  constructor(session, key) {
    super('GET', '/v0/gamer/shared/' + key, session);
  }
}

/**
 * Create or replace the Shared Storage 'public' segment value for the given key with the given value.
 */
export class SharedStoragePublicPutRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} key The storage key to put.
   * @param  {Object} data The value to assign to the specified key's 'public' segment.
   * @return {SharedStoragePutRequest} An instance of this object.
   */
  constructor(session, key, data) {
    super('PUT', '/v0/gamer/shared/' + key + '/public', session, data);
  }
}

/**
 * Merge the Shared Storage 'public' segment value for the given key with the given value.
 */
export class SharedStoragePublicPatchRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} key The key to create or replace the value for.
   * @param  {Object} data The entity that will be merged into that key's 'public' segment.
   * @return {SharedStoragePatchRequest} An instance of this object.
   */
  constructor(session, key, data) {
    super('PATCH', '/v0/gamer/shared/' + key + '/public', session, data);
  }
}

/**
 * Delete the data stored in Shared Storage under a particular key's 'public' segment, if any.
 */
export class SharedStoragePublicDeleteRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} The key to delete the corresponding 'public' segment value for.
   * @return {SharedStorageDeleteRequest} An instance of this object.
   */
  constructor(session, key) {
    super('DELETE', '/v0/gamer/shared/' + key + '/public', session);
  }
}

/**
 * Run a query over Shared Storage data.
 */
export class SharedStorageSearchRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} query The query string to execute.
   * @return {SharedStorageSearchRequest} An instance of this object.
   */
  constructor(session, query) {
    var queryParams = {'query': query};
    super('GET', '/v0/gamer/shared/', session, null, queryParams);
  }

  /**
   * Restrict the query to run only over Shared Storage keys with the given name. Defaults to no filter,
   * the query will run over all Shared Storage records.
   * @param  {String} key The key filter to use.
   * @return {SharedStorageSearchRequest} Current instance of this object, can be used to chain function calls.
   */
  filterKey(key) {
    this._queryParams['filter_key'] = key;
    return this;
  }

  /**
   * Define a sort order for the results. Defaults to no sort, natural ordering is used.
   * @param  {String} key The sort order definition to use.
   * @return {SharedStorageSearchRequest} Current instance of this object, can be used to chain function calls.
   */
  sort(key) {
    this._queryParams.sort = key;
    return this;
  }

  /**
   * Offset query results by the given number of entries. Useful for paginating query results.
   * Default 0 (first page). Must be greater than or equal to 0.
   * @param  {Integer} offset The query result offset to use.
   * @return {SharedStorageSearchRequest} Current instance of this object, can be used to chain function calls.
   */
  offset(offset) {
    this._queryParams.offset = offset;
    return this;
  }

  /**
   * Limit the number of results returned in a single response. Must be between 0 and 100, inclusive. Default 10.
   * Using a limit of 0 will return no results, but can be useful for aggregation or similar scenarios
   * where the result count is useful by itself.
   * @param  {Integer} limit The maximum number of results to return in a response.
   * @return {SharedStorageSearchRequest} Current instance of this object, can be used to chain function calls.
   */
  limit(limit) {
    this._queryParams.limit = limit;
    return this;
  }
}
