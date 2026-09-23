"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-3xl font-bold text-slate-950">Não foi possível carregar as vagas</h1>
      <p className="mt-3 text-slate-600">Tente novamente em instantes.</p>
      <div className="mt-6 flex gap-4">
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700" onClick={reset} type="button">Tentar novamente</button>
        <Link className="rounded-lg px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
