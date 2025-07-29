import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCardFilters } from "@shared/schema";
import CreditCardMap from "@/components/credit-card-map";
import CreditCardTable from "@/components/credit-card-table";
import FiltersSidebar from "@/components/filters-sidebar";
import ImportModal from "@/components/import-modal";
import { Button } from "@/components/ui/button";
import { CreditCard, Download } from "lucide-react";

export default function Dashboard() {
  const [filters, setFilters] = useState<CreditCardFilters>({
    page: 1,
    limit: 25,
    sortOrder: 'asc',
  });

  const { data: stats } = useQuery<{ totalRecords: number; bankDistribution: any[]; stateDistribution: any[]; expiringCards: number }>({
    queryKey: ['/api/credit-cards-stats'],
  });

  const handleExport = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    window.open(`/api/export-credit-cards?${params.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-8 w-8 text-blue-700" data-testid="icon-credit-card" />
              <h1 className="text-2xl font-semibold text-slate-800" data-testid="text-title">
                Credit Card Database
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600" data-testid="text-record-count">
                {stats?.totalRecords.toLocaleString() || '0'} Records
              </span>
              <ImportModal />
              <Button 
                onClick={handleExport}
                className="bg-blue-700 hover:bg-blue-800"
                data-testid="button-export"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <FiltersSidebar 
          filters={filters} 
          onFiltersChange={setFilters}
          data-testid="sidebar-filters"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Map Section */}
          <div className="bg-white border-b border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800" data-testid="text-map-title">
                  Geographic Distribution
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                    <span>Card Locations</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>High Density</span>
                  </div>
                </div>
              </div>
              <CreditCardMap filters={filters} data-testid="map-credit-cards" />
            </div>
          </div>

          {/* Data Table Section */}
          <div className="p-6">
            <CreditCardTable 
              filters={filters} 
              onFiltersChange={setFilters}
              data-testid="table-credit-cards"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
