import { AdminShell } from "@/components/admin/AdminShell";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnimatedBackground />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
