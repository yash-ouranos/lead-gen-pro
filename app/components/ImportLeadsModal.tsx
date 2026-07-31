"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DocumentDownload, Upload, Close } from "@carbon/icons-react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

interface ImportLeadsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ImportLeadsModal({ isOpen, onOpenChange, onSuccess }: ImportLeadsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDownloadTemplate = () => {
    const headers = [
      "Lead Name",
      "Lead Type",
      "Method of Contact",
      "Lead Status",
      "Lead Temperature",
      "Contact Name",
      "Contact Mobile No.1",
      "Contact Email",
      "Contact Designation",
      "Company Name",
      "Industry",
      "Annual Revenue",
      "Website",
      "Street No.",
      "Country",
      "State",
      "City",
      "Pin Code",
      "Products",
      "Services",
      "Remarks"
    ];
    const csvContent = headers.map(h => `"${h}"`).join(",") + "\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "leads_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a valid CSV file.");
        setFile(null);
        setParsedData([]);
        return;
      }
      setError("");
      setFile(selectedFile);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
        },
        error: (err) => {
          setError("Failed to parse CSV. Please check the file format.");
        }
      });
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("The uploaded CSV is empty or invalid.");
      return;
    }

    setIsImporting(true);
    setError("");

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsedData })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to import leads.");
      }

      onSuccess();
      onOpenChange(false);
      setFile(null);
      setParsedData([]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      if (!isImporting) {
        onOpenChange(open);
        if (!open) {
          setFile(null);
          setParsedData([]);
          setError("");
        }
      }
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-foreground">Import Leads</Dialog.Title>
            <Dialog.Close disabled={isImporting} className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
              <Close size={20} />
            </Dialog.Close>
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            Upload a CSV file to bulk import leads. Please ensure your file matches the required template structure.
          </div>

          <div className="flex items-center justify-between mb-4 border border-border bg-background p-4 rounded-md">
            <div>
              <p className="text-sm font-semibold text-foreground">Need the template?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Download our pre-formatted CSV template.</p>
            </div>
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <DocumentDownload size={16} /> Download CSV
            </button>
          </div>

          <div className="space-y-2 mb-2">
            <label className="text-sm font-medium text-foreground">Upload CSV File</label>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer bg-background border border-border rounded-md px-3 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isImporting}
            />
            {file && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                Ready to import {parsedData.length} leads.
              </p>
            )}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
              className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-md text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || !file || parsedData.length === 0}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isImporting ? "Importing..." : <><Upload size={16} /> Import</>}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
