"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const POPULAR_POOLS = [
  {
    id: "0xb0a8310f11be8dfeea4e200b9935b815f3faa2fa",
    name: "DSwap/wCHZ",
    volume24h: 1234567,
    tvl: 9876543,
    change24h: 5.67,
  },
  {
    id: "0x3159a90f80fa4aeccc044923b7a504a98417145d",
    name: "PEPPER/DSwap",
    volume24h: 987654,
    tvl: 8765432,
    change24h: -2.34,
  },
  {
    id: "0x14a634bf2d5be1c6ad7790d958e748174d8a2d43",
    name: "CHZ/USDT",
    volume24h: 567890,
    tvl: 7654321,
    change24h: 8.91,
  },
  {
    id: "0x5f3efab95224dbb5490e8ddc8c2c1daad4c0db37",
    name: "PEPPER/wCHZ",
    volume24h: 345678,
    tvl: 6543210,
    change24h: -1.23,
  },
]

export function PopularPools() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pools populares</CardTitle>
        <CardDescription>Los pools más activos en DiviSwap</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pool</TableHead>
              <TableHead className="text-right">Volumen (24h)</TableHead>
              <TableHead className="text-right">TVL</TableHead>
              <TableHead className="text-right">Cambio (24h)</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POPULAR_POOLS.map((pool) => (
              <TableRow key={pool.id}>
                <TableCell className="font-medium">{pool.name}</TableCell>
                <TableCell className="text-right">${formatCurrency(pool.volume24h, 0)}</TableCell>
                <TableCell className="text-right">${formatCurrency(pool.tvl, 0)}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={`flex items-center justify-end ${
                      pool.change24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {pool.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(pool.change24h)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/charts?address=${pool.id}`}
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    View chart
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

