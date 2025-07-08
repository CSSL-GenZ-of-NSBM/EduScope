"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Lightbulb, GraduationCap, Users, Search, Upload, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nsbm-green to-nsbm-blue text-white py-20">
        <div className="academic-container">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20">
                <Image
                  src="/images/logo.png"
                  alt="EduScope Logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 md:w-24 md:h-24"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to EduScope
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              NSBM Green University's comprehensive research platform for research collaboration, 
              project sharing, and academic guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signin">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="academic-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Pillars of Academic Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover, share, and collaborate on academic content while getting guidance for your educational journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Research & Projects */}
            <Card className="research-card">
              <CardHeader>
                <div className="w-12 h-12 bg-nsbm-green rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Research & Projects</CardTitle>
                <CardDescription>
                  Share and discover academic papers and projects from fellow students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-nsbm-green" />
                    <span className="text-sm">Upload research papers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-nsbm-green" />
                    <span className="text-sm">Browse by field & year</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-nsbm-green" />
                    <span className="text-sm">Collaborate with peers</span>
                  </div>
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/research">Explore Research</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Idea Bank */}
            <Card className="research-card">
              <CardHeader>
                <div className="w-12 h-12 bg-nsbm-blue rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Idea Bank</CardTitle>
                <CardDescription>
                  Find inspiration and share innovative research ideas across disciplines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-nsbm-blue" />
                    <span className="text-sm">Discover research topics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-nsbm-blue" />
                    <span className="text-sm">Vote on popular ideas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-nsbm-blue" />
                    <span className="text-sm">Filter by field</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="secondary" asChild>
                  <Link href="/ideas">Browse Ideas</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Degree Guidance */}
            <Card className="research-card">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Degree Guidance</CardTitle>
                <CardDescription>
                  Get personalized recommendations for choosing your ideal degree program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Personalized assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Detailed program info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Career path guidance</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/guidance">Get Guidance</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="academic-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-nsbm-green mb-2">500+</div>
              <div className="text-muted-foreground">Research Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-nsbm-blue mb-2">1200+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-muted-foreground">Research Ideas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">4</div>
              <div className="text-muted-foreground">Faculties</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="academic-container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Academic Community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow NSBM students, share your research, and discover new opportunities for academic growth.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signin">Sign In with NSBM Email</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
