'use client'

import { QRCodeSVG } from 'qrcode.react'

interface PlantaQRCodeProps {
    value: string
    size?: number
    level?: 'L' | 'M' | 'Q' | 'H'
    includeMargin?: boolean
}

export function PlantaQRCode({
    value,
    size = 120,
    level = 'M',
    includeMargin = true
}: PlantaQRCodeProps) {
    return (
        <div className="bg-white p-1 rounded-sm shadow-sm inline-block">
            <QRCodeSVG
                value={value}
                size={size}
                level={level}
                includeMargin={includeMargin}
            />
        </div>
    )
}
