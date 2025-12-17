import { Metadata } from "next";
import ClassesListClient from "./ClassesListClient";

export const metadata: Metadata = {
  title: "Classes | SteppersLife",
  description:
    "Browse stepping classes, workshops, and lessons. Find your next class on SteppersLife.com",
  openGraph: {
    title: "Classes | SteppersLife",
    description: "Browse stepping classes, workshops, and lessons",
    type: "website",
  },
};

export default function ClassesPage() {
  return <ClassesListClient />;
}
