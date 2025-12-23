import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jwtVerify } from "jose";
import { getJwtSecretEncoded } from "@/lib/auth/jwt-secret";

const JWT_SECRET = getJwtSecretEncoded();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Verify user is authenticated and is an admin or organizer
 */
async function verifyAuth(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  const token = request.cookies.get("session_token")?.value || request.cookies.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    // Allow admin and organizer roles to use AI extraction
    if (role !== "admin" && role !== "organizer") return null;
    return { userId: payload.userId as string, role };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - admin/organizer only
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized - Admin or organizer access required" },
        { status: 401 }
      );
    }

    const { filepath, imageBase64, mimeType } = await request.json();

    if (!filepath && !imageBase64) {
      return NextResponse.json(
        { error: "No filepath or imageBase64 provided" },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "Gemini API not configured",
          details: "GEMINI_API_KEY environment variable is not set",
        },
        { status: 503 }
      );
    }

    // Get the image data
    let base64Image: string;
    let imageMimeType: string = mimeType || "image/jpeg";

    if (imageBase64) {
      // Image provided directly as base64
      base64Image = imageBase64;
    } else {
      // Fetch image from filepath URL
      const imageUrl = filepath.startsWith("http")
        ? filepath
        : `${process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com"}${filepath}`;

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(imageBuffer).toString("base64");

        // Determine MIME type from response or URL
        const contentType = imageResponse.headers.get("content-type");
        if (contentType) {
          imageMimeType = contentType.split(";")[0].trim();
        } else if (filepath.toLowerCase().endsWith(".png")) {
          imageMimeType = "image/png";
        } else if (filepath.toLowerCase().endsWith(".webp")) {
          imageMimeType = "image/webp";
        }
      } catch (fetchError) {
        console.error("[Gemini] Failed to fetch image:", fetchError);
        return NextResponse.json(
          {
            error: "Failed to fetch flyer image",
            details: fetchError instanceof Error ? fetchError.message : "Unknown error",
          },
          { status: 400 }
        );
      }
    }

    // Use Gemini 1.5 Flash for faster extraction (or Pro for better accuracy)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Same comprehensive extraction prompt as Ollama
    const prompt = `EXPERT EVENT FLYER EXTRACTION PROMPT - TWO-PHASE EXTRACTION

You are an expert at extracting event information from party flyers, club flyers, and promotional event materials.

Your task: Extract ALL text from this flyer using a TWO-PHASE APPROACH and return it as clean, structured JSON.

═══════════════════════════════════════════════════════════════════
🚨 CRITICAL: SAVE THE DATE FLYERS - DATE IS MANDATORY
═══════════════════════════════════════════════════════════════════

⚠️ **IF THIS IS A "SAVE THE DATE" FLYER:**

The DATE is the ABSOLUTE MOST CRITICAL piece of information. You MUST find it.

**How to identify Save the Date flyers:**
- Contains text: "save the date", "save-the-date", "STD"
- Contains: "details to follow", "coming soon", "more info coming"
- Has event name and date but missing venue/time details

**FOR SAVE THE DATE FLYERS - DATE EXTRACTION RULES:**

1. **THE DATE IS MANDATORY - YOU MUST FIND IT**
   - Search the ENTIRE flyer for date information
   - Look EVERYWHERE: top, bottom, center, corners, sides, watermarks, background
   - Check ALL text sizes: large headlines, small print, decorative text
   - Look for ANY date format: "January 8-11", "Jan 8", "1/8/26", "January 2026"

2. **For Save the Date flyers:**
   - Description field: MUST include "Save the Date" and the DATE
   - eventName: Required
   - **eventDate: ABSOLUTELY REQUIRED - THIS IS THE MOST IMPORTANT FIELD**
   - venueName: Can be null (details to follow)
   - eventTime: Can be null (details to follow)
   - city/state: Extract if shown, null if not
   - containsSaveTheDateText: Must be true
   - eventType: Must be "SAVE_THE_DATE"

═══════════════════════════════════════════════════════════════════
🎯 TWO-PHASE EXTRACTION STRATEGY
═══════════════════════════════════════════════════════════════════

**PHASE 1: COMPLETE TEXT EXTRACTION WITH FORMATTING (MOST IMPORTANT)**
First, you MUST extract 100% of ALL visible text from the entire flyer image.
This goes in the "description" field and is the foundation for Phase 2.

Read the ENTIRE flyer carefully and capture:
- Main event title/headline
- All dates and times mentioned anywhere (including END time if shown)
- Venue name and address details
- ALL performer names, DJ names, special guests
- **TICKET PRICING INFORMATION** (very important - include all ticket types, prices, and details)
- Contact information (phone, email, social media)
- Age restrictions, dress codes, parking info
- Sponsors, hosts, organizers
- Fine print, disclaimers, legal text
- Any other visible text (don't skip anything!)

🚫 **CRITICAL EXCLUSION - DO NOT INCLUDE DESIGNER INFORMATION IN DESCRIPTION:**
- **COMPLETELY EXCLUDE** any text about graphic design, flyer design, or designer credits
- **DO NOT include** phrases like:
  * "Design by [name]"
  * "Designed by [name]"
  * "Graphic design by [name]"
  * "Graphics by [name]"
  * "Flyer by [name]"

**CRITICAL JSON FORMATTING:**
- In the JSON output, use the escape sequence \\n (backslash-n) for line breaks
- DO NOT use actual/literal newlines in the JSON string - this breaks JSON parsing
- Example CORRECT: "description": "Paragraph 1\\n\\nParagraph 2\\n\\nParagraph 3"

**PHASE 2: STRUCTURED FIELD EXTRACTION**
After Phase 1 is complete, use the description text you extracted to fill out the structured fields below (eventName, eventDate, eventTime, venueName, etc.).

═══════════════════════════════════════════════════════════════════
🚨 CRITICAL MANDATORY FIELDS (CANNOT BE NULL)
═══════════════════════════════════════════════════════════════════

1. DESCRIPTION (description) - **PHASE 1: EXTRACT FIRST WITH FORMATTING**
   - This is the FIRST and MOST IMPORTANT field
   - Extract 100% of ALL visible text from the entire flyer
   - **MUST be formatted with proper structure using line breaks (\\n\\n between sections)**
   - Use double line breaks (\\n\\n) between major sections
   - Use single line breaks (\\n) within sections for lists
   - Make this VERY comprehensive and detailed

2. EVENT NAME (eventName) - **PHASE 2: From description**
   - The main title, theme, or name of the event
   - This is usually the largest or most prominent text

3. EVENT DATE (eventDate) - **PHASE 2: From description** ⚠️ CRITICAL FIELD
   - Extract the date EXACTLY as it appears on the flyer - DO NOT REFORMAT
   - Examples: "March 12-15, 2026", "Saturday, November 25, 2025"

4. EVENT TIME (eventTime) - **PHASE 2: From description**
   - Extract and format the start time as: "H:MM PM" or "H:MM AM"
   - Example: "7:00 PM", "9:00 PM"

5. VENUE NAME (venueName) - **PHASE 2: From description**
   - The name of the location/club/venue

6. CITY (city) - **PHASE 2: From description**
   - Extract the city name

7. STATE (state) - **PHASE 2: From description**
   - Extract state as 2-letter abbreviation if shown (GA, IL, CA, FL, NY)

═══════════════════════════════════════════════════════════════════
📋 ADDITIONAL FIELDS (Extract if present, null if not)
═══════════════════════════════════════════════════════════════════

8. EVENT END DATE (eventEndDate) - Only for multi-day events
9. EVENT END TIME (eventEndTime) - If the flyer shows when the event ENDS
10. FULL ADDRESS (address) - Include street number AND street name
11. ZIP CODE (zipCode) - Extract if visible
12. TIMEZONE (eventTimezone) - ONLY if explicitly mentioned: "EST", "PST", "CST"
13. HOST/ORGANIZER (hostOrganizer) - Person or organization hosting
14. TICKET PRICES (ticketPrices) - Leave as empty array [], pricing goes in description
15. AGE RESTRICTION (ageRestriction) - "21+", "18+", "All ages"
16. CONTACT INFORMATION (contacts) - Array of contacts with name, phone, email, socialMedia
17. SPECIAL NOTES (specialNotes) - Important notes not in other fields
18. SAVE THE DATE CHECK (containsSaveTheDateText) - Boolean: true or false
19. EVENT TYPE (eventType) - "FREE_EVENT", "TICKETED_EVENT", or "SAVE_THE_DATE"
20. EVENT CATEGORIES (categories) - Array: "Set", "Workshop", "Cruise", "Holiday Event", "Weekend Event"

═══════════════════════════════════════════════════════════════════
📤 JSON OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

Return this EXACT structure with DESCRIPTION FIRST:

{
  "description": "string (REQUIRED - PHASE 1: ALL text from flyer, very comprehensive)",
  "eventName": "string (REQUIRED - PHASE 2: From description)",
  "eventDate": "string (REQUIRED - PHASE 2: From description, EXACT text as shown on flyer)",
  "eventEndDate": "string or null (PHASE 2: From description)",
  "eventTime": "string (REQUIRED - PHASE 2: From description, formatted as 'H:MM PM/AM')",
  "eventEndTime": "string or null (PHASE 2: From description)",
  "eventTimezone": "string or null (PHASE 2: From description)",
  "venueName": "string (REQUIRED - PHASE 2: From description)",
  "address": "string or null (PHASE 2: From description)",
  "city": "string (REQUIRED - PHASE 2: From description)",
  "state": "string (REQUIRED - PHASE 2: From description)",
  "zipCode": "string or null (PHASE 2: From description)",
  "hostOrganizer": "string or null (PHASE 2: From description)",
  "contacts": [
    {
      "name": "string",
      "phoneNumber": "string or null",
      "email": "string or null",
      "role": "string or null",
      "socialMedia": {
        "instagram": "string (ONLY if found)",
        "facebook": "string (ONLY if found)",
        "twitter": "string (ONLY if found)",
        "tiktok": "string (ONLY if found)"
      }
    }
  ],
  "ticketPrices": [],
  "ageRestriction": "string or null (PHASE 2: From description)",
  "specialNotes": "string or null (PHASE 2: From description)",
  "containsSaveTheDateText": boolean,
  "eventType": "FREE_EVENT or TICKETED_EVENT or SAVE_THE_DATE",
  "categories": ["array of applicable categories"]
}

CRITICAL RULES:
✅ Return ONLY valid JSON - no markdown, no code blocks, no explanations
✅ Use null for missing fields (not empty strings, not "N/A")
✅ Empty arrays [] for contacts/categories if none found
✅ Use \\n for line breaks in description, NOT actual newlines

BEGIN TWO-PHASE EXTRACTION NOW.`;

    // Call Gemini API with the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: imageMimeType,
        },
      },
    ]);

    const response = await result.response;
    const extractedText = response.text();

    if (!extractedText) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    let extractedData: any;
    let cleanedText = extractedText.trim();

    try {
      // Remove markdown code blocks if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
      }

      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }

      cleanedText = cleanedText.trim();

      // Try to parse the JSON
      extractedData = JSON.parse(cleanedText);

      // Check if AI returned an error response
      if (extractedData.error === "EXTRACTION_FAILED") {
        console.error("[Gemini] AI EXTRACTION FAILED:", extractedData.message);
        const partialData = extractedData.partialData || {};

        const isSaveTheDate =
          partialData.containsSaveTheDateText === true ||
          partialData.eventType === "SAVE_THE_DATE";

        if (isSaveTheDate && partialData.eventName && partialData.eventDate) {
          return NextResponse.json({
            success: true,
            extractedData: partialData,
            provider: "gemini-1.5-flash",
            warning: "Save the Date flyer - missing venue/time details (expected)",
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: "INCOMPLETE_FLYER_DATA",
            message:
              extractedData.message ||
              "The flyer is missing required information.",
            partialData: partialData,
          },
          { status: 400 }
        );
      }

      // Validate required fields
      const isSaveTheDate =
        extractedData.containsSaveTheDateText === true ||
        extractedData.eventType === "SAVE_THE_DATE" ||
        (extractedData.description &&
          extractedData.description.toLowerCase().includes("save the date"));

      const requiredFields = isSaveTheDate
        ? ["description", "eventName", "eventDate"]
        : ["description", "eventName", "eventDate", "eventTime", "venueName", "city", "state"];

      const missingFields = requiredFields.filter((field) => !extractedData[field]);

      if (missingFields.length > 0) {
        console.error("[Gemini] MISSING REQUIRED FIELDS:", missingFields);

        // Return partial data with warning
        return NextResponse.json(
          {
            success: false,
            error: "INCOMPLETE_FLYER_DATA",
            message: `Missing required fields: ${missingFields.join(", ")}`,
            partialData: extractedData,
          },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("[Gemini] FAILED TO PARSE RESPONSE");
      console.error(
        "Parse error:",
        parseError instanceof Error ? parseError.message : String(parseError)
      );
      console.error("Raw response (first 500 chars):", cleanedText.substring(0, 500));

      return NextResponse.json(
        {
          error: "Failed to parse Gemini response as JSON",
          details: parseError instanceof Error ? parseError.message : "Unknown parse error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extractedData,
      provider: "gemini-1.5-flash",
    });
  } catch (error) {
    console.error("[Gemini] AI extraction error:", error);

    // Check for specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "Gemini API key invalid or expired",
            details: error.message,
          },
          { status: 401 }
        );
      }
      if (error.message.includes("quota") || error.message.includes("rate")) {
        return NextResponse.json(
          {
            error: "Gemini API rate limit exceeded",
            details: error.message,
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to extract flyer data with Gemini",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
