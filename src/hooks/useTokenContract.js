import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { userApi } from '../api/userApi'

// Business Token Contract ABI (simplified ERC-20 with loyalty features)
const BUSINESS_TOKEN_ABI = [
  {
    "inputs": [
      {"name": "name", "type": "string"},
      {"name": "symbol", "type": "string"},
      {"name": "businessOwner", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "redeem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "businessOwner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TokensMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TokensRedeemed",
    "type": "event"
  }
]

// Token Factory Contract ABI
const TOKEN_FACTORY_ABI = [
  {
    "inputs": [
      {"name": "name", "type": "string"},
      {"name": "symbol", "type": "string"}
    ],
    "name": "createBusinessToken",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "getBusinessTokens",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// Contract addresses (these would be deployed contracts on Base)
const TOKEN_FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890' // Replace with actual deployed address

export const useTokenContract = (tokenAddress) => {
  const { address: userAddress } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Contract write hooks
  const { writeContract, data: writeData, isPending: isWritePending } = useWriteContract()
  
  // Transaction receipt hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  })

  // Read token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: BUSINESS_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: !!tokenAddress && !!userAddress,
  })

  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: tokenAddress,
    abi: BUSINESS_TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!tokenAddress,
  })

  // Read business owner
  const { data: businessOwner } = useReadContract({
    address: tokenAddress,
    abi: BUSINESS_TOKEN_ABI,
    functionName: 'businessOwner',
    enabled: !!tokenAddress,
  })

  // Mint tokens (only business owner can call this)
  const mintTokens = async (recipientAddress, amount, businessId, tokenId) => {
    if (!tokenAddress || !userAddress) {
      throw new Error('Contract address or user address not available')
    }

    try {
      setIsLoading(true)
      setError(null)

      // Call the mint function
      writeContract({
        address: tokenAddress,
        abi: BUSINESS_TOKEN_ABI,
        functionName: 'mint',
        args: [recipientAddress, BigInt(amount)],
      })

      // Wait for transaction confirmation
      if (writeData) {
        // Record transaction in database
        await userApi.recordTransaction({
          userId: recipientAddress, // This should be the user's database ID
          businessId,
          tokenId,
          type: 'mint',
          amount,
          transactionHash: writeData,
          metadata: {
            contractAddress: tokenAddress,
            mintedBy: userAddress
          }
        })
      }

      return writeData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Redeem tokens
  const redeemTokens = async (amount, businessId, tokenId) => {
    if (!tokenAddress || !userAddress) {
      throw new Error('Contract address or user address not available')
    }

    try {
      setIsLoading(true)
      setError(null)

      // Call the redeem function
      writeContract({
        address: tokenAddress,
        abi: BUSINESS_TOKEN_ABI,
        functionName: 'redeem',
        args: [BigInt(amount)],
      })

      // Wait for transaction confirmation
      if (writeData) {
        // Record transaction in database
        await userApi.recordTransaction({
          userId: userAddress, // This should be the user's database ID
          businessId,
          tokenId,
          type: 'redeem',
          amount,
          transactionHash: writeData,
          metadata: {
            contractAddress: tokenAddress,
            redeemedBy: userAddress
          }
        })
      }

      return writeData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh balance after transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
    }
  }, [isConfirmed, refetchBalance])

  return {
    // Contract data
    balance: balance ? Number(balance) : 0,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    businessOwner,
    
    // Contract functions
    mintTokens,
    redeemTokens,
    
    // Transaction state
    isLoading: isLoading || isWritePending || isConfirming,
    isConfirmed,
    error,
    transactionHash: writeData,
    
    // Utilities
    refetchBalance,
  }
}

// Hook for Token Factory contract
export const useTokenFactory = () => {
  const { address: userAddress } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const { writeContract, data: writeData, isPending: isWritePending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  })

  // Get business tokens for an owner
  const { data: businessTokens } = useReadContract({
    address: TOKEN_FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getBusinessTokens',
    args: [userAddress],
    enabled: !!userAddress,
  })

  // Create a new business token
  const createBusinessToken = async (name, symbol) => {
    if (!userAddress) {
      throw new Error('User address not available')
    }

    try {
      setIsLoading(true)
      setError(null)

      writeContract({
        address: TOKEN_FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'createBusinessToken',
        args: [name, symbol],
      })

      return writeData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    businessTokens: businessTokens || [],
    createBusinessToken,
    isLoading: isLoading || isWritePending || isConfirming,
    isConfirmed,
    error,
    transactionHash: writeData,
  }
}

// Utility functions
export const formatTokenAmount = (amount) => {
  return Number(amount).toLocaleString()
}

export const parseTokenAmount = (amount) => {
  return BigInt(amount)
}
