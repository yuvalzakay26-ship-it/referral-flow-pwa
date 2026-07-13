import { cloneElement, isValidElement } from "react";
import type { ReactElement, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal Slot: merges the given props (notably className) into a single child
 * element, enabling an `asChild` pattern for Button/Link composition without
 * pulling in Radix.
 */
export function Slot({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!isValidElement(children)) return null;
  const child = children as ReactElement<{ className?: string }>;
  return cloneElement(child, {
    ...props,
    className: cn(className, child.props.className),
  } as Partial<{ className?: string }>);
}
