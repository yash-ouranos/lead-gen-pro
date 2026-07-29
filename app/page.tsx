"use client"

import Link from "next/link"
import { Button } from "./components/ui/button"
import { motion } from "framer-motion"

export default function LandingPage() {
  const features = [
    {
      title: "Google Maps Scraping",
      desc: "Extract hundreds of leads in minutes from any city and niche with zero technical setup.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      colorClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    },
    {
      title: "AI Lead Scoring",
      desc: "Our AI analyzes their website to tell you exactly how likely they are to buy, saving you hours.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    },
    {
      title: "1-Click Cold Email",
      desc: "Use dynamic templates to send highly personalized emails directly from your own Gmail account.",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  ]

  const pricingPlans = [
    { name: "Starter", price: "$29", desc: "Perfect for freelancers getting started.", features: ["500 leads / month", "Basic AI scoring", "1 connected email", "Standard support"] },
    { name: "Pro", price: "$79", desc: "For growing agencies and sales teams.", features: ["5,000 leads / month", "Advanced AI scoring", "5 connected emails", "Priority support", "Custom templates"], highlight: true },
    { name: "Agency", price: "$199", desc: "Uncapped potential for large operations.", features: ["Unlimited leads", "Custom AI parameters", "Unlimited emails", "24/7 phone support", "White-label reports"] }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#030014] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-800/20 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-30" />
      </div>

      <header className="px-6 lg:px-14 h-20 flex items-center border-b border-white/5 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
          </div>
          <span className="font-bold text-xl text-white">LeadGen<span className="text-indigo-400">Pro</span></span>
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block" href="/login">
            Login
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 flex items-center justify-center relative">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-8"
            >
              <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse shadow-[0_0_10px_2px_rgba(129,140,248,0.5)]"></span>
                LeadGenPro 2.0 is now live
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 pb-2 sm:pb-4">
                Automate your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">lead generation</span> engine.
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl/relaxed lg:text-2xl/relaxed">
                Find local businesses, score them using AI, and send personalized automated emails. All from one powerful dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg shadow-[0_0_40px_8px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_60px_12px_rgba(79,70,229,0.4)] hover:scale-105">
                    Start for free
                  </Button>
                </Link>
                <Link href="/#features">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/20 hover:bg-white/10 text-white text-lg bg-transparent backdrop-blur-sm">
                    View features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-black/40 border-y border-white/5 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 pb-2">Everything you need to grow</h2>
              <p className="max-w-[800px] text-gray-400 md:text-xl/relaxed">
                We've built the ultimate tool for agencies, freelancers, and B2B businesses to scale their outreach.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm h-full"
                >
                  <div className={`p-4 rounded-2xl border ${feature.colorClass}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 pb-2">Simple, transparent pricing</h2>
              <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed">
                Choose the perfect plan for your business needs. No hidden fees.
              </p>
            </div>
            
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 items-center">
              {pricingPlans.map((plan, i) => (
                <motion.div 
                  key={plan.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col p-8 rounded-3xl backdrop-blur-xl ${plan.highlight ? 'bg-gradient-to-b from-indigo-900/40 to-purple-900/40 border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 transform md:-translate-y-4 relative' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                  {plan.highlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400 mt-2 text-sm h-10">{plan.desc}</p>
                  <div className="my-6">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-400 font-medium">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center text-gray-300 text-sm font-medium">
                        <svg className="w-5 h-5 text-indigo-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className="w-full mt-auto">
                    <Button className={`w-full h-12 rounded-xl text-md font-semibold ${plan.highlight ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-black hover:bg-gray-200'}`}>
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/10 bg-black/40 py-8 relative z-10">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-white"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
            </div>
            <p className="text-sm font-medium text-gray-400">
              © 2026 LeadGenPro Inc. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Terms of Service</Link>
            <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Twitter</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
