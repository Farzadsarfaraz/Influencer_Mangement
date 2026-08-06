import type { Metadata } from "next";

import { GeneralSettingsForm } from "@/components/agency/general-settings-form";
import { getGeneralSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getGeneralSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <GeneralSettingsForm settings={settings} />
    </div>
  );
}
