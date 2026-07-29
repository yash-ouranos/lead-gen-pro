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
 <form onSubmit={loginWithEmail} className="space-y-4">
 {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-2">{error}</div>}
 
 <div>
 <label className="block text-sm font-medium mb-1">Email</label>
 <input
 type="email"
 required
 suppressHydrationWarning
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full border px-3 py-2 text-sm"
 placeholder="name@example.com"
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Password</label>
 <input
 type="password"
 required
 suppressHydrationWarning
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full border px-3 py-2 text-sm"
 />
 </div>

 <Button type="submit"className="w-full"disabled={isLoading || isGoogleLoading}>
 {isLoading && (
 <svg className="mr-2 h-4 w-4 animate-spin"xmlns="http://www.w3.org/2000/svg"fill="none"viewBox="0 0 24 24">
 <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"></circle>
 <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 )}
 Sign In
 </Button>
 </form>

 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <span className="w-full border-t"/>
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="bg-background px-2 text-muted-foreground">
 Or continue with
 </span>
 </div>
 </div>

 <Button type="button"variant="outline"onClick={loginWithGoogle} disabled={isLoading || isGoogleLoading}>
 {isGoogleLoading ? (
 <svg className="mr-2 h-4 w-4 animate-spin"xmlns="http://www.w3.org/2000/svg"fill="none"viewBox="0 0 24 24">
 <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"></circle>
 <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 ) : (
 <svg className="mr-2 h-4 w-4"aria-hidden="true"focusable="false"data-prefix="fab"data-icon="google"role="img"xmlns="http://www.w3.org/2000/svg"viewBox="0 0 488 512">
 <path fill="currentColor"d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
 </svg>
 )}
 Google (For Gmail Sending)
 </Button>
 </div>
 )
}
