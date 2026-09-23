"use client";

import { useActionState } from "react";
import { updateCandidateProfile } from "@/actions/profile";
import { FormAlert, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import { BRAZILIAN_STATES, CANDIDATE_PROFILE_FIELDS, EMPLOYMENT_TYPES, WORK_MODES, workModeLabels } from "@/lib/profile-options";

type Values = Record<(typeof CANDIDATE_PROFILE_FIELDS)[number], string>;

export function CandidateProfileForm({ initial }: { initial: Values }) {
  const [state, action, pending] = useActionState(updateCandidateProfile, undefined);
  const value = (name: keyof Values) => state?.values?.[name] ?? initial[name];
  const field = (name: keyof Values) => ({ name, defaultValue: value(name), error: state?.errors?.[name] });

  return (
    <form action={action} className="space-y-8" noValidate>
      <FormAlert message={state?.message} success={state?.success} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Dados pessoais</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField {...field("fullName")} autoComplete="name" className="sm:col-span-2" label="Nome completo" required />
          <TextField {...field("phone")} autoComplete="tel" inputMode="tel" label="Telefone / WhatsApp" placeholder="(89) 99999-9999" type="tel" />
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <TextField {...field("city")} autoComplete="address-level2" label="Cidade" placeholder="Oeiras" />
            <SelectField {...field("state")} label="UF" options={BRAZILIAN_STATES} placeholder="--" />
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Perfil profissional</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField {...field("professionalTitle")} label="Cargo ou título profissional" placeholder="Ex.: Auxiliar administrativo" />
          <TextField {...field("professionalArea")} label="Área de atuação" placeholder="Ex.: Administração" />
          <TextAreaField {...field("professionalSummary")} className="sm:col-span-2" hint="Conte em poucas linhas sua experiência e seus objetivos." label="Resumo profissional" maxLength={2000} />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Preferências de trabalho</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField {...field("desiredWorkMode")} label="Modalidade desejada" options={WORK_MODES.map((mode) => ({ value: mode, label: workModeLabels[mode] }))} />
          <SelectField {...field("desiredEmploymentType")} label="Tipo de contratação" options={EMPLOYMENT_TYPES} />
          <TextField {...field("salaryExpectation")} hint="Valor mensal em reais. Opcional." inputMode="decimal" label="Pretensão salarial (R$)" placeholder="2.500,00" />
          <TextField {...field("availability")} label="Disponibilidade" placeholder="Ex.: Imediata" />
        </div>
      </section>
      <SubmitButton pending={pending} pendingLabel="Salvando...">Salvar perfil</SubmitButton>
    </form>
  );
}
