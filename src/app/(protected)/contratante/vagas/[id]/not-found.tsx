import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <h1 className="text-3xl font-bold">Vaga não encontrada</h1>
      <p className="mt-3 text-slate-600">A vaga não existe ou não pertence à sua empresa.</p>
      <Link className="mt-6 inline-flex font-semibold text-blue-700" href="/contratante/vagas">← Minhas vagas</Link>
    </section>
  );
}
