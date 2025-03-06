"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

// Sample data for proposals
const PROPOSALS = [
  {
    id: 1,
    title: "Increase staking rewards by 10%",
    description: "This proposal aims to increase staking rewards to incentivize more participation in the platform.",
    forVotes: 1500000,
    againstVotes: 500000,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  {
    id: 2,
    title: "Integrate new trading pair USDC/CHZ",
    description: "Add a new USDC/CHZ trading pair to increase liquidity and trading options on the platform.",
    forVotes: 2000000,
    againstVotes: 100000,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
]

export default function GovernancePage() {
  const [votingPower, setVotingPower] = useState(10000) // Example voting power
  const { toast } = useToast()

  const handleVote = (proposalId: number, support: boolean) => {
    // Here would go the real voting logic
    toast({
      title: "Vote recorded",
      description: `You have voted ${support ? "for" : "against"} proposal ${proposalId}`,
    })
  }

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6">$DSwap Governance</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Voting Power</CardTitle>
          <CardDescription>Based on your staked $DSwap tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(votingPower)} votes</p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Active Proposals</h2>
      <div className="space-y-6">
        {PROPOSALS.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <CardTitle>{proposal.title}</CardTitle>
              <CardDescription>Ends on {proposal.endTime.toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{proposal.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold">For: {formatCurrency(proposal.forVotes)}</p>
                  <p className="font-semibold">Against: {formatCurrency(proposal.againstVotes)}</p>
                </div>
                <div className="space-x-2">
                  <Button onClick={() => handleVote(proposal.id, true)} variant="outline">
                    Vote For
                  </Button>
                  <Button onClick={() => handleVote(proposal.id, false)} variant="outline">
                    Vote Against
                  </Button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(proposal.forVotes / (proposal.forVotes + proposal.againstVotes)) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

