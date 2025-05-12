'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: string[]
  active: string
  onTabChange: (tab: string) => void
  className?: string
}

export function Tabs({ tabs, active, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 border-b pb-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            active === tab
              ? "bg-black text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
