import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[var(--rf-text)]"
      >
        {label}
        {required && <span className="mr-1 text-[var(--rf-magenta)]">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[var(--rf-text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  "w-full rounded-xl border border-white/10 bg-[var(--rf-surface-2)]/60 px-3.5 text-[var(--rf-text)] placeholder:text-[var(--rf-text-muted)]/60 transition-colors focus:border-[var(--rf-cyan)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--rf-cyan)]/20";

export const TextInput = function TextInput({
  className,
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <input
      ref={ref}
      className={cn(controlBase, "h-11", className)}
      {...props}
    />
  );
};

export const SelectInput = function SelectInput({
  className,
  children,
  ref,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  ref?: React.Ref<HTMLSelectElement>;
}) {
  return (
    <select
      ref={ref}
      className={cn(controlBase, "h-11 appearance-none", className)}
      {...props}
    >
      {children}
    </select>
  );
};

export const TextArea = function TextArea({
  className,
  ref,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: React.Ref<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      ref={ref}
      className={cn(controlBase, "min-h-24 py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
};
