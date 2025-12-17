import { Metadata } from "next";
import RestaurantsListClient from "./RestaurantsListClient";

export const metadata: Metadata = {
  title: "Restaurants | SteppersLife",
  description: "Order food for pickup from local restaurants on SteppersLife",
  openGraph: {
    title: "Restaurants | SteppersLife",
    description: "Order food for pickup from local restaurants",
    type: "website",
  },
};

export default function RestaurantsPage() {
  return <RestaurantsListClient />;
}
