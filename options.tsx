// This file is intentionally minimal as we use popup.tsx for settings
import { useState, useEffect } from "react"

function OptionsIndex() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hint Options</h1>
      <p className="text-gray-600">
        Please use the extension popup (click the extension icon) to configure settings.
      </p>
    </div>
  )
}

export default OptionsIndex
