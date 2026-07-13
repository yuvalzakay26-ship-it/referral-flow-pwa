import {
  Sparkles,
  Clock,
  AlertCircle,
  Copy,
  Send,
  Workflow,
  XCircle,
  CheckCircle2,
  Hourglass,
  BadgeCheck,
  Archive,
  Radio,
  Users,
  Share2,
  Briefcase,
  UserPlus,
  GraduationCap,
  Link as LinkIcon,
  MoreHorizontal,
  ShieldCheck,
  ShieldQuestion,
  ShieldAlert,
  type LucideIcon,
  HelpCircle,
} from "lucide-react";

/** Named icon registry so config files can reference icons by string. */
const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Clock,
  AlertCircle,
  Copy,
  Send,
  Workflow,
  XCircle,
  CheckCircle2,
  Hourglass,
  BadgeCheck,
  Archive,
  Radio,
  Users,
  Share2,
  Briefcase,
  UserPlus,
  GraduationCap,
  Link: LinkIcon,
  MoreHorizontal,
  ShieldCheck,
  ShieldQuestion,
  ShieldAlert,
};

export interface IconProps {
  name: string;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export function Icon({ name, className, size = 16 }: IconProps) {
  const Cmp = ICONS[name] ?? HelpCircle;
  return <Cmp className={className} size={size} aria-hidden />;
}
