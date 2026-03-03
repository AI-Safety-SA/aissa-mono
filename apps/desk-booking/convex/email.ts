"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const sendBookingConfirmation = internalAction({
  args: {
    bookingId: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log(
        `[Email] RESEND_API_KEY not configured, skipping booking confirmation for ${args.bookingId}`,
      );
      return;
    }

    // In production, fetch booking details via ctx.runQuery and send email
    console.log(
      `[Email] Would send booking confirmation for ${args.bookingId}`,
    );
  },
});

export const sendBookingCancellation = internalAction({
  args: {
    bookingId: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log(
        `[Email] RESEND_API_KEY not configured, skipping cancellation email for ${args.bookingId}`,
      );
      return;
    }

    console.log(
      `[Email] Would send booking cancellation for ${args.bookingId}`,
    );
  },
});
