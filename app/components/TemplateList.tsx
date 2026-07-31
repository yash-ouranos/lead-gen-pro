"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTemplate } from "@/app/(app)/templates/actions";
import { Edit, TrashCan, Add, Code } from "@carbon/icons-react";
import toast from "react-hot-toast";
import type { EmailTemplate } from "@prisma/client";

export default function TemplateList({ templates: initialTemplates }: { templates: EmailTemplate[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const res = await deleteTemplate(formData);
      if (res?.success) {
        toast.success("Template deleted successfully");
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        toast.error("Failed to delete template");
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting");
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-end items-end mb-6">
        <button
          onClick={() => router.push("/templates/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition shadow-sm"
        >
          <Add size={18} /> New Template
        </button>
      </div>

      <div className="bg-card rounded-md border border-border overflow-hidden">
        {templates.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
             <Code size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground mb-1">No templates found</p>
            <p className="text-sm">You haven't created any email templates yet.</p>
            <button
              onClick={() => router.push("/templates/new")}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded hover:bg-muted/80 transition"
            >
              <Add size={18} /> Create your first template
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Template Name</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">{t.name}</td>
                    <td className="px-6 py-4 text-muted-foreground truncate max-w-xs" title={t.subject}>{t.subject}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/templates/${t.id}/edit`)}
                          className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Edit Template"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete Template"
                        >
                          <TrashCan size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
