"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slippage: number
  onSlippageChange: (slippage: number) => void
  deadline: number
  onDeadlineChange: (deadline: number) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  slippage,
  onSlippageChange,
  deadline,
  onDeadlineChange,
}: SettingsDialogProps) {
  const [customSlippage, setCustomSlippage] = useState("")
  const [customDeadline, setCustomDeadline] = useState("")

  const handleSlippageChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomSlippage(value)
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
        onSlippageChange(numValue)
      }
    }
  }

  const handleDeadlineChange = (value: string) => {
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setCustomDeadline(value)
      const numValue = Number.parseInt(value)
      if (!isNaN(numValue) && numValue > 0) {
        onDeadlineChange(numValue)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuración de transacción</DialogTitle>
          <DialogDescription>
            Ajusta la tolerancia de slippage y el tiempo límite para tus transacciones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Tolerancia de slippage</Label>
            <div className="flex gap-2">
              <Button
                variant={slippage === 0.1 ? "default" : "outline"}
                className="flex-1"
                onClick={() => onSlippageChange(0.1)}
              >
                0.1%
              </Button>
              <Button
                variant={slippage === 0.5 ? "default" : "outline"}
                className="flex-1"
                onClick={() => onSlippageChange(0.5)}
              >
                0.5%
              </Button>
              <Button
                variant={slippage === 1.0 ? "default" : "outline"}
                className="flex-1"
                onClick={() => onSlippageChange(1.0)}
              >
                1.0%
              </Button>
              <div className="relative flex-1">
                <Input
                  value={customSlippage}
                  onChange={(e) => handleSlippageChange(e.target.value)}
                  placeholder={slippage.toString()}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[slippage]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={(value) => onSlippageChange(value[0])}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Tu transacción será revertida si el precio cambia desfavorablemente por más del porcentaje seleccionado.
            </p>
          </div>

          <div className="space-y-4">
            <Label>Tiempo límite de transacción</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={customDeadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                placeholder={deadline.toString()}
                className="w-20"
              />
              <span className="text-muted-foreground">minutos</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu transacción será revertida si está pendiente por más tiempo que el límite establecido.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

