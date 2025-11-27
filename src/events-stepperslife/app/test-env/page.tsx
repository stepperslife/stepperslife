"use client";

export default function TestEnvPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Environment Variable Test</h1>
      <p>NEXT_PUBLIC_CONVEX_URL: {convexUrl || "❌ NOT FOUND"}</p>
      <p>Type: {typeof convexUrl}</p>

      {convexUrl ? (
        <div style={{ background: "#d4edda", padding: "10px", margin: "10px 0" }}>
          ✅ Convex URL is available to client
        </div>
      ) : (
        <div style={{ background: "#f8d7da", padding: "10px", margin: "10px 0" }}>
          ❌ Convex URL is NOT available to client!
          <br />
          This means NEXT_PUBLIC_CONVEX_URL is not being passed to the browser.
        </div>
      )}
    </div>
  );
}
