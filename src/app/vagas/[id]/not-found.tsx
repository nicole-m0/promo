import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-bold text-slate-950">Vaga não encontrada</h1>
        <p className="mt-3 text-slate-600">Esta vaga não existe, foi encerrada ou ainda não foi publicada.</p>
        <Link className="mt-6 inline-flex font-semibold text-blue-700" href="/vagas">Ver vagas abertas →</Link>
      </main>
    </div>
  );
}
