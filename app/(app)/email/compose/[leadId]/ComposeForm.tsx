"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmail } from "./actions";
import type { EmailTemplate } from "@prisma/client";
import dynamic from "next/dynamic";

const CKEditor = dynamic(() => import("@/app/components/CKEditorWrapper"), { ssr: false });

interface ComposeFormProps {
  leadId: string;
  leadData: {
    businessName: string;
    niche: string;
    location: string;
    website: string;
    email: string;
  };
  templates: EmailTemplate[];
  initialSubject: string;
  initialBody: string;
  onSuccess?: () => void;
}

export default function ComposeForm({ leadId, leadData, templates, initialSubject, initialBody, onSuccess }: ComposeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  function applyTemplate(templateId: string) {
    if (!templateId) return;
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    let newSubject = template.subject;
    let newBody = template.body;

    const replaceVars = (text: string) => {
      return text
        .replace(/{businessName}/g, leadData.businessName || "")
        .replace(/{niche}/g, leadData.niche || "")
        .replace(/{location}/g, leadData.location || "")
        .replace(/{website}/g, leadData.website || "");
    };

    setSubject(replaceVars(newSubject));
    setBody(replaceVars(newBody));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setError(null);

    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = "Subject is required.";
    if (!body.trim()) newErrors.body = "Message body is required.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const result = await sendEmail(leadId, subject, body);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      if (onSuccess) {
        onSuccess();
        setSubject(initialSubject);
        setBody(initialBody);
        setIsSubmitting(false);
      } else {
        router.push("/dashboard");
      }
    }
  }

  const getInputClasses = (field: string) => {
    return `w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:outline-none transition-all text-foreground text-sm shadow-sm ${
      fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary"
    }`;
  };

  return (
    <div className="flex-1 p-6 md:p-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 mb-6 border border-red-100">
          {error}
        </div>
      )}

      {templates.length > 0 && (
        <div className="mb-6 p-4 bg-muted/50 border border-border flex items-center justify-between">
          <label htmlFor="template" className="text-sm font-medium text-muted-foreground">Load a Template</label>
          <select 
            id="template"
            className="px-4 py-2.5 border border-border bg-background outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none text-sm w-64 transition-all shadow-sm"
            onChange={(e) => applyTemplate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>-- Select Template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">To</label>
          <div className="w-full px-4 py-2 border border-border bg-muted/50 text-muted-foreground font-medium">
            {leadData.email}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-1">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={getInputClasses("subject")}
          />
          {fieldErrors.subject && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject}</p>}
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-muted-foreground mb-1">Message *</label>
          <CKEditor
            value={body}
            onChange={setBody}
            placeholder="Type your message here..."
          />
          {fieldErrors.body && <p className="text-red-500 text-xs mt-1">{fieldErrors.body}</p>}
          <p className="mt-1 text-xs text-gray-400">The tracking pixel is automatically appended.</p>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-card text-muted-foreground font-medium hover:bg-muted/50 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? "Sending..." : "Send Email"}
          </button>
        </div>
      </form>
    </div>
  );
}
