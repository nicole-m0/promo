"use client";

import { useActionState } from "react";
import type { ModerationState } from "@/actions/moderation";
import { FormAlert, TextAreaField } from "@/components/forms/fields";

type Action = (state: ModerationState, formData: FormData) => Promise<ModerationState>;

export function ModerationActions({ jobId, approve, reject }: { jobId: string; approve: Action; reject: Action }) {
  const [approveState, approveAction, approving] = useActionState(approve, undefined);
  const [rejectState, rejectAction, rejecting] = useActionState(reject, undefined);
  const pending = approving || rejecting;
  const result = approveState?.message ? approveState : rejectState?.message ? rejectState : undefined;

  return (
    <div className="space-y-4">
      <FormAlert message={result?.message} success={result?.success} />
      <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
        <form action={approveAction}>
          <button className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60 lg:w-auto" disabled={pending} type="submit">{approving ? "Publicando..." : "Aprovar e publicar"}</button>
        </form>
        <details className="rounded-lg border border-slate-200 bg-white p-3" open={Boolean(rejectState?.errors)}>
          <summary className="cursor-pointer font-semibold text-red-700">Recusar vaga</summary>
          <form action={rejectAction} className="mt-3 space-y-3">
            <TextAreaField defaultValue={rejectState?.values?.reason} error={rejectState?.errors?.reason} hint="O contratante verá este motivo para ajustar a vaga." label="Motivo da recusa" maxLength={1000} id={`reason-${jobId}`} name="reason" rows={3} />
            <button className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60" disabled={pending} type="submit">{rejecting ? "Recusando..." : "Confirmar recusa"}</button>
          </form>
        </details>
      </div>
    </div>
  );
}
