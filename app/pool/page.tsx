"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { PoolCard } from "@/components/pool-card"
import { AddLiquidityForm } from "@/components/add-liquidity-form"
import { RemoveLiquidityForm } from "@/components/remove-liquidity-form"
import { getFactoryContract } from "@/lib/contracts"
import { COMMON_TOKENS } from "@/lib/constants"
import { createToken, addLiquidity, getPairLiquidity } from "@/lib/uniswap"
import { ROUTER_ADDRESS } from "@/lib/constants"

export default function PoolPage() {
  const { provider, account, isConnected } = useWeb3()
  const { toast } = useToast()

  const [userPools, setUserPools] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("positions")

  const fetchUserPools = async () => {
    if (!isConnected || !provider || !account) {
      setUserPools([])
      return
    }

    setIsLoading(true)

    try {
      const factory = getFactoryContract(provider)

      // Get all possible token pair combinations
      const tokenPairs = []
      for (let i = 0; i < COMMON_TOKENS.length; i++) {
        for (let j = i + 1; j < COMMON_TOKENS.length; j++) {
          tokenPairs.push([COMMON_TOKENS[i], COMMON_TOKENS[j]])
        }
      }

      const userPoolsPromises = tokenPairs.map(async ([token0, token1]) => {
        try {
          const pairAddress = await factory.getPair(token0.address, token1.address)

          if (pairAddress !== ethers.constants.AddressZero) {
            const token0Obj = createToken(token0.address, token0.decimals, token0.symbol, token0.name)
            const token1Obj = createToken(token1.address, token1.decimals, token1.symbol, token1.name)
            const liquidity = await getPairLiquidity(token0Obj, token1Obj, account, provider)

            if (Number(liquidity.liquidityTokens) > 0) {
              return {
                id: pairAddress,
                token0,
                token1,
                liquidityTokens: liquidity.liquidityTokens,
                token0Amount: liquidity.tokenAAmount,
                token1Amount: liquidity.tokenBAmount,
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching pair for ${token0.symbol}-${token1.symbol}:`, error)
        }
        return null
      })

      const resolvedUserPools = (await Promise.all(userPoolsPromises)).filter(Boolean)
      setUserPools(resolvedUserPools)
    } catch (error) {
      console.error("Error fetching user pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your liquidity positions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPools()
  }, [isConnected]) //Corrected useEffect dependency

  const handleAddLiquidityClick = () => {
    setActiveTab("add")
  }

  const handleAddLiquidity = async (tokenA, tokenB, amountA, amountB) => {
    if (!isConnected || !provider) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    try {
      const tokenAObj = createToken(tokenA.address, tokenA.decimals, tokenA.symbol, tokenA.name)
      const tokenBObj = createToken(tokenB.address, tokenB.decimals, tokenB.symbol, tokenB.name)

      const txHash = await addLiquidity(
        tokenAObj,
        tokenBObj,
        ethers.utils.parseUnits(amountA, tokenA.decimals).toString(),
        ethers.utils.parseUnits(amountB, tokenB.decimals).toString(),
        account,
        provider,
      )

      toast({
        title: "Success",
        description: `Liquidity added successfully! Transaction hash: ${txHash}`,
      })

      fetchUserPools()
    } catch (error) {
      console.error("Error adding liquidity:", error)
      toast({
        title: "Error",
        description: "Failed to add liquidity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveLiquidity = async (poolId, amount) => {
    if (!isConnected || !provider) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    try {
      const pool = userPools.find((p) => p.id === poolId)
      if (!pool) {
        throw new Error("Pool not found")
      }

      const router = new ethers.Contract(
        ROUTER_ADDRESS,
        [
          "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
        ],
        provider.getSigner(),
      )

      const liquidityAmount = ethers.utils.parseUnits(amount, 18) // Assuming 18 decimals for LP tokens
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

      const tx = await router.removeLiquidity(
        pool.token0.address,
        pool.token1.address,
        liquidityAmount,
        0, // amountAMin, set to 0 for simplicity, but in production you should calculate this
        0, // amountBMin, set to 0 for simplicity, but in production you should calculate this
        account,
        deadline,
        { gasLimit: 300000 },
      )

      await tx.wait()

      toast({
        title: "Success",
        description: `Liquidity removed successfully! Transaction hash: ${tx.hash}`,
      })

      fetchUserPools()
    } catch (error) {
      console.error("Error removing liquidity:", error)
      toast({
        title: "Error",
        description: "Failed to remove liquidity. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Liquidity Pools</h1>
      <div className="flex flex-col gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">My Positions</TabsTrigger>
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4 pt-4">
            {!isConnected ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p>Connect your wallet to view your liquidity positions</p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <Card>
                <CardContent className="pt-6 flex justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ) : userPools.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p>You don't have any liquidity positions</p>
                    <Button variant="link" className="text-primary" onClick={handleAddLiquidityClick}>
                      Add Liquidity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userPools.map((pool) => (
                  <PoolCard key={pool.id} pool={pool} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4 pt-4">
            <Tabs defaultValue="add">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add</TabsTrigger>
                <TabsTrigger value="remove">Remove</TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="pt-4">
                <AddLiquidityForm onAddLiquidity={handleAddLiquidity} />
              </TabsContent>

              <TabsContent value="remove" className="pt-4">
                <RemoveLiquidityForm pools={userPools} onRemoveLiquidity={handleRemoveLiquidity} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

