"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { WebhookForm } from "@/components/admin/WebhookForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WebhooksPage() {
  const webhooks = useQuery(api.webhooks.list) ?? [];
  const removeWebhook = useMutation(api.webhooks.remove);
  const updateWebhook = useMutation(api.webhooks.update);
  const [editingWebhook, setEditingWebhook] = useState<Doc<"webhooks"> | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating || editingWebhook) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          {editingWebhook ? "Edit Webhook" : "Register Webhook"}
        </h1>
        <WebhookForm
          webhook={editingWebhook ?? undefined}
          onDone={() => {
            setIsCreating(false);
            setEditingWebhook(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          Webhooks
        </h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/50 text-teal-300 text-xs font-mono"
        >
          + REGISTER WEBHOOK
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center text-teal-800 text-sm py-10 font-mono">
          No webhooks registered. Register one to receive event notifications.
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <div
              key={webhook._id}
              className={`p-4 bg-teal-950/20 border border-teal-900/30 rounded-lg ${!webhook.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-sm font-mono text-teal-300 break-all">
                    {webhook.url}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {webhook.eventTypes.map((et) => (
                      <span
                        key={et}
                        className="px-1.5 py-0.5 bg-teal-900/30 border border-teal-800/30 rounded text-[10px] font-mono text-teal-500"
                      >
                        {et}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-teal-700 font-mono">
                    {webhook.isActive ? "ACTIVE" : "INACTIVE"}
                    {webhook.secret ? " // SIGNED" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateWebhook({
                        id: webhook._id,
                        isActive: !webhook.isActive,
                      })
                    }
                    className="border-teal-800 text-teal-400 hover:bg-teal-900/30 text-[10px] h-7"
                  >
                    {webhook.isActive ? "DISABLE" : "ENABLE"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWebhook(webhook)}
                    className="border-teal-800 text-teal-400 hover:bg-teal-900/30 text-[10px] h-7"
                  >
                    EDIT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await removeWebhook({ id: webhook._id });
                      toast.success("Webhook removed");
                    }}
                    className="border-red-900/50 text-red-400 hover:bg-red-900/20 text-[10px] h-7"
                  >
                    DELETE
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
