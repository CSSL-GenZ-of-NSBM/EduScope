"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Faculty, UserRole } from "@/types"
import { AlertCircle, Check, Lock, User, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/toast"

// User profile interface
interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  studentId: string;
  faculty: string;
  year?: number | null;
  role: string;
}

// Pending year change request interface
interface PendingYearChangeRequest {
  id: string;
  currentYear: number;
  requestedYear: number;
  createdAt: string;
  status: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [pendingYearRequest, setPendingYearRequest] = useState<PendingYearChangeRequest | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [profileData, setProfileData] = useState({
    academicYear: ""
  })
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [deleteAccountText, setDeleteAccountText] = useState("")
  const [updateError, setUpdateError] = useState<string | null>(null)
  const { addToast } = useToast()

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const profile = await response.json()
            setUserProfile(profile)
            setProfileData({
              academicYear: ""  // Initialize with empty string so user has to make a selection
            })
          } else {
            console.error('Failed to fetch user profile')
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }

    const fetchPendingYearChangeRequest = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch('/api/user/pending-year-change')
          if (response.ok) {
            const data = await response.json()
            if (data.hasPendingRequest) {
              setPendingYearRequest(data.request)
            } else {
              setPendingYearRequest(null)
            }
          } else {
            console.error('Failed to fetch pending year change request')
          }
        } catch (error) {
          console.error('Error fetching pending year change request:', error)
        }
      }
    }

    fetchUserProfile()
    fetchPendingYearChangeRequest()
  }, [status])

  if (status === "loading" || !userProfile) {
    return (
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push('/auth/signin')
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ password: true })
    setUpdateError(null)

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setUpdateError("New passwords don't match")
      setLoading({ password: false })
      return
    }

    try {
      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      addToast({
        title: "Password Updated",
        description: "Your password has been successfully updated",
        variant: "success"
      })
    } catch (error: any) {
      setUpdateError(error.message)
    } finally {
      setLoading({ password: false })
    }
  }

  const handleAcademicYearChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ academicYear: true })
    setUpdateError(null)

    // Check if there's already a pending request (frontend validation)
    if (pendingYearRequest) {
      setUpdateError("You already have a pending year change request. Please wait for it to be reviewed.")
      setLoading({ academicYear: false })
      return
    }

    // Validate that the requested year is different from current year
    const requestedYear = parseInt(profileData.academicYear)
    if (userProfile?.year && requestedYear === userProfile.year) {
      setUpdateError("You cannot request a change to your current academic year")
      setLoading({ academicYear: false })
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newAcademicYear: requestedYear
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to request academic year change")
      }

      // Reset the form
      setProfileData({ academicYear: "" })

      // Refresh pending requests to show the new request
      const pendingResponse = await fetch('/api/user/pending-year-change')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        if (pendingData.hasPendingRequest) {
          setPendingYearRequest(pendingData.request)
        }
      }

      addToast({
        title: "Request Submitted",
        description: "Your academic year change request has been submitted for approval",
        variant: "success"
      })
    } catch (error: any) {
      setUpdateError(error.message)
    } finally {
      setLoading({ academicYear: false })
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteAccountText !== "DELETE") {
      setUpdateError("Please type DELETE to confirm account deletion")
      return
    }

    setLoading({ delete: true })
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account")
      }

      addToast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
        variant: "warning"
      })

      // Sign out and redirect to home page
      router.push('/')
    } catch (error: any) {
      setUpdateError(error.message)
    } finally {
      setLoading({ delete: false })
      setConfirmDeleteAccount(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      {updateError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{updateError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={userProfile?.name || ""} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Name cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={userProfile?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input id="faculty" value={userProfile?.faculty || "Not set"} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Faculty cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" value={userProfile?.studentId || "Not set"} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Student ID cannot be changed</p>
                </div>
              </div>
              
              {/* Academic Year Change Request */}
              <div className="border rounded-lg p-4 mt-6">
                <h3 className="text-lg font-medium mb-2">Request Academic Year Change</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your current academic year is: {userProfile?.year ? `Year ${userProfile.year}` : "Not set"}. 
                  Changes require approval from a moderator or admin.
                </p>
                
                {/* Show pending request if exists */}
                {pendingYearRequest ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Pending Year Change Request</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      You have a pending request to change from Year {pendingYearRequest.currentYear} to Year {pendingYearRequest.requestedYear}.
                    </p>
                    <p className="text-xs text-yellow-600">
                      Submitted on: {new Date(pendingYearRequest.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Please wait for an admin or moderator to review your request before submitting a new one.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAcademicYearChange}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="academicYear">New Academic Year</Label>
                        <Select 
                          value={profileData.academicYear}
                          onValueChange={(value) => 
                            setProfileData(prev => ({ ...prev, academicYear: value }))
                          }
                        >
                          <SelectTrigger id="academicYear">
                            <SelectValue placeholder={
                              userProfile?.year 
                                ? "Select a different academic year" 
                                : "Select academic year"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4].map(year => {
                              // Only show years that are not the user's current year
                              // Handle null/undefined current year by allowing all options
                              const currentYear = userProfile?.year;
                              const shouldShow = !currentYear || currentYear !== year;
                              
                              if (shouldShow) {
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    Year {year}
                                  </SelectItem>
                                );
                              }
                              return null;
                            })}
                            {/* Show a message if no years are available (shouldn't happen) */}
                            {userProfile?.year && [1, 2, 3, 4].every(year => year === userProfile.year) && (
                              <div className="px-2 py-1 text-sm text-gray-500">
                                No other years available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={loading.academicYear || !profileData.academicYear}>
                        {loading.academicYear ? "Submitting..." : "Request Change"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading.password}>
                  {loading.password ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="danger">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Actions here can't be undone. Be careful.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-destructive rounded-lg p-4">
                  <h3 className="text-lg font-medium text-destructive mb-2">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete your account, all your research papers, and other content.
                    This action cannot be undone.
                  </p>
                  <Dialog open={confirmDeleteAccount} onOpenChange={setConfirmDeleteAccount}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers, including all your research papers,
                          saved papers, and other content.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <p className="text-sm text-muted-foreground">
                          To confirm, type "DELETE" in the field below:
                        </p>
                        <Input
                          value={deleteAccountText}
                          onChange={(e) => setDeleteAccountText(e.target.value)}
                          placeholder="Type DELETE to confirm"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteAccount(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading.delete}>
                          {loading.delete ? "Deleting..." : "Delete Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
