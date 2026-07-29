import { Email, Time, Return } from"@carbon/icons-react";

export default function EmailHistory({ emailLogs }: { emailLogs: any[] }) {
 if (!emailLogs || emailLogs.length === 0) {
 return null;
 }

 return (
 <div className="mt-8 bg-white shadow-sm border border-gray-100 p-8">
 <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
 <Email className="text-gray-400"/> Email Conversation
 </h2>
 <div className="space-y-6">
 {emailLogs.map((log: any) => {
 const isSent = log.type ==="SENT";
 return (
 <div 
 key={log.id} 
 className={`p-5 border relative ${
 isSent 
 ?"bg-slate-50 border-slate-200 ml-4 lg:ml-12"
 :"bg-blue-50 border-blue-200 mr-4 lg:mr-12"
 }`}
 >
 {/* Connector dot */}
 <div className={`absolute top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
 isSent ?"-left-1.5 bg-slate-400":"-right-1.5 bg-blue-400"
 }`} />

 <div className="flex items-center justify-between mb-3 border-b pb-3 border-black/5">
 <div className="flex items-center gap-2">
 {isSent ? (
 <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
 <Return size={14} /> You Sent
 </span>
 ) : (
 <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-white px-2.5 py-1 rounded-full shadow-sm border border-blue-100">
 <Email size={14} /> Lead Replied
 </span>
 )}
 <h3 className="font-semibold text-gray-900 ml-2">{log.subject}</h3>
 </div>
 <div className="flex items-center gap-3 text-xs text-gray-500">
 <span className="flex items-center gap-1">
 <Time size={12} />
 {new Date(log.sentAt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit"})}
 </span>
 {isSent && log.opened && (
 <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 border border-green-100">
 <Email size={12} /> Opened
 </span>
 )}
 </div>
 </div>
 
 <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
 {log.body}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
