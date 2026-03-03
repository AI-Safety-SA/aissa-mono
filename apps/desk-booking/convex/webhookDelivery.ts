"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import crypto from "crypto";

export const deliver = internalAction({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Fetch the event
    const event = await ctx.runQuery(internal.webhookDeliveryHelpers.getEvent, {
      eventId: args.eventId,
    });
    if (!event) {
      console.log(`[Webhook] Event ${args.eventId} not found`);
      return;
    }

    // Fetch active webhooks
    const webhooks = await ctx.runQuery(
      internal.webhookDeliveryHelpers.getActiveWebhooks,
      { eventType: event.type },
    );

    if (webhooks.length === 0) {
      await ctx.runMutation(internal.events.markDelivered, {
        eventId: args.eventId,
      });
      return;
    }

    const payload = JSON.stringify({
      id: args.eventId,
      type: event.type,
      timestamp: event.timestamp,
      data: event.payload,
    });

    for (const webhook of webhooks) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (webhook.secret) {
          const signature = crypto
            .createHmac("sha256", webhook.secret)
            .update(payload)
            .digest("hex");
          headers["X-Webhook-Signature"] = signature;
        }

        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: payload,
        });

        console.log(
          `[Webhook] Delivered ${event.type} to ${webhook.url}: ${response.status}`,
        );
      } catch (error) {
        console.error(
          `[Webhook] Failed to deliver ${event.type} to ${webhook.url}:`,
          error,
        );
      }
    }

    await ctx.runMutation(internal.events.markDelivered, {
      eventId: args.eventId,
    });
  },
});
