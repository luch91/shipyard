import type { ParsedContract, ContractParam, ContractMethod, ParamType } from '@/types'

// ─── Type Mapping ─────────────────────────────────────────────────────────────

function toParamType(raw: string): ParamType {
  const t = raw.trim().toLowerCase()
  if (t === 'str') return 'str'
  if (t === 'int') return 'int'
  if (t === 'float') return 'float'
  if (t === 'bool') return 'bool'
  if (t.startsWith('list') || t === 'list') return 'list'
  if (t.startsWith('dict') || t === 'dict') return 'dict'
  return 'unknown'
}

// ─── Class Name ───────────────────────────────────────────────────────────────

function parseClassName(source: string): string {
  const match = source.match(/^class\s+(\w+)\s*\(\s*gl\.Contract\s*\)/m)
  return match ? match[1] : ''
}

// ─── Constructor Params ───────────────────────────────────────────────────────

function parseConstructorParams(source: string): ContractParam[] {
  // Match single-line __init__ signature
  const initMatch = source.match(/def\s+__init__\s*\(self(?:,\s*([^)]+))?\)/)
  if (!initMatch || !initMatch[1]) return []

  const paramStr = initMatch[1].trim()
  const params: ContractParam[] = []

  // Split on commas (naive — won't handle nested generics, acceptable per known limitation)
  for (const part of paramStr.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // name: type = default  OR  name: type  OR  name = default  OR  name
    const withDefault = trimmed.match(/^(\w+)\s*:\s*(\w[\w\[\], ]*?)\s*=\s*(.+)$/)
    if (withDefault) {
      params.push({
        name: withDefault[1],
        type: toParamType(withDefault[2]),
        required: false,
        defaultValue: withDefault[3].trim(),
      })
      continue
    }

    const withType = trimmed.match(/^(\w+)\s*:\s*(\w[\w\[\], ]*)$/)
    if (withType) {
      params.push({
        name: withType[1],
        type: toParamType(withType[2]),
        required: true,
      })
      continue
    }

    const withOnlyDefault = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
    if (withOnlyDefault) {
      params.push({
        name: withOnlyDefault[1],
        type: 'unknown',
        required: false,
        defaultValue: withOnlyDefault[2].trim(),
      })
      continue
    }

    // bare name
    params.push({ name: trimmed, type: 'unknown', required: true })
  }

  return params
}

// ─── Methods ──────────────────────────────────────────────────────────────────

function parseMethods(source: string): ContractMethod[] {
  const methods: ContractMethod[] = []

  // Match @gl.public.view or @gl.public.write followed by a def on the next line(s)
  const methodRegex =
    /(@gl\.public\.(view|write))\s*\ndef\s+(\w+)\s*\(self(?:,\s*([^)]*))?\)\s*(?:->\s*([\w\[\], ]+?))?\s*:/gm

  let match: RegExpExecArray | null
  while ((match = methodRegex.exec(source)) !== null) {
    const methodType = match[2] === 'view' ? 'read' : 'write'
    const methodName = match[3]
    const paramsRaw = match[4] ? match[4].trim() : ''
    const returnType = match[5] ? match[5].trim() : 'None'

    const params: ContractParam[] = []
    if (paramsRaw) {
      for (const part of paramsRaw.split(',')) {
        const trimmed = part.trim()
        if (!trimmed) continue

        const withDefault = trimmed.match(/^(\w+)\s*:\s*(\w[\w\[\], ]*?)\s*=\s*(.+)$/)
        if (withDefault) {
          params.push({
            name: withDefault[1],
            type: toParamType(withDefault[2]),
            required: false,
            defaultValue: withDefault[3].trim(),
          })
          continue
        }

        const withType = trimmed.match(/^(\w+)\s*:\s*(\w[\w\[\], ]*)$/)
        if (withType) {
          params.push({
            name: withType[1],
            type: toParamType(withType[2]),
            required: true,
          })
          continue
        }

        params.push({ name: trimmed, type: 'unknown', required: true })
      }
    }

    // Extract docstring if present (first string literal in method body)
    const afterDef = source.slice(match.index + match[0].length)
    const docstringMatch = afterDef.match(/^\s*"""([\s\S]*?)"""/)
    const docstring = docstringMatch ? docstringMatch[1].trim() : undefined

    methods.push({ name: methodName, type: methodType, params, returnType, docstring })
  }

  return methods
}

// ─── State Variables ──────────────────────────────────────────────────────────

function parseStateVariables(source: string): Array<{ name: string; type: string }> {
  const vars: Array<{ name: string; type: string }> = []

  // Class body state vars: exactly 4 spaces indent + name: type (not inside a method)
  const stateVarRegex = /^    (\w+)\s*:\s*([\w\[\], ]+)\s*$/gm

  let match: RegExpExecArray | null
  while ((match = stateVarRegex.exec(source)) !== null) {
    const name = match[1]
    const type = match[2].trim()

    // Skip if it looks like a method parameter (self, cls, etc.)
    if (name === 'self' || name === 'cls') continue
    // Skip `return` type annotations that may have leaked
    if (name === 'return') continue

    vars.push({ name, type })
  }

  return vars
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseContract(source: string): ParsedContract {
  return {
    className: parseClassName(source),
    constructorParams: parseConstructorParams(source),
    methods: parseMethods(source),
    stateVariables: parseStateVariables(source),
    raw: source,
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateContract(source: string): ValidationResult {
  const errors: string[] = []

  if (!source.trim()) {
    errors.push('Contract source is empty.')
    return { valid: false, errors }
  }

  if (!source.includes('from genlayer import')) {
    errors.push('Missing required import: from genlayer import *')
  }

  if (source.includes('py-genlayer:test')) {
    errors.push(
      'Dependency "py-genlayer:test" does not resolve on Bradbury. ' +
      'Replace it with: # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }'
    )
  }

  if (!source.match(/class\s+\w+\s*\(\s*gl\.Contract\s*\)/)) {
    errors.push('Contract class must extend gl.Contract (e.g. class MyContract(gl.Contract):)')
  }

  if (!source.includes('def __init__')) {
    errors.push('Contract must define an __init__ constructor.')
  }

  return { valid: errors.length === 0, errors }
}
