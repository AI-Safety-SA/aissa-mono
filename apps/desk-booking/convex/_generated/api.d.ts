/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookings from "../bookings.js";
import type * as desks from "../desks.js";
import type * as deskTypes from "../deskTypes.js";
import type * as email from "../email.js";
import type * as events from "../events.js";
import type * as floorPlans from "../floorPlans.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_validation from "../lib/validation.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";
import type * as webhookDelivery from "../webhookDelivery.js";
import type * as webhookDeliveryHelpers from "../webhookDeliveryHelpers.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  desks: typeof desks;
  deskTypes: typeof deskTypes;
  email: typeof email;
  events: typeof events;
  floorPlans: typeof floorPlans;
  "lib/auth": typeof lib_auth;
  "lib/validation": typeof lib_validation;
  settings: typeof settings;
  users: typeof users;
  webhookDelivery: typeof webhookDelivery;
  webhookDeliveryHelpers: typeof webhookDeliveryHelpers;
  webhooks: typeof webhooks;
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
