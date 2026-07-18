"use server";

/** Message templates — server actions. Dispatches to Supabase or the mock store. */

import type { MessageTemplate, MessageTemplateKey } from "@/types";
import { USE_MOCK_DATA } from "@/config/app";
import * as mock from "./mock/templateService";
import * as supa from "./supabase/templateService";

const impl = USE_MOCK_DATA ? mock : supa;

export async function listTemplates(): Promise<MessageTemplate[]> {
  return impl.listTemplates();
}

export async function updateTemplate(
  key: MessageTemplateKey,
  body: string,
): Promise<MessageTemplate | null> {
  return impl.updateTemplate(key, body);
}

export async function resetTemplate(
  key: MessageTemplateKey,
): Promise<MessageTemplate | null> {
  return impl.resetTemplate(key);
}
