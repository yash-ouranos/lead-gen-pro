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
 <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
 <div className="absolute inset-0 bg-primary"/>
 <div className="relative z-20 flex items-center text-lg font-medium">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 className="mr-2 h-6 w-6"
 >
 <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
 </svg>
 LeadGenPro
 </div>
 <div className="relative z-20 mt-auto">
 <blockquote className="space-y-2">
 <p className="text-lg">
 &ldquo;This tool has completely transformed how we find and engage with local businesses. The AI scoring saves us hours every single day.&rdquo;
 </p>
 <footer className="text-sm">Sofia Davis, Agency Owner</footer>
 </blockquote>
 </div>
 </div>
 <div className="lg:p-8">
 <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
 <div className="flex flex-col space-y-2 text-center">
 <h1 className="text-2xl font-semibold tracking-tight">
 Welcome back
 </h1>
 <p className="text-sm text-muted-foreground">
 Login with your Google account to continue
 </p>
 </div>
 <UserAuthForm />
 <p className="px-8 text-center text-sm text-muted-foreground">
 By clicking continue, you agree to our{""}
 <Link
 href="/terms"
 className="underline underline-offset-4 hover:text-primary"
 >
 Terms of Service
 </Link>{""}
 and{""}
 <Link
 href="/privacy"
 className="underline underline-offset-4 hover:text-primary"
 >
 Privacy Policy
 </Link>
 .
 </p>
 </div>
 </div>
 </div>
 )
}
