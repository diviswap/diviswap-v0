"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart } from "lucide-react"
import { useSearchParams } from "next/navigation"

const POOL_OPTIONS = [
  { label: "DSwap/wCHZ", value: "0xb0a8310f11be8dfeea4e200b9935b815f3faa2fa" },
  { label: "PEPPER/DSwap", value: "0x3159a90f80fa4aeccc044923b7a504a98417145d" },
  { label: "CHZ/USDT", value: "0x14a634bf2d5be1c6ad7790d958e748174d8a2d43" },
  { label: "PEPPER/wCHZ", value: "0x5f3efab95224dbb5490e8ddc8d2c1daad4c0db37" },
]

export default function ChartsPage() {
  const searchParams = useSearchParams()
  const [poolAddress, setPoolAddress] = useState(POOL_OPTIONS[0].value)
  const [chartType, setChartType] = useState("price")
  const [resolution, setResolution] = useState("1D")

  useEffect(() => {
    const addressParam = searchParams.get("address")
    if (addressParam && POOL_OPTIONS.some((option) => option.value === addressParam)) {
      setPoolAddress(addressParam)
    }
  }, [searchParams])

  // Modified URL to show only the chart
  const geckoTerminalUrl = `https://www.geckoterminal.com/chiliz-chain/pools/${poolAddress}?embed=1&info=0&swaps=0&chart_type=${chartType}&resolution=${resolution}&tv_chart=1`

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6">Charts</h1>
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Market Analysis</CardTitle>
              <CardDescription>Powered by GeckoTerminal</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Select value={poolAddress} onValueChange={setPoolAddress}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select pool" />
                </SelectTrigger>
                <SelectContent>
                  {POOL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tabs defaultValue={chartType} onValueChange={setChartType} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="price" className="flex items-center gap-1">
                    <LineChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Price</span>
                  </TabsTrigger>
                  <TabsTrigger value="liquidity" className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Liquidity</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="w-full h-[80vh]">
            <iframe
              height="100%"
              width="100%"
              id="geckoterminal-embed"
              title="GeckoTerminal Embed"
              src={geckoTerminalUrl}
              frameBorder="0"
              allow="clipboard-write"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Market data is provided by GeckoTerminal. DiviSwap does not guarantee the accuracy of this data.
      </div>
    </div>
  )
}

