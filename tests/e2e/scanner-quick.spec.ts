import { test, expect } from "@playwright/test";

test.describe("Scanner Camera Permissions", () => {
  test("Staff scanner page allows camera", async ({ request }) => {
    const response = await request.get("https://stepperslife.com/staff/scan-tickets");
    const headers = response.headers();

    console.log("Staff scanner Permissions-Policy:", headers["permissions-policy"]);

    expect(headers["permissions-policy"]).toContain("camera=(self)");
    expect(response.status()).toBe(200);
  });

  test("Event scanner page allows camera", async ({ request }) => {
    const response = await request.get("https://stepperslife.com/scan/test-event");
    const headers = response.headers();

    console.log("Event scanner Permissions-Policy:", headers["permissions-policy"]);

    expect(headers["permissions-policy"]).toContain("camera=(self)");
    expect(response.status()).toBe(200);
  });

  test("Homepage blocks camera", async ({ request }) => {
    const response = await request.get("https://stepperslife.com/");
    const headers = response.headers();

    console.log("Homepage Permissions-Policy:", headers["permissions-policy"]);

    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(response.status()).toBe(200);
  });

  test("Events page blocks camera", async ({ request }) => {
    const response = await request.get("https://stepperslife.com/events");
    const headers = response.headers();

    console.log("Events page Permissions-Policy:", headers["permissions-policy"]);

    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(response.status()).toBe(200);
  });
});
