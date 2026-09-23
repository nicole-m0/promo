import type { ReactNode } from "react";
import { Brand } from "@/components/brand";

export function AuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 sm:px-5">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Brand />
        <h1 className="mt-8 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-7">{children}</div>
        <p className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">{footer}</p>
      </section>
    </main>
  );
}
