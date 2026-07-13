import type { Metadata } from "next";
import { ApplyForm } from "@/components/candidates/ApplyForm";
import { parseSource } from "@/config/sources";

export const metadata: Metadata = {
  title: "שליחת קורות חיים",
  description:
    "מילוי טופס ושליחת קורות חיים לבדיקת התאמה אפשרית דרך תוכנית הפניית עובדים.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  return <ApplyForm initialSource={parseSource(source)} />;
}
