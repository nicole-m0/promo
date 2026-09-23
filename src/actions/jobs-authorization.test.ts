import { beforeEach, describe, expect, it, vi } from "vitest";
import { JOB_FIELDS } from "@/lib/job-options";

// Banco em memória que aplica os mesmos filtros (dono via company.userId e status) que o Prisma aplicaria.
// A sessão e o requireRole são os reais: só cookies, banco e navegação do Next são simulados.
const mocks = vi.hoisted(() => {
  class Redirect extends Error { constructor(public url: string) { super(`REDIRECT ${url}`); } }
  type Job = { id: string; ownerUserId: string; companyId: string; status: string; [key: string]: unknown };
  const users = {
    candidate: { id: "candidate-1", email: "c@x.com", role: "CANDIDATE", status: "ACTIVE" },
    employer: { id: "employer-1", email: "e@x.com", role: "EMPLOYER", status: "ACTIVE" },
    otherEmployer: { id: "employer-2", email: "o@x.com", role: "EMPLOYER", status: "ACTIVE" },
    admin: { id: "admin-1", email: "a@x.com", role: "ADMIN", status: "ACTIVE" },
  };
  const state = { sessionUser: null as null | (typeof users)[keyof typeof users], jobs: [] as Job[] };
  const companies: Record<string, string> = { "employer-1": "company-1", "employer-2": "company-2" };

  type Where = { id?: string; status?: string | { in?: string[]; not?: string }; company?: { userId?: string } };
  const matches = (job: Job, where: Where) => {
    if (where.id !== undefined && job.id !== where.id) return false;
    if (where.company?.userId !== undefined && job.ownerUserId !== where.company.userId) return false;
    const status = where.status;
    if (typeof status === "string" && job.status !== status) return false;
    if (status && typeof status === "object" && ((status.in && !status.in.includes(job.status)) || (status.not && job.status === status.not))) return false;
    return true;
  };

  const db = {
    session: { findUnique: vi.fn(async () => state.sessionUser && { expiresAt: new Date(Date.now() + 60_000), user: state.sessionUser }) },
    companyProfile: { findUnique: vi.fn(async ({ where }: { where: { userId: string } }) => (companies[where.userId] ? { id: companies[where.userId] } : null)) },
    job: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: "new-job" , ...data })),
      findFirst: vi.fn(async ({ where }: { where: Where }) => state.jobs.find((job) => matches(job, where)) ?? null),
      updateMany: vi.fn(async ({ where, data }: { where: Where; data: Record<string, unknown> }) => {
        const targets = state.jobs.filter((job) => matches(job, where));
        targets.forEach((job) => Object.assign(job, data));
        return { count: targets.length };
      }),
    },
    adminAction: { create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: "action-1", ...data })) },
    $transaction: vi.fn(),
  };
  db.$transaction.mockImplementation(async (fn: (tx: typeof db) => unknown) => fn(db));
  return { Redirect, users, state, db };
});

vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => (mocks.state.sessionUser ? { value: "token" } : undefined), set: vi.fn(), delete: vi.fn() }) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new mocks.Redirect(url); }, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { closeJob, createJob, updateJob } = await import("@/actions/jobs");
const { approveJob, rejectJob } = await import("@/actions/moderation");

const { db, state, users } = mocks;
const loginAs = (user: (typeof users)[keyof typeof users] | null) => { state.sessionUser = user; };
const redirectOf = async (promise: Promise<unknown>) => { try { await promise; } catch (error) { if (error instanceof mocks.Redirect) return error.url; throw error; } return null; };

function jobForm(extra: Record<string, string> = {}) {
  const form = new FormData();
  for (const field of JOB_FIELDS) form.set(field, "");
  const values = { title: "Atendente de loja", workMode: "ON_SITE", employmentType: "CLT", city: "Oeiras", state: "PI", description: "Atendimento ao público, organização da loja e apoio ao caixa.", ...extra };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}
const writes = () => db.job.create.mock.calls.length + db.job.updateMany.mock.calls.length + db.adminAction.create.mock.calls.length;

beforeEach(() => {
  vi.clearAllMocks();
  loginAs(null);
  state.jobs = [
    { id: "job-own", ownerUserId: "employer-1", companyId: "company-1", status: "PUBLISHED" },
    { id: "job-other", ownerUserId: "employer-2", companyId: "company-2", status: "PUBLISHED" },
    { id: "job-closed", ownerUserId: "employer-1", companyId: "company-1", status: "CLOSED" },
    { id: "job-pending", ownerUserId: "employer-2", companyId: "company-2", status: "PENDING" },
  ];
});

describe("criar vaga", () => {
  it.each([["visitante", null, "/entrar"], ["candidato", users.candidate, "/acesso-negado"], ["admin", users.admin, "/acesso-negado"]] as const)("%s não consegue criar vaga", async (_label, user, destination) => {
    loginAs(user);
    expect(await redirectOf(createJob(undefined, jobForm()))).toBe(destination);
    expect(writes()).toBe(0);
  });

  it("contratante cria vaga PENDING vinculada à própria empresa, ignorando companyId/status do formulário", async () => {
    loginAs(users.employer);
    const url = await redirectOf(createJob(undefined, jobForm({ companyId: "company-2", status: "PUBLISHED", slug: "hack" })));
    expect(url).toBe("/contratante/vagas/new-job?aviso=criada");
    const data = db.job.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ companyId: "company-1", status: "PENDING" });
    expect(data.slug).not.toBe("hack");
    expect(db.companyProfile.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "employer-1" } }));
  });

  it("retorna erros de validação sem gravar", async () => {
    loginAs(users.employer);
    const state = await createJob(undefined, jobForm({ title: "", description: "curta" }));
    expect(state?.errors).toHaveProperty("title");
    expect(state?.errors).toHaveProperty("description");
    expect(writes()).toBe(0);
  });
});

describe("editar e encerrar vaga", () => {
  it("contratante não altera vaga de outra empresa", async () => {
    loginAs(users.employer);
    const result = await updateJob("job-other", undefined, jobForm({ title: "Vaga sequestrada" }));
    expect(result?.message).toBe("Vaga não encontrada.");
    expect(db.job.updateMany).not.toHaveBeenCalled();
    expect(state.jobs.find((job) => job.id === "job-other")).toMatchObject({ status: "PUBLISHED" });
    expect(state.jobs.find((job) => job.id === "job-other")).not.toHaveProperty("title");
  });

  it("edição da própria vaga publicada volta para PENDING e mantém a empresa", async () => {
    loginAs(users.employer);
    expect(await redirectOf(updateJob("job-own", undefined, jobForm({ title: "Novo título", companyId: "company-2" })))).toBe("/contratante/vagas/job-own?aviso=atualizada");
    expect(state.jobs.find((job) => job.id === "job-own")).toMatchObject({ title: "Novo título", status: "PENDING", companyId: "company-1" });
    expect(db.job.updateMany.mock.calls[0][0].where).toMatchObject({ id: "job-own", company: { userId: "employer-1" } });
  });

  it("vaga encerrada não pode ser editada", async () => {
    loginAs(users.employer);
    expect((await updateJob("job-closed", undefined, jobForm()))?.message).toBe("Vagas encerradas não podem ser editadas.");
    expect(db.job.updateMany).not.toHaveBeenCalled();
  });

  it("candidato não edita nem encerra vagas", async () => {
    loginAs(users.candidate);
    expect(await redirectOf(updateJob("job-own", undefined, jobForm()))).toBe("/acesso-negado");
    expect(await redirectOf(closeJob("job-own"))).toBe("/acesso-negado");
    expect(writes()).toBe(0);
  });

  it("contratante só encerra a própria vaga", async () => {
    loginAs(users.otherEmployer);
    expect(await redirectOf(closeJob("job-own"))).toBe("/contratante/vagas");
    expect(state.jobs.find((job) => job.id === "job-own")?.status).toBe("PUBLISHED");
    loginAs(users.employer);
    expect(await redirectOf(closeJob("job-own"))).toBe("/contratante/vagas/job-own?aviso=encerrada");
    expect(state.jobs.find((job) => job.id === "job-own")?.status).toBe("CLOSED");
  });
});

describe("moderação", () => {
  const reason = () => { const form = new FormData(); form.set("reason", "Faltam informações sobre a jornada."); return form; };

  it.each([["visitante", null, "/entrar"], ["candidato", users.candidate, "/acesso-negado"], ["contratante", users.employer, "/acesso-negado"]] as const)("%s não consegue moderar", async (_label, user, destination) => {
    loginAs(user);
    expect(await redirectOf(approveJob("job-pending"))).toBe(destination);
    expect(await redirectOf(rejectJob("job-pending", undefined, reason()))).toBe(destination);
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(state.jobs.find((job) => job.id === "job-pending")?.status).toBe("PENDING");
  });

  it("admin aprova vaga pendente e registra AdminAction", async () => {
    loginAs(users.admin);
    expect(await redirectOf(approveJob("job-pending"))).toBe("/admin/vagas?aviso=aprovada");
    expect(state.jobs.find((job) => job.id === "job-pending")).toMatchObject({ status: "PUBLISHED", publishedAt: expect.any(Date) });
    expect(db.adminAction.create).toHaveBeenCalledWith({ data: { actorId: "admin-1", action: "JOB_APPROVED", targetType: "JOB", targetId: "job-pending" } });
  });

  it("admin recusa com motivo registrado em AdminAction.metadata", async () => {
    loginAs(users.admin);
    expect(await redirectOf(rejectJob("job-pending", undefined, reason()))).toBe("/admin/vagas?aviso=recusada");
    expect(state.jobs.find((job) => job.id === "job-pending")?.status).toBe("REJECTED");
    expect(db.adminAction.create.mock.calls[0][0]).toMatchObject({ data: { action: "JOB_REJECTED", metadata: { reason: "Faltam informações sobre a jornada." } } });
  });

  it("recusa sem motivo retorna erro sem alterar a vaga", async () => {
    loginAs(users.admin);
    const result = await rejectJob("job-pending", undefined, new FormData());
    expect(result?.errors).toHaveProperty("reason");
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("não modera vaga que não está pendente e não registra ação", async () => {
    loginAs(users.admin);
    expect((await approveJob("job-closed"))?.message).toBe("Esta vaga não está mais pendente de análise.");
    expect(state.jobs.find((job) => job.id === "job-closed")?.status).toBe("CLOSED");
    expect(db.adminAction.create).not.toHaveBeenCalled();
  });
});
