"use client";

import { useState } from "react";
import { createTemplate, updateTemplate, deleteTemplate } from "./actions";
import { TrashCan, Close, Edit, Add, Save } from "@carbon/icons-react";
import type { EmailTemplate } from "@prisma/client";

export default function TemplateManager({ initialTemplates }: { initialTemplates: EmailTemplate[] }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function startCreate() {
    setName("");
    setSubject("");
    setBody("");
    setIsCreating(true);
    setEditingId(null);
    setFieldErrors({});
  }

  function startEdit(t: EmailTemplate) {
    setName(t.name);
    setSubject(t.subject);
    setBody(t.body);
    setEditingId(t.id);
    setIsCreating(false);
    setFieldErrors({});
  }

  function cancelForm() {
    setIsCreating(false);
    setEditingId(null);
    setFieldErrors({});
  }

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

    try {
      if (isCreating) {
        await createTemplate(formData);
      } else if (editingId) {
        formData.append("id", editingId);
        await updateTemplate(formData);
      }
      // Since revalidatePath is called in actions, we could rely on Server Actions to refresh the page.
      // But Next.js revalidatePath might just refresh the RSC payload.
      window.location.reload(); // Simple approach to refresh data
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      await deleteTemplate(formData);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  }

  const getInputClasses = (field: string) => {
    return `w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:outline-none transition-all text-foreground text-sm shadow-sm ${
      fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary"
    }`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <Add size={18} /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: List */}
        <div className="col-span-1 bg-card overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-muted/50 font-medium text-muted-foreground">Your Templates</div>
          <div className="overflow-y-auto flex-1">
            {templates.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No templates yet. Create one!</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {templates.map(t => (
                  <li 
                    key={t.id} 
                    className={`p-4 hover:bg-muted/50 cursor-pointer flex justify-between group ${editingId === t.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                    onClick={() => startEdit(t)}
                  >
                    <div>
                      <h3 className="font-medium text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">{t.subject}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <TrashCan size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: Editor */}
        <div className="col-span-2">
          {(isCreating || editingId) ? (
            <div className="bg-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">{isCreating ? "New Template" : "Edit Template"}</h2>
                <button onClick={cancelForm} className="text-gray-400 hover:text-muted-foreground">
                  <Close size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Template Name *</label>
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email Subject *</label>
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1 flex justify-between">
                    <span>Email Body *</span>
                  </label>
                  <textarea
                    rows={12}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    className={`${getInputClasses("body")} font-sans resize-y`}
                    placeholder="Hi there..."
                  />
                  {fieldErrors.body && <p className="text-red-500 text-xs mt-1">{fieldErrors.body}</p>}
                </div>
                
                <div className="bg-blue-50 p-3 text-sm text-blue-800">
                  <strong>Available Variables:</strong> <br/>
                  <code className="text-blue-900 bg-blue-100 px-1 py-0.5">{`{businessName}`}</code>, 
                  <code className="text-blue-900 bg-blue-100 px-1 py-0.5 ml-2">{`{niche}`}</code>, 
                  <code className="text-blue-900 bg-blue-100 px-1 py-0.5 ml-2">{`{location}`}</code>, 
                  <code className="text-blue-900 bg-blue-100 px-1 py-0.5 ml-2">{`{website}`}</code>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save size={16} /> {isSubmitting ? "Saving..." : "Save Template"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border border-dashed border-border bg-muted/50 flex items-center justify-center h-[600px] text-muted-foreground">
              Select a template to edit or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
