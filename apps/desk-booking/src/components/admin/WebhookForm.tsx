"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const EVENT_TYPES = [
  "booking.created",
  "booking.cancelled",
  "desk.created",
  "desk.updated",
];

interface WebhookFormProps {
  webhook?: Doc<"webhooks">;
  onDone: () => void;
}

export function WebhookForm({ webhook, onDone }: WebhookFormProps) {
  const registerWebhook = useMutation(api.webhooks.register);
  const updateWebhook = useMutation(api.webhooks.update);

  const [url, setUrl] = useState(webhook?.url ?? "");
  const [secret, setSecret] = useState(webhook?.secret ?? "");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    webhook?.eventTypes ?? EVENT_TYPES,
  );

  const toggleEvent = (eventType: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((e) => e !== eventType)
        : [...prev, eventType],
    );
  };

  const handleSubmit = async () => {
    if (!url) {
      toast.error("URL is required");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Select at least one event type");
      return;
    }

    try {
      if (webhook) {
        await updateWebhook({
          id: webhook._id,
          url,
          eventTypes: selectedEvents,
          secret: secret || undefined,
        });
        toast.success("Webhook updated");
      } else {
        await registerWebhook({
          url,
          eventTypes: selectedEvents,
          secret: secret || undefined,
        });
        toast.success("Webhook registered");
      }
      onDone();
    } catch (error) {
      toast.error("Failed to save webhook");
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label className="text-teal-500 text-xs font-mono uppercase">
          Endpoint URL
        </Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
          placeholder="https://example.com/webhook"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-teal-500 text-xs font-mono uppercase">
          HMAC Secret (optional)
        </Label>
        <Input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
          placeholder="your-secret-key"
          type="password"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-teal-500 text-xs font-mono uppercase">
          Event Types
        </Label>
        <div className="space-y-1">
          {EVENT_TYPES.map((eventType) => (
            <label
              key={eventType}
              className="flex items-center gap-2 text-xs font-mono text-teal-300 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedEvents.includes(eventType)}
                onChange={() => toggleEvent(eventType)}
                className="accent-teal-500"
              />
              {eventType}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onDone}
          className="border-teal-800 text-teal-400 hover:bg-teal-900/30"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold font-mono"
        >
          {webhook ? "UPDATE" : "REGISTER"}
        </Button>
      </div>
    </div>
  );
}
