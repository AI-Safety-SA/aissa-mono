"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BookingList } from "@/components/booking/BookingList";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Link from "next/link";

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-teal-100 font-sans">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <main className="relative z-10 max-w-2xl mx-auto p-6 space-y-6">
        <header className="border-b border-teal-900/50 pb-4">
          <Link href="/">
            <h1 className="text-3xl font-black bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
              Sanctuary<span className="text-teal-800">.</span>OS
            </h1>
          </Link>
          <p className="text-teal-600 font-mono text-xs tracking-wider mt-1">
            {"// MY BOOKINGS"}
          </p>
        </header>

        <AuthGuard>
          <MyBookingsContent />
        </AuthGuard>

        <div className="pt-4 border-t border-teal-900/30">
          <Link
            href="/"
            className="text-xs text-teal-700 hover:text-teal-400 font-mono"
          >
            &lt;- BACK TO FLOOR PLAN
          </Link>
        </div>
      </main>
    </div>
  );
}

function MyBookingsContent() {
  const bookings = useQuery(api.bookings.getMyBookings);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-teal-400 uppercase tracking-widest font-mono">
        Your Bookings
      </h2>
      {bookings === undefined ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <BookingList
          bookings={bookings}
          emptyMessage="You have no upcoming bookings."
        />
      )}
    </div>
  );
}
