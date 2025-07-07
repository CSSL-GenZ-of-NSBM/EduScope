'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Compass, TrendingUp, Users, Clock, BookOpen } from 'lucide-react'

export default function GuidancePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Mock questionnaire
  const questions = [
    {
      id: 'interests',
      title: 'What are your main interests?',
      options: ['Technology & Programming', 'Business & Finance', 'Science & Research', 'Engineering & Design']
    },
    {
      id: 'skills',
      title: 'Which skills do you excel at?',
      options: ['Problem Solving', 'Communication', 'Mathematics', 'Creative Thinking']
    },
    {
      id: 'career',
      title: 'What type of career appeals to you?',
      options: ['Tech Industry', 'Corporate Business', 'Research & Academia', 'Entrepreneurship']
    }
  ]

  // Mock degree programs
  const degreePrograms = [
    {
      id: 'cs',
      name: 'Computer Science',
      faculty: 'Faculty of Computing',
      duration: '4 years',
      description: 'Develop software, work with algorithms, and create innovative technology solutions.',
      careerPaths: ['Software Engineer', 'Data Scientist', 'AI Specialist', 'Tech Lead'],
      requirements: ['Mathematics', 'Physics', 'English'],
      popularity: 95,
      employmentRate: 98,
      averageSalary: 'LKR 80,000 - 150,000'
    },
    {
      id: 'bba',
      name: 'Business Administration',
      faculty: 'Faculty of Business',
      duration: '4 years',
      description: 'Learn business strategy, management, and entrepreneurial skills.',
      careerPaths: ['Business Analyst', 'Project Manager', 'Marketing Manager', 'CEO'],
      requirements: ['Mathematics', 'English', 'Commerce'],
      popularity: 88,
      employmentRate: 92,
      averageSalary: 'LKR 60,000 - 120,000'
    },
    {
      id: 'se',
      name: 'Software Engineering',
      faculty: 'Faculty of Computing',
      duration: '4 years',
      description: 'Design and develop large-scale software systems and applications.',
      careerPaths: ['Software Architect', 'Full-Stack Developer', 'DevOps Engineer', 'Tech Consultant'],
      requirements: ['Mathematics', 'Physics', 'English'],
      popularity: 92,
      employmentRate: 96,
      averageSalary: 'LKR 75,000 - 140,000'
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

  const getRecommendations = () => {
    // Simple recommendation logic based on answers
    return degreePrograms.slice(0, 2)
  }

  const showResults = Object.keys(answers).length === questions.length

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
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        {program.name}
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-800">Best Match</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {program.faculty} • {program.duration}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{program.popularity}% Match</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Career Paths
                      </h4>
                      <div className="space-y-1">
                        {program.careerPaths.map((path, idx) => (
                          <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {path}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Employment Rate:</span>
                          <span className="font-medium">{program.employmentRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Salary:</span>
                          <span className="font-medium">{program.averageSalary}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Requirements: {program.requirements.join(', ')}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Apply Now
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
                {degreePrograms.map((program) => (
                  <div
                    key={program.id}
                    className="p-4 border rounded-lg hover:border-green-500 transition-colors cursor-pointer"
                  >
                    <h3 className="font-semibold mb-1">{program.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{program.faculty}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span>{program.duration}</span>
                      <span className="text-green-600">{program.employmentRate}% employed</span>
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
