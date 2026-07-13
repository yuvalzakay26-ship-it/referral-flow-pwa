import { cn } from "@/lib/utils";
import { Slot } from "./Slot";

type Variant = "gradient" | "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  gradient: "btn-gradient font-semibold",
  solid:
    "bg-[var(--rf-surface-2)] text-[var(--rf-text)] border border-white/10 hover:bg-[var(--rf-surface-2)]/70",
  outline:
    "border border-white/15 text-[var(--rf-text)] hover:bg-white/5 hover:border-white/25",
  ghost: "text-[var(--rf-text)] hover:bg-white/5",
  danger:
    "bg-[var(--rf-danger)]/15 text-red-300 border border-red-400/30 hover:bg-[var(--rf-danger)]/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-7 text-base gap-2.5 rounded-2xl",
};

export function Button({
  variant = "solid",
  size = "md",
  asChild = false,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
