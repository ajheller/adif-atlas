import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADIF Log Workshop — ADIF Atlas",
  description:
    "Merge, filter, deduplicate, clean, and export amateur-radio ADIF logs entirely in your browser.",
};

export default function WorkshopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
