import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "elevated" | "gradient";
}

export function Card({
  variant = "glass",
  className,
  ...props
}: CardProps) {
  const base =
    variant === "gradient"
      ? "gradient-border"
      : variant === "elevated"
        ? "glass-elevated"
        : "glass";
  return (
    <div
      className={cn(
        base,
        "rounded-[var(--rf-radius)] p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-bold text-[var(--rf-text)]", className)}
      {...props}
    />
  );
}
