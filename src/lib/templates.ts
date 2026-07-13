import type { Candidate } from "@/types";

export interface TemplateContext {
  name?: string;
  ref?: string;
  position?: string;
  field?: string;
}

/** Resolve {{placeholders}} in a template body against a context. */
export function resolveTemplate(body: string, ctx: TemplateContext): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = ctx[key as keyof TemplateContext];
    return value != null && value !== "" ? String(value) : `{{${key}}}`;
  });
}

/** Build a template context from a candidate record. */
export function contextFromCandidate(candidate: Candidate): TemplateContext {
  return {
    name: candidate.full_name.split(" ")[0] || candidate.full_name,
    ref: candidate.reference_number,
    position: candidate.referred_position ?? candidate.professional_field,
    field: candidate.professional_field,
  };
}
