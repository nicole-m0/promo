import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main aria-busy="true" className="mx-auto max-w-6xl px-5 py-10">
        <p className="sr-only">Carregando vagas...</p>
        <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((item) => <div className="h-36 animate-pulse rounded-2xl bg-slate-200" key={item} />)}</div>
      </main>
    </div>
  );
}
