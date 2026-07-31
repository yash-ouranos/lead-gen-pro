"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTemplate, updateTemplate } from "@/app/(app)/templates/actions";
import toast from "react-hot-toast";
import { Save } from "@carbon/icons-react";
import type { EmailTemplate } from "@prisma/client";
import dynamic from "next/dynamic";

const CKEditor = dynamic(() => import("@/app/components/CKEditorWrapper"), { ssr: false });

export default function TemplateForm({ initialData }: { initialData?: EmailTemplate }) {
  const router = useRouter();
  
  const [name, setName] = useState(initialData?.name || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [body, setBody] = useState(initialData?.body || "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isCreating = !initialData;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Template Name is required.";
    if (!subject.trim()) newErrors.subject = "Email Subject is required.";
    if (!body.trim()) newErrors.body = "Email Body is required.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("subject", subject);
    formData.append("body", body);
    
    if (!isCreating && initialData?.id) {
        formData.append("id", initialData.id);
    }

    try {
      if (isCreating) {
        await createTemplate(formData);
        toast.success("Template created successfully");
      } else {
        await updateTemplate(formData);
        toast.success("Template updated successfully");
      }
      router.push("/templates");
      router.refresh(); // Ensure the templates list gets updated
    } catch (err) {
      toast.error("Failed to save template");
      console.error(err);
      setIsSubmitting(false);
    }
  }

  const getInputClasses = (field: string) => {
    return `w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:outline-none transition-all text-foreground text-sm shadow-sm ${
      fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary"
    }`;
  };

  return (
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Template Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className={getInputClasses("name")}
          placeholder="e.g. Initial Outreach - Digital Agencies"
        />
        {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Email Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className={getInputClasses("subject")}
          placeholder="e.g. Quick question about {businessName}"
        />
        {fieldErrors.subject && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5 flex justify-between">
          <span>Email Body *</span>
        </label>
        <CKEditor
          value={body}
          onChange={setBody}
          placeholder="Hi there..."
        />
        {fieldErrors.body && <p className="text-red-500 text-xs mt-1">{fieldErrors.body}</p>}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-800 dark:text-blue-300 rounded">
        <strong>Available Variables:</strong> <br/>
        <code className="text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded">{`{businessName}`}</code>, 
        <code className="text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded ml-2">{`{niche}`}</code>, 
        <code className="text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded ml-2">{`{location}`}</code>, 
        <code className="text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded ml-2">{`{website}`}</code>
      </div>

      <div className="pt-6 flex justify-end gap-4 pb-12">
        <button
          type="button"
          onClick={() => router.push("/templates")}
          className="px-6 py-2.5 bg-card text-foreground border border-border hover:bg-muted font-semibold transition-all shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={16} /> {isSubmitting ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
}
