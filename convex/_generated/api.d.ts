/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as functions_conversations from "../functions/conversations.js";
import type * as functions_messages from "../functions/messages.js";
import type * as functions_users from "../functions/users.js";
import type * as http from "../http.js";
import type * as schema_conversations from "../schema/conversations.js";
import type * as schema_users from "../schema/users.js";
import type * as storage from "../storage.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "functions/conversations": typeof functions_conversations;
  "functions/messages": typeof functions_messages;
  "functions/users": typeof functions_users;
  http: typeof http;
  "schema/conversations": typeof schema_conversations;
  "schema/users": typeof schema_users;
  storage: typeof storage;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
