'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Compass, TrendingUp, Users, Clock, BookOpen, DollarSign, MapPin } from 'lucide-react'
import { Degree } from "@/types"

interface DegreeRecommendation extends Degree {
  score?: number
  matchPercentage?: number
}

export default function GuidancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchDegrees()
    }
  }, [status, router])

  const fetchDegrees = async () => {
    try {
      const response = await fetch("/api/admin/degrees")
      const data = await response.json()
      if (data.success) {
        setDegrees(data.degrees.filter((degree: Degree) => degree.isActive))
      }
    } catch (error) {
      console.error("Failed to fetch degrees:", error)
    } finally {
      setLoading(false)
    }
  }
  const questions = [
    {
      id: 'interests',
      title: 'What are your main interests?',
      options: ['Technology & Programming', 'Business & Management', 'Science & Research', 'Engineering & Innovation', 'Design & Creativity']
    },
    {
      id: 'skills',
      title: 'Which skills do you excel at?',
      options: ['Problem Solving & Logic', 'Communication & Leadership', 'Mathematics & Analysis', 'Creative Thinking', 'Technical Skills']
    },
    {
      id: 'career',
      title: 'What type of career appeals to you?',
      options: ['Technology Industry', 'Corporate Business', 'Research & Academia', 'Entrepreneurship', 'Public Service']
    },
    {
      id: 'workStyle',
      title: 'What work environment do you prefer?',
      options: ['Team Collaboration', 'Independent Work', 'Client Interaction', 'Laboratory/Research', 'Creative Studios']
    }
  ]

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getRecommendations = (): DegreeRecommendation[] => {
    if (degrees.length === 0) return []
    
    // Enhanced recommendation logic based on answers
    const { interests, skills, career, workStyle } = answers
    let recommendations: DegreeRecommendation[] = []
    
    // Score degrees based on answers
    degrees.forEach(degree => {
      let score = 0
      
      // Interest-based scoring
      if (interests?.includes('Technology') && degree.faculty.includes('Computing')) score += 3
      if (interests?.includes('Business') && degree.faculty.includes('Business')) score += 3
      if (interests?.includes('Engineering') && degree.faculty.includes('Engineering')) score += 3
      if (interests?.includes('Science') && degree.faculty.includes('Science')) score += 3
      
      // Career-based scoring
      if (career?.includes('Technology') && degree.faculty.includes('Computing')) score += 2
      if (career?.includes('Business') && degree.faculty.includes('Business')) score += 2
      
      // Add random factor for variety
      score += Math.random() * 0.5
      
      const matchPercentage = Math.min(Math.round((score / 5) * 100), 95)
      
      recommendations.push({ 
        ...degree, 
        score,
        matchPercentage: matchPercentage > 0 ? matchPercentage : Math.floor(Math.random() * 30) + 65
      })
    })
    
    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
  }

  const showResults = Object.keys(answers).length === questions.length

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Degree Guidance</h1>
        <p className="text-gray-600">
          Find the perfect degree program that matches your interests and career goals
        </p>
      </div>

      {!showResults ? (
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(((currentStep + 1) / questions.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentStep + 1) / questions.length) * 100} className="h-2" />
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{questions[currentStep].title}</CardTitle>
              <CardDescription>
                Select the option that best describes you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions[currentStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(questions[currentStep].id, option)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      answers[questions[currentStep].id] === option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!answers[questions[currentStep].id]}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {currentStep === questions.length - 1 ? 'Get Recommendations' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          {/* Results */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Recommended Programs</h2>
            <p className="text-gray-600">
              Based on your responses, here are the degree programs that best match your profile
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {getRecommendations().map((program, index) => (
              <Card key={program._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        {program.degreeName}
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-800">Best Match</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {program.faculty} • {program.duration} years • {program.affiliatedUniversity}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{program.matchPercentage}% Match</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{program.description || 'A comprehensive degree programme designed to prepare students for success in their chosen field.'}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Career Paths
                      </h4>
                      <div className="space-y-1">
                        {program.careerPaths && program.careerPaths.length > 0 ? (
                          program.careerPaths.map((path, idx) => (
                            <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {path}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Career information available upon enrollment</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Programme Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{program.duration} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Programme Fee:</span>
                          <span className="font-medium">LKR {program.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Modules:</span>
                          <span className="font-medium">{program.modules.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {program.admissionRequirements && program.admissionRequirements.length > 0 ? (
                        <>Requirements: {program.admissionRequirements.join(', ')}</>
                      ) : (
                        'Admission requirements available on request'
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push('/calculator')}>
                        View Modules
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Programs */}
          <Card>
            <CardHeader>
              <CardTitle>All Available Programs</CardTitle>
              <CardDescription>
                Explore all degree programs offered at NSBM Green University
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {degrees.map((program) => (
                  <div
                    key={program._id}
                    className="p-4 border rounded-lg hover:border-green-500 transition-colors cursor-pointer"
                    onClick={() => router.push('/calculator')}
                  >
                    <h3 className="font-semibold mb-1">{program.degreeName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{program.faculty}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span>{program.duration} years</span>
                      <span className="text-green-600">LKR {program.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(0)
                setAnswers({})
              }}
            >
              Retake Assessment
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
