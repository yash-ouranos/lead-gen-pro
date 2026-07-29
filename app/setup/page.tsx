"use client"

import { useState } from"react"
import { Button } from"@/app/components/ui/button"
import { useRouter } from"next/navigation"

export default function SetupPage() {
 const router = useRouter()
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState("")
 const [formData, setFormData] = useState({
 name:"",
 email:"",
 password:""
 })

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault()
 setIsLoading(true)
 setError("")

 try {
 const res = await fetch("/api/setup", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify(formData)
 })

 if (res.ok) {
 router.push("/login")
 } else {
 const data = await res.json()
 setError(data.error ||"Failed to create admin")
 }
 } catch (err) {
 setError("An unexpected error occurred")
 } finally {
 setIsLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
 <div className="max-w-md w-full bg-white p-8 shadow-md border">
 <h1 className="text-2xl font-bold mb-6 text-center">Initial Setup</h1>
 <p className="text-sm text-gray-500 mb-6 text-center">
 Create the first admin account. This screen will only work if there are zero users in the database.
 </p>

 {error && <div className="text-sm text-red-500 bg-red-50 p-3 mb-4">{error}</div>}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Name</label>
 <input 
 type="text"
 required
 value={formData.name}
 onChange={e => setFormData({...formData, name: e.target.value})}
 className="w-full border px-3 py-2"
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Email</label>
 <input 
 type="email"
 required
 value={formData.email}
 onChange={e => setFormData({...formData, email: e.target.value})}
 className="w-full border px-3 py-2"
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Password</label>
 <input 
 type="password"
 required
 value={formData.password}
 onChange={e => setFormData({...formData, password: e.target.value})}
 className="w-full border px-3 py-2"
 />
 </div>
 
 <Button type="submit"className="w-full mt-4"disabled={isLoading}>
 {isLoading ?"Creating...":"Create Admin Account"}
 </Button>
 </form>
 </div>
 </div>
 )
}
