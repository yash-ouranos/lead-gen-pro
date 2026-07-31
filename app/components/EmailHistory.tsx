"use client";

import { useState } from "react";
import { Email, Time, View, User } from "@carbon/icons-react";

export default function EmailHistory({ emailLogs }: { emailLogs: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!emailLogs || emailLogs.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-12 bg-white rounded-xl text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4 border border-gray-100">
          <Email size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No emails yet</h3>
        <p className="text-gray-500 max-w-sm">
          Send an email to this lead to start a conversation.
        </p>
      </div>
    );
  }

  // Sort logs by sentAt descending (latest first)
  const sortedLogs = [...emailLogs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  return (
    <div className="flex flex-col border-t border-gray-200">
      {sortedLogs.map((log: any) => {
        const isSent = log.type === "SENT";
        const isUnread = isSent ? log.openCount === 0 : false; // Treat unread sent as bold (or maybe we shouldn't? Let's just make everything normal unless we track inbound unread)
        // Actually, let's just make SENT unread bold, and RECEIVED unread bold (we don't track inbound unread yet, so let's default inbound to bold to simulate it needing attention)
        const isUnreadDisplay = isSent ? log.openCount === 0 : true; 
        const isExpanded = expandedId === log.id;
        
        // Snippet generation
        const snippet = (log.body || "").replace(/\n/g, ' ').substring(0, 100) + ((log.body || "").length > 100 ? '...' : '');
        const senderText = isSent ? "Me" : "Lead";

        return (
          <div key={log.id} className="border-b border-gray-200 flex flex-col">
            {/* List Row */}
            <div 
              onClick={() => setExpandedId(isExpanded ? null : log.id)}
              className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors ${
                isUnreadDisplay ? 'bg-white' : 'bg-gray-50/50'
              } hover:bg-gray-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.02)]`}
            >
              <div className="w-24 shrink-0 flex items-center gap-2">
                <span className={`text-sm ${isUnreadDisplay ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {senderText}
                </span>
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className={`text-sm truncate ${isUnreadDisplay ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {log.subject}
                </span>
                <span className="text-sm text-gray-500 truncate">- {snippet}</span>
              </div>
              
              <div className="w-24 shrink-0 text-right">
                <span className={`text-xs ${isUnreadDisplay ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                  {new Date(log.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-inner">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {isSent ? "Me" : "Lead"} 
                      </h4>
                      <p className="text-xs text-gray-500">to {isSent ? "Lead" : "Me"}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Time size={14} />
                    {new Date(log.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{log.subject}</h3>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {log.body}
                  </div>
                </div>

                {isSent && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs">
                    {log.openCount > 0 ? (
                      <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                        <View size={14} />
                        Opened {log.openCount} {log.openCount === 1 ? 'time' : 'times'}
                        {log.openedAt && ` (Last: ${new Date(log.openedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })})`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full font-medium border border-gray-200">
                        <View size={14} /> Unread
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
