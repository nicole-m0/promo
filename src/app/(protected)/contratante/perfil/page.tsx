import type { Metadata } from "next";
import { CompanyProfileForm } from "@/components/forms/company-profile-form";
import { requireRole } from "@/lib/auth/session";
import { getCompanyProfile } from "@/lib/profiles";

export const metadata: Metadata = { title: "Perfil da empresa" };

export default async function Page() {
  const user = await requireRole("EMPLOYER");
  const profile = await getCompanyProfile(user.id);
  const initial = {
    name: profile?.name ?? "", description: profile?.description ?? "", industry: profile?.industry ?? "", website: profile?.website ?? "",
    linkedInUrl: profile?.linkedInUrl ?? "", instagramUrl: profile?.instagramUrl ?? "", contactEmail: profile?.contactEmail ?? "",
    contactPhone: profile?.contactPhone ?? "", city: profile?.city ?? "", state: profile?.state ?? "", companySize: profile?.companySize ?? "",
  };
  return (
    <section>
      <p className="font-semibold text-blue-700">Perfil da empresa</p>
      <h1 className="mt-2 text-3xl font-bold">Dados da sua empresa</h1>
      <p className="mt-3 text-slate-600">Essas informações ajudam os candidatos a conhecer quem está contratando.</p>
      <div className="mt-8"><CompanyProfileForm initial={initial} /></div>
    </section>
  );
}
