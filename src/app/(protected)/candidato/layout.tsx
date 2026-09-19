import type { ReactNode } from "react"; import { UserRole } from "@prisma/client"; import { ProtectedShell } from "@/components/protected-shell";
export default function Layout({ children }: { children: ReactNode }) { return <ProtectedShell role={UserRole.CANDIDATE}>{children}</ProtectedShell>; }
