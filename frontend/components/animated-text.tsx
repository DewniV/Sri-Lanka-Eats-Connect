"use client"

import { useEffect, useState } from "react"

const texts = [
  "Discover Sri Lanka's Finest Restaurants",
  "සිංහලෙන් අවන්හල් සොයන්න",
  "தமிழில் உணவகங்களை கண்டறியுங்கள்",
]

export function AnimatedText() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length)
        setVisible(true)
      }, 500)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      style={{
        transition: "opacity 0.5s ease",
        opacity: visible ? 1 : 0,
        display: "inline-block",
      }}
    >
      {texts[index]}
    </span>
  )
}
