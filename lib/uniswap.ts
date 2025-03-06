import { Currency, CurrencyAmount, JSBI, Percent, TokenAmount, Trade, Route, Token, type TradeType } from "@uniswap/sdk"
import { ethers } from "ethers"
import { CHILIZ_CHAIN_ID, ROUTER_ADDRESS, WCHZ_ADDRESS } from "./constants"
import { Fetcher } from "@uniswap/sdk"

// Configure ChainId for Chiliz
const CHILIZ_CHAIN_ID_SDK = CHILIZ_CHAIN_ID // We'll use MAINNET as a placeholder, adjust this when Chiliz is supported

// WCHZ token
const WCHZ = new Token(CHILIZ_CHAIN_ID_SDK, WCHZ_ADDRESS, 18, "WCHZ", "Wrapped CHZ")

export function createToken(address: string, decimals: number, symbol: string, name: string): Token {
  return new Token(CHILIZ_CHAIN_ID_SDK, address, decimals, symbol, name)
}

export async function getRoute(tokenA: Token, tokenB: Token, provider: ethers.providers.Provider): Promise<Route> {
  const pair = await Fetcher.fetchPairData(tokenA, tokenB, provider)
  return new Route([pair], tokenA)
}

export function createTrade(route: Route, amount: string, tradeType: TradeType): Trade {
  const tokenAmount = new TokenAmount(route.input, amount)
  return new Trade(route, tokenAmount, tradeType)
}

export async function executeSwap(
  trade: Trade,
  account: string,
  provider: ethers.providers.Web3Provider,
): Promise<string> {
  const router = new ethers.Contract(
    ROUTER_ADDRESS,
    [
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    ],
    provider.getSigner(),
  )

  const slippageTolerance = new Percent("50", "10000") // 0.5%
  const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString()
  const path = trade.route.path.map((token) => token.address)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

  const tx = await router.swapExactTokensForTokens(
    trade.inputAmount.raw.toString(),
    amountOutMin,
    path,
    account,
    deadline,
    { gasLimit: 300000 },
  )

  return tx.hash
}

export async function addLiquidity(
  tokenA: Token,
  tokenB: Token,
  amountA: string,
  amountB: string,
  account: string,
  provider: ethers.providers.Web3Provider,
): Promise<string> {
  const router = new ethers.Contract(
    ROUTER_ADDRESS,
    [
      "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
    ],
    provider.getSigner(),
  )

  const slippageTolerance = new Percent("50", "10000") // 0.5%
  const amountADesired = ethers.BigNumber.from(amountA)
  const amountBDesired = ethers.BigNumber.from(amountB)
  const amountAMin = amountADesired.mul(ethers.BigNumber.from(9950)).div(ethers.BigNumber.from(10000))
  const amountBMin = amountBDesired.mul(ethers.BigNumber.from(9950)).div(ethers.BigNumber.from(10000))
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

  const tx = await router.addLiquidity(
    tokenA.address,
    tokenB.address,
    amountADesired.toString(),
    amountBDesired.toString(),
    amountAMin.toString(),
    amountBMin.toString(),
    account,
    deadline,
    { gasLimit: 300000 },
  )

  return tx.hash
}

export async function getTokenBalance(
  token: Token,
  account: string,
  provider: ethers.providers.Provider,
): Promise<string> {
  try {
    if (token.address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()) {
      // For the native token (CHZ), we get the ETH balance
      const balance = await provider.getBalance(account)
      return (Number(balance) / Math.pow(10, token.decimals)).toString()
    } else {
      // Use Contract for ERC20 tokens
      const contract = new ethers.Contract(
        token.address,
        ["function balanceOf(address) view returns (uint256)"],
        provider,
      )

      try {
        const balance = await contract.balanceOf(account)
        return (Number(balance) / Math.pow(10, token.decimals)).toString()
      } catch (error) {
        console.warn(`Error calling balanceOf for token ${token.symbol}:`, error)
        if (error.code === "BAD_DATA" && error.value === "0x") {
          console.warn("Received empty data from contract, assuming zero balance")
          return "0"
        }
        throw error
      }
    }
  } catch (error) {
    console.error("Error fetching token balance:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    return "0"
  }
}

export async function getPairLiquidity(
  tokenA: Token,
  tokenB: Token,
  account: string,
  provider: ethers.providers.Provider,
): Promise<{
  liquidityTokens: string
  tokenAAmount: string
  tokenBAmount: string
}> {
  const pair = await Fetcher.fetchPairData(tokenA, tokenB, provider)
  const liquidityToken = pair.liquidityToken
  const liquidityBalance = await getTokenBalance(liquidityToken, account, provider)

  const reserves = await pair.getReserves()
  const totalSupply = await pair.totalSupply()

  const liquidityShare = new TokenAmount(
    liquidityToken,
    ethers.BigNumber.from(liquidityBalance).mul(ethers.BigNumber.from(10).pow(liquidityToken.decimals)).toString(),
  )
  const tokenAAmount = reserves[0].multiply(liquidityShare).divide(totalSupply)
  const tokenBAmount = reserves[1].multiply(liquidityShare).divide(totalSupply)

  return {
    liquidityTokens: liquidityBalance,
    tokenAAmount: tokenAAmount.toSignificant(6),
    tokenBAmount: tokenBAmount.toSignificant(6),
  }
}

export function wrappedCurrency(currency: Currency, chainId: number): Token | undefined {
  return chainId && currency === Currency.ETHER ? WCHZ : currency instanceof Token ? currency : undefined
}

export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = ethers.utils.parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== "0") {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

