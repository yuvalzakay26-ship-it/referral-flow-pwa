import "server-only";

import type { MessageTemplate, MessageTemplateKey } from "@/types";
import { requireOwner } from "@/lib/supabase/guard";
import { DEFAULT_TEMPLATES, TEMPLATE_LIST } from "@/config/messageTemplates";

/** Canonical display order (the order defined in config). */
const ORDER = TEMPLATE_LIST.map((t) => t.key);

/** Seed default templates once; never overwrites an already-edited body. */
async function ensureSeeded(
  supabase: Awaited<ReturnType<typeof requireOwner>>["supabase"],
): Promise<void> {
  const rows = TEMPLATE_LIST.map((t) => ({
    key: t.key,
    title: t.title,
    body: t.body,
  }));
  await supabase
    .from("message_templates")
    .upsert(rows, { onConflict: "key", ignoreDuplicates: true });
}

export async function listTemplates(): Promise<MessageTemplate[]> {
  const { supabase } = await requireOwner();
  await ensureSeeded(supabase);
  const { data, error } = await supabase
    .from("message_templates")
    .select("key, title, body");
  if (error) throw new Error("שגיאה בטעינת התבניות.");
  const list = (data ?? []) as unknown as MessageTemplate[];
  return list.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
}

export async function updateTemplate(
  key: MessageTemplateKey,
  body: string,
): Promise<MessageTemplate | null> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("message_templates")
    .update({ body })
    .eq("key", key)
    .select("key, title, body")
    .maybeSingle();
  if (error) throw new Error("שגיאה בעדכון התבנית.");
  return (data as unknown as MessageTemplate) ?? null;
}

export async function resetTemplate(
  key: MessageTemplateKey,
): Promise<MessageTemplate | null> {
  const { supabase } = await requireOwner();
  const fallback = DEFAULT_TEMPLATES[key];
  if (!fallback) return null;
  const { data, error } = await supabase
    .from("message_templates")
    .upsert(
      { key, title: fallback.title, body: fallback.body },
      { onConflict: "key" },
    )
    .select("key, title, body")
    .maybeSingle();
  if (error) throw new Error("שגיאה באיפוס התבנית.");
  return (data as unknown as MessageTemplate) ?? null;
}
