"use client";

import { useActionState } from "react";
import { updateCompanyProfile } from "@/actions/profile";
import { FormAlert, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import { BRAZILIAN_STATES, COMPANY_PROFILE_FIELDS, COMPANY_SIZES } from "@/lib/profile-options";

type Values = Record<(typeof COMPANY_PROFILE_FIELDS)[number], string>;

export function CompanyProfileForm({ initial }: { initial: Values }) {
  const [state, action, pending] = useActionState(updateCompanyProfile, undefined);
  const value = (name: keyof Values) => state?.values?.[name] ?? initial[name];
  const field = (name: keyof Values) => ({ name, defaultValue: value(name), error: state?.errors?.[name] });

  return (
    <form action={action} className="space-y-8" noValidate>
      <FormAlert message={state?.message} success={state?.success} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Sobre a empresa</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField {...field("name")} autoComplete="organization" className="sm:col-span-2" label="Nome da empresa" required />
          <TextField {...field("industry")} label="Segmento" placeholder="Ex.: Comércio varejista" />
          <SelectField {...field("companySize")} label="Porte" options={COMPANY_SIZES} />
          <TextAreaField {...field("description")} className="sm:col-span-2" hint="Apresente a empresa para os candidatos." label="Descrição" maxLength={3000} />
          <div className="grid grid-cols-[1fr_7rem] gap-3 sm:col-span-2">
            <TextField {...field("city")} label="Cidade" placeholder="Oeiras" />
            <SelectField {...field("state")} label="UF" options={BRAZILIAN_STATES} placeholder="--" />
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Contato</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField {...field("contactEmail")} inputMode="email" label="E-mail de contato" type="email" />
          <TextField {...field("contactPhone")} inputMode="tel" label="Telefone de contato" placeholder="(89) 99999-9999" type="tel" />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Presença online</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <TextField {...field("website")} inputMode="url" label="Site" placeholder="empresa.com.br" />
          <TextField {...field("linkedInUrl")} inputMode="url" label="LinkedIn" placeholder="linkedin.com/company/..." />
          <TextField {...field("instagramUrl")} inputMode="url" label="Instagram" placeholder="instagram.com/..." />
        </div>
      </section>
      <SubmitButton pending={pending} pendingLabel="Salvando...">Salvar dados da empresa</SubmitButton>
    </form>
  );
}
