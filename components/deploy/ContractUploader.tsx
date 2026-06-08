'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, Clipboard, FileCode, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { useDeployStore } from '@/hooks/useDeployStore'
import { parseContract, validateContract } from '@/lib/genlayer/parser'
import { track } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { AI_MODELS, DEFAULT_MODEL_ID } from '@/lib/ai/models'

// Monaco is heavy — load it lazily, only in this component (per CLAUDE.md rule)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type TabId = 'upload' | 'paste' | 'generate'

export default function ContractUploader() {
  const { contractSource, setContractSource, setParsedContract, setConstructorArg } = useDeployStore()
  const [isDragging, setIsDragging] = useState(false)
  const [showEditor, setShowEditor] = useState(!!contractSource)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('upload')

  // Generate tab state
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID)
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [generateSuccess, setGenerateSuccess] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  // Show editor when source is set externally (URL param, fork, template)
  useEffect(() => {
    if (contractSource) setShowEditor(true)
  }, [contractSource])

  const loadSource = useCallback(
    (source: string, method: 'file' | 'paste' | 'generate') => {
      setContractSource(source)
      const validation = validateContract(source)
      if (validation.valid) {
        const parsed = parseContract(source)
        setParsedContract(parsed)
        for (const param of parsed.constructorParams) {
          if (param.defaultValue !== undefined) {
            setConstructorArg(param.name, param.type === 'bool' ? param.defaultValue.toLowerCase() : param.defaultValue)
          }
        }
        setParseError(null)
        toast.success('Contract parsed successfully.')
        track('contract_loaded', { method, contract_name: parsed.className, has_errors: false })
      } else {
        setParsedContract(null)
        setParseError(validation.errors[0] ?? 'Invalid contract.')
        toast.error(validation.errors[0] ?? 'Invalid contract.')
        track('contract_loaded', { method, contract_name: null, has_errors: true })
      }
      setShowEditor(true)
    },
    [setContractSource, setParsedContract, setConstructorArg]
  )

  // ── File Drop ─────────────────────────────────────────────────────────────

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (!file) return
      if (!file.name.endsWith('.py')) {
        toast.error('Only .py files are supported.')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => loadSource((ev.target?.result as string) ?? '', 'file')
      reader.readAsText(file)
    },
    [loadSource]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => loadSource((ev.target?.result as string) ?? '', 'file')
      reader.readAsText(file)
    },
    [loadSource]
  )

  // ── Paste ─────────────────────────────────────────────────────────────────

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        toast.error('Clipboard is empty.')
        return
      }
      loadSource(text, 'paste')
    } catch {
      toast.error('Could not read clipboard. Please paste manually into the editor.')
    }
  }, [loadSource])

  // ── Editor change ─────────────────────────────────────────────────────────

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const source = value ?? ''
      setContractSource(source)
      const validation = validateContract(source)
      if (validation.valid) {
        setParsedContract(parseContract(source))
        setParseError(null)
      } else {
        setParsedContract(null)
        setParseError(source.trim() ? (validation.errors[0] ?? 'Contract could not be parsed.') : null)
      }
    },
    [setContractSource, setParsedContract]
  )

  // ── Generate ──────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return
    setIsGenerating(true)
    setGenerateError(null)
    setGenerateSuccess(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, modelId: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGenerateError(data.error ?? 'Generation failed. Try again.')
        return
      }
      setRemaining(data.remaining ?? null)
      setGenerateSuccess(true)
      loadSource(data.contract, 'generate')
    } catch {
      setGenerateError('Could not reach the generation service. Check your connection.')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel)

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload', icon: <Upload size={12} /> },
    { id: 'paste', label: 'Paste', icon: <Clipboard size={12} /> },
    { id: 'generate', label: 'Generate', icon: <Sparkles size={12} /> },
  ]

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-sm font-semibold text-neutral-300">
        1. Contract Source
      </h2>

      {showEditor ? (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2">
            <FileCode size={13} className="text-emerald-400" />
            <span className="font-mono text-xs text-neutral-400">contract.py</span>
            <button
              type="button"
              onClick={() => {
                setContractSource('')
                setParsedContract(null)
                setParseError(null)
                setShowEditor(false)
                track('contract_cleared', {})
              }}
              className="ml-auto text-xs text-neutral-600 hover:text-neutral-400"
              aria-label="Clear contract source"
            >
              clear
            </button>
          </div>
          <MonacoEditor
            height="340px"
            language="python"
            theme="vs-dark"
            value={contractSource}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              fontFamily: 'Fira Code, monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 12 },
            }}
          />
          {parseError && (
            <div className="border-t border-red-500/20 bg-red-500/5 px-3 py-2 font-mono text-xs text-red-400">
              ✗ {parseError}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          {/* Tab bar */}
          <div className="flex border-b border-neutral-800 bg-neutral-900/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-b-2 border-emerald-500 text-emerald-400 -mb-px'
                    : 'text-neutral-500 hover:text-neutral-300'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upload tab */}
          {activeTab === 'upload' && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                className={clsx(
                  'flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-14 text-center transition-colors',
                  isDragging ? 'bg-emerald-500/5' : 'hover:bg-neutral-900/50'
                )}
                aria-label="Drop .py file here or click to upload"
              >
                <Upload size={28} className={isDragging ? 'text-emerald-500' : 'text-neutral-600'} />
                <div>
                  <p className="text-sm font-medium text-neutral-400">
                    Drop your <span className="font-mono text-emerald-400">.py</span> contract here
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">or click to browse</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}

          {/* Paste tab */}
          {activeTab === 'paste' && (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
              <Clipboard size={28} className="text-neutral-600" />
              <div>
                <p className="text-sm font-medium text-neutral-400">Paste from clipboard</p>
                <p className="mt-1 text-xs text-neutral-600">
                  Your contract will be loaded into the editor
                </p>
              </div>
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <Clipboard size={12} />
                Paste from clipboard
              </button>
            </div>
          )}

          {/* Generate tab */}
          {activeTab === 'generate' && (
            <div className="flex flex-col gap-4 p-4">
              {/* Model selector */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-neutral-400">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-200 focus:border-emerald-500 focus:outline-none"
                >
                  {AI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label} — {model.badge ?? model.bestFor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-neutral-400">Describe your contract</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. A prediction market that fetches a news URL and resolves based on whether a specific event occurred"
                  rows={4}
                  className="resize-none rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!description.trim() || isGenerating}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Contract
                  </>
                )}
              </button>

              {/* Status line */}
              {isGenerating && currentModel && (
                <p className="text-center text-xs text-neutral-500">
                  Generating with {currentModel.label}...
                </p>
              )}
              {generateSuccess && !isGenerating && (
                <p className="text-center text-xs text-emerald-400">
                  Generated. Review the contract before deploying.
                </p>
              )}
              {generateError && (
                <p className="text-center text-xs text-red-400">{generateError}</p>
              )}

              {/* Rate limit warning */}
              {remaining !== null && remaining <= 3 && (
                <p className="text-center text-xs text-amber-400">
                  ⚠️ {remaining} free generation{remaining === 1 ? '' : 's'} left this hour
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
