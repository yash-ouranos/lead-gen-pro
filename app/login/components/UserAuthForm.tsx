"use client"

import * as React from"react"
import { signIn } from"next-auth/react"
import { Button } from"@/app/components/ui/button"
import { cn } from"@/lib/utils"

export default function UserAuthForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
 const [isLoading, setIsLoading] = React.useState<boolean>(false)
 const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
 const [email, setEmail] = React.useState("")
 const [password, setPassword] = React.useState("")
 const [error, setError] = React.useState("")

 async function loginWithEmail(e: React.FormEvent) {
 e.preventDefault()
 setIsLoading(true)
 setError("")

 try {
 const res = await signIn("credentials", {
 redirect: false,
 email,
 password,
 })

 if (res?.error) {
 setError("Invalid email or password")
 } else {
 window.location.href ="/dashboard"
 }
 } catch (error) {
 setError("An unexpected error occurred")
 } finally {
 setIsLoading(false)
 }
 }

 async function loginWithGoogle() {
 setIsGoogleLoading(true)
 try {
 await signIn("google", { callbackUrl:"/dashboard"})
 } catch (error) {
 console.error(error)
 setIsGoogleLoading(false)
 }
 }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={loginWithEmail} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                required
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                required
                suppressHydrationWarning
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98]" 
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading && (
            <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-medium">
          <span className="bg-white px-3 text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={loginWithGoogle} 
        disabled={isLoading || isGoogleLoading}
        className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 rounded-lg font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
      >
        {isGoogleLoading ? (
          <svg className="mr-2 h-4 w-4 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            <path fill="#34A853" d="M248 504c-76.3 0-143.9-33.8-189.5-86.8L120.3 365C154.2 396.4 198.8 414.6 248 414.6c98.2 0 135-70.4 140.8-106.9l69.1 54.1C412.3 434 336.9 504 248 504z"></path>
            <path fill="#FBBC05" d="M58.5 417.2C21.7 375.4 0 318.5 0 256s21.7-119.4 58.5-161.2l61.8 52.1C102.3 175.7 94.3 214.2 94.3 256s8 80.3 26 109.1l-61.8 52.1z"></path>
            <path fill="#EA4335" d="M248 8c76.3 0 143.9 33.8 189.5 86.8l-61.8 52.2C341.8 115.6 297.2 97.4 248 97.4c-84.6 0-153.7 70.1-153.7 156.6l-69.1-54.1C71.1 76 146.5 8 248 8z"></path>
          </svg>
        )}
        Google (For Gmail Sending)
      </Button>
    </div>
  )
}
