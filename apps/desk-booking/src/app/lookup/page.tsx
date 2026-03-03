"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BookingList } from "@/components/booking/BookingList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LookupPage() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const bookings = useQuery(
    api.bookings.getByEmail,
    searchEmail ? { email: searchEmail } : "skip",
  );

  const handleSearch = () => {
    if (email.includes("@")) {
      setSearchEmail(email);
    }
  };

  // Enrich bookings with desk info (fetched separately by the query)
  // The getByEmail query returns raw bookings, we display what we have
  const enrichedBookings =
    bookings?.map((b) => ({ ...b, desk: null })) ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-teal-100 font-sans">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <main className="relative z-10 max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="border-b border-teal-900/50 pb-4">
          <Link href="/">
            <h1 className="text-3xl font-black bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
              Sanctuary<span className="text-teal-800">.</span>OS
            </h1>
          </Link>
          <p className="text-teal-600 font-mono text-xs tracking-wider mt-1">
            {"// BOOKING LOOKUP"}
          </p>
        </header>

        {/* Search */}
        <div className="bg-teal-950/20 border border-teal-900/30 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-teal-400 uppercase tracking-widest font-mono">
            Find Your Bookings
          </h2>
          <p className="text-xs text-teal-600 font-mono">
            Enter the email address you used when booking.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono placeholder:text-teal-700"
              placeholder="your@email.com"
            />
            <Button
              onClick={handleSearch}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold font-mono"
            >
              SEARCH
            </Button>
          </div>
        </div>

        {/* Results */}
        {searchEmail && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-teal-500 uppercase tracking-widest">
              Results for {searchEmail}
            </h3>
            {bookings === undefined ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <BookingList
                bookings={enrichedBookings}
                emptyMessage="No bookings found for this email."
              />
            )}
          </div>
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-teal-900/30">
          <Link
            href="/book"
            className="text-xs text-teal-700 hover:text-teal-400 font-mono"
          >
            &lt;- BOOK A DESK
          </Link>
        </div>
      </main>
    </div>
  );
}
