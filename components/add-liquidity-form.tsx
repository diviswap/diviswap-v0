"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { TokenSelector } from "@/components/token-selector"
import { COMMON_TOKENS, ROUTER_ADDRESS } from "@/lib/constants"
import { checkAllowance, approveToken } from "@/lib/contracts"
import { formatCurrency } from "@/lib/utils"

export function AddLiquidityForm({ onAddLiquidity }) {
  const { provider, signer, account, isConnected } = useWeb3()
  const { toast } = useToast()

  const [token0, setToken0] = useState(COMMON_TOKENS[0])
  const [token1, setToken1] = useState(null)
  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")
  const [isApproved0, setIsApproved0] = useState(false)
  const [isApproved1, setIsApproved1] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const checkTokenAllowances = async () => {
      if (!isConnected || !signer || !token0 || !token1 || !amount0 || !amount1) {
        setIsApproved0(false)
        setIsApproved1(false)
        return
      }

      try {
        const amount0Wei = ethers.utils.parseUnits(amount0, token0.decimals)
        const amount1Wei = ethers.utils.parseUnits(amount1, token1.decimals)

        const [allowance0, allowance1] = await Promise.all([
          checkAllowance(token0.address, account, ROUTER_ADDRESS, provider),
          checkAllowance(token1.address, account, ROUTER_ADDRESS, provider),
        ])

        setIsApproved0(allowance0.gte(amount0Wei))
        setIsApproved1(allowance1.gte(amount1Wei))
      } catch (error) {
        console.error("Error checking allowances:", error)
        setIsApproved0(false)
        setIsApproved1(false)
      }
    }

    checkTokenAllowances()
  }, [isConnected, provider, signer, account, token0, token1, amount0, amount1])

  const handleApprove = async (tokenIndex: number) => {
    if (!isConnected || !signer) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    const token = tokenIndex === 0 ? token0 : token1
    const amount = tokenIndex === 0 ? amount0 : amount1

    if (!token || !amount) {
      return
    }

    setIsApproving(true)

    try {
      const amountWei = ethers.utils.parseUnits(amount, token.decimals)
      const tx = await approveToken(token.address, ROUTER_ADDRESS, ethers.constants.MaxUint256, signer)

      toast({
        title: "Success",
        description: `${token.symbol} approved successfully!`,
      })

      if (tokenIndex === 0) {
        setIsApproved0(true)
      } else {
        setIsApproved1(true)
      }
    } catch (error) {
      console.error("Error approving token:", error)
      toast({
        title: "Error",
        description: "Failed to approve token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!isConnected || !signer || !token0 || !token1) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!isApproved0 || !isApproved1) {
      toast({
        title: "Error",
        description: "Please approve both tokens first.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)

    try {
      await onAddLiquidity(token0, token1, amount0, amount1)
      setAmount0("")
      setAmount1("")
    } catch (error) {
      console.error("Error adding liquidity:", error)
      toast({
        title: "Error",
        description: "Failed to add liquidity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Añadir liquidez</CardTitle>
        <CardDescription>Añade liquidez para ganar comisiones de trading</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token 0 input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="token0-amount">Token 1</Label>
            {account && token0 && (
              <span className="text-xs text-muted-foreground">
                Balance: {formatCurrency(0)} {token0.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="token0-amount"
                placeholder="0.0"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs"
                onClick={() => setAmount0("0")} // Replace with actual max balance
              >
                MAX
              </Button>
            </div>
            <TokenSelector selectedToken={token0} onSelectToken={setToken0} otherToken={token1} />
          </div>
        </div>

        <div className="flex justify-center">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Token 1 input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="token1-amount">Token 2</Label>
            {account && token1 && (
              <span className="text-xs text-muted-foreground">
                Balance: {formatCurrency(0)} {token1.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="token1-amount"
              placeholder="0.0"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              className="flex-1"
            />
            <TokenSelector selectedToken={token1} onSelectToken={setToken1} otherToken={token0} />
          </div>
        </div>

        {token0 && token1 && amount0 && amount1 && (
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Participación en el pool</span>
              <span>0.00%</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!isConnected ? (
          <Button className="w-full" disabled>
            Conecta tu wallet para continuar
          </Button>
        ) : !isApproved0 || !isApproved1 ? (
          <div className="flex flex-col w-full gap-2">
            {!isApproved0 && token0 && amount0 && (
              <Button className="w-full" onClick={() => handleApprove(0)} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Aprobando...
                  </>
                ) : (
                  `Aprobar ${token0.symbol}`
                )}
              </Button>
            )}
            {!isApproved1 && token1 && amount1 && (
              <Button className="w-full" onClick={() => handleApprove(1)} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Aprobando...
                  </>
                ) : (
                  `Aprobar ${token1.symbol}`
                )}
              </Button>
            )}
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={handleAddLiquidity}
            disabled={
              isAdding || !token0 || !token1 || !amount0 || !amount1 || Number(amount0) === 0 || Number(amount1) === 0
            }
          >
            {isAdding ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Añadiendo liquidez...
              </>
            ) : (
              "Añadir liquidez"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

