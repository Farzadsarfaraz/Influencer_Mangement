import { notFound } from "next/navigation";

import { BrandStatusToggle } from "@/components/agency/brand-status-toggle";
import { RemoveBrandMemberButton } from "@/components/agency/brand-member-row-actions";
import { InviteBrandMemberDialog } from "@/components/agency/invite-brand-member-dialog";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEntityActivity } from "@/lib/data/activity";
import { getBrandDetail } from "@/lib/data/brands";

export default async function BrandDetailPage(
  props: PageProps<"/agency/brands/[brandId]">,
) {
  const { brandId } = await props.params;
  const [brand, activity] = await Promise.all([
    getBrandDetail(brandId),
    getEntityActivity("Brand", brandId),
  ]);
  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold">{brand.name}</h1>
            <Badge
              variant={brand.status === "ACTIVE" ? "default" : "secondary"}
            >
              {brand.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {brand.industry ?? "No industry set"}
            {brand.website ? ` · ${brand.website}` : ""}
          </p>
        </div>
        <BrandStatusToggle brandId={brand.id} status={brand.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client contacts</CardTitle>
            <InviteBrandMemberDialog brandId={brand.id} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {brand.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={member.user.name}
                          image={member.user.image}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium">{member.user.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.user.status}</TableCell>
                    <TableCell>
                      <RemoveBrandMemberButton
                        brandId={brand.id}
                        userId={member.userId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {brand.members.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center"
                    >
                      No contacts yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brand.campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>{campaign.status}</TableCell>
                  </TableRow>
                ))}
                {brand.campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-muted-foreground text-center"
                    >
                      No campaigns yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ActivityTimeline events={activity} />
    </div>
  );
}
