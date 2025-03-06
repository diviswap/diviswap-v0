import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, ArrowLeftRight, Droplets, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PopularPools } from "@/components/popular-pools"

export default function Home() {
  return (
    <div className="flex flex-col gap-12 min-h-[calc(100vh-4rem)]">
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Trade and provide liquidity on
              <br />
              <span className="text-primary">Chiliz Chain</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              DiviSwap is a decentralized exchange (DEX) on Chiliz Chain that allows you to trade tokens and earn
              rewards by providing liquidity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/swap">
                  Start Trading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pool">
                  Provide Liquidity
                  <Droplets className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="features" className="container">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
        </TabsList>
        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <ArrowLeftRight className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Frictionless Trading</CardTitle>
                <CardDescription>Trade tokens on Chiliz Chain quickly and with low fees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our automated market maker (AMM) protocol ensures you can always trade your tokens at the best
                  possible price.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/swap">
                    Go to Swap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Droplets className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Earn by Providing Liquidity</CardTitle>
                <CardDescription>Provide liquidity to pools and earn fees on every trade</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By providing liquidity, you receive LP tokens that represent your share in the pool and allow you to
                  earn fees.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/pool">
                    Go to Pool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Guaranteed Security</CardTitle>
                <CardDescription>Audited smart contracts and robust security mechanisms</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our smart contracts have been audited by security experts to ensure the protection of your assets.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="#">
                    View Audits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tokenomics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">$DSwap Tokenomics</CardTitle>
                <CardDescription>$DSwap Token Distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRI_BLACK-bWDciwZMKpfXzIt9lcQG6rRsUqmSdK.png"
                    alt="DSwap Token"
                    className="w-48 h-48 drop-shadow-2xl"
                  />
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Community Allocation</span>
                    <span className="font-semibold">27.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Liquidity Pool</span>
                    <span className="font-semibold">20%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>DiviSwap Launchpad</span>
                    <span className="font-semibold">15%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>DiviSwap KEWL</span>
                    <span className="font-semibold">15%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Development and Maintenance</span>
                    <span className="font-semibold">12.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Liquidity Incentives</span>
                    <span className="font-semibold">7.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Marketing</span>
                    <span className="font-semibold">2.5%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>$DSwap Features</CardTitle>
                <CardDescription>Discover the key features of the governance token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Governance</h3>
                    <p className="text-sm text-muted-foreground">
                      $DSwap holders can participate in protocol decision-making through proposals and voting.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Staking</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn additional yields by staking your $DSwap tokens in different pools.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Fee Sharing</h3>
                    <p className="text-sm text-muted-foreground">
                      $DSwap holders receive a portion of the fees generated by the protocol.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Priority Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Get priority access to new launches and exclusive features in the DiviSwap ecosystem.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Deflationary</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatic burn mechanism that reduces the total supply with each transaction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <section className="container py-12">
        <div className="flex flex-col gap-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter">DiviSwap Statistics</h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Discover the volume, liquidity, and other important metrics of DiviSwap
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Volume (24h)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,234,567</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.67% since yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Liquidity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$9,876,543</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.34% since yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Transactions (24h)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,345</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.91% since yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Fees Generated (24h)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$34,567</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +6.78% since yesterday
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="container py-12">
        <PopularPools />
      </section>
    </div>
  )
}

