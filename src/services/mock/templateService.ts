import type { MessageTemplate, MessageTemplateKey } from "@/types";
import { store, delay } from "../store";
import { DEFAULT_TEMPLATES } from "@/config/messageTemplates";

export async function listTemplates(): Promise<MessageTemplate[]> {
  return delay([...store.templates]);
}

export async function updateTemplate(
  key: MessageTemplateKey,
  body: string,
): Promise<MessageTemplate | null> {
  const tpl = store.templates.find((t) => t.key === key);
  if (!tpl) return delay(null);
  tpl.body = body;
  return delay(tpl);
}

export async function resetTemplate(
  key: MessageTemplateKey,
): Promise<MessageTemplate | null> {
  const tpl = store.templates.find((t) => t.key === key);
  if (!tpl) return delay(null);
  tpl.body = DEFAULT_TEMPLATES[key].body;
  return delay(tpl);
}
