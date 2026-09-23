"use client";

import { useActionState, useState } from "react";
import { signup } from "@/actions/auth";
import { FormAlert, SubmitButton, TextField } from "@/components/forms/fields";
import type { AccountType } from "@/lib/validation/auth";

const accountOptions: { value: AccountType; title: string; text: string }[] = [
  { value: "CANDIDATE", title: "Candidato", text: "Quero encontrar oportunidades de trabalho." },
  { value: "EMPLOYER", title: "Contratante", text: "Quero divulgar vagas e encontrar profissionais." },
];

export function SignupForm({ initialAccountType }: { initialAccountType: AccountType }) {
  const [state, action, pending] = useActionState(signup, undefined);
  const [accountType, setAccountType] = useState(initialAccountType);
  const errors = state?.errors;

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormAlert message={state?.message} />
      <fieldset>
        <legend className="text-sm font-medium text-slate-800">Tipo de conta</legend>
        <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
          {accountOptions.map((option) => (
            <label className="cursor-pointer rounded-xl border border-slate-300 p-4 transition has-checked:border-blue-600 has-checked:bg-blue-50 has-checked:ring-2 has-checked:ring-blue-100 has-focus-visible:ring-2 has-focus-visible:ring-blue-300" key={option.value}>
              {/* Não controlado: o React reseta o formulário após cada envio e restauraria o defaultChecked da montagem. */}
              <input className="sr-only" defaultChecked={(state?.values?.accountType ?? initialAccountType) === option.value} name="accountType" onChange={() => setAccountType(option.value)} type="radio" value={option.value} />
              <span className="block font-semibold text-slate-900">{option.title}</span>
              <span className="mt-1 block text-sm text-slate-600">{option.text}</span>
            </label>
          ))}
        </div>
        {errors?.accountType?.[0] && <p className="mt-1.5 text-sm text-red-600">{errors.accountType[0]}</p>}
      </fieldset>
      <TextField autoComplete={accountType === "EMPLOYER" ? "organization" : "name"} defaultValue={state?.values?.name} error={errors?.name} label={accountType === "EMPLOYER" ? "Nome da empresa" : "Nome completo"} name="name" required />
      <TextField autoComplete="email" defaultValue={state?.values?.email} error={errors?.email} inputMode="email" label="E-mail" name="email" required type="email" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField autoComplete="new-password" error={errors?.password} hint="Mínimo de 8 caracteres, com letras e números." label="Senha" name="password" required type="password" />
        <TextField autoComplete="new-password" error={errors?.confirmPassword} label="Confirme a senha" name="confirmPassword" required type="password" />
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input aria-invalid={errors?.acceptTerms ? true : undefined} className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600" defaultChecked={state?.values?.acceptTerms === "on"} name="acceptTerms" required type="checkbox" />
          <span>Li e aceito os Termos de Uso e a Política de Privacidade da Promo Oeiras, incluindo o tratamento dos meus dados conforme a LGPD.</span>
        </label>
        {errors?.acceptTerms?.[0] && <p className="mt-1.5 text-sm text-red-600">{errors.acceptTerms[0]}</p>}
      </div>
      <SubmitButton pending={pending} pendingLabel="Criando conta...">Criar conta</SubmitButton>
    </form>
  );
}
