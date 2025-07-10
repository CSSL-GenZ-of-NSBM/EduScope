"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Degree } from "@/types"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    faculty: "",
    year: "",
    degree: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [degrees, setDegrees] = useState<Degree[]>([])
  const router = useRouter()

  // Fetch degrees when component mounts
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const response = await fetch("/api/degrees") // We'll need to create a public endpoint
        const data = await response.json()
        if (data.success) {
          setDegrees(data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch degrees:", error)
      }
    }

    fetchDegrees()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          studentId: formData.studentId,
          faculty: formData.faculty,
          year: formData.year ? parseInt(formData.year) : null,
          degree: formData.degree || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Account created successfully! Please sign in.")
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with logo (visible only on md screens and up) */}
          <div className="hidden md:block md:w-1/3 md:border-r md:flex md:flex-col md:justify-center md:items-center md:bg-muted/30 md:rounded-l-lg md:p-6">
            <div className="mb-6">
              <Image
                src="/images/logo.png"
                alt="EduScope Logo"
                width={180}
                height={180}
                className="h-24 w-auto object-contain"
                priority
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Join EduScope
              </CardTitle>
              <CardDescription className="mt-2 text-sm">
                Create your NSBM student account to access resources, share research, and connect with peers
              </CardDescription>
            </div>
          </div>
          
          {/* Form section */}
          <div className="md:w-2/3">
            {/* Mobile header with logo */}
            <CardHeader className="md:hidden space-y-1 pt-4 pb-0">
              <div className="flex flex-col items-center">
                <Image
                  src="/images/logo.png"
                  alt="EduScope Logo"
                  width={150}
                  height={150}
                  className="h-16 w-auto object-contain mb-2"
                  priority
                />
                <CardTitle className="text-xl font-bold text-primary">
                  Join EduScope
                </CardTitle>
                <CardDescription className="text-sm">
                  Create your NSBM student account
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pt-3 md:pt-6 px-4 md:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Messages */}
            {error && (
              <Alert variant="destructive" className="py-2 mb-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="py-2 mb-2 bg-green-50 border-green-200">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            
            {/* Form Fields in 2-column grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
              {/* Personal Information */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Student Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.name@students.nsbm.ac.lk"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>
              
              {/* Academic Information */}
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="2XXXX"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="faculty" className="text-sm font-medium">Faculty</Label>
                <Select 
                  onValueChange={(value: string) => handleSelectChange("faculty", value)}
                  value={formData.faculty}
                >
                  <SelectTrigger id="faculty" className="h-11">
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty of Engineering">Faculty of Engineering</SelectItem>
                    <SelectItem value="Faculty of Business">Faculty of Business</SelectItem>
                    <SelectItem value="Faculty of Computing">Faculty of Computing</SelectItem>
                    <SelectItem value="Faculty of Sciences">Faculty of Sciences</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">Academic Year</Label>
                <Select 
                  onValueChange={(value: string) => handleSelectChange("year", value)}
                  value={formData.year}
                >
                  <SelectTrigger id="year" className="h-11">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="degree" className="text-sm font-medium">Degree Programme</Label>
                <Select 
                  onValueChange={(value: string) => handleSelectChange("degree", value)}
                  value={formData.degree}
                >
                  <SelectTrigger id="degree" className="h-11">
                    <SelectValue placeholder="Select your degree programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {degrees.map((degree) => (
                      <SelectItem key={degree._id} value={degree._id}>
                        {degree.degreeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Empty div for grid alignment */}
              <div className="hidden sm:block"></div>
              
              {/* Password section - full width on mobile, side by side on desktop */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 mt-1">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          
            {/* Sign in link */}
            <div className="flex items-center justify-center mt-4 text-sm">
              <span className="text-muted-foreground">
                Already have an account?
              </span>
              <Link
                href="/auth/signin"
                className="ml-2 text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}
