import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ColumnHeaderProps {
  title: string;
  tooltip?: string;
}

/**
 * ColumnHeader - Displays a column title with an optional tooltip
 *
 * Usage:
 *   <ColumnHeader title="Amount" tooltip="Total billed amount in INR" />
 *   <ColumnHeader title="Name" />  // No tooltip
 */
export default function ColumnHeader({ title, tooltip }: ColumnHeaderProps) {
  if (!tooltip) {
    return <>{title}</>;
  }

  return (
    <span className="flex items-center gap-1">
      {title}
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
