"use client";

import { useState, useEffect } from "react";
import { Email, Time, View, User, ChevronLeft, SendAlt, Reply } from "@carbon/icons-react";
import { sendEmail, toggleEmailReadStatus } from "@/app/(app)/email/compose/[leadId]/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { signIn } from "next-auth/react";

const CKEditor = dynamic(() => import("@/app/components/CKEditorWrapper"), { ssr: false });

function cleanEmailBody(body: string, isHtml: boolean) {
  if (!body) return "";
  let cleaned = body;

  if (isHtml) {
    // For HTML, we let CSS handle hiding the `.gmail_quote` elements to avoid breaking HTML structure
    // But we still strip the "On [date] wrote:" text that sometimes precedes the quote
    cleaned = cleaned.replace(/<div dir="ltr">On\s+.*?wrote:<br><\/div>/gi, '');
  } else {
    // Remove plain text quote blocks starting with "On ... wrote:"
    const quotePattern = /(\r?\n)*On\s+.*?wrote:\s*[\s\S]*$/i;
    cleaned = cleaned.replace(quotePattern, '');
  }
  
  return cleaned.trim();
}

function ThreadMessage({ log, isLatest, isSent }: { log: any, isLatest: boolean, isSent: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(!isLatest);
  const displayBody = log.body?.trim() ? log.body : "No content available.";
  const plainTextBody = displayBody.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n/g, ' ').trim();
  const snippet = plainTextBody.substring(0, 100) + (plainTextBody.length > 100 ? '...' : '');
  const isHtml = /<\/?(html|body|div|p|br|table|strong|em|span|b|i)[>\s]/i.test(log.body || '');

  return (
    <div className={`flex flex-col border border-gray-100 rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${isCollapsed ? 'bg-white' : ''}`}>
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${!isCollapsed ? 'bg-gray-50/50 border-b border-gray-100' : 'bg-white'}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${isSent ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <User size={16} />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 text-sm shrink-0">
              {isSent ? "Me" : "Lead"} 
            </h4>
            {isCollapsed && (
              <span className="text-sm text-gray-500 truncate">- {snippet}</span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 shrink-0 ml-4">
          {new Date(log.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-5 text-[13px] text-gray-700 leading-relaxed bg-white">
          {isHtml ? (
            <div 
              dangerouslySetInnerHTML={{ __html: cleanEmailBody(displayBody, true) }}
              className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-ul:my-1 prose-li:my-0.5"
            />
          ) : (
            <div className="whitespace-pre-wrap font-sans">
              {cleanEmailBody(displayBody, false)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmailHistory({ 
  emailLogs,
  onExpandChange,
  searchQuery,
  dateFilter,
  leadId
}: { 
  emailLogs: any[],
  onExpandChange?: (isExpanded: boolean) => void,
  searchQuery?: string,
  dateFilter?: string,
  leadId?: string
}) {
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [needsGoogleConnect, setNeedsGoogleConnect] = useState(false);
  const [localLogs, setLocalLogs] = useState(emailLogs);
  const router = useRouter();

  // Sync local state when server props change
  useEffect(() => {
    setLocalLogs(emailLogs);
  }, [emailLogs]);

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(expandedThreadId !== null);
      if (expandedThreadId === null) {
        setIsReplying(false);
        setReplyText("");
      }
    }
  }, [expandedThreadId, onExpandChange]);

  const handleToggleReadStatus = async (logId: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistically update UI instantly
    const newStatus = !currentStatus;
    setLocalLogs(prev => prev.map(log => log.id === logId ? { ...log, isRead: newStatus } : log));

    try {
      const res = await toggleEmailReadStatus(logId, newStatus);
      if (res?.error) {
        if (res.error.includes("connect your Google account")) {
          setNeedsGoogleConnect(true);
        } else {
          toast.error(res.error);
        }
        // Revert on error
        setLocalLogs(prev => prev.map(log => log.id === logId ? { ...log, isRead: currentStatus } : log));
      } else {
        router.refresh(); // Keep server cache in sync quietly
      }
    } catch (err) {
      toast.error("Failed to update status");
      // Revert on error
      setLocalLogs(prev => prev.map(log => log.id === logId ? { ...log, isRead: currentStatus } : log));
    }
  };

  // We do NOT include `threads` in the dependency array to avoid infinite loops,
  // since `threads` is recreated on every render.
  // We can just rely on the fact that when `expandedThreadId` changes, we process it once.
  useEffect(() => {
    if (expandedThreadId) {
      // We look up the latest log for this thread directly from localLogs
      const relatedLogs = localLogs.filter(l => l.threadId === expandedThreadId || l.id === expandedThreadId);
      if (relatedLogs.length > 0) {
        // Sort to get latest
        const sorted = [...relatedLogs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        const latestLog = sorted[0];
        if (latestLog.type === "RECEIVED" && !latestLog.isRead) {
          // Pass the CURRENT status (false) so the toggle flips it to true
          handleToggleReadStatus(latestLog.id, false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedThreadId]);

  let filteredLogs = [...localLogs];
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredLogs = filteredLogs.filter((log: any) => {
      const subjectMatch = log.subject?.toLowerCase().includes(q);
      const plainTextBody = (log.body || '').replace(/<[^>]*>?/gm, ' ').toLowerCase();
      const bodyMatch = plainTextBody.includes(q);
      return subjectMatch || bodyMatch;
    });
  }

  if (dateFilter) {
    filteredLogs = filteredLogs.filter((log: any) => 
      new Date(log.sentAt).toISOString().split('T')[0] === dateFilter
    );
  }

  // Normalize subject for grouping legacy emails without threadId
  const normalizeSubject = (subject: string) => {
    return (subject || "").replace(/^(re|fwd|fw):\s*/gi, "").trim().toLowerCase();
  };
  const isReply = (subject: string) => /^(re|fwd|fw):\s*/i.test(subject || "");

  // Step 1: Initial grouping based on Gmail threadId or legacy subject
  const threadIdToGroup = new Map<string, any[]>();
  const legacySubjectToGroup = new Map<string, any[]>();
  
  filteredLogs.forEach((log) => {
    if (log.threadId) {
      if (!threadIdToGroup.has(log.threadId)) {
        threadIdToGroup.set(log.threadId, []);
      }
      threadIdToGroup.get(log.threadId)!.push(log);
    } else {
      const normSubj = normalizeSubject(log.subject);
      if (!legacySubjectToGroup.has(normSubj)) {
        legacySubjectToGroup.set(normSubj, []);
      }
      legacySubjectToGroup.get(normSubj)!.push(log);
    }
  });

  const allGroups = [
    ...Array.from(threadIdToGroup.values()),
    ...Array.from(legacySubjectToGroup.values())
  ];

  // Step 2: Separate into root threads (contain original emails) and orphan threads (only replies)
  const rootGroups: any[][] = [];
  const orphanGroups: any[][] = [];
  
  allGroups.forEach(group => {
    const hasRoot = group.some(log => !isReply(log.subject));
    if (hasRoot) {
      rootGroups.push(group);
    } else {
      orphanGroups.push(group);
    }
  });

  // Step 3: Merge orphan reply threads into their corresponding root thread
  orphanGroups.forEach(orphan => {
    const normSubj = normalizeSubject(orphan[0].subject);
    const matchingRoot = rootGroups.find(root => normalizeSubject(root[0].subject) === normSubj);
    if (matchingRoot) {
      matchingRoot.push(...orphan);
    } else {
      rootGroups.push(orphan);
    }
  });

  // Convert to array and sort by most recent email
  const threads = rootGroups.map((logs, index) => {
    const id = logs.find(l => l.threadId)?.threadId || logs[0].id || String(index);
    return {
      id,
      logs: logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    };
  }).sort((a, b) => {
    const latestA = new Date(a.logs[0].sentAt).getTime();
    const latestB = new Date(b.logs[0].sentAt).getTime();
    return latestB - latestA;
  });

  if (needsGoogleConnect) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-12 bg-white rounded-xl text-center border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-100">
          <Email size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Gmail</h3>
        <p className="text-gray-500 max-w-md mb-6">
          To send and receive emails directly from the CRM, you need to link your Google account.
        </p>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          Continue with Google
        </button>
        <button
          onClick={() => setNeedsGoogleConnect(false)}
          className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

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

  if (expandedThreadId) {
    const thread = threads.find((t) => t.id === expandedThreadId);
    if (!thread) {
      setExpandedThreadId(null);
      return null;
    }
    
    // Sort chronologically (oldest first) for reading flow
    const chronologicalLogs = [...thread.logs].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    const displaySubject = thread.logs[0].subject?.replace(/^(re|fwd|fw):\s*/gi, "").trim() || "No Subject";
    const latestLog = thread.logs[0];
    const latestReceivedLog = thread.logs.find(log => log.type === "RECEIVED");
    
    return (
      <div className="flex flex-col bg-white">
        <style>{`
          .gmail_quote { display: none !important; }
        `}</style>
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 bg-white shrink-0 sticky top-0 z-10">
          <button 
            onClick={() => setExpandedThreadId(null)}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back to Emails
          </button>
          <div className="ml-auto">
            {latestReceivedLog && (
              <button 
                onClick={(e) => handleToggleReadStatus(latestReceivedLog.id, latestReceivedLog.isRead, e)}
                className="text-xs font-semibold px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Mark as {latestReceivedLog.isRead ? "Unread" : "Read"}
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900">{displaySubject}</h3>
          </div>

          <div className="space-y-3">
            {chronologicalLogs.map((log: any, index: number) => {
              const isSent = log.type === "SENT";
              const isLatest = index === chronologicalLogs.length - 1;
              return (
                <ThreadMessage 
                  key={log.id || index} 
                  log={log} 
                  isLatest={isLatest} 
                  isSent={isSent} 
                />
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-4">
            {!isReplying ? (
              <button
                onClick={() => setIsReplying(true)}
                className="flex items-center gap-2 self-start px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md font-medium transition-colors border border-gray-200"
              >
                <Reply size={16} />
                Reply
              </button>
            ) : (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-200 rounded-md p-1 shadow-sm">
                <CKEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder="Type your reply here..."
                />
                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={isSubmittingReply}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!replyText.trim() || !leadId) return;
                      setIsSubmittingReply(true);
                      try {
                        const replySubject = latestLog.subject.toLowerCase().startsWith('re:') ? latestLog.subject : `Re: ${latestLog.subject}`;
                        const result = await sendEmail(leadId, replySubject, replyText, latestLog.id);
                        if (result.error) {
                          if (result.error.includes("connect your Google account")) {
                            setNeedsGoogleConnect(true);
                          } else {
                            toast.error(result.error);
                          }
                        } else {
                          toast.success("Reply sent successfully");
                          
                          // Optimistic update: Add the sent email instantly to the thread
                          const tempLog = {
                            id: "temp-" + Date.now(),
                            subject: replySubject,
                            body: replyText,
                            type: "SENT",
                            isRead: false, // Sent emails don't need reading
                            openCount: 0,
                            sentAt: new Date().toISOString(),
                            threadId: latestLog.threadId || latestLog.id
                          };
                          setLocalLogs(prev => [...prev, tempLog]);

                          setIsReplying(false);
                          setReplyText("");
                          router.refresh(); // Refresh data here to pull the real log from DB
                        }
                      } catch (e) {
                        toast.error("Failed to send reply");
                      } finally {
                        setIsSubmittingReply(false);
                      }
                    }}
                    disabled={!replyText.trim() || isSubmittingReply}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <SendAlt size={16} />
                    {isSubmittingReply ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-gray-200">
      {threads.map((thread) => {
        const latestLog = thread.logs[0];
        const isSent = latestLog.type === "SENT";
        const isUnreadDisplay = isSent ? false : !latestLog.isRead;
        const threadCount = thread.logs.length;
        
        const displaySubject = latestLog.subject?.trim() ? latestLog.subject : "No Subject";
        const displayBody = latestLog.body?.trim() ? latestLog.body : "No content available.";
        
        // Snippet generation (strip HTML tags)
        const plainTextBody = displayBody.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n/g, ' ').trim();
        const snippet = plainTextBody.substring(0, 100) + (plainTextBody.length > 100 ? '...' : '');
        
        // Determine senders display
        const senderTypes = Array.from(new Set(thread.logs.map(l => l.type === "SENT" ? "Me" : "Lead")));
        const senderText = senderTypes.join(", ");

        return (
          <div key={thread.id} className="border-b border-gray-200 flex flex-col">
            {/* List Row */}
            <div 
              onClick={() => setExpandedThreadId(thread.id)}
              className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors ${
                isUnreadDisplay && !isSent ? 'bg-blue-50/30' : isUnreadDisplay ? 'bg-white' : 'bg-gray-50/50'
              } hover:bg-gray-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.02)]`}
            >
              <div className="w-32 shrink-0 flex items-center gap-2">
                {!isSent && isUnreadDisplay && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                )}
                <span className={`text-sm truncate ${isUnreadDisplay ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {senderText}
                  {threadCount > 1 && <span className="ml-1 text-gray-500 font-normal">({threadCount})</span>}
                </span>
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-2 pr-4">
                <span className={`text-sm truncate ${isUnreadDisplay ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {displaySubject}
                </span>
                <span className="text-sm text-gray-500 truncate">- {snippet}</span>
              </div>
              
              <div className="w-20 shrink-0 flex items-center justify-end text-xs mr-4">
                {isSent ? (
                  latestLog.openCount > 0 ? (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-100" title={`Opened ${latestLog.openCount} times`}>
                      <View size={12} /> {latestLog.openCount}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Unread</span>
                  )
                ) : null}
              </div>

              <div className="w-20 shrink-0 text-right">
                <span className={`text-xs ${isUnreadDisplay ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                  {new Date(latestLog.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
