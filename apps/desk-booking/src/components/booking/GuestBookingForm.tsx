"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GuestBookingFormProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
}

export function GuestBookingForm({
  name,
  email,
  onNameChange,
  onEmailChange,
}: GuestBookingFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 items-center gap-3">
        <Label
          htmlFor="booker-name"
          className="text-right text-teal-500 text-xs font-mono uppercase"
        >
          Name
        </Label>
        <Input
          id="booker-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="col-span-3 bg-teal-900/30 border-teal-700 text-teal-100 placeholder:text-teal-700 focus-visible:ring-teal-500"
          placeholder="Your name"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-3">
        <Label
          htmlFor="booker-email"
          className="text-right text-teal-500 text-xs font-mono uppercase"
        >
          Email
        </Label>
        <Input
          id="booker-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="col-span-3 bg-teal-900/30 border-teal-700 text-teal-100 placeholder:text-teal-700 focus-visible:ring-teal-500"
          placeholder="your@email.com"
        />
      </div>
    </div>
  );
}
