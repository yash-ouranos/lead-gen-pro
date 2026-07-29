import { Metadata } from"next"
import Link from"next/link"
import { getServerSession } from"next-auth"
import { redirect } from"next/navigation"
import { authOptions } from"@/lib/auth"
import UserAuthForm from"./components/UserAuthForm"

export const metadata: Metadata = {
 title:"Login | LeadGenPro",
 description:"Login to your account",
}

export default async function LoginPage() {
 const session = await getServerSession(authOptions)
 
 if (session?.user) {
 redirect("/dashboard")
 }

 return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex overflow-hidden">
        {/* Dynamic Premium Background */}
        <div className="absolute inset-0 bg-[#030014] z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/30 blur-[120px] z-0" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-800/30 blur-[100px] z-0" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] z-0" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-20 z-0" />

        <div className="relative z-20 flex items-center text-xl font-bold tracking-tight">
          <div className="w-8 h-8 mr-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-white"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          LeadGen<span className="text-indigo-400">Pro</span>
        </div>

        {/* Floating Glassmorphism Element */}
        <div className="relative z-20 m-auto w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-[1.02] duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">AI-Powered Scraping</h3>
                <p className="text-indigo-200 text-sm">Automated local business discovery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Smart Lead Scoring</h3>
                <p className="text-purple-200 text-sm">Focus on high-converting prospects</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <span className="text-xl">✉️</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Automated Outreach</h3>
                <p className="text-blue-200 text-sm">Integrated Gmail sending & tracking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-lg font-medium leading-relaxed text-indigo-50">
              &ldquo;This tool has completely transformed how we find and engage with local businesses. The AI scoring saves us hours every single day.&rdquo;
            </p>
            <footer className="text-sm text-indigo-300 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs">SD</div>
              <span className="font-medium">Sofia Davis, Agency Owner</span>
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex items-center justify-center bg-gray-50/50">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Enter your credentials to access your account
            </p>
          </div>
          
          <UserAuthForm />
          
          <p className="px-8 text-center text-xs text-gray-500 leading-relaxed">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-indigo-600 transition-colors font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-indigo-600 transition-colors font-medium"
            >
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
 </div>
 )
}
