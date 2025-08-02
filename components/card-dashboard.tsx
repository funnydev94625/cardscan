"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Upload,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import CardMap from "@/components/card-map";
import CardTable from "@/components/card-table";
import {
  fetchCreditCardsWithFilters,
  getCreditCardStats,
} from "@/lib/database";
import type { CreditCardData } from "@/lib/types";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { se } from "date-fns/locale";

type LatLng = { lat: number; lng: number };

export default function CardDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<CreditCardData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCounts, setTotalCounts] = useState(25);

  // Stats
  const [recordCount, setRecordCount] = useState(25);
  const [page, setPage] = useState(1);
  const [expiringCount, setExpiringCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [bankCounts, setBankCounts] = useState<Record<string, number>>({});

  // Available options
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [sortField, setSortField] = useState("card_number");
  const [sortDirection, setSortDirection] = useState("asc");
  const [start, setStart] = useState(true);

  const { toast } = useToast();

  // Load initial data and stats
  useEffect(() => {
    // loadData()
    loadStats();
    console.log(filteredData.length);
    if (start) {
      setStart(false);
      loadData();
    }
  }, []);

  // Load filtered data when filters change
  useEffect(() => {
    if (!start) {
      console.log("query");
      loadFilteredData();
    }
  }, [
    searchQuery,
    selectedCountry,
    selectedState,
    selectedBanks,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    console.log(recordCount);
    loadFilteredData();
  }, [page, recordCount]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      loadFilteredData();
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load credit card data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await getCreditCardStats();
      setExpiringCount(stats.expiringSoon);
      setInvalidCount(stats.expired);
      setBankCounts(stats.bankCounts);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadFilteredData = async () => {
    try {
      setIsRefreshing(true);
      const result = await fetchCreditCardsWithFilters({
        search: searchQuery || undefined,
        country: selectedCountry !== "all" ? selectedCountry : undefined,
        state: selectedState !== "all" ? selectedState : undefined,
        banks: selectedBanks.length > 0 ? selectedBanks : undefined,
        page,
        recordCount,
        sortDirection,
        sortField
      });

      setFilteredData(result.data);
      const addresses = result.data.map((item) => item.address);
      Promise.all(
        addresses.map((addr) =>
          fetch(`/api/geocode?address=${encodeURIComponent(addr)}`)
            .then((res) => res.json())
            .then((data) => data.results[0]?.geometry.location as LatLng)
        )
      ).then((coords) => {
        setMarkers(coords.filter(Boolean));
      });
      setTotalCounts(result.count);
    } catch (error) {
      console.error("Error loading filtered data:", error);
      toast({
        title: "Error",
        description: "Failed to filter data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
    await loadStats();
    toast({
      title: "Success",
      description: "Data refreshed successfully",
    });
  };

  const toggleBankFilter = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  };

  const handleImportData = () => {
    toast({
      title: "Import Data",
      description: "Import functionality would be implemented here",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Data",
      description: "Export functionality would be implemented here",
    });
  };

  const banks = Object.keys(bankCounts).sort(
    (a, b) => bankCounts[b] - bankCounts[a]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading credit card database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen theme-transition">
      {/* Sidebar */}
      <div className="w-full lg:w-72 border-r bg-card p-4 overflow-y-auto theme-transition">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Credit Card Database</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-medium mb-2">Global Search</h2>
            <Input
              placeholder="Search cards, names, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full enhanced-focus"
            />
          </div>

          <div>
            <h2 className="text-sm font-medium mb-2">Quick Filters</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent theme-transition">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>All Locations</span>
                </div>
                <Badge variant="outline" className="badge-outline">
                  {recordCount}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent theme-transition">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Expiring Soon</span>
                </div>
                <Badge
                  variant="outline"
                  className="warning-bg warning-text warning-border"
                >
                  {expiringCount}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent theme-transition">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span>Expired Cards</span>
                </div>
                <Badge
                  variant="outline"
                  className="error-bg error-text error-border"
                >
                  {invalidCount}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-medium mb-2">Geographic Filters</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Country</label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger className="enhanced-focus">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="enhanced-focus">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-medium mb-2">Bank Filters</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {banks.map((bank) => (
                <div
                  key={bank}
                  className="flex items-center space-x-2 p-1 rounded hover:bg-accent theme-transition"
                >
                  <Checkbox
                    id={`bank-${bank}`}
                    checked={selectedBanks.includes(bank)}
                    onCheckedChange={() => toggleBankFilter(bank)}
                    className="enhanced-focus"
                  />
                  <label
                    htmlFor={`bank-${bank}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full cursor-pointer"
                  >
                    <span>{bank}</span>
                    <span className="text-muted-foreground">
                      ({bankCounts[bank]})
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {selectedBanks.length > 0 && (
              <Button
                variant="link"
                className="text-xs p-0 h-auto mt-2 enhanced-focus"
                onClick={() => setSelectedBanks([])}
              >
                Clear bank filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto theme-transition">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Credit Card Database</h1>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="enhanced-focus bg-transparent"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <ThemeSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportData}
              className="hover-lift enhanced-focus bg-transparent"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="hover-lift enhanced-focus bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Map Section */}
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle>Geographic Distribution</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>Card Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span>High Density</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full rounded-md overflow-hidden border">
                <CardMap markers={markers} />
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="glass-effect">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>Credit Card Records</CardTitle>
              <div className="text-sm text-muted-foreground">
                {isRefreshing ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <span>
                    Showing{" "}
                    {filteredData.length > 0
                      ? `1-${Math.min(
                          filteredData.length,
                          25
                        )} of ${recordCount}`
                      : "0"}{" "}
                    records
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardTable
                data={filteredData}
                setPage={setPage}
                page={page}
                recordCount={recordCount}
                setRecordCount={setRecordCount}
                totalCounts={totalCounts}
                sortField={sortField}
                setSortField={setSortField}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
