import { useState, useMemo, useRef, useEffect } from "react"
import { Plus, Search, ArrowUpDown, Trash2, Filter, X, Clock, Link, Download, Upload } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Badge } from "../../../components/ui/badge"
import { Checkbox } from "../../../components/ui/checkbox"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../../../components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { CreateChainDialog } from "../dialogs/CreateChainDialog"
import { DeleteChainDialog } from "../dialogs/DeleteChainDialog"
import { DeleteAllChainsDialog } from "../dialogs/DeleteAllChainsDialog"
import { useAppStore } from "../../../store"
import { exportAllChains, importChains } from "../../../services/storage"
import { toast } from "../../../lib/toast"

type SortKey = "id" | "name" | "created_at" | "updated_at"
type SortDir = "asc" | "desc"

export function ChainList() {
  const chains = useAppStore(s => s.chains)
  const chainsLoaded = useAppStore(s => s.chainsLoaded)
  const loadChains = useAppStore(s => s.loadChains)
  const createChainAction = useAppStore(s => s.createChain)
  const deleteChainAction = useAppStore(s => s.deleteChain)
  const deleteAllChainsAction = useAppStore(s => s.deleteAllChains)
  const setSelectedChainId = useAppStore(s => s.setSelectedChainId)
  
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chains on mount
  useEffect(() => {
    if (!chainsLoaded) {
      loadChains()
    }
  }, [chainsLoaded, loadChains])

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsCreating(true)
    const created = await createChainAction(name.trim())
    setIsCreating(false)
    if (created) {
      setSelectedChainId(created.id)
      setShowCreate(false)
      setName("")
    }
  }

  const handleSelect = (id: string) => {
    setSelectedChainId(id)
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteChainAction(id)
    setIsDeleting(false)
    setDeleteConfirm(null)
  }

  const handleDeleteAll = async () => {
    setIsDeletingAll(true)
    await deleteAllChainsAction()
    setIsDeletingAll(false)
    setShowDeleteAll(false)
  }

  const handleExport = () => {
    const json = exportAllChains()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `httpchain-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Export complete", "All chains exported successfully")
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = await importChains(text)
      await loadChains()
      toast.success("Import complete", `${result.imported} chains imported`)
    } catch (err) {
      toast.error("Import failed", "Invalid backup file")
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const allTags = useMemo(() => {
    if (!chains) return []
    const tagSet = new Set<string>()
    chains.forEach(chain => {
      chain.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [chains])

  const filteredSorted = useMemo(() => {
    if (!chains) return []
    const filtered = chains.filter((c) => {
      if (search) {
        const q = search.toLowerCase()
        if (!String(c.id).includes(q) && !c.name.toLowerCase().includes(q)) {
          return false
        }
      }
      
      if (selectedTags.length > 0) {
        if (!c.tags || c.tags.length === 0) return false
        const hasSelectedTag = selectedTags.some(tag => c.tags.includes(tag))
        if (!hasSelectedTag) return false
      }
      
      return true
    })
    return filtered.sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1
      const av = a[sortKey]
      const bv = b[sortKey]
      return av < bv ? -mult : av > bv ? mult : 0
    })
  }, [chains, search, sortKey, sortDir, selectedTags])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearTagFilters = () => {
    setSelectedTags([])
  }

  if (!chainsLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">Loading chains</p>
            <p className="text-xs text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  if (chains.length === 0) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-8 py-6 border-b">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Chains</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your workflow chains
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Chain
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-6">
                  <Link className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No chains yet</h3>
                <p className="text-sm text-muted-foreground">
                  Get started by creating your first chain or import an existing backup.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Backup
                </Button>
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Chain
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <CreateChainDialog
          open={showCreate}
          name={name}
          onNameChange={setName}
          onCreate={handleCreate}
          onCancel={() => setShowCreate(false)}
          isPending={isCreating}
        />
      </>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Chains</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {chains.length} {chains.length === 1 ? 'chain' : 'chains'} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button 
                onClick={handleExport} 
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {chains.length > 0 && (
                <Button 
                  onClick={() => setShowDeleteAll(true)} 
                  variant="outline"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              )}
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Chain
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chains..."
                className="pl-9"
              />
            </div>

            {allTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Tags
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 overflow-auto">
                    {allTags.map(tag => (
                      <DropdownMenuItem
                        key={tag}
                        className="cursor-pointer"
                        onSelect={(e) => {
                          e.preventDefault()
                          toggleTagFilter(tag)
                        }}
                      >
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          className="mr-2"
                          onCheckedChange={() => toggleTagFilter(tag)}
                        />
                        <span className="flex-1">{tag}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onSelect={clearTagFilters}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => toggleTagFilter(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1.5" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          <div className="px-8 py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-24">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 font-medium hover:bg-transparent"
                        onClick={() => toggleSort("id")}
                      >
                        ID
                        <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortKey === "id" ? "opacity-100" : "opacity-40"}`} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 font-medium hover:bg-transparent"
                        onClick={() => toggleSort("name")}
                      >
                        Name
                        <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortKey === "name" ? "opacity-100" : "opacity-40"}`} />
                      </Button>
                    </TableHead>
                    <TableHead className="w-64">Tags</TableHead>
                    <TableHead className="w-48">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 font-medium hover:bg-transparent"
                        onClick={() => toggleSort("created_at")}
                      >
                        Created
                        <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortKey === "created_at" ? "opacity-100" : "opacity-40"}`} />
                      </Button>
                    </TableHead>
                    <TableHead className="w-48">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 font-medium hover:bg-transparent"
                        onClick={() => toggleSort("updated_at")}
                      >
                        Updated
                        <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortKey === "updated_at" ? "opacity-100" : "opacity-40"}`} />
                      </Button>
                    </TableHead>
                    <TableHead className="w-20">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSorted.map(chain => (
                    <TableRow 
                      key={chain.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelect(chain.id)}
                    >
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {chain.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {chain.name}
                      </TableCell>
                      <TableCell>
                        {chain.tags && chain.tags.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {chain.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {chain.tags.length > 3 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs cursor-help">
                                    +{chain.tags.length - 3}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {chain.tags.slice(3).map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No tags</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatDistanceToNow(new Date(chain.created_at), { addSuffix: true })}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{new Date(chain.created_at).toLocaleString()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatDistanceToNow(new Date(chain.updated_at), { addSuffix: true })}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{new Date(chain.updated_at).toLocaleString()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(chain.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete chain</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="border-t px-8 py-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{filteredSorted.length}</span> of{" "}
            <span className="font-medium text-foreground">{chains.length}</span> chains
          </div>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTagFilters}
              className="text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <CreateChainDialog
        open={showCreate}
        name={name}
        onNameChange={setName}
        onCreate={handleCreate}
        onCancel={() => setShowCreate(false)}
        isPending={isCreating}
      />

      <DeleteChainDialog
        chainId={deleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isPending={isDeleting}
      />

      <DeleteAllChainsDialog
        open={showDeleteAll}
        count={chains.length}
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteAll(false)}
        isPending={isDeletingAll}
      />
    </TooltipProvider>
  )
}