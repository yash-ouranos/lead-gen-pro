"use client";

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Bold,
    Italic,
    Paragraph,
    Link,
    List
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { ErrorBoundary } from './ErrorBoundary';

interface CKEditorWrapperProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function CKEditorWrapper({ value, onChange, placeholder }: CKEditorWrapperProps) {
    return (
        <div className="prose max-w-none w-full ckeditor-container">
            <ErrorBoundary>
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        licenseKey: 'GPL',
                        plugins: [Essentials, Bold, Italic, Paragraph, Link, List],
                        toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList'],
                        placeholder: placeholder || 'Type your message here...'
                    }}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        onChange(data);
                    }}
                />
            </ErrorBoundary>
            <style jsx global>{`
                .ckeditor-container .ck-editor__editable {
                    min-height: 250px;
                    background-color: var(--background) !important;
                    color: var(--foreground) !important;
                }
                .ckeditor-container .ck-toolbar {
                    background-color: var(--muted) !important;
                    border-color: var(--border) !important;
                }
                .ckeditor-container .ck.ck-editor__editable_inline {
                    border-color: var(--border) !important;
                }
                .ckeditor-container .ck.ck-editor__editable_inline.ck-focused {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 2px var(--primary) inset !important;
                }
                .ckeditor-container .ck-content ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .ckeditor-container .ck-content ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .ckeditor-container .ck-content li {
                    margin-bottom: 0.25rem;
                }
            `}</style>
        </div>
    );
}
