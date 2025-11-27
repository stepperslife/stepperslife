"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TestSimplePage() {
  const events = useQuery(api.public.queries.getPublishedEvents, {});

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Convex Test</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Events Query Status</h2>

          {events === undefined ? (
            <p className="text-yellow-600">⏳ Loading (events === undefined)...</p>
          ) : events === null ? (
            <p className="text-red-600">❌ Query returned null</p>
          ) : Array.isArray(events) ? (
            <div>
              <p className="text-green-600 font-bold mb-4">✅ SUCCESS! Found {events.length} events</p>
              <div className="space-y-2">
                {events.map((event: any) => (
                  <div key={event._id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-sm text-gray-600">
                      {event.location?.city}, {event.location?.state}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-orange-600">⚠️ Unexpected type: {typeof events}</p>
          )}
        </div>
      </div>
    </div>
  );
}
