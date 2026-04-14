'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Clipboard, FileCode } from 'lucide-react'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { useDeployStore } from '@/hooks/useDeployStore'
import { parseContract, validateContract } from '@/lib/genlayer/parser'
import toast from 'react-hot-toast'

// Monaco is heavy — load it lazily, only in this component (per CLAUDE.md rule)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function ContractUploader() {
  const { contractSource, setContractSource, setParsedContract } = useDeployStore()
  const [isDragging, setIsDragging] = useState(false)
  const [showEditor, setShowEditor] = useState(!!contractSource)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadSource = useCallback(
    (source: string) => {
      setContractSource(source)
      const validation = validateContract(source)
      if (validation.valid) {
        setParsedContract(parseContract(source))
        toast.success('Contract parsed successfully.')
      } else {
        setParsedContract(null)
        toast.error(validation.errors[0] ?? 'Invalid contract.')
      }
      setShowEditor(true)
    },
    [setContractSource, setParsedContract]
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
      reader.onload = (ev) => loadSource((ev.target?.result as string) ?? '')
      reader.readAsText(file)
    },
    [loadSource]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => loadSource((ev.target?.result as string) ?? '')
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
      loadSource(text)
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
      } else {
        setParsedContract(null)
      }
    },
    [setContractSource, setParsedContract]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-neutral-300">
          1. Contract Source
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label="Paste contract from clipboard"
          >
            <Clipboard size={12} />
            Paste
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label="Upload .py file"
          >
            <Upload size={12} />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

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
                setShowEditor(false)
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
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors',
            isDragging
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50'
          )}
          aria-label="Drop .py file here or click to upload"
        >
          <Upload size={28} className="text-neutral-600" />
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Drop your <span className="font-mono text-emerald-400">.py</span> contract here
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              or paste from clipboard, or click to upload
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
