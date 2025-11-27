import { Metadata } from "next";
import RestaurateurApplyClient from "./RestaurateurApplyClient";

export const metadata: Metadata = {
  title: "Add Your Restaurant | SteppersLife Restaurants",
  description: "Apply to join the SteppersLife restaurant network. Reach thousands of customers in the stepping community.",
};

export default function RestaurateurApplyPage() {
  return <RestaurateurApplyClient />;
}
