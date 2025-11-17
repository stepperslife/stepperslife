"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TestEventsPage() {
  const events = useQuery(api.public.queries.getPublishedEvents, {});

  console.log("[TestEventsPage] Raw query result:", events);
  console.log("[TestEventsPage] Events count:", events?.length);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Debug: Test Events Query</h1>

      <div style={{ background: "#f0f0f0", padding: "10px", margin: "10px 0" }}>
        <strong>Query Status:</strong>
        <ul>
          <li>events === undefined: {String(events === undefined)}</li>
          <li>events === null: {String(events === null)}</li>
          <li>Array.isArray(events): {String(Array.isArray(events))}</li>
          <li>events?.length: {events?.length ?? "N/A"}</li>
        </ul>
      </div>

      {events === undefined && (
        <div style={{ background: "#fff3cd", padding: "10px", margin: "10px 0" }}>
          ⏳ Loading...
        </div>
      )}

      {events && events.length === 0 && (
        <div style={{ background: "#f8d7da", padding: "10px", margin: "10px 0" }}>
          ❌ Query returned empty array
        </div>
      )}

      {events && events.length > 0 && (
        <div style={{ background: "#d4edda", padding: "10px", margin: "10px 0" }}>
          ✅ Found {events.length} events!
          <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "400px" }}>
            {JSON.stringify(events, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
