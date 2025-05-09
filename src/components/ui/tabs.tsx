'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: string[]
  active: string
  onTabChange: (tab: string) => void
  className?: string // ✅ Pour permettre les classes externes
}

export function Tabs({ tabs, active, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-2 border-b mb-4", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
            active === tab
              ? "border-black text-black"
              : "border-transparent text-muted-foreground hover:text-black hover:border-gray-300"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
