"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { FormAlert, SubmitButton, TextField } from "@/components/forms/fields";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormAlert message={state?.message} />
      {next && <input name="next" type="hidden" value={next} />}
      <TextField autoComplete="email" defaultValue={state?.values?.email} error={state?.errors?.email} inputMode="email" label="E-mail" name="email" required type="email" />
      <TextField autoComplete="current-password" error={state?.errors?.password} label="Senha" name="password" required type="password" />
      <SubmitButton pending={pending} pendingLabel="Entrando...">Entrar</SubmitButton>
    </form>
  );
}
