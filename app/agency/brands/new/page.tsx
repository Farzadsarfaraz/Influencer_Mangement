import type { Metadata } from "next";

import { BrandForm } from "@/components/agency/brand-form";

export const metadata: Metadata = { title: "New Brand" };

export default function NewBrandPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">New Brand</h1>
      <BrandForm />
    </div>
  );
}
