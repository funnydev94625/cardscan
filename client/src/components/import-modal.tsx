import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  message: string;
}

export default function ImportModal() {
  const [textData, setTextData] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: string): Promise<ImportResult> => {
      const response = await fetch('/api/import-credit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textData: data }),
      });
      
      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Import Successful",
        description: `Imported ${result.imported} credit card records`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/map-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/states'] });
      
      setTextData("");
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  const handleImport = () => {
    if (!textData.trim()) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please paste your credit card data to import",
      });
      return;
    }
    
    importMutation.mutate(textData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          data-testid="button-import-modal"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="modal-import">
        <DialogHeader>
          <DialogTitle>Import Credit Card Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              Paste your credit card data in pipe-delimited format. Supports multiple formats:
            </p>
            <div className="bg-slate-50 p-3 rounded text-xs font-mono space-y-1">
              <div>Format 1: cardNumber|expiry|cvv|name|address|phone|city|state|zip|email|country</div>
              <div>Format 2: cardNumber|expiry|cvv|name|address|city|country|zip|state|phone|email|ip</div>
              <div>Format 3: cardNumber|expiry|cvv|name|address|city|state|country|zip|email|ip|browser</div>
            </div>
          </div>
          
          <Textarea
            placeholder="Paste your pipe-delimited credit card data here..."
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            data-testid="textarea-import-data"
          />
          
          {importMutation.data?.errors && importMutation.data.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Import Warnings</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {importMutation.data.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={importMutation.isPending || !textData.trim()}
              data-testid="button-confirm-import"
            >
              {importMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}