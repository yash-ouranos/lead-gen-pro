import { ArrowsHorizontal, Email, SendAlt, AddAlt, Calendar } from"@carbon/icons-react";

export default function ActivityTimeline({ activities }: { activities: any[] }) {
 const getIconForActivity = (type: string) => {
 switch (type) {
 case"CREATED": return <AddAlt size={16} className="text-green-500"/>;
 case"STATUS_CHANGE": return <ArrowsHorizontal size={16} className="text-blue-500"/>;
 case"EMAIL_SENT": return <SendAlt size={16} className="text-purple-500"/>;
 case"EMAIL_RECEIVED": return <Email size={16} className="text-teal-500"/>;
 case"EMAIL_OPENED": return <Email size={16} className="text-yellow-500"/>;
 case"MEETING_BOOKED": return <Calendar size={16} className="text-indigo-500"/>;
 default: return <AddAlt size={16} className="text-gray-500"/>;
 }
 };

 return (
 <div>
 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
 <ActivityIcon /> Activity History
 </h3>
 
 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
 
 {(!activities || activities.length === 0) ? (
 <p className="text-sm text-gray-500 italic ml-12">No activity recorded yet.</p>
 ) : (
 activities.map((activity: any) => (
 <div key={activity.id} className="relative flex items-start gap-4">
 
 <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-50 text-slate-500 shadow-sm shrink-0 z-10 relative">
 {getIconForActivity(activity.type)}
 </div>
 
 <div className="flex-1 p-4 border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
 <h4 className="font-semibold text-sm text-gray-900 capitalize tracking-tight">
 {activity.type.replace(/_/g,"").toLowerCase()}
 </h4>
 <time className="text-xs text-gray-400 font-medium whitespace-nowrap">
 {new Date(activity.createdAt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit"}) }
 </time>
 </div>
 <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
 </div>

 </div>
 ))
 )}
 </div>
 </div>
 );
}

function ActivityIcon() {
 return (
 <svg xmlns="http://www.w3.org/2000/svg"width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"className="text-gray-400">
 <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
 </svg>
 );
}
