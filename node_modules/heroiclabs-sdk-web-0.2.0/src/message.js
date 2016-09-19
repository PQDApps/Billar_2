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
 * List all or some subset of messages in the current account's mailbox.
 */
export class MessageListRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @return {MessageListRequest} An instance of this object.
   */
  constructor(session) {
    super('GET', '/v0/gamer/message', session, null, {});
  }

  /**
   * Only return messages created after this UTC timestamp in milliseconds.
   * @param  {Integer} timestamp A UTC timestamp in milliseconds, messages created before this won't be returned.
   * @return {MessageListRequest} Current instance of this object, can be used to chain function calls.
   */
  since(timestamp) {
    this._queryParams.since = timestamp;
    return this;
  }

  /**
   * Indicate that the messages returned should include their respective body data.
   * @return {MessageListRequest} Current instance of this object, can be used to chain function calls.
   */
  withBody() {
    this._queryParams['with_body'] = true;
    return this;
  }
}

/**
 * Retrieve a single message from the account's mailbox, and mark it as read if it was unread.
 */
export class MessageReadRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} messageId The message ID to get and mark as read.
   * @return {MessageReadRequest} An instance of this object.
   */
  constructor(session, messageId) {
    super('GET', '/v0/gamer/message/' + messageId, session, null, {});
  }

  /**
   * Indicate that the message returned should include its body data.
   * @return {MessageReadRequest} Current instance of this object, can be used to chain function calls.
   */
  withNoBody() {
    this._queryParams['with_body'] = false;
    return this;
  }
}

/**
 * Delete a single message from the account's mailbox.
 */
export class MessageDeleteRequest extends ApiRequest {

  /**
   * @param  {Session} session Session identifying the account making this request.
   * @param  {String} messageId The message ID to delete.
   * @return {MessageDeleteRequest} An instance of this object.
   */
  constructor(session, messageId) {
    super('DELETE', '/v0/gamer/message/' + messageId, session);
  }
}
