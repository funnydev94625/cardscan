"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  getCountries,
  getStates,
  loadFilteredData
} from "@/lib/database";
import type { CreditCardData } from "@/lib/types";
import { ThemeSwitcher } from "@/components/theme-switcher";

type LatLng = { lat: number; lng: number };

export default function CardDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");

  // Initialize state from URL query params on first load
  useEffect(() => {
    if (!searchParams) return;

    const initialBankName = searchParams.get("bankName") || "";
    const initialCardName = searchParams.get("cardName") || "";
    const initialCardNumber = searchParams.get("cardNumber") || "";
    const initialExpiryStart = searchParams.get("expiryStart") || "";
    const initialExpiryEnd = searchParams.get("expiryEnd") || "";

    // Set both temporary and actual values
    setTempBankName(initialBankName);
    setTempCardName(initialCardName);
    setTempCardNumber(initialCardNumber);
    setTempExpiryStart(initialExpiryStart);
    setTempExpiryEnd(initialExpiryEnd);

    setBankName(initialBankName);
    setCardName(initialCardName);
    setCardNumber(initialCardNumber);
    setExpiryStart(initialExpiryStart);
    setExpiryEnd(initialExpiryEnd);

    setSelectedCountry(searchParams.get("country") || "all");
    setSelectedState(searchParams.get("state") || "all");
    setPage(Number(searchParams.get("page")) || 1);
    setRecordCount(Number(searchParams.get("recordCount")) || 25);
    setSortField(searchParams.get("sortField") || "card_number");
    const sortDir = searchParams.get("sortDirection");
    setSortDirection(sortDir === "desc" ? "desc" : "asc");
  }, [searchParams]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCounts, setTotalCounts] = useState(25);

  // Available options
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [sortField, setSortField] = useState<string>("card_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");


  // MINE ---------------------------------------------------
  const [countryList, setCountryList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);

  // filter - temporary values for inputs
  const [tempBankName, setTempBankName] = useState<string>("");
  const [tempCardName, setTempCardName] = useState<string>("");
  const [tempCardNumber, setTempCardNumber] = useState<string>("");
  const [tempExpiryStart, setTempExpiryStart] = useState<string>("");
  const [tempExpiryEnd, setTempExpiryEnd] = useState<string>("");

  // filter - actual values that trigger API calls
  const [bankName, setBankName] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryStart, setExpiryStart] = useState<string>("");
  const [expiryEnd, setExpiryEnd] = useState<string>("");

  // sort


  //other
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<CreditCardData[]>([]);
  const [recordCount, setRecordCount] = useState(25);
  const [page, setPage] = useState(1);
  //

  useEffect(() => {
    const getCountryList = async () => {
      const result = await getCountries();
      setCountryList(result)
    }
    getCountryList();
  }, []);

  useEffect(() => {
    const getStateList = async () => {
      if (selectedCountry !== "all") {
        const result = await getStates(selectedCountry);
        setStateList(result);
      } else {
        setStateList([]);
      }
    };
    getStateList();
  }, [selectedCountry])
  // Sync filter state to URL and fetch data
  useEffect(() => {
    const params = new URLSearchParams();
    if (bankName) params.set("bankName", bankName);
    if (cardName) params.set("cardName", cardName);
    if (cardNumber) params.set("cardNumber", cardNumber);
    if (expiryStart) params.set("expiryStart", expiryStart);
    if (expiryEnd) params.set("expiryEnd", expiryEnd);
    if (selectedCountry && selectedCountry !== "all") params.set("country", selectedCountry);
    if (selectedState && selectedState !== "all") params.set("state", selectedState);
    if (page !== 1) params.set("page", String(page));
    if (recordCount !== 25) params.set("recordCount", String(recordCount));
    if (sortField && sortField !== "card_number") params.set("sortField", sortField);
    if (sortDirection && sortDirection !== "asc") params.set("sortDirection", sortDirection);
    const url = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    router.replace(url, { scroll: false });

    const loadData = async () => {
      setIsLoading(true);
      const result = await loadFilteredData({
        bankName: bankName === "" ? undefined : bankName,
        cardName: cardName === "" ? undefined : cardName,
        cardNumber: cardNumber === "" ? undefined : cardNumber,
        expiryEnd: expiryEnd === "" ? undefined : expiryEnd,
        expiryStart: expiryStart === "" ? undefined : expiryStart,
        country: selectedCountry === "all" ? undefined : countryList.find(c => c.id == selectedCountry)?.country_code,
        state: selectedState === "all" ? undefined : selectedState,
        page,
        recordCount,
        sortField,
        sortDirection
      });

      // Update markers from the loaded data
      const locationMarkers = result.data
        .filter(card => card.lat !== null && card.lat !== undefined && card.lng !== null && card.lng !== undefined)
        .map(card => ({
          lat: card.lat as number,
          lng: card.lng as number
        }));
      setTotalCounts(result.count || 0);
      setMarkers(locationMarkers);

      setIsLoading(false);
      setCardData(result.data);
    };
    loadData();
  }, [bankName, cardNumber, cardName, expiryEnd, expiryStart, selectedCountry, selectedState, page, recordCount, sortField, sortDirection]);
  const { toast } = useToast();

  const handleBlur = (e) => {
    switch (e.target.name) {
      case "bankName":
        setBankName(tempBankName);
        break;
      case "cardNumber":
        setCardNumber(tempCardNumber);
        break;
      case "cardName":
        setCardName(tempCardName);
        break;
      case "expiryStart":
        setExpiryStart(tempExpiryStart);
        break;
      case "expiryEnd":
        setExpiryEnd(tempExpiryEnd);
        break;
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      switch (e.target.name) {
        case "bankName":
          setBankName(tempBankName);
          break;
        case "cardNumber":
          setCardNumber(tempCardNumber);
          break;
        case "cardName":
          setCardName(tempCardName);
          break;
        case "expiryStart":
          setExpiryStart(tempExpiryStart);
          break;
        case "expiryEnd":
          setExpiryEnd(tempExpiryEnd);
          break;
      }
    }
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
            <h2 className="text-sm font-medium mb-2">Advanced Filters</h2>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Bank Name</label>
                <Input
                  name="bankName"
                  placeholder="e.g. Chase"
                  value={tempBankName}
                  onChange={e => setTempBankName(e.target.value)}
                  className="w-full enhanced-focus"
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Cardholder Name</label>
                <Input
                  placeholder="e.g. John Doe"
                  name="cardName"
                  value={tempCardName}
                  onChange={e => setTempCardName(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full enhanced-focus"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Card Number</label>
                <Input
                  placeholder="e.g. 123456******7890"
                  name="cardNumber"
                  value={tempCardNumber}
                  onChange={e => setTempCardNumber(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full enhanced-focus"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block">Expiry Start (MM/YY)</label>
                  <Input
                    placeholder="e.g. 01/24"
                    name="expiryStart"
                    value={tempExpiryStart}
                    onChange={e => setTempExpiryStart(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full enhanced-focus"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block">Expiry End (MM/YY)</label>
                  <Input
                    placeholder="e.g. 12/25"
                    value={tempExpiryEnd}
                    name="expiryEnd"
                    onChange={e => setTempExpiryEnd(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full enhanced-focus"
                  />
                </div>
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
                    {(countryList || []).map((country) => (
                      <SelectItem key={country.id} value={country.id?.toString()}>
                        {country.country_name} ({country.country_code})
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
                    {stateList.map((state) => (
                      <SelectItem key={state.state_code} value={state.state_code}>
                        {state.state_name} ({state.state_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            {/* <h2 className="text-sm font-medium mb-2">Bank Filters</h2>
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
            </div> */}
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
              // onClick={handleRefresh}
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
              // onClick={handleImportData}
              className="hover-lift enhanced-focus bg-transparent"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              // onClick={handleExportData}
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
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <span>
                    Showing{" "}
                    {cardData.length > 0
                      ? `1-${Math.min(
                        cardData.length,
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
                data={cardData}
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
