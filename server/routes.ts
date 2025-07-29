import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { creditCardFiltersSchema } from "@shared/schema";
import { importCreditCardsFromText } from "./migration";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get credit cards with filters
  app.get("/api/credit-cards", async (req, res) => {
    try {
      // Handle the banks parameter which might come as a comma-separated string
      const queryParams = { ...req.query };
      if (queryParams.banks && typeof queryParams.banks === 'string') {
        queryParams.banks = queryParams.banks.split(',').filter(b => b.trim());
      }
      
      const filters = creditCardFiltersSchema.parse(queryParams);
      const result = await storage.getCreditCards(filters);
      res.json(result);
    } catch (error) {
      console.error("Filter validation error:", error);
      res.status(400).json({ error: "Invalid filters", details: error });
    }
  });

  // Get single credit card
  app.get("/api/credit-cards/:id", async (req, res) => {
    try {
      const card = await storage.getCreditCard(req.params.id);
      if (!card) {
        res.status(404).json({ error: "Credit card not found" });
        return;
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get credit card statistics
  app.get("/api/credit-cards-stats", async (req, res) => {
    try {
      const stats = await storage.getCreditCardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get map data
  app.get("/api/map-data", async (req, res) => {
    try {
      // Handle the banks parameter which might come as a comma-separated string
      const queryParams = { ...req.query };
      if (queryParams.banks && typeof queryParams.banks === 'string') {
        queryParams.banks = queryParams.banks.split(',').filter(b => b.trim());
      }
      
      const filters = Object.keys(queryParams).length > 0 ? creditCardFiltersSchema.parse(queryParams) : undefined;
      const mapData = await storage.getMapData(filters);
      res.json(mapData);
    } catch (error) {
      console.error("Map data error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get bank list
  app.get("/api/banks", async (req, res) => {
    try {
      const banks = await storage.getBankList();
      res.json(banks);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get state list
  app.get("/api/states", async (req, res) => {
    try {
      const country = req.query.country as string;
      const states = await storage.getStateList(country);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Export credit cards
  app.get("/api/export-credit-cards", async (req, res) => {
    try {
      const filters = creditCardFiltersSchema.parse(req.query);
      const cards = await storage.exportCreditCards(filters);
      
      // Convert to CSV
      const csvHeader = "Card Number,Expiry,CVV,Holder Name,Address,Phone,City,State,Zip,Email,Country,Bank,BIN\n";
      const csvData = cards.map(card => 
        `"${card.cardNumber}","${card.expiryDate}","${card.cvv}","${card.holderName}","${card.address}","${card.phone}","${card.city}","${card.state}","${card.zipCode}","${card.email}","${card.country}","${card.bankName || ''}","${card.binNumber}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="credit_cards.csv"');
      res.send(csvHeader + csvData);
    } catch (error) {
      res.status(400).json({ error: "Export failed" });
    }
  });

  // BIN lookup endpoint
  app.get("/api/bin-lookup/:bin", async (req, res) => {
    try {
      const bin = req.params.bin;
      if (bin.length !== 6) {
        res.status(400).json({ error: "BIN must be 6 digits" });
        return;
      }

      // Mock BIN lookup - in production this would call a real BIN API
      const binDatabase: Record<string, { bank: string; logo?: string }> = {
        "400022": { bank: "Chase Bank", logo: "https://logos-world.net/wp-content/uploads/2021/03/Chase-Logo.png" },
        "400344": { bank: "Citibank", logo: "https://logos-world.net/wp-content/uploads/2020/08/Citibank-Logo.png" },
        "411111": { bank: "Bank of America", logo: "https://logos-world.net/wp-content/uploads/2020/04/Bank-of-America-Logo.png" },
        "424242": { bank: "Wells Fargo", logo: "https://logos-world.net/wp-content/uploads/2020/03/Wells-Fargo-Logo.png" },
        "374245": { bank: "American Express", logo: "https://logos-world.net/wp-content/uploads/2020/04/American-Express-Logo.png" },
        // Add more common BIN ranges for visa cards
        "4000": { bank: "Generic Visa", logo: "https://cdn.worldvectorlogo.com/logos/visa-2.svg" },
        "4111": { bank: "Test Bank", logo: "https://cdn.worldvectorlogo.com/logos/visa-2.svg" },
        "4532": { bank: "CitiBank", logo: "https://logos-world.net/wp-content/uploads/2020/08/Citibank-Logo.png" },
        "4716": { bank: "Wells Fargo", logo: "https://logos-world.net/wp-content/uploads/2020/03/Wells-Fargo-Logo.png" },
        "4929": { bank: "Bank of America", logo: "https://logos-world.net/wp-content/uploads/2020/04/Bank-of-America-Logo.png" },
      };

      // Try exact match first, then partial matches
      let result = binDatabase[bin];
      
      if (!result) {
        // Try 4-digit prefix for broader matching
        const prefix4 = bin.substring(0, 4);
        result = binDatabase[prefix4];
      }
      
      if (!result) {
        // Default fallback
        result = { bank: "Unknown Bank" };
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "BIN lookup failed" });
    }
  });

  // Migration API - Import credit cards from text data
  app.post("/api/import-credit-cards", async (req, res) => {
    try {
      const { textData } = req.body;
      
      if (!textData || typeof textData !== 'string') {
        return res.status(400).json({ error: "textData is required and must be a string" });
      }

      const result = await importCreditCardsFromText(textData);
      
      res.json({
        success: true,
        imported: result.imported,
        errors: result.errors,
        message: `Successfully imported ${result.imported} credit card records`
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ 
        error: "Import failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
