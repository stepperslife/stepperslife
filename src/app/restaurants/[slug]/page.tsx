import { Metadata } from "next";
import RestaurantDetailClient from "./RestaurantDetailClient";
import { use } from "react";

export const metadata: Metadata = {
  title: "Restaurant | SteppersLife",
  description: "View menu and order food for pickup",
};

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <RestaurantDetailClient slug={slug} />;
}
