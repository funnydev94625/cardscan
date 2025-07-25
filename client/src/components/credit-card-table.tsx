import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, CreditCardFilters } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown, Download } from "lucide-react";
import BankLogo from "./bank-logo";

interface CreditCardTableProps {
  filters: CreditCardFilters;
  onFiltersChange: (filters: CreditCardFilters) => void;
}

export default function CreditCardTable({ filters, onFiltersChange }: CreditCardTableProps) {
  const { data, isLoading } = useQuery<{ cards: CreditCard[]; total: number }>({
    queryKey: ['/api/credit-cards', filters],
  });

  const handleSort = (field: string) => {
    const newSortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({
      ...filters,
      sortBy: field as any,
      sortOrder: newSortOrder,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({
      ...filters,
      page: newPage,
    });
  };

  const handleLimitChange = (newLimit: string) => {
    onFiltersChange({
      ...filters,
      limit: parseInt(newLimit),
      page: 1,
    });
  };

  const totalPages = Math.ceil((data?.total || 0) / filters.limit);
  const startRecord = (filters.page - 1) * filters.limit + 1;
  const endRecord = Math.min(filters.page * filters.limit, data?.total || 0);

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.substring(0, 4) + '•••••••' + cardNumber.substring(cardNumber.length - 4);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(now.getMonth() + 6);

    if (expiry < now) {
      return { color: 'bg-red-100 text-red-800', label: 'Expired' };
    } else if (expiry < sixMonthsFromNow) {
      return { color: 'bg-amber-100 text-amber-800', label: 'Expiring Soon' };
    } else {
      return { color: 'bg-emerald-100 text-emerald-800', label: 'Active' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-8 text-center">
          <div className="animate-pulse">Loading credit card data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-slate-800" data-testid="text-table-title">
              Credit Card Records
            </h3>
            <span className="text-sm text-slate-600" data-testid="text-table-count">
              Showing {startRecord}-{endRecord} of {data?.total.toLocaleString() || 0} records
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={filters.limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-32" data-testid="select-page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-download-table">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('bankName')}
                  className="flex items-center space-x-1 hover:text-slate-700 p-0 h-auto font-medium"
                  data-testid="button-sort-bank"
                >
                  <span>Bank</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('cardNumber')}
                  className="flex items-center space-x-1 hover:text-slate-700 p-0 h-auto font-medium"
                  data-testid="button-sort-card"
                >
                  <span>Card Number</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('holderName')}
                  className="flex items-center space-x-1 hover:text-slate-700 p-0 h-auto font-medium"
                  data-testid="button-sort-cardholder"
                >
                  <span>Cardholder</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('city')}
                  className="flex items-center space-x-1 hover:text-slate-700 p-0 h-auto font-medium"
                  data-testid="button-sort-location"
                >
                  <span>Location</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('expiryDate')}
                  className="flex items-center space-x-1 hover:text-slate-700 p-0 h-auto font-medium"
                  data-testid="button-sort-expiry"
                >
                  <span>Expiry</span>
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data?.cards.map((card: CreditCard) => {
              const expiryStatus = getExpiryStatus(card.expiryDate);
              return (
                <tr key={card.id} className="hover:bg-slate-50" data-testid={`row-card-${card.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BankLogo 
                        binNumber={card.binNumber} 
                        bankName={card.bankName}
                        className="w-10 h-6 mr-3"
                        data-testid={`logo-bank-${card.id}`}
                      />
                      <span className="text-sm font-medium text-slate-900" data-testid={`text-bank-${card.id}`}>
                        {card.bankName || 'Unknown Bank'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-900" data-testid={`text-card-number-${card.id}`}>
                      {maskCardNumber(card.cardNumber)}
                    </span>
                    <div className="text-xs text-slate-500" data-testid={`text-bin-${card.id}`}>
                      BIN: {card.binNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900" data-testid={`text-holder-${card.id}`}>
                        {card.holderName}
                      </div>
                      <div className="text-sm text-slate-500" data-testid={`text-address-${card.id}`}>
                        {card.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-slate-900" data-testid={`text-city-${card.id}`}>
                        {card.city}, {card.state}
                      </div>
                      <div className="text-sm text-slate-500" data-testid={`text-zip-${card.id}`}>
                        {card.zipCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.color}`}
                      data-testid={`badge-expiry-${card.id}`}
                    >
                      {card.expiryDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-slate-900" data-testid={`text-phone-${card.id}`}>
                      {card.phone}
                    </div>
                    <div className="text-slate-500 text-xs" data-testid={`text-email-${card.id}`}>
                      {card.email}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700" data-testid="text-pagination-info">
            Showing <span className="font-medium">{startRecord}</span> to{' '}
            <span className="font-medium">{endRecord}</span> of{' '}
            <span className="font-medium">{data?.total.toLocaleString() || 0}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              data-testid="button-previous"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {filters.page > 2 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    data-testid="button-page-1"
                  >
                    1
                  </Button>
                  {filters.page > 3 && <span className="text-slate-500">...</span>}
                </>
              )}
              
              {filters.page > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  data-testid={`button-page-${filters.page - 1}`}
                >
                  {filters.page - 1}
                </Button>
              )}
              
              <Button variant="default" size="sm" data-testid={`button-page-current`}>
                {filters.page}
              </Button>
              
              {filters.page < totalPages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  data-testid={`button-page-${filters.page + 1}`}
                >
                  {filters.page + 1}
                </Button>
              )}
              
              {filters.page < totalPages - 1 && (
                <>
                  {filters.page < totalPages - 2 && <span className="text-slate-500">...</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    data-testid={`button-page-last`}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= totalPages}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
