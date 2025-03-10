"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"

type Web3ContextType = {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
})

export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Chiliz Chain configuration
  const CHILIZ_CHAIN_ID = 88888 // Replace with actual Chiliz Chain ID
  const CHILIZ_CHAIN_CONFIG = {
    chainId: `0x${CHILIZ_CHAIN_ID.toString(16)}`,
    chainName: "Chiliz Chain",
    nativeCurrency: {
      name: "CHZ",
      symbol: "CHZ",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.chiliz.com"], // Replace with actual RPC URL
    blockExplorerUrls: ["https://explorer.chiliz.com"], // Replace with actual explorer URL
  }

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

        // Create ethers provider
        const ethersProvider = new ethers.BrowserProvider(window.ethereum)
        const ethersSigner = await ethersProvider.getSigner()
        const network = await ethersProvider.getNetwork()

        setProvider(ethersProvider)
        setSigner(ethersSigner)
        setAccount(accounts[0])
        setChainId(Number(network.chainId))
        setIsConnected(true)

        // Check if we're on Chiliz Chain
        if (Number(network.chainId) !== CHILIZ_CHAIN_ID) {
          try {
            // Try to switch to Chiliz Chain
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: CHILIZ_CHAIN_CONFIG.chainId }],
            })
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [CHILIZ_CHAIN_CONFIG],
                })
              } catch (addError) {
                console.error("Failed to add Chiliz Chain", addError)
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to connect to wallet", error)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet")
    }
  }

  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
        }
      }

      // Handle chain changes
      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = Number.parseInt(chainIdHex, 16)
        setChainId(newChainId)

        // Reload the page on chain change as recommended by MetaMask
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Check if already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connect()
          }
        })
        .catch(console.error)

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [account])

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

