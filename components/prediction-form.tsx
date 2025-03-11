"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, BirdIcon as CricketBall, Trophy, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PredictionResult } from "@/components/prediction-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const teams = [
  "Chennai Super Kings",
  "Royal Challengers Bengaluru",
  "Punjab Kings",
  "Mumbai Indians",
  "Kolkata Knight Riders",
  "Rajasthan Royals",
  "Sunrisers Hyderabad",
  "Delhi Capitals",
  "Lucknow Super Giants",
  "Gujarat Titans",
]

const cities = [
  "Bangalore",
  "Chandigarh",
  "Delhi",
  "Mumbai",
  "Kolkata",
  "Jaipur",
  "Hyderabad",
  "Chennai",
  "Cape Town",
  "Port Elizabeth",
  "Durban",
  "Centurion",
  "East London",
  "Johannesburg",
  "Kimberley",
  "Bloemfontein",
  "Ahmedabad",
  "Cuttack",
  "Nagpur",
  "Dharamsala",
  "Visakhapatnam",
  "Pune",
  "Raipur",
  "Ranchi",
  "Abu Dhabi",
  "Bengaluru",
  "Indore",
  "Dubai",
  "Sharjah",
  "Navi Mumbai",
  "Lucknow",
  "Guwahati",
  "Mohali",
].filter((city) => city !== undefined && city !== null && city !== "nan")

const formSchema = z
  .object({
    batting_team: z.string().min(1, "Batting team is required"),
    bowling_team: z.string().min(1, "Bowling team is required"),
    city: z.string().min(1, "City is required"),
    runs_left: z.coerce
      .number()
      .min(0, "Runs left cannot be negative")
      .refine((val) => val >= 0, {
        message: "Runs left cannot be negative",
      }),
    balls_left: z.coerce
      .number()
      .min(0, "Balls left cannot be negative")
      .max(120, "Balls left cannot be more than 120"),
    wickets_left: z.coerce
      .number()
      .min(0, "Wickets left cannot be negative")
      .max(10, "Wickets left cannot be more than 10"),
    target_runs: z.coerce.number().min(1, "Target runs must be at least 1"),
    crr: z.coerce.number().optional(),
    rrr: z.coerce.number().optional(),
  })
  .refine((data) => data.batting_team !== data.bowling_team, {
    message: "Batting and bowling teams must be different",
    path: ["bowling_team"],
  })
  .refine((data) => data.runs_left <= data.target_runs, {
    message: "Runs left cannot be greater than target runs",
    path: ["runs_left"],
  })

export function PredictionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batting_team: "",
      bowling_team: "",
      city: "",
      runs_left: undefined,
      balls_left: undefined,
      wickets_left: undefined,
      target_runs: undefined,
      crr: undefined,
      rrr: undefined,
    },
  })

  const { watch, setValue } = form
  const runs_left = watch("runs_left")
  const balls_left = watch("balls_left")
  const target_runs = watch("target_runs")

  // Calculate CRR and RRR
  useEffect(() => {
    if (target_runs && runs_left !== undefined && balls_left !== undefined) {
      const totalBallsFaced = 120 - balls_left
      if (totalBallsFaced > 0) {
        const runsScored = target_runs - runs_left
        const crr = (runsScored / (totalBallsFaced / 6)).toFixed(2)
        form.setValue("crr", Number.parseFloat(crr))
      }

      if (balls_left > 0) {
        const rrr = (runs_left / (balls_left / 6)).toFixed(2)
        form.setValue("rrr", Number.parseFloat(rrr))
      }
    }
  }, [runs_left, balls_left, target_runs, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setPredictionResult(null)

    try {
      // Calculate CRR and RRR
      const totalBallsFaced = 120 - values.balls_left
      const runsScored = values.target_runs - values.runs_left
      const crr = totalBallsFaced > 0 ? runsScored / (totalBallsFaced / 6) : 0
      const rrr = values.balls_left > 0 ? values.runs_left / (values.balls_left / 6) : 0

      const payload = {
        ...values,
        crr,
        rrr,
      }

      const response = await fetch("https://iplmatchbackend.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPredictionResult(data.result)
      setShowResult(true)
    } catch (error) {
      console.error("Error predicting match result:", error)
      alert("Failed to predict match result. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <CricketBall className="h-6 w-6" />
          Match Situation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                  <Trophy className="h-5 w-5" /> Teams Information
                </h3>
                <FormField
                  control={form.control}
                  name="batting_team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">Batting Team</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 h-11 rounded-md shadow-sm transition-all">
                            <SelectValue placeholder="Select batting team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {teams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bowling_team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">Bowling Team</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 h-11 rounded-md shadow-sm transition-all">
                            <SelectValue placeholder="Select bowling team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {teams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 h-11 rounded-md shadow-sm transition-all">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-700">
                  <Target className="h-5 w-5" /> Match Situation
                </h3>
                <FormField
                  control={form.control}
                  name="target_runs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-700">Target Runs</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          className="border-2 border-purple-200 focus:border-purple-500 h-11 rounded-md shadow-sm transition-all"
                          placeholder="Enter target runs"
                        />
                      </FormControl>
                      <FormDescription>Total runs to be chased</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="runs_left"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-700">Runs Left</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          className="border-2 border-purple-200 focus:border-purple-500 h-11 rounded-md shadow-sm transition-all"
                          placeholder="Enter runs left"
                        />
                      </FormControl>
                      <FormDescription>Runs needed to win</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balls_left"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-700">Balls Left</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          className="border-2 border-purple-200 focus:border-purple-500 h-11 rounded-md shadow-sm transition-all"
                          placeholder="Enter balls left"
                        />
                      </FormControl>
                      <FormDescription>Remaining balls to be bowled</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wickets_left"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-700">Wickets Left</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          className="border-2 border-purple-200 focus:border-purple-500 h-11 rounded-md shadow-sm transition-all"
                          placeholder="Enter wickets left (0-10)"
                        />
                      </FormControl>
                      <FormDescription>Remaining wickets (0-10)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="crr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Current Run Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        disabled
                        className="bg-gray-50 border-2 border-gray-200 h-11 rounded-md"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated based on runs scored and balls faced</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rrr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Required Run Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        disabled
                        className="bg-gray-50 border-2 border-gray-200 h-11 rounded-md"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated based on runs left and balls left</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Match Situation...
                </>
              ) : (
                "Predict Match Result"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {showResult && predictionResult !== null && (
        <PredictionResult
          result={predictionResult}
          battingTeam={form.getValues("batting_team")}
          bowlingTeam={form.getValues("bowling_team")}
          onClose={() => setShowResult(false)}
        />
      )}
    </Card>
  )
}

