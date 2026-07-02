"use client"

import { Toaster } from "sonner"

function Sonner() {
  return (
    <Toaster
      richColors
      position="bottom-right"
      toastOptions={{
        className: "text-sm",
      }}
    />
  )
}

export { Sonner }
