"use client"

import * as React from "react"

type AccentColor = "indigo" | "violet" | "emerald" | "rose" | "amber" | "sky"

type AccentColorProviderProps = {
  children: React.ReactNode
  defaultColor?: AccentColor
  storageKey?: string
}

type AccentColorProviderState = {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
}

const initialState: AccentColorProviderState = {
  accentColor: "indigo",
  setAccentColor: () => null,
}

const AccentColorProviderContext = React.createContext<AccentColorProviderState>(initialState)

export function AccentColorProvider({
  children,
  defaultColor = "indigo",
  storageKey = "taskflow-accent-color",
  ...props
}: AccentColorProviderProps) {
  const [accentColor, setAccentColor] = React.useState<AccentColor>(defaultColor)

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as AccentColor
    if (stored && ["indigo", "violet", "emerald", "rose", "amber", "sky"].includes(stored)) {
      setAccentColor(stored)
    }
  }, [storageKey])

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove(
      "theme-indigo",
      "theme-violet",
      "theme-emerald",
      "theme-rose",
      "theme-amber",
      "theme-sky"
    )

    // Add current theme class
    root.classList.add(`theme-${accentColor}`)
  }, [accentColor])

  const value = {
    accentColor,
    setAccentColor: (color: AccentColor) => {
      localStorage.setItem(storageKey, color)
      setAccentColor(color)
    },
  }

  return (
    <AccentColorProviderContext.Provider {...props} value={value}>
      {children}
    </AccentColorProviderContext.Provider>
  )
}

export const useAccentColor = () => {
  const context = React.useContext(AccentColorProviderContext)

  if (context === undefined)
    throw new Error("useAccentColor must be used within an AccentColorProvider")

  return context
}

export const accentColors: { value: AccentColor; label: string; class: string }[] = [
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "violet", label: "Violet", class: "bg-violet-500" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { value: "rose", label: "Rose", class: "bg-rose-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "sky", label: "Sky", class: "bg-sky-500" },
]
