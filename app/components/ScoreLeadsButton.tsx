"use client";

import { useState } from"react";

export default function ScoreLeadsButton({ userId, campaignId }: { userId: string, campaignId?: string }) {
 const [loading, setLoading] = useState(false);

 const handleScore = () => {
 setLoading(true);
 fetch("/api/score-leads", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ userId, campaignId })
 }).then(() => {
 window.location.reload();
 }).finally(() => {
 setLoading(false);
 });
 };

 return (
 <button 
 type="button"
 onClick={handleScore}
 disabled={loading}
 className="text-sm px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
 >
 {loading ?"Scoring...":"Run AI Scoring"}
 </button>
 );
}
