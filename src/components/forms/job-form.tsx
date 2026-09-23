"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { JobFormState } from "@/actions/jobs";
import { CheckboxField, FormAlert, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import type { JobField } from "@/lib/job-options";
import { BRAZILIAN_STATES, EMPLOYMENT_TYPES, WORK_MODES, workModeLabels } from "@/lib/profile-options";

type Props = {
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  initial: Record<JobField, string>;
  submitLabel: string;
  cancelHref: string;
};

export function JobForm({ action: submit, initial, submitLabel, cancelHref }: Props) {
  const [state, action, pending] = useActionState(submit, undefined);
  const value = (name: JobField) => state?.values?.[name] ?? initial[name];
  const field = (name: JobField) => ({ name, defaultValue: value(name), error: state?.errors?.[name] });
  const check = (name: JobField) => ({ name, defaultChecked: value(name) === "on", error: state?.errors?.[name] });
  const hasErrors = Boolean(state?.errors && Object.keys(state.errors).length);

  return (
    <form action={action} className="space-y-8" noValidate>
      <FormAlert message={state?.message ?? (hasErrors ? "Revise os campos destacados abaixo." : undefined)} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Informações da vaga</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField {...field("title")} className="sm:col-span-2" label="Título / função" placeholder="Ex.: Atendente de loja" required />
          <TextField {...field("area")} label="Área" placeholder="Ex.: Comércio, Administração" />
          <SelectField {...field("employmentType")} label="Tipo de contratação" options={EMPLOYMENT_TYPES} required />
          <TextAreaField {...field("summary")} className="sm:col-span-2" hint="Uma ou duas frases que aparecem na listagem de vagas." label="Resumo da vaga" maxLength={500} rows={3} />
          <SelectField {...field("workMode")} label="Modalidade" options={WORK_MODES.map((mode) => ({ value: mode, label: workModeLabels[mode] }))} required />
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <TextField {...field("city")} hint="Opcional para vagas remotas." label="Cidade" placeholder="Oeiras" />
            <SelectField {...field("state")} label="UF" options={BRAZILIAN_STATES} placeholder="--" />
          </div>
          <TextField {...field("salaryMin")} inputMode="decimal" label="Salário mínimo (R$)" placeholder="1.800,00" />
          <TextField {...field("salaryMax")} inputMode="decimal" label="Salário máximo (R$)" placeholder="2.500,00" />
          <div className="space-y-3 sm:col-span-2">
            <CheckboxField {...check("salaryNegotiable")} label="Salário a combinar" />
            <CheckboxField {...check("salaryHidden")} label="Não exibir o salário no anúncio" />
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Descrição</h2>
        <div className="mt-5 grid gap-5">
          <TextAreaField {...field("description")} hint="Apresente a vaga e o dia a dia da função (mínimo de 30 caracteres)." label="Descrição da vaga" maxLength={5000} required />
          <TextAreaField {...field("responsibilities")} label="Responsabilidades" maxLength={3000} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextAreaField {...field("requiredSkills")} label="Requisitos obrigatórios" maxLength={3000} />
            <TextAreaField {...field("desiredSkills")} label="Requisitos desejáveis" maxLength={3000} />
          </div>
          <TextAreaField {...field("benefits")} label="Benefícios" maxLength={2000} />
          <TextField {...field("workSchedule")} label="Horário / escala" placeholder="Ex.: Segunda a sexta, 8h às 18h" />
          <TextAreaField {...field("additionalInformation")} label="Informações adicionais" maxLength={2000} rows={3} />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Publicação</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField {...field("applicationDeadline")} hint="Opcional. As inscrições encerram no fim do dia." label="Prazo para candidatura" type="date" />
          <TextField {...field("maxApplications")} hint="Opcional." inputMode="numeric" label="Limite de candidaturas" min={1} type="number" />
        </div>
        <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">A vaga será analisada pela equipe Promo Oeiras antes de ser publicada. Alterações em vagas já publicadas também passam por nova análise.</p>
      </section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Link className="rounded-lg px-4 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-100" href={cancelHref}>Cancelar</Link>
        <SubmitButton pending={pending} pendingLabel="Enviando...">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
