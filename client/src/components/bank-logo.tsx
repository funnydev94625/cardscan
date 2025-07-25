import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankLogoProps {
  binNumber: string;
  bankName?: string | null;
  className?: string;
}

export default function BankLogo({ binNumber, bankName, className }: BankLogoProps) {
  const { data: binData } = useQuery<{ bank: string; logo?: string }>({
    queryKey: ['/api/bin-lookup', binNumber],
    enabled: !!binNumber,
  });

  const logoUrl = binData?.logo;
  const displayBankName = binData?.bank || bankName || 'Unknown Bank';

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={displayBankName}
        className={cn("object-contain bg-slate-200 rounded", className)}
        onError={(e) => {
          // Fallback to icon if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextSibling) {
            (target.nextSibling as HTMLElement).style.display = 'flex';
          }
        }}
        data-testid={`img-bank-logo-${binNumber}`}
      />
    );
  }

  return (
    <div 
      className={cn("bg-slate-200 rounded flex items-center justify-center", className)}
      data-testid={`div-bank-placeholder-${binNumber}`}
    >
      <Building2 className="h-3 w-3 text-slate-500" />
    </div>
  );
}
