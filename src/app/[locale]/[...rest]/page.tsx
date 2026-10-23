import { notFound } from "next/navigation";

// Unknown URLs render the localized 404 inside the site layout.
export default function CatchAll() {
  notFound();
}
