"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Trophy, AlertTriangle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PredictionResultProps {
  result: number
  battingTeam: string
  bowlingTeam: string
  onClose: () => void
}

export function PredictionResult({ result, battingTeam, bowlingTeam, onClose }: PredictionResultProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    setIsClient(true)

    // Animate the percentage
    const timer = setTimeout(() => {
      setAnimatedPercentage(result)
    }, 500)

    return () => clearTimeout(timer)
  }, [result])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  // Round to 2 decimal places
  const battingTeamWinPercentage = Number.parseFloat(result.toFixed(2))
  const bowlingTeamWinPercentage = Number.parseFloat((100 - battingTeamWinPercentage).toFixed(2))

  const data = [
    { name: battingTeam, value: battingTeamWinPercentage },
    { name: bowlingTeam, value: bowlingTeamWinPercentage },
  ]

  // Determine colors based on which team has higher probability
  const COLORS =
    battingTeamWinPercentage > bowlingTeamWinPercentage
      ? ["#4f46e5", "#f97316"] // Batting team winning (indigo, orange)
      : ["#f97316", "#4f46e5"] // Bowling team winning (orange, indigo)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-bold text-lg">{`${payload[0].name}`}</p>
          <p className="text-md font-medium">{`Win Probability: ${payload[0].value}%`}</p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Only show label if percentage is significant enough (> 5%)
    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-medium text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-blue-50 border-0 shadow-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-blue-800 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Match Prediction Result
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Win probability based on the current match situation
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <div className="w-full h-64">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                    animationBegin={200}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value, entry, index) => <span className="text-gray-800 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 text-center">
            {battingTeamWinPercentage > bowlingTeamWinPercentage ? (
              <div className="space-y-2">
                <Badge className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-lg">Batting Team Favored</Badge>
                <p className="text-xl font-bold text-blue-800">
                  {battingTeam} has a {battingTeamWinPercentage}% chance of winning
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge className="bg-orange-500 hover:bg-orange-600 px-3 py-1 text-lg">Bowling Team Favored</Badge>
                <p className="text-xl font-bold text-orange-700">
                  {bowlingTeam} has a {bowlingTeamWinPercentage}% chance of winning
                </p>
              </div>
            )}

            {(battingTeamWinPercentage < 20 || bowlingTeamWinPercentage < 20) && (
              <div className="mt-3 flex items-center justify-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">This is a highly one-sided match situation!</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

