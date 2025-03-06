import { ethers } from "ethers"

// Network
export const CHILIZ_CHAIN_ID = 88888 // Replace with the actual Chiliz Chain ID

// Contract addresses
export const FACTORY_ADDRESS = "0xBDd9c322Ecf401E09C9D2Dca3be46a7E45d48BB1"
export const ROUTER_ADDRESS = "0xC4E14363A01B7725532e099a67DbD17617FB7485"
export const WCHZ_ADDRESS = "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"

// Token List URL
export const TOKEN_LIST_URL = "https://ipfs.io/ipfs/bafkreibn42b7pcjspbzgamdvric52anjfdvpzqpe7wmc3dhhq62dlfagxi"

// Fetch token list
export async function fetchTokenList() {
  try {
    const response = await fetch(TOKEN_LIST_URL)
    const data = await response.json()
    return data.tokens || []
  } catch (error) {
    console.error("Error fetching token list:", error)
    return []
  }
}

// ABIs
export const FACTORY_ABI = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"]

export const ROUTER_ABI = [
  "function getAmountOut(uint amountIn, address tokenIn, address tokenOut) external view returns (uint amountOut)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
]

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function transfer(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

export const PAIR_ABI = [
  // Add the actual Pair ABI here
]

// Common tokens
export const COMMON_TOKENS = [
  {
    name: "Chiliz",
    symbol: "CHZ",
    address: "0x0000000000000000000000000000000000000000", // Address 0 represents the native token
    decimals: 18,
    logoURI: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rHJrCRLDtphuSlEN06yGYcJTuo2kpg.png",
  },
  // Add other common tokens here
]

// Default token (CHZ)
export const DEFAULT_TOKEN = COMMON_TOKENS[0]

// Default slippage tolerance
export const DEFAULT_SLIPPAGE = 0.5 // 0.5%

// Transaction deadline (minutes)
export const DEFAULT_DEADLINE_MINUTES = 20

// Gas price settings
export const GAS_PRICE = {
  low: ethers.parseUnits("5", "gwei"),
  medium: ethers.parseUnits("7", "gwei"),
  high: ethers.parseUnits("9", "gwei"),
}

