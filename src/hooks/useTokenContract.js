import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'

// Basic ERC-20 ABI for token operations
const TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'redeem',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'businessOwner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
]

// Token Factory ABI
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' }
    ],
    name: 'createBusinessToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getBusinessTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  }
]

// Hook for interacting with individual token contracts
export const useTokenContract = (tokenAddress) => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Read contract data
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress
  })

  const { data: totalSupply } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!tokenAddress
  })

  const { data: businessOwner } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'businessOwner',
    enabled: !!tokenAddress
  })

  // Write contract functions
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  })

  // Mint tokens (business owner only)
  const mintTokens = async (recipientAddress, amount, businessId, tokenId) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await writeContract({
        address: tokenAddress,
        abi: TOKEN_ABI,
        functionName: 'mint',
        args: [recipientAddress, parseEther(amount.toString())]
      })

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Redeem tokens
  const redeemTokens = async (amount, businessId, tokenId) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await writeContract({
        address: tokenAddress,
        abi: TOKEN_ABI,
        functionName: 'redeem',
        args: [parseEther(amount.toString())]
      })

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    balance: balance ? formatEther(balance) : '0',
    totalSupply: totalSupply ? formatEther(totalSupply) : '0',
    businessOwner,
    mintTokens,
    redeemTokens,
    isLoading: isLoading || isConfirming,
    isConfirmed,
    error,
    transactionHash: hash
  }
}

// Hook for interacting with the token factory contract
export const useTokenFactory = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const factoryAddress = import.meta.env.VITE_TOKEN_FACTORY_ADDRESS

  // Get business tokens for current user
  const { data: businessTokens } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'getBusinessTokens',
    args: [address],
    enabled: !!address && !!factoryAddress
  })

  // Write contract functions
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  })

  // Create a new business token
  const createBusinessToken = async (name, symbol) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await writeContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: 'createBusinessToken',
        args: [name, symbol]
      })

      return result
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
    isLoading: isLoading || isConfirming,
    isConfirmed,
    error,
    transactionHash: hash
  }
}

// Hook for token operations with database integration
export const useTokenOperations = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mint tokens with database recording
  const mintTokensWithRecord = async (tokenAddress, recipientAddress, amount, businessId, tokenId, userId) => {
    try {
      setIsLoading(true)
      setError(null)

      // First mint the tokens on-chain
      const tokenContract = useTokenContract(tokenAddress)
      const txHash = await tokenContract.mintTokens(recipientAddress, amount, businessId, tokenId)

      // Then record the transaction in the database
      const { userApi } = await import('../api/userApi')
      await userApi.recordTransaction({
        userId,
        businessId,
        tokenId,
        type: 'mint',
        amount,
        transactionHash: txHash,
        metadata: { source: 'contract_mint' }
      })

      return txHash
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Redeem tokens with database recording
  const redeemTokensWithRecord = async (tokenAddress, amount, businessId, tokenId, userId) => {
    try {
      setIsLoading(true)
      setError(null)

      // First redeem the tokens on-chain
      const tokenContract = useTokenContract(tokenAddress)
      const txHash = await tokenContract.redeemTokens(amount, businessId, tokenId)

      // Then record the transaction in the database
      const { userApi } = await import('../api/userApi')
      await userApi.recordTransaction({
        userId,
        businessId,
        tokenId,
        type: 'redeem',
        amount,
        transactionHash: txHash,
        metadata: { source: 'contract_redeem' }
      })

      return txHash
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mintTokensWithRecord,
    redeemTokensWithRecord,
    isLoading,
    error
  }
}
