import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from 'lucide-react'

const ExamDetails = ({ examDetails, isDarkMode }) => {
  if (!examDetails) return null

  return (
    <Card className={`w-full max-w-3xl ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Exam Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Score:</span>
            <span className="text-xl font-bold">{examDetails.score}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Status:</span>
            <span className={`text-xl font-bold flex items-center ${examDetails.passed ? 'text-green-500' : 'text-red-500'}`}>
              {examDetails.passed ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Passed
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 mr-2" />
                  Failed
                </>
              )}
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Question Details:</h3>
            {examDetails.questions.map((question, index) => (
              <div key={index} className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className="font-medium mb-2">{question.question}</p>
                <p className="text-sm">
                  Your answer: {JSON.stringify(examDetails.answers[index])}
                </p>
                <p className="text-sm">
                  Correct answer: {JSON.stringify(question.correctAnswer)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExamDetails

