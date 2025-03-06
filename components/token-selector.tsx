"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fetchTokenList, DEFAULT_TOKEN } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface TokenSelectorProps {
  selectedToken: any
  onSelectToken: (token: any) => void
  otherToken?: any
}

export function TokenSelector({ selectedToken, onSelectToken, otherToken }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tokens, setTokens] = useState([DEFAULT_TOKEN])

  useEffect(() => {
    const loadTokens = async () => {
      const fetchedTokens = await fetchTokenList()
      setTokens([DEFAULT_TOKEN, ...fetchedTokens])
    }
    loadTokens()
  }, [])

  // Filter out the other selected token
  const availableTokens = tokens.filter((token) => !otherToken || token.address !== otherToken.address)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="min-w-[140px] justify-between">
          {selectedToken ? (
            <div className="flex items-center gap-2">
              {selectedToken.logoURI ? (
                <Image
                  src={selectedToken.logoURI || "/placeholder.svg"}
                  alt={selectedToken.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  {selectedToken.symbol.charAt(0)}
                </div>
              )}
              <span>{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Seleccionar</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Buscar token..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontraron tokens.</CommandEmpty>
            <CommandGroup>
              {availableTokens.map((token) => (
                <CommandItem
                  key={token.address}
                  value={token.symbol}
                  onSelect={() => {
                    onSelectToken(token)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {token.logoURI ? (
                      <Image
                        src={token.logoURI || "/placeholder.svg"}
                        alt={token.symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        {token.symbol.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span>{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">{token.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedToken?.address === token.address ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

