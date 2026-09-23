import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const control = "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100";

type Common = { label: string; name: string; id?: string; error?: string[]; hint?: ReactNode; className?: string };

function Wrapper({ label, name, id = name, error, hint, className, children }: Common & { children: ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-800" htmlFor={id}>{label}</label>
      {children}
      {error?.[0] ? <p className="mt-1.5 text-sm text-red-600" id={`${id}-error`}>{error[0]}</p> : hint ? <p className="mt-1.5 text-sm text-slate-500" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}

const a11y = (name: string, id: string = name, error?: string[], hint?: ReactNode) => ({ id, name, "aria-invalid": error?.length ? true : undefined, "aria-describedby": error?.length ? `${id}-error` : hint ? `${id}-hint` : undefined });

export function TextField({ label, name, id, error, hint, className, ...props }: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  return <Wrapper {...{ label, name, id, error, hint, className }}><input className={control} {...a11y(name, id, error, hint)} {...props} /></Wrapper>;
}

export function TextAreaField({ label, name, id, error, hint, className, ...props }: Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return <Wrapper {...{ label, name, id, error, hint, className }}><textarea className={`${control} min-h-32`} {...a11y(name, id, error, hint)} {...props} /></Wrapper>;
}

export function SelectField({ label, name, id, error, hint, className, options, placeholder = "Selecione", ...props }: Common & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> & { options: readonly (string | { value: string; label: string })[]; placeholder?: string }) {
  return (
    <Wrapper {...{ label, name, id, error, hint, className }}>
      {/* O React ignora mudanças de defaultValue em <select> após a montagem; a key força remontar para que o reset do formulário use o valor atual. */}
      <select className={control} key={String(props.defaultValue ?? "")} {...a11y(name, id, error, hint)} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => { const { value, label: text } = typeof option === "string" ? { value: option, label: option } : option; return <option key={value} value={value}>{text}</option>; })}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({ label, name, error, defaultChecked }: { label: ReactNode; name: string; error?: string[]; defaultChecked?: boolean }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input aria-invalid={error?.length ? true : undefined} className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600" defaultChecked={defaultChecked} id={name} name={name} type="checkbox" />
        <span>{label}</span>
      </label>
      {error?.[0] && <p className="mt-1.5 text-sm text-red-600">{error[0]}</p>}
    </div>
  );
}

export function FormAlert({ message, success }: { message?: string; success?: boolean }) {
  if (!message) return null;
  return <p className={`rounded-lg border px-4 py-3 text-sm ${success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`} role={success ? "status" : "alert"}>{message}</p>;
}

export function SubmitButton({ pending, children, pendingLabel = "Enviando..." }: { pending: boolean; children: ReactNode; pendingLabel?: string }) {
  return <button className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" disabled={pending} type="submit">{pending ? pendingLabel : children}</button>;
}
