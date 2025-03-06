import { ethers } from "ethers"
import { FACTORY_ADDRESS, ROUTER_ADDRESS, FACTORY_ABI, ROUTER_ABI, ERC20_ABI, PAIR_ABI } from "@/lib/constants"

export function getFactoryContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
}

export function getRouterContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider)
}

export function getERC20Contract(tokenAddress: string, provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider)
}

export function getPairContract(pairAddress: string, provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(pairAddress, PAIR_ABI, provider)
}

export async function getTokenInfo(tokenAddress: string, provider: ethers.Provider) {
  const tokenContract = getERC20Contract(tokenAddress, provider)

  try {
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ])

    return { name, symbol, decimals }
  } catch (error) {
    console.error("Error fetching token info:", error)
    return null
  }
}

export async function getTokenBalance(tokenAddress: string, accountAddress: string, provider: ethers.Provider) {
  try {
    if (tokenAddress === ethers.ZeroAddress) {
      // For native token (CHZ)
      const balance = await provider.getBalance(accountAddress)
      return balance
    } else {
      // For ERC20 tokens
      const tokenContract = getERC20Contract(tokenAddress, provider)
      const balance = await tokenContract.balanceOf(accountAddress)
      return balance
    }
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return ethers.parseUnits("0", 18) // Return 0 with 18 decimals as a fallback
  }
}

export async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  provider: ethers.Provider,
): Promise<bigint> {
  // If the token address is the zero address (native token), return max allowance
  if (tokenAddress === ethers.ZeroAddress) {
    return ethers.MaxUint256
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

  try {
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress)
    return allowance
  } catch (error) {
    console.error("Error checking allowance:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    if (typeof error === "object" && error !== null && "code" in error) {
      console.error("Error code:", (error as { code: string }).code)
    }
    // Return 0 allowance in case of error
    return BigInt(0)
  }
}

export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
  signer: ethers.Signer,
) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

  try {
    const tx = await tokenContract.approve(spenderAddress, amount)
    return await tx.wait()
  } catch (error) {
    console.error("Error approving token:", error)
    throw error
  }
}

export async function getAmountsOut(router: ethers.Contract, amountIn: bigint, path: string[]): Promise<bigint[]> {
  try {
    const amounts = await router.getAmountsOut(amountIn, path)
    return amounts
  } catch (error) {
    console.error("Error getting amounts out:", error)
    throw error
  }
}

export async function getAmountOut(
  router: ethers.Contract,
  amountIn: bigint,
  tokenIn: string,
  tokenOut: string,
): Promise<bigint> {
  try {
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut])
    return amounts[1]
  } catch (error) {
    console.error("Error getting amount out:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    if (typeof error === "object" && error !== null && "code" in error) {
      console.error("Error code:", (error as { code: string }).code)
    }
    throw error
  }
}

export async function swapExactTokensForTokens(
  router: ethers.Contract,
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline, { gasLimit: 300000 })
    return await tx.wait()
  } catch (error) {
    console.error("Error swapping tokens:", error)
    throw error
  }
}

export async function addLiquidity(
  router: ethers.Contract,
  tokenA: string,
  tokenB: string,
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      to,
      deadline,
      { gasLimit: 300000 },
    )
    return await tx.wait()
  } catch (error) {
    console.error("Error adding liquidity:", error)
    throw error
  }
}

export async function removeLiquidity(
  router: ethers.Contract,
  tokenA: string,
  tokenB: string,
  liquidity: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, {
      gasLimit: 300000,
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error removing liquidity:", error)
    throw error
  }
}

