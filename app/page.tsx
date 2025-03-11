import { PredictionForm } from "@/components/prediction-form"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            IPL Match Predictor
          </h1>
          <p className="text-gray-600 text-lg">Predict the winning percentage of IPL teams based on match situations</p>
        </header>
        <PredictionForm />
      </div>
    </main>
  )
}

