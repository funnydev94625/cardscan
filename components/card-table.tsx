"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { CreditCardData } from "@/lib/types";
import BankLogo from "@/components/bank-logo";

interface CardTableProps {
  data: CreditCardData[];
  setPage: (page: number) => void;
  page: number;
  setRecordCount: (page: number) => void;
  recordCount: number;
  totalCounts: number;
  setSortField: (page: string) => void;
  sortField: string;
  setSortDirection: (page: string) => void;
  sortDirection: string;
}

type SortField =
  | "bank"
  | "card_number"
  | "name"
  | "address_line1"
  | "expiry_year";
type SortDirection = "asc" | "desc";

export default function CardTable({
  data,
  setPage,
  page,
  recordCount,
  setRecordCount,
  totalCounts,
  setSortField,
  sortField,
  setSortDirection,
  sortDirection,
}: CardTableProps) {
  // const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };
  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      // case "bank":
      //   comparison = (a.bank || "").localeCompare(b.bank || "")
      //   break
      case "card_number":
        comparison = a.cardNumber.localeCompare(b.cardNumber);
        break;
      case "mame":
        comparison = a.cardholderName.localeCompare(b.cardholderName);
        break;
      case "address_line1":
        comparison = `${a.city}, ${a.state}`.localeCompare(
          `${b.city}, ${b.state}`
        );
        break;
      case "expiry_year":
        const aMonth = a.expiry_month;
        const aYear = a.expiry_year;
        const bMonth = b.expiry_month;
        const bYear = b.expiry_year;
        const aDate = new Date(
          Number.parseInt(`20${aYear}`),
          Number.parseInt(aMonth) - 1
        );
        const bDate = new Date(
          Number.parseInt(`20${bYear}`),
          Number.parseInt(bMonth) - 1
        );
        comparison = aDate.getTime() - bDate.getTime();
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });
  function maskCardNumber(cardNumber: string) {
    return cardNumber.slice(0, -4).replace(/\d/g, "*") + cardNumber.slice(-4);
  }
  async function getBankName(cardNumber: string) {
    return "";
  }
  // Paginate data
  const startIndex = (page - 1) * recordCount;
  const totalPages = Math.ceil(totalCounts / recordCount);
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("bank")}
                  className="flex items-center font-medium"
                >
                  Bank {getSortIcon("bank")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("card_number")}
                  className="flex items-center font-medium"
                >
                  Card Number {getSortIcon("card_number")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="flex items-center font-medium"
                >
                  Cardholder {getSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("address_line1")}
                  className="flex items-center font-medium"
                >
                  Location {getSortIcon("address_line1")}
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("expiry_year")}
                  className="flex items-center font-medium"
                >
                  Expiry {getSortIcon("expiry_year")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((card, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <BankLogo bin={card.banks} />
                      <span>
                        {card.banks?.name || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{maskCardNumber(card.cardNumber)}</span>
                      <span className="text-xs text-muted-foreground">
                        BIN: {card.cardNumber.slice(0, 6)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{card.cardholderName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {card.city}, {card.state} {card.country}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {card.zipCode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={`${
                      isExpired(card.expiry_month + "/" + card.expiry_year)
                        ? "text-destructive"
                        : ""
                    }`}
                  >
                    {card.expiry_month + "/" + card.expiry_year}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs">{card.phone}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {card.email}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(startIndex + recordCount, data.length)} of {data.length}{" "}
            records
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {recordCount} per page
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[10, 25, 50, 100].map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => {
                      setRecordCount(value);
                      setPage(1);
                    }}
                  >
                    {value} per page
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to check if a card is expired
function isExpired(expiry: string): boolean {
  const [month, year] = expiry.split("/");
  const expiryDate = new Date(
    Number.parseInt(`20${year}`),
    Number.parseInt(month)
  );
  const now = new Date();
  return expiryDate < now;
}
