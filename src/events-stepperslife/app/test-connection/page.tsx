"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const events = useQuery(api.public.queries.getPublishedEvents, {});

  useEffect(() => {
    console.log("[TestConnection] Component mounted");
    console.log("[TestConnection] Environment:", {
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
      nodeEnv: process.env.NODE_ENV,
    });
  }, []);

  useEffect(() => {
    console.log("[TestConnection] Events state changed:", {
      isUndefined: events === undefined,
      isNull: events === null,
      isArray: Array.isArray(events),
      length: events?.length,
    });

    if (events === undefined) {
      setConnectionStatus("Loading... (query undefined)");
    } else if (events === null) {
      setConnectionStatus("Query returned null");
    } else if (Array.isArray(events)) {
      setConnectionStatus(`Connected! Found ${events.length} events`);
    } else {
      setConnectionStatus(`Unexpected: ${typeof events}`);
    }
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Convex Connection Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg mb-4">
            Status: <span className="font-mono font-bold">{connectionStatus}</span>
          </p>
          <p className="text-sm text-gray-600">
            Convex URL: <span className="font-mono">{process.env.NEXT_PUBLIC_CONVEX_URL}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Query Result</h2>
          {events === undefined ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <span>Waiting for query to complete...</span>
            </div>
          ) : events === null ? (
            <p className="text-red-600">Query returned null</p>
          ) : Array.isArray(events) ? (
            <div>
              <p className="text-green-600 font-semibold mb-4">✅ Query successful!</p>
              <p className="mb-2">Found {events.length} events:</p>
              <ul className="list-disc list-inside space-y-1">
                {events.map((event: any) => (
                  <li key={event._id} className="text-sm">
                    {event.name} - {event.location?.city}, {event.location?.state}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-orange-600">Unexpected response type: {typeof events}</p>
          )}
        </div>

        <div className="bg-gray-800 text-gray-100 rounded-lg shadow p-6 mt-6 font-mono text-sm">
          <h2 className="text-lg font-semibold mb-3">Debug Info</h2>
          <p>Check browser console for detailed logs</p>
          <p className="mt-2">Server logs at terminal</p>
        </div>
      </div>
    </div>
  );
}
