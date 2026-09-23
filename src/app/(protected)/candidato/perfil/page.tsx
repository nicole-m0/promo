import type { Metadata } from "next";
import { CandidateProfileForm } from "@/components/forms/candidate-profile-form";
import { requireRole } from "@/lib/auth/session";
import { getCandidateProfile } from "@/lib/profiles";
import { formatCentsForInput } from "@/lib/validation/form";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function Page() {
  const user = await requireRole("CANDIDATE");
  const profile = await getCandidateProfile(user.id);
  const initial = {
    fullName: profile?.fullName ?? "", phone: profile?.phone ?? "", city: profile?.city ?? "", state: profile?.state ?? "",
    professionalTitle: profile?.professionalTitle ?? "", professionalArea: profile?.professionalArea ?? "", professionalSummary: profile?.professionalSummary ?? "",
    salaryExpectation: formatCentsForInput(profile?.salaryExpectationCents), desiredWorkMode: profile?.desiredWorkMode ?? "",
    desiredEmploymentType: profile?.desiredEmploymentType ?? "", availability: profile?.availability ?? "",
  };
  return (
    <section>
      <p className="font-semibold text-blue-700">Meu perfil</p>
      <h1 className="mt-2 text-3xl font-bold">Seus dados profissionais</h1>
      <p className="mt-3 text-slate-600">Mantenha seu perfil atualizado para se candidatar às vagas com mais facilidade.</p>
      <div className="mt-8"><CandidateProfileForm initial={initial} /></div>
    </section>
  );
}
