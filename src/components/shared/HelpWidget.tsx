import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

export default function HelpWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/contact"
            className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-button hover:scale-105 transition-transform"
          >
            <HelpCircle className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Need help? Contact support</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
