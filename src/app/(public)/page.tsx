import { Hero } from "@/components/public/Hero";
import { ProcessSteps } from "@/components/public/ProcessSteps";
import { Benefits } from "@/components/public/Benefits";
import { FAQ } from "@/components/public/FAQ";
import { DisclaimerSection } from "@/components/public/DisclaimerSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProcessSteps />
      <Benefits />
      <DisclaimerSection />
      <FAQ />
    </>
  );
}
