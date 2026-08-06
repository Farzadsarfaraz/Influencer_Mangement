import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { listBrands } from "@/lib/data/brands";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage(props: PageProps<"/agency/brands">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const { brands, pageCount } = await listBrands({ query: q, page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Brands</h1>
        <Button asChild>
          <Link href="/agency/brands/new">
            <Plus /> New brand
          </Link>
        </Button>
      </div>

      <SearchForm defaultValue={q} placeholder="Search brands…" />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/agency/brands/${brand.id}`}
                    className="hover:underline"
                  >
                    {brand.name}
                  </Link>
                </TableCell>
                <TableCell>{brand.industry ?? "—"}</TableCell>
                <TableCell>{brand._count.campaigns}</TableCell>
                <TableCell>{brand._count.members}</TableCell>
                <TableCell>
                  <Badge variant={brand.status === "ACTIVE" ? "default" : "secondary"}>
                    {brand.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/agency/brands" searchParams={{ q }} />
    </div>
  );
}
