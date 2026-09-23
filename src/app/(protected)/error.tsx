"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="rounded-2xl border border-red-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-950">Algo deu errado</h1>
      <p className="mt-3 text-slate-600">Não foi possível carregar esta página agora. Tente novamente em instantes.</p>
      <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700" onClick={reset} type="button">Tentar novamente</button>
    </section>
  );
}
