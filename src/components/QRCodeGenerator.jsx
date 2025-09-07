import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

const QRCodeGenerator = ({ 
  businessId, 
  tokenId, 
  amount, 
  metadata = {},
  size = 256,
  className = '' 
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!businessId || !tokenId || !amount) return

    const generateQR = async () => {
      try {
        const qrData = {
          type: 'token_mint',
          businessId,
          tokenId,
          amount,
          timestamp: Date.now(),
          metadata
        }

        const canvas = canvasRef.current
        if (canvas) {
          await QRCode.toCanvas(canvas, JSON.stringify(qrData), {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
        }
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [businessId, tokenId, amount, metadata, size])

  if (!businessId || !tokenId || !amount) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm text-center">
          Missing QR data
        </p>
      </div>
    )
  }

  return (
    <div className={`inline-block ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
      />
    </div>
  )
}

export default QRCodeGenerator
