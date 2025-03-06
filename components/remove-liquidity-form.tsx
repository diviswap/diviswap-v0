"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { ethers } from "ethers"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { formatCurrency } from "@/lib/utils"
import { getRouterContract } from "@/lib/contracts"

interface RemoveLiquidityFormProps {
  pools: any[]
}

export function RemoveLiquidityForm({ pools }: RemoveLiquidityFormProps) {
  const { provider, signer, account, isConnected } = useWeb3()
  const { toast } = useToast()

  const [selectedPool, setSelectedPool] = useState(pools[0])
  const [amount, setAmount] = useState("")
  const [isRemoving, setIsRemoving] = useState(false)

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !signer || !selectedPool || !amount) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsRemoving(true)

    try {
      const router = getRouterContract(signer)
      const amountWei = ethers.utils.parseUnits(
        amount,
        18, // Assuming 18 decimals for LP tokens
      )

      // In a real implementation, you would call the router's removeLiquidity method

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success",
        description: "Liquidity removed successfully!",
      })

      // Reset form
      setAmount("")
    } catch (error) {
      console.error("Error removing liquidity:", error)
      toast({
        title: "Error",
        description: "Failed to remove liquidity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirar liquidez</CardTitle>
        <CardDescription>Retirar liquidez de un pool</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pool-select">Seleccionar pool</Label>
          <select
            id="pool-select"
            value={selectedPool?.id}
            onChange={(e) => setSelectedPool(pools.find((pool) => pool.id === e.target.value))}
            className="w-full border border-input bg-input text-foreground rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.token0.symbol}/{pool.token1.symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">Cantidad</Label>
            {account && selectedPool && (
              <span className="text-xs text-muted-foreground">Balance: {formatCurrency(0)} LP</span>
            )}
          </div>
          <Input
            id="amount"
            placeholder="0.0"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleRemoveLiquidity}
          disabled={isRemoving || !selectedPool || !amount || Number.parseFloat(amount) === 0}
        >
          {isRemoving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retirando...
            </>
          ) : (
            "Retirar liquidez"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

