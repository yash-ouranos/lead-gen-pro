"use client";

import { useState, useEffect } from"react";
import {TrashCan, Edit, Add, Box , ChevronLeft, ChevronRight} from "@carbon/icons-react";
import Link from "next/link";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useAdvancedFilter } from "@/app/hooks/useAdvancedFilter";
import AdvancedFilterPopover from "@/app/components/AdvancedFilterPopover";

const STAFF_COLUMNS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "status", label: "Status" }
];

export default function StaffsPage() {
 const [staffs, setStaffs] = useState<any[]>([]);
  const { filteredData: filteredStaffs, filters, setFilters, appliedFilterCount } = useAdvancedFilter(staffs);
  const [currentPage, setCurrentPage] = useState(1);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    const res = await fetch("/api/staffs");
    if (res.ok) {
      setStaffs(await res.json());
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const res = await fetch(`/api/staffs/${itemToDelete}`, { method: "DELETE" });
    if (res.ok) {
      fetchStaffs();
    }
    setItemToDelete(null);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">

      <div className="bg-card overflow-hidden flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-4 px-4 py-2.5 border-b">
          <div className="flex items-center gap-3">
            <AdvancedFilterPopover 
              columns={STAFF_COLUMNS}
              filters={filters}
              setFilters={setFilters}
              appliedFilterCount={appliedFilterCount}
            />
            <Link
              href="/staffs/new"
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
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStaffs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Box className="w-10 h-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No Data Available</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredStaffs.slice((currentPage - 1) * 10, currentPage * 10).map((staff) => (
                <tr key={staff.id} className="bg-card hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      {staff.phone && <div className="text-xs text-muted-foreground">{staff.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{staff.email}</td>
                  <td className="px-6 py-4">
                    {staff.role ? (
                      <span className="bg-[#d0e2ff] text-[#0043ce] text-xs px-2 py-0.5 font-medium tracking-wide">
                        {staff.role.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">No Role</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${staff.status === "Active" ? "text-green-600" : "text-gray-500"}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3 justify-end items-center h-full">
                    <Link href={`/staffs/${staff.id}`} className="text-blue-500 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => setItemToDelete(staff.id)} className="text-red-500 hover:text-red-700">
                      <TrashCan className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStaffs.length > 0 && (
          <div className="sticky bottom-0 z-10 px-6 py-4 border-t flex items-center justify-between bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * 10 + 1}</span> to{""}
              <span className="font-bold text-foreground">
                {Math.min(currentPage * 10, filteredStaffs.length)}
              </span>{""}
              of <span className="font-bold text-foreground">{filteredStaffs.length}</span> entries
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
                Page {currentPage} of {Math.max(1, Math.ceil(filteredStaffs.length / 10))}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredStaffs.length / 10), p + 1))}
                disabled={currentPage >= Math.ceil(filteredStaffs.length / 10)}
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
        title="Delete Staff"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
