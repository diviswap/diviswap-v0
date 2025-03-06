"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { ChevronRight, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface PoolCardProps {
  pool: any
}

export function PoolCard({ pool }: PoolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {pool.token0.symbol}/{pool.token1.symbol}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </Button>
        </div>
        <CardDescription>Pool de liquidez</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Tu liquidez</p>
            <p className="text-lg font-medium">{formatCurrency(Number(pool.liquidityTokens))} LP</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/pool/add?token0=${pool.token0.address}&token1=${pool.token1.address}`}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/pool/remove?pair=${pool.id}`}>
                <Minus className="h-4 w-4 mr-1" />
                Retirar
              </a>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tu liquidez</p>
                <p className="font-medium">
                  {formatCurrency(Number(pool.token0Amount))} {pool.token0.symbol}
                </p>
                <p className="font-medium">
                  {formatCurrency(Number(pool.token1Amount))} {pool.token1.symbol}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

