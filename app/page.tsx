import Link from"next/link"
import { Button } from"./components/ui/button"

export default function LandingPage() {
 return (
 <div className="flex min-h-screen flex-col">
 <header className="px-6 lg:px-14 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
 <Link className="flex items-center justify-center"href="/">
 <span className="font-bold text-xl text-primary">LeadGen<span className="text-gray-900">Pro</span></span>
 </Link>
 <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
 <Link className="text-sm font-medium hover:text-primary transition-colors"href="#features">
 Features
 </Link>
 <Link className="text-sm font-medium hover:text-primary transition-colors"href="#pricing">
 Pricing
 </Link>
 <Link className="text-sm font-medium hover:text-primary transition-colors"href="/login">
 Login
 </Link>
 <Link href="/login">
 <Button>Get Started</Button>
 </Link>
 </nav>
 </header>
 <main className="flex-1">
 <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-50">
 <div className="container px-4 md:px-6 mx-auto">
 <div className="flex flex-col items-center space-y-4 text-center">
 <div className="space-y-2 max-w-3xl">
 <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
 Automate your <span className="text-primary">lead generation</span> and close more deals.
 </h1>
 <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 pt-4">
 Find local businesses, score them using AI, and send personalized automated emails. All from one powerful dashboard.
 </p>
 </div>
 <div className="space-x-4 pt-6">
 <Link href="/login">
 <Button size="lg"className="h-12 px-8">Start for free</Button>
 </Link>
 <Link href="#features">
 <Button variant="outline"size="lg"className="h-12 px-8">Learn more</Button>
 </Link>
 </div>
 </div>
 </div>
 </section>

 <section id="features"className="w-full py-12 md:py-24 lg:py-32 bg-white">
 <div className="container px-4 md:px-6 mx-auto">
 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
 <div className="space-y-2">
 <div className="inline-block bg-gray-100 px-3 py-1 text-sm text-primary font-medium">Features</div>
 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need to grow</h2>
 <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
 We've built the ultimate tool for agencies, freelancers, and B2B businesses.
 </p>
 </div>
 </div>
 <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
 <div className="flex flex-col items-center space-y-4 text-center p-6 border shadow-sm bg-gray-50/50">
 <div className="p-3 bg-primary/10 rounded-full text-primary">
 <svg className="w-6 h-6"fill="none"height="24"stroke="currentColor"strokeLinecap="round"strokeLinejoin="round"strokeWidth="2"viewBox="0 0 24 24"width="24"xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12"x2="12"y1="15"y2="3"/></svg>
 </div>
 <h3 className="text-xl font-bold">Google Maps Scraping</h3>
 <p className="text-gray-500 dark:text-gray-400">Extract hundreds of leads in minutes from any city and niche.</p>
 </div>
 <div className="flex flex-col items-center space-y-4 text-center p-6 border shadow-sm bg-gray-50/50">
 <div className="p-3 bg-primary/10 rounded-full text-primary">
 <svg className="w-6 h-6"fill="none"height="24"stroke="currentColor"strokeLinecap="round"strokeLinejoin="round"strokeWidth="2"viewBox="0 0 24 24"width="24"xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
 </div>
 <h3 className="text-xl font-bold">AI Lead Scoring</h3>
 <p className="text-gray-500 dark:text-gray-400">Our AI analyzes their website to tell you exactly how likely they are to buy.</p>
 </div>
 <div className="flex flex-col items-center space-y-4 text-center p-6 border shadow-sm bg-gray-50/50">
 <div className="p-3 bg-primary/10 rounded-full text-primary">
 <svg className="w-6 h-6"fill="none"height="24"stroke="currentColor"strokeLinecap="round"strokeLinejoin="round"strokeWidth="2"viewBox="0 0 24 24"width="24"xmlns="http://www.w3.org/2000/svg"><rect height="16"rx="2"width="20"x="2"y="4"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
 </div>
 <h3 className="text-xl font-bold">1-Click Cold Email</h3>
 <p className="text-gray-500 dark:text-gray-400">Use dynamic templates to send highly personalized emails from your own Gmail.</p>
 </div>
 </div>
 </div>
 </section>
 </main>
 <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
 <p className="text-xs text-gray-500 dark:text-gray-400">
 © 2026 LeadGenPro Inc. All rights reserved.
 </p>
 <nav className="sm:ml-auto flex gap-4 sm:gap-6">
 <Link className="text-xs hover:underline underline-offset-4 text-gray-500"href="#">
 Terms of Service
 </Link>
 <Link className="text-xs hover:underline underline-offset-4 text-gray-500"href="#">
 Privacy
 </Link>
 </nav>
 </footer>
 </div>
 )
}
