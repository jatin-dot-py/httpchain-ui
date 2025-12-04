import { useState, useMemo, useEffect } from "react"
import { Plus, X, Check, Edit2, Trash2, AlertTriangle, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeclarativeCheckExtractor } from "../extractors/DeclarativeCheckExtractor"
import { CheckDisplay } from "./CheckDisplay"
import { getStepDependencies } from "@/shared/utils/variables"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import type { DeclarativeCheck, ConditionOperator } from "@/types/schema"
import { ConditionOperator as ConditionOperatorEnum } from "@/types/schema"
import { DeclarativeOperator as DeclarativeOperatorEnum } from "@/types/schema"

export function ConditionsEditor() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const workflow = useAppStore(s => s.workflow)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const condition = step?.condition ?? null
  const disabled = isSaving
  
  const stepDependencies = useMemo(() => {
    if (!workflow || !selectedStepNodeId) return []
    return getStepDependencies(workflow, selectedStepNodeId)
  }, [workflow, selectedStepNodeId])

  if (!step) return null

  const [operator, setOperator] = useState<ConditionOperator>(
    condition?.operator || ConditionOperatorEnum.AND
  )
  const [checks, setChecks] = useState<DeclarativeCheck[]>(
    condition?.checks || []
  )
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentCheck, setCurrentCheck] = useState<DeclarativeCheck>({
    path: [],
    operator: DeclarativeOperatorEnum.EXISTS,
    variable_name: "",
  })

  useEffect(() => {
    if (condition) {
      setOperator(condition.operator)
      setChecks(condition.checks)
    } else {
      setOperator(ConditionOperatorEnum.AND)
      setChecks([])
    }
  }, [condition])

  const invalidVariables = useMemo(() => {
    const invalid = new Set<string>()
    checks.forEach(check => {
      if (check.variable_name && !stepDependencies.includes(check.variable_name)) {
        invalid.add(check.variable_name)
      }
    })
    return Array.from(invalid)
  }, [checks, stepDependencies])

  const handleStartAdd = () => {
    setIsAdding(true)
    setEditingIndex(null)
    setCurrentCheck({
      path: [],
      operator: DeclarativeOperatorEnum.EXISTS,
      variable_name: "",
    })
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setIsAdding(false)
    setCurrentCheck(checks[index])
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setCurrentCheck({
      path: [],
      operator: DeclarativeOperatorEnum.EXISTS,
      variable_name: "",
    })
  }

  const handleSave = () => {
    if (!currentCheck.variable_name || !currentCheck.variable_name.trim()) {
      return
    }

    const updated = [...checks]
    if (editingIndex !== null) {
      updated[editingIndex] = currentCheck
    } else {
      updated.push(currentCheck)
    }

    setChecks(updated)
    updateCondition(operator, updated)
    handleCancel()
  }

  const handleDelete = (index: number) => {
    const updated = checks.filter((_, i) => i !== index)
    setChecks(updated)
    updateCondition(operator, updated)
  }

  const handleOperatorChange = (newOperator: ConditionOperator) => {
    setOperator(newOperator)
    updateCondition(newOperator, checks)
  }

  const updateCondition = (op: ConditionOperator, chks: DeclarativeCheck[]) => {
    if (!selectedStepNodeId) return
    
    if (chks.length === 0) {
      updateStep(selectedStepNodeId, { condition: null })
    } else {
      updateStep(selectedStepNodeId, {
        condition: {
          operator: op,
          checks: chks,
        }
      })
    }
  }

  const isFormVisible = isAdding || editingIndex !== null
  const isValid = currentCheck.variable_name && currentCheck.variable_name.trim() !== ""

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Conditions</h3>
          {checks.length > 0 && (
            <span className="text-xs text-muted-foreground">({checks.length} check{checks.length !== 1 ? 's' : ''})</span>
          )}
        </div>
        {!isFormVisible && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartAdd}
            disabled={disabled}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Check
          </Button>
        )}
      </div>

      {invalidVariables.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Invalid variables in conditions:</p>
            <p className="text-xs mt-1">
              The following variables are used in conditions but are not in step dependencies:{" "}
              <span className="font-mono font-semibold">{invalidVariables.join(", ")}</span>
            </p>
          </div>
        </div>
      )}

      {/* Operator selector - show if there are checks or form is visible */}
      {(checks.length > 0 || isFormVisible) && (
        <div className="space-y-2">
          <Label>Operator</Label>
          <Select 
            value={operator} 
            onValueChange={(v) => handleOperatorChange(v as ConditionOperator)} 
            disabled={disabled || isFormVisible}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ConditionOperatorEnum.AND}>AND (all checks must pass)</SelectItem>
              <SelectItem value={ConditionOperatorEnum.OR}>OR (any check must pass)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {operator === ConditionOperatorEnum.AND 
              ? "All checks must pass for the condition to be true"
              : "At least one check must pass for the condition to be true"}
          </p>
        </div>
      )}

      {isFormVisible && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{editingIndex !== null ? "Edit Check" : "Add New Check"}</h4>
            <Button size="icon" variant="ghost" onClick={handleCancel} disabled={disabled} className="h-8 w-8">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <DeclarativeCheckExtractor
            value={currentCheck}
            onChange={setCurrentCheck}
            disabled={disabled}
            showPath={false}
            showVariable={true}
            availableVariables={stepDependencies}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={disabled}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={disabled || !isValid}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {editingIndex !== null ? "Save Changes" : "Add Check"}
            </Button>
          </div>
        </div>
      )}

      {/* Checks List */}
      {checks.length === 0 && !isFormVisible ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-sm text-muted-foreground">
          No conditions yet. Click "Add Check" to create one.
        </div>
      ) : (
        checks.length > 0 && (
          <div className="space-y-2">
            {checks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0">
                  <CheckDisplay check={check} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleStartEdit(index)}
                    disabled={disabled || isFormVisible}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(index)}
                    disabled={disabled || isFormVisible}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
