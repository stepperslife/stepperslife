import { Metadata } from "next";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";
import ClassDetailClient from "./ClassDetailClient";

interface PageProps {
  params: Promise<{ classId: string }>;
}

// Fetch class data directly from Convex HTTP API for metadata
async function getClassData(classId: string) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }

    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "public/queries:getPublicClassDetails",
        args: { classId },
        format: "json",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error("Error fetching class data:", error);
    return null;
  }
}

function formatClassDate(timestamp: number, timezone?: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone || "America/New_York",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { classId } = await params;

  if (!classId) {
    return {
      title: "Class | SteppersLife",
      description: "Discover stepping classes at SteppersLife.com",
    };
  }

  const classDetails = await getClassData(classId);

  if (!classDetails) {
    return {
      title: "Class Not Found | SteppersLife",
      description: "This class doesn't exist or is no longer available.",
    };
  }

  // Format class date for description
  const classDateStr = classDetails.startDate
    ? formatClassDate(classDetails.startDate, classDetails.timezone)
    : "";

  const description = `${classDetails.name}${classDateStr ? " - " + classDateStr : ""}. Find stepping classes on SteppersLife.com`;

  // Use OG image if available
  const imageUrl = classDetails.imageUrl || "https://events.stepperslife.com/og-default.png";

  // Get the class URL
  const classUrl = `https://events.stepperslife.com/classes/${classId}`;

  return {
    title: `${classDetails.name} | SteppersLife Classes`,
    description: description,

    openGraph: {
      type: "website",
      url: classUrl,
      title: classDetails.name,
      description: description,
      siteName: "SteppersLife",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: classDetails.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: classDetails.name,
      description: description,
      images: [imageUrl],
    },

    keywords: [
      "stepping classes",
      "dance classes",
      "steppers",
      classDetails.name,
      ...(classDetails.categories || []),
      ...(classDetails.location ? [classDetails.location.city, classDetails.location.state] : []),
    ],
  };
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { classId } = await params;

  // Check if class exists - if not, return 404
  const classDetails = await getClassData(classId);
  if (!classDetails) {
    notFound();
  }

  const typedClassId = classId as Id<"events">;

  return <ClassDetailClient classId={typedClassId} />;
}
