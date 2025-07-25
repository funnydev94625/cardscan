import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCardFilters } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin, Calendar, AlertTriangle } from "lucide-react";

interface FiltersSidebarProps {
  filters: CreditCardFilters;
  onFiltersChange: (filters: CreditCardFilters) => void;
}

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const { data: stats } = useQuery<{ totalRecords: number; bankDistribution: { bankName: string; count: number }[]; stateDistribution: any[]; expiringCards: number }>({
    queryKey: ['/api/credit-cards-stats'],
  });

  const { data: banks } = useQuery<string[]>({
    queryKey: ['/api/banks'],
  });

  const { data: states } = useQuery<{ state: string; count: number }[]>({
    queryKey: ['/api/states'],
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof CreditCardFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankToggle = (bankName: string, checked: boolean) => {
    const currentBanks = localFilters.banks || [];
    const newBanks = checked
      ? [...currentBanks, bankName]
      : currentBanks.filter(b => b !== bankName);
    
    setLocalFilters(prev => ({
      ...prev,
      banks: newBanks,
    }));
  };

  const applyFilters = () => {
    onFiltersChange({
      ...localFilters,
      page: 1, // Reset to first page when applying filters
    });
  };

  const clearFilters = () => {
    const clearedFilters: CreditCardFilters = {
      page: 1,
      limit: filters.limit,
      sortOrder: 'asc',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <aside className="w-80 bg-white shadow-sm border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        {/* Search Section */}
        <div className="mb-6">
          <Label htmlFor="global-search" className="block text-sm font-medium text-slate-700 mb-2">
            Global Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="global-search"
              type="text"
              className="pl-10"
              placeholder="Search cards, names, locations..."
              value={localFilters.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              data-testid="input-global-search"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Filters</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
              data-testid="button-all-locations"
            >
              <MapPin className="mr-2 h-4 w-4" />
              All Locations
              <span className="ml-auto text-slate-500">
                {stats?.totalRecords.toLocaleString() || '0'}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-sm hover:bg-slate-50"
              data-testid="button-expiring-soon"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Expiring Soon
              <span className="ml-auto text-slate-500">
                {stats?.expiringCards || '0'}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-sm hover:bg-slate-50"
              data-testid="button-invalid-data"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Invalid Data
              <span className="ml-auto text-slate-500">0</span>
            </Button>
          </div>
        </div>

        {/* Geographic Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Geographic Filters</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="country-select" className="block text-xs text-slate-600 mb-1">
                Country
              </Label>
              <Select
                value={localFilters.country || 'US'}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">
                    United States ({stats?.totalRecords.toLocaleString() || '0'})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="state-select" className="block text-xs text-slate-600 mb-1">
                State
              </Label>
              <Select
                value={localFilters.state || ''}
                onValueChange={(value) => handleInputChange('state', value === 'all' ? undefined : value)}
              >
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states?.map((state) => (
                    <SelectItem key={state.state} value={state.state}>
                      {state.state} ({state.count.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="city-input" className="block text-xs text-slate-600 mb-1">
                City
              </Label>
              <Input
                id="city-input"
                type="text"
                placeholder="Enter city name..."
                value={localFilters.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                data-testid="input-city"
              />
            </div>
          </div>
        </div>

        {/* Bank Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Bank Filters</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats?.bankDistribution.slice(0, 10).map((bank) => (
              <div key={bank.bankName} className="flex items-center space-x-2">
                <Checkbox
                  id={`bank-${bank.bankName}`}
                  checked={(localFilters.banks || []).includes(bank.bankName)}
                  onCheckedChange={(checked) => handleBankToggle(bank.bankName, checked as boolean)}
                  data-testid={`checkbox-bank-${bank.bankName.replace(/\s+/g, '-').toLowerCase()}`}
                />
                <Label
                  htmlFor={`bank-${bank.bankName}`}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {bank.bankName} ({bank.count.toLocaleString()})
                </Label>
              </div>
            ))}
          </div>
          {(stats?.bankDistribution.length || 0) > 10 && (
            <Button
              variant="link"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto mt-2"
              data-testid="button-show-more-banks"
            >
              Show more banks...
            </Button>
          )}
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Expiration Date Range</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="expiry-from" className="block text-xs text-slate-600 mb-1">
                From
              </Label>
              <Input
                id="expiry-from"
                type="month"
                value={localFilters.expiryFrom || '2024-01'}
                onChange={(e) => handleInputChange('expiryFrom', e.target.value)}
                data-testid="input-expiry-from"
              />
            </div>
            <div>
              <Label htmlFor="expiry-to" className="block text-xs text-slate-600 mb-1">
                To
              </Label>
              <Input
                id="expiry-to"
                type="month"
                value={localFilters.expiryTo || '2030-12'}
                onChange={(e) => handleInputChange('expiryTo', e.target.value)}
                data-testid="input-expiry-to"
              />
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="space-y-2">
          <Button
            onClick={applyFilters}
            className="w-full bg-blue-700 hover:bg-blue-800"
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
          <Button
            onClick={clearFilters}
            variant="outline"
            className="w-full"
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </aside>
  );
}
