"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { ArrowDown, Settings, Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { TokenSelector } from "@/components/token-selector"
import { SettingsDialog } from "@/components/settings-dialog"
import { ROUTER_ADDRESS, DEFAULT_SLIPPAGE, DEFAULT_TOKEN } from "@/lib/constants"
import { checkAllowance, approveToken } from "@/lib/contracts"
import { formatCurrency } from "@/lib/utils"
import { createToken, getRoute, createTrade, executeSwap, getTokenBalance } from "@/lib/uniswap"
import { TradeType } from "@uniswap/sdk"

export default function SwapPage() {
  const { provider, signer, account, isConnected } = useWeb3()
  const { toast } = useToast()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [deadline, setDeadline] = useState(20) // 20 minutes

  const [fromToken, setFromToken] = useState(DEFAULT_TOKEN)
  const [toToken, setToToken] = useState(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(0)
  const [priceImpact, setPriceImpact] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fromBalance, setFromBalance] = useState<string>("0")
  const [toBalance, setToBalance] = useState<string>("0")

  useEffect(() => {
    const checkTokenAllowance = async () => {
      if (!isConnected || !signer || !fromToken || !fromAmount) {
        setIsApproved(false)
        return
      }

      try {
        const amountWei = ethers.utils.parseUnits(fromAmount, fromToken.decimals)
        const allowance = await checkAllowance(fromToken.address, account, ROUTER_ADDRESS, provider)
        setIsApproved(ethers.BigNumber.from(allowance).gte(amountWei))
      } catch (error) {
        console.error("Error checking allowance:", error)
        setIsApproved(false)
        toast({
          title: "Error",
          description: "Failed to check token allowance. Please try again.",
          variant: "destructive",
        })
      }
    }

    checkTokenAllowance()
  }, [isConnected, provider, signer, account, fromToken, fromAmount, toast])

  useEffect(() => {
    const getQuote = async () => {
      if (!fromToken || !toToken || !fromAmount || Number(fromAmount) === 0) {
        setToAmount("")
        setExchangeRate(0)
        setPriceImpact(0)
        return
      }

      setIsLoading(true)

      try {
        const tokenA = createToken(fromToken.address, fromToken.decimals, fromToken.symbol, fromToken.name)
        const tokenB = createToken(toToken.address, toToken.decimals, toToken.symbol, toToken.name)
        const route = await getRoute(tokenA, tokenB, provider)
        const trade = createTrade(
          route,
          ethers.BigNumber.from(fromAmount).mul(ethers.BigNumber.from(10).pow(fromToken.decimals)).toString(),
          TradeType.EXACT_INPUT,
        )

        setToAmount(
          ethers.BigNumber.from(trade.outputAmount.raw.toString())
            .div(ethers.BigNumber.from(10).pow(toToken.decimals))
            .toString(),
        )
        setExchangeRate(Number(trade.executionPrice.toSignificant(6)))
        setPriceImpact(Number(trade.priceImpact.toSignificant(2)))
      } catch (error) {
        console.error("Error getting quote:", error)
        setToAmount("")
        setExchangeRate(0)
        setPriceImpact(0)
        toast({
          title: "Error",
          description: "Failed to get quote. There might be insufficient liquidity for this pair.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getQuote()
  }, [fromToken, toToken, fromAmount, provider, toast])

  useEffect(() => {
    const updateBalances = async () => {
      if (isConnected && provider && account) {
        try {
          if (fromToken) {
            const fromTokenObj = createToken(fromToken.address, fromToken.decimals, fromToken.symbol, fromToken.name)
            const balance = await getTokenBalance(fromTokenObj, account, provider)
            setFromBalance(balance)
          }
          if (toToken) {
            const toTokenObj = createToken(toToken.address, toToken.decimals, toToken.symbol, toToken.name)
            const balance = await getTokenBalance(toTokenObj, account, provider)
            setToBalance(balance)
          }
        } catch (error) {
          console.error("Error updating balances:", error)
          toast({
            title: "Warning",
            description: "Failed to fetch some token balances. They may display as zero.",
            variant: "warning",
          })
        }
      } else {
        setFromBalance("0")
        setToBalance("0")
      }
    }

    updateBalances()
  }, [isConnected, provider, account, fromToken, toToken, toast])

  const handleFromAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
    }
  }

  const handleToAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value)
      if (exchangeRate > 0) {
        const calculatedFromAmount = Number(value) / exchangeRate
        setFromAmount(calculatedFromAmount.toFixed(6))
      }
    }
  }

  const handleTokenSwap = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleApprove = async () => {
    if (!isConnected || !signer || !fromToken) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsApproving(true)

    try {
      const amountWei = ethers.utils.parseUnits(fromAmount, fromToken.decimals)
      const tx = await approveToken(fromToken.address, ROUTER_ADDRESS, ethers.constants.MaxUint256, signer)
      toast({
        title: "Success",
        description: "Token approved successfully!",
      })
      setIsApproved(true)
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

  const handleSwap = async () => {
    if (!isConnected || !signer || !fromToken || !toToken) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!isApproved) {
      toast({
        title: "Error",
        description: "Please approve the token first.",
        variant: "destructive",
      })
      return
    }

    setIsSwapping(true)

    try {
      const tokenA = createToken(fromToken.address, fromToken.decimals, fromToken.symbol, fromToken.name)
      const tokenB = createToken(toToken.address, toToken.decimals, toToken.symbol, toToken.name)
      const route = await getRoute(tokenA, tokenB, provider)
      const trade = createTrade(
        route,
        ethers.utils.parseUnits(fromAmount, fromToken.decimals).toString(),
        TradeType.EXACT_INPUT,
      )

      const txHash = await executeSwap(trade, account, provider as ethers.providers.Web3Provider)

      toast({
        title: "Success",
        description: `Swap executed successfully! Transaction hash: ${txHash}`,
      })

      setFromAmount("")
      setToAmount("")
    } catch (error) {
      console.error("Error executing swap:", error)
      toast({
        title: "Error",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Swap</h1>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Swap</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Trade tokens on Chiliz Chain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="from-amount">From</Label>
              {account && fromToken && (
                <span className="text-xs text-muted-foreground">
                  Balance: {formatCurrency(Number(fromBalance))} {fromToken.symbol}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  id="from-amount"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="pr-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 text-xs"
                  onClick={() => setFromAmount(fromBalance)}
                >
                  MAX
                </Button>
              </div>
              <TokenSelector selectedToken={fromToken} onSelectToken={setFromToken} otherToken={toToken} />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTokenSwap}
              disabled={!toToken}
              className="rounded-full bg-muted h-8 w-8"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="to-amount">To</Label>
              {account && toToken && (
                <span className="text-xs text-muted-foreground">
                  Balance: {formatCurrency(Number(toBalance))} {toToken.symbol}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="to-amount"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <TokenSelector selectedToken={toToken} onSelectToken={setToToken} otherToken={fromToken} />
            </div>
          </div>

          {fromToken && toToken && fromAmount && toAmount && (
            <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price</span>
                <span>
                  1 {fromToken.symbol} = {formatCurrency(exchangeRate)} {toToken.symbol}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">Price Impact</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className={priceImpact > 1 ? "text-yellow-500" : "text-green-500"}>
                  {formatCurrency(priceImpact, 2)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Minimum Slippage</span>
                <span>{slippage}%</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!isConnected ? (
            <Button className="w-full" disabled>
              Connect your wallet to continue
            </Button>
          ) : !isApproved ? (
            <Button
              className="w-full"
              onClick={handleApprove}
              disabled={isApproving || !fromToken || !toToken || !fromAmount || !toAmount}
            >
              {isApproving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                `Approve ${fromToken?.symbol || ""}`
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleSwap}
              disabled={isSwapping || !fromToken || !toToken || !fromAmount || !toAmount || Number(fromAmount) === 0}
            >
              {isSwapping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Swapping...
                </>
              ) : (
                "Swap"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        slippage={slippage}
        onSlippageChange={setSlippage}
        deadline={deadline}
        onDeadlineChange={setDeadline}
      />
    </div>
  )
}

