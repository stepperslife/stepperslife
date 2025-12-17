import { Metadata } from "next";
import RestaurantDetailClient from "./RestaurantDetailClient";

export const metadata: Metadata = {
  title: "Restaurant | SteppersLife",
  description: "View menu and order food for pickup",
};

export default function RestaurantPage({ params }: { params: { slug: string } }) {
  return <RestaurantDetailClient slug={params.slug} />;
}
