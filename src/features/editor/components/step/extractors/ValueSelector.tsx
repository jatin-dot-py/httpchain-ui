import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ValueType = "true" | "false" | "null" | "string" | "numeric"

interface ValueSelectorProps {
  value: any
  onChange: (value: any) => void
  disabled?: boolean
  operator?: string // Reserved for future use
}

export function ValueSelector({ value, onChange, disabled }: ValueSelectorProps) {
  // Determine current value type
  const getValueType = (val: any): ValueType => {
    if (val === true || val === "true") return "true"
    if (val === false || val === "false") return "false"
    if (val === null || val === "null" || val === undefined) return "null"
    if (typeof val === "number") return "numeric"
    // Check if string is numeric (but not empty string)
    if (typeof val === "string" && val !== "" && !isNaN(Number(val)) && !isNaN(parseFloat(val))) {
      return "numeric"
    }
    // Empty string or any other string defaults to "string" type
    return "string"
  }

  const [valueType, setValueType] = useState<ValueType>(getValueType(value))
  const [stringValue, setStringValue] = useState<string>(valueType === "string" ? (value !== undefined && value !== null ? String(value) : "") : "")
  const [numericValue, setNumericValue] = useState<string>(valueType === "numeric" ? String(value || "") : "")

  useEffect(() => {
    const currentType = getValueType(value)
    setValueType(currentType)
    if (currentType === "string") {
      // Preserve empty strings - don't convert undefined/null to empty string if value is already empty string
      setStringValue(value !== undefined && value !== null ? String(value) : "")
    } else if (currentType === "numeric") {
      setNumericValue(String(value || ""))
    }
  }, [value])

  const handleTypeChange = (newType: ValueType) => {
    setValueType(newType)
    
    switch (newType) {
      case "true":
        onChange(true)
        break
      case "false":
        onChange(false)
        break
      case "null":
        onChange(null)
        break
      case "string":
        onChange(stringValue)
        break
      case "numeric":
        if (numericValue === "" || numericValue === undefined) {
          onChange(0)
        } else {
          const num = Number(numericValue)
          onChange(isNaN(num) ? 0 : num)
        }
        break
    }
  }

  const handleStringChange = (newValue: string) => {
    setStringValue(newValue)
    onChange(newValue)
  }

  const handleNumericChange = (newValue: string) => {
    setNumericValue(newValue)
    const num = newValue ? Number(newValue) : 0
    onChange(isNaN(num) ? 0 : num)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="value_type">Value Type</Label>
      <Select value={valueType} onValueChange={(v) => handleTypeChange(v as ValueType)} disabled={disabled}>
        <SelectTrigger id="value_type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
          <SelectItem value="null">Null</SelectItem>
          <SelectItem value="string">String</SelectItem>
          <SelectItem value="numeric">Numeric</SelectItem>
        </SelectContent>
      </Select>

      {valueType === "string" && (
        <Input
          id="string_value"
          value={stringValue}
          onChange={(e) => handleStringChange(e.target.value)}
          placeholder="Enter string value (empty string allowed)"
          disabled={disabled}
        />
      )}

      {valueType === "numeric" && (
        <Input
          id="numeric_value"
          type="number"
          value={numericValue}
          onChange={(e) => handleNumericChange(e.target.value)}
          placeholder="Enter numeric value"
          disabled={disabled}
        />
      )}
    </div>
  )
}

