import { useState, useMemo } from "react"
import { Plus, X, Edit2, Trash2, Filter, Check, GitBranch, Hash, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DeclarativeCheckExtractor } from "./DeclarativeCheckExtractor"
import { RegexExtractorForm } from "./RegexExtractor"
import { JsonPathArrayExtractor } from "./JsonPathArrayExtractor"
import { ValueDisplay } from "./ValueDisplay"
import { getForbiddenExtractorKeys } from "@/shared/utils/variables"
import { useAppStore } from "@/store"
import { useActiveStep } from "@/features/editor/hooks/useActiveStep"
import type { Extractor, ExtractorType, DeclarativeCheck, RegexExtractor } from "@/types/schema"
import { ExtractorType as ExtractorTypeEnum } from "@/types/schema"
import { DeclarativeOperator as DeclarativeOperatorEnum } from "@/types/schema"

type AddingType = ExtractorType | null

export function ExtractorsEditor() {
  const step = useActiveStep()
  const selectedStepNodeId = useAppStore(s => s.selectedStepNodeId)
  const workflow = useAppStore(s => s.workflow)
  const isSaving = useAppStore(s => s.isSaving)
  const updateStep = useAppStore(s => s.updateStep)

  const extractors = step?.request.extractors ?? []
  const disabled = isSaving
  const [addingType, setAddingType] = useState<AddingType>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [extractorKey, setExtractorKey] = useState("")

  if (!step || !selectedStepNodeId) return null

  // Get forbidden extractor keys (chain variables + dependency variables)
  const forbiddenKeys = useMemo(() => {
    return getForbiddenExtractorKeys(workflow)
  }, [workflow, selectedStepNodeId])

  // Get all used extractor keys for duplicate checking
  const usedKeys = useMemo(() => {
    const keys = new Set<string>()
    
    // Add forbidden keys (chain variables + dependency variables)
    forbiddenKeys.forEach(k => keys.add(k))
    
    // Add extractor keys from all steps (excluding current step if editing)
    if (workflow?.steps) {
      workflow.steps.forEach(s => {
        if (s.node_id !== selectedStepNodeId && s.request.extractors) {
          s.request.extractors.forEach(extractor => {
            keys.add(extractor.extractor_key)
          })
        }
      })
    }
    
    // Add extractor keys from current step (excluding the one being edited)
    extractors.forEach((extractor, index) => {
      if (editingIndex === null || index !== editingIndex) {
        keys.add(extractor.extractor_key)
      }
    })
    
    return keys
  }, [workflow, selectedStepNodeId, extractors, editingIndex, forbiddenKeys])

  const isDuplicate = useMemo(() => {
    if (!extractorKey.trim()) return false
    return usedKeys.has(extractorKey.trim())
  }, [extractorKey, usedKeys])
  
  // Form state for different extractor types
  const [declarativeCheck, setDeclarativeCheck] = useState<DeclarativeCheck>({
    path: [],
    operator: DeclarativeOperatorEnum.EXISTS,
  })
  const [regexExtractor, setRegexExtractor] = useState<RegexExtractor>({
    path: [],
    pattern: "",
    find_all: false,
  })
  const [jsonPathArray, setJsonPathArray] = useState<string[]>([])

  const handleStartAdd = (type: ExtractorType) => {
    setAddingType(type)
    setExtractorKey("")
    setDeclarativeCheck({ path: [], operator: DeclarativeOperatorEnum.EXISTS })
    setRegexExtractor({ path: [], pattern: "", find_all: false })
    setJsonPathArray([])
    setEditingIndex(null)
  }

  const handleStartEdit = (index: number) => {
    const extractor = extractors[index]
    setEditingIndex(index)
    setExtractorKey(extractor.extractor_key)
    setAddingType(extractor.extractor_type)
    
    if (extractor.declarative_check_extractor) {
      setDeclarativeCheck(extractor.declarative_check_extractor)
    }
    if (extractor.regex_extractor) {
      setRegexExtractor(extractor.regex_extractor)
    }
    if (extractor.jsonpatharray_extractor) {
      setJsonPathArray(extractor.jsonpatharray_extractor)
    }
  }

  const handleCancel = () => {
    setAddingType(null)
    setEditingIndex(null)
    setExtractorKey("")
    setDeclarativeCheck({ path: [], operator: DeclarativeOperatorEnum.EXISTS })
    setRegexExtractor({ path: [], pattern: "", find_all: false })
    setJsonPathArray([])
  }

  const handleSave = () => {
    if (!extractorKey.trim() || !addingType) return
    
    const trimmedKey = extractorKey.trim()
    
    // Check for duplicates
    if (usedKeys.has(trimmedKey)) {
      return // Don't save if duplicate
    }

    let newExtractor: Extractor = {
      extractor_key: trimmedKey,
      extractor_type: addingType,
    }

    if (addingType === ExtractorTypeEnum.DECLARATIVE_CHECK) {
      newExtractor.declarative_check_extractor = declarativeCheck
    } else if (addingType === ExtractorTypeEnum.REGEX) {
      newExtractor.regex_extractor = regexExtractor
    } else if (addingType === ExtractorTypeEnum.JSONPATHARRAY) {
      newExtractor.jsonpatharray_extractor = jsonPathArray
    }

    const updated = [...extractors]
    if (editingIndex !== null) {
      updated[editingIndex] = newExtractor
    } else {
      updated.push(newExtractor)
    }

    updateStep(selectedStepNodeId, {
      request: {
        ...step.request,
        extractors: updated
      }
    })
    handleCancel()
  }

  const handleDelete = (index: number) => {
    const updated = extractors.filter((_, i) => i !== index)
    updateStep(selectedStepNodeId, {
      request: {
        ...step.request,
        extractors: updated.length > 0 ? updated : null
      }
    })
  }

  const isFormVisible = addingType !== null
  const isValid = extractorKey.trim() && !isDuplicate && addingType && (
    (addingType === ExtractorTypeEnum.DECLARATIVE_CHECK && declarativeCheck?.path && declarativeCheck.path.length > 0) ||
    (addingType === ExtractorTypeEnum.REGEX && regexExtractor?.path && regexExtractor.path.length > 0 && regexExtractor.pattern) ||
    (addingType === ExtractorTypeEnum.JSONPATHARRAY && jsonPathArray && jsonPathArray.length > 0)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Extractors</h3>
          {extractors.length > 0 && (
            <span className="text-xs text-muted-foreground">({extractors.length})</span>
          )}
        </div>
        {!isFormVisible && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartAdd(ExtractorTypeEnum.DECLARATIVE_CHECK)}
              disabled={disabled}
            >
              <GitBranch className="h-3.5 w-3.5 mr-1.5" />
              Add Declarative Check
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartAdd(ExtractorTypeEnum.JSONPATHARRAY)}
              disabled={disabled}
            >
              <Hash className="h-3.5 w-3.5 mr-1.5" />
              Add JSON Path
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartAdd(ExtractorTypeEnum.REGEX)}
              disabled={disabled}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Regex
            </Button>
          </div>
        )}
      </div>

      {/* Inline Form */}
      {isFormVisible && (
        <div className="border rounded-lg p-4 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {editingIndex !== null ? "Edit Extractor" : "Add Extractor"}
            </h4>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={disabled}
              className="h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extractor_key">Extractor Key</Label>
              <Input
                id="extractor_key"
                value={extractorKey}
                onChange={(e) => setExtractorKey(e.target.value)}
                placeholder="e.g., user_id, token, status"
                disabled={disabled}
                className={isDuplicate ? "border-destructive" : ""}
              />
              {isDuplicate ? (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>
                    {forbiddenKeys.has(extractorKey.trim()) 
                      ? "This key cannot be used (reserved for chain variables or dependencies)"
                      : "This key is already used in another step"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The variable name that will store the extracted value (must be unique and cannot be a chain variable or dependency)
                </p>
              )}
            </div>

            {addingType === ExtractorTypeEnum.DECLARATIVE_CHECK && (
              <DeclarativeCheckExtractor
                value={declarativeCheck}
                onChange={setDeclarativeCheck}
                disabled={disabled}
                showPath={true}
                showVariable={false}
              />
            )}

            {addingType === ExtractorTypeEnum.REGEX && (
              <RegexExtractorForm
                value={regexExtractor}
                onChange={setRegexExtractor}
                disabled={disabled}
              />
            )}

            {addingType === ExtractorTypeEnum.JSONPATHARRAY && (
              <JsonPathArrayExtractor
                value={jsonPathArray}
                onChange={setJsonPathArray}
                disabled={disabled}
              />
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={disabled || !isValid}
                size="sm"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                {editingIndex !== null ? "Save Changes" : "Add Extractor"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={disabled}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Extractor List */}
      {extractors.length === 0 && !isFormVisible ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-sm text-muted-foreground">
          No extractors yet. Use the buttons above to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {extractors.map((extractor, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg bg-card"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{extractor.extractor_key}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                    {extractor.extractor_type}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  {extractor.extractor_type === ExtractorTypeEnum.JSONPATHARRAY && 
                    extractor.jsonpatharray_extractor && 
                    <span>Path: {extractor.jsonpatharray_extractor.join(" → ")}</span>}
                  {extractor.extractor_type === ExtractorTypeEnum.REGEX && 
                    extractor.regex_extractor && 
                    <span>Pattern: {extractor.regex_extractor.pattern}</span>}
                  {extractor.extractor_type === ExtractorTypeEnum.DECLARATIVE_CHECK && 
                    extractor.declarative_check_extractor && (
                      <>
                        <span>Operator: {extractor.declarative_check_extractor.operator}</span>
                        {extractor.declarative_check_extractor.value !== undefined && (
                          <ValueDisplay value={extractor.declarative_check_extractor.value} />
                        )}
                      </>
                    )}
                </div>
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
      )}
    </div>
  )
}
