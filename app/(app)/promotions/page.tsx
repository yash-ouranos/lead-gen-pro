"use client";

import { useState, useEffect } from"react";
import {TrashCan, Edit, Add, Box , ChevronLeft, ChevronRight} from "@carbon/icons-react";
import Link from "next/link";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useAdvancedFilter } from "@/app/hooks/useAdvancedFilter";
import AdvancedFilterPopover from "@/app/components/AdvancedFilterPopover";

const PROMOTION_COLUMNS = [
  { value: "name", label: "Name" },
  { value: "status", label: "Status" }
];

export default function PromotionsPage() {
 const [promotions, setPromotions] = useState<any[]>([]);
  const { filteredData: filteredPromotions, filters, setFilters, appliedFilterCount } = useAdvancedFilter(promotions);
  const [currentPage, setCurrentPage] = useState(1);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const res = await fetch("/api/promotions");
    if (res.ok) {
      setPromotions(await res.json());
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const res = await fetch(`/api/promotions/${itemToDelete}`, { method: "DELETE" });
    if (res.ok) {
      fetchPromotions();
    }
    setItemToDelete(null);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">

      <div className="bg-card overflow-hidden flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-4 px-4 py-2.5 border-b">
          <div className="flex items-center gap-3">
            <AdvancedFilterPopover 
              columns={PROMOTION_COLUMNS}
              filters={filters}
              setFilters={setFilters}
              appliedFilterCount={appliedFilterCount}
            />
            <Link
              href="/promotions/new"
              className="bg-primary text-white px-4 py-2 flex items-center gap-2"
            >
              <Add className="w-4 h-4" /> Create
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#e0e0e0] border-b border-border text-[13px] font-semibold text-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Box className="w-10 h-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No Data Available</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredPromotions.slice((currentPage - 1) * 10, currentPage * 10).map((promo) => (
                <tr key={promo.id} className="bg-card hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">{promo.name}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{promo.status}</td>
                  <td className="px-6 py-4">{new Date(promo.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex gap-3 justify-end">
                    <Link href={`/promotions/${promo.id}`} className="text-blue-500 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => setItemToDelete(promo.id)} className="text-red-500 hover:text-red-700">
                      <TrashCan className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPromotions.length > 0 && (
          <div className="sticky bottom-0 z-10 px-6 py-4 border-t flex items-center justify-between bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * 10 + 1}</span> to{""}
              <span className="font-bold text-foreground">
                {Math.min(currentPage * 10, filteredPromotions.length)}
              </span>{""}
              of <span className="font-bold text-foreground">{filteredPromotions.length}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-muted-foreground font-bold px-3 uppercase tracking-wider">
                Page {currentPage} of {Math.max(1, Math.ceil(filteredPromotions.length / 10))}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPromotions.length / 10), p + 1))}
                disabled={currentPage >= Math.ceil(filteredPromotions.length / 10)}
                className="p-1.5 border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
