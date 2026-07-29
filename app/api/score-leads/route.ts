import { NextResponse } from"next/server";
import { prisma } from"@/lib/prisma";
import Anthropic from"@anthropic-ai/sdk";
import OpenAI from"openai";
import { GoogleGenerativeAI } from"@google/generative-ai";

export async function POST(request: Request) {
 try {
 const { campaignId, userId } = await request.json();

 const user = await prisma.user.findUnique({
 where: { id: userId },
 });

 if (!user) {
 return NextResponse.json({ error:"User not found"}, { status: 404 });
 }

 const leads = await prisma.lead.findMany({
 where: { campaignId, aiScore: null },
 take: 10, // Process in batches
 });

 if (leads.length === 0) {
 await prisma.campaign.update({
 where: { id: campaignId },
 data: { status:"COMPLETED"},
 });
 return NextResponse.json({ message:"All leads scored"});
 }

 for (const lead of leads) {
 const prompt =`Analyze this business lead and give a score from 0 to 100 based on how likely they are to need digital marketing or software services.
 
 Business Name: ${lead.businessName}
 Website: ${lead.website ||"None"}
 Phone: ${lead.phone ||"None"}
 Address: ${lead.address ||"None"}
 Rating: ${lead.rating ||"N/A"}
 Reviews: ${lead.reviewCount ||"N/A"}
 
 Provide your response as a JSON object with exactly two keys:
 {
"score": (integer 0-100),
"analysis":"(string explaining the reasoning briefly)"
 }`;

 let result: { score: number; analysis: string } | null = null;

 // 1. Try Claude 3.5 Sonnet
 if (user.anthropicApiKey && !result) {
 try {
 const anthropic = new Anthropic({ apiKey: user.anthropicApiKey });
 const response = await anthropic.messages.create({
 model:"claude-3-5-sonnet-20240620",
 max_tokens: 300,
 messages: [{ role:"user", content: prompt }],
 });
 const text = response.content[0].type ==='text'? response.content[0].text :"";
 const match = text.match(/\{[\s\S]*\}/);
 if (match) result = JSON.parse(match[0]);
 } catch (e) {
 console.error("Claude failed:", e);
 }
 }

 // 2. Try OpenAI GPT-4o
 if (user.openaiApiKey && !result) {
 try {
 const openai = new OpenAI({ apiKey: user.openaiApiKey });
 const response = await openai.chat.completions.create({
 model:"gpt-4o",
 response_format: { type:"json_object"},
 messages: [{ role:"user", content: prompt }],
 });
 result = JSON.parse(response.choices[0].message.content ||"{}");
 } catch (e) {
 console.error("OpenAI failed:", e);
 }
 }

 // 3. Try Gemini
 if (user.geminiApiKey && !result) {
 try {
 const genAI = new GoogleGenerativeAI(user.geminiApiKey);
 const model = genAI.getGenerativeModel({ model:"gemini-1.5-pro"});
 const response = await model.generateContent(prompt);
 const text = response.response.text();
 const match = text.match(/\{[\s\S]*\}/);
 if (match) result = JSON.parse(match[0]);
 } catch (e) {
 console.error("Gemini failed:", e);
 }
 }

 // Fallback if all fail or no keys provided
 if (!result) {
 result = { score: 50, analysis:"Could not score lead due to missing API keys or API failures."};
 }

 await prisma.lead.update({
 where: { id: lead.id },
 data: {
 aiScore: result.score,
 aiAnalysis: result.analysis,
 },
 });
 }

 return NextResponse.json({ message:`Scored ${leads.length} leads.`});
 } catch (error) {
 console.error("Scoring error:", error);
 return NextResponse.json({ error:"Internal Server Error"}, { status: 500 });
 }
}
