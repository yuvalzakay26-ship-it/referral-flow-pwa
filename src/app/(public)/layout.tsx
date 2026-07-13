import { PublicNav } from "@/components/public/PublicNav";
import { Footer } from "@/components/public/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AnimatedBackground />
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
