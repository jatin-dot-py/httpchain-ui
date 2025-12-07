import type { ValidationResult, ForbiddenPattern } from "../types"

// ============================================================================
// Constants
// ============================================================================

export const LANGUAGE_ID = "python"
export const MONACO_LANGUAGE = "python"
export const DISPLAY_NAME = "Python"
export const IS_AVAILABLE = true

export const IMPORT_HEADER = `# Available imports (read-only, auto-imported by backend)
import re, json, base64, hashlib, datetime, math
from urllib.parse import urlparse, parse_qs, urlencode, quote, unquote
from html import escape, unescape
from collections import defaultdict, Counter, OrderedDict
from itertools import chain, groupby, islice
from functools import reduce, partial
# ─────────────────────────────────────────────────────────────────

`

export const DEFAULT_TEMPLATE = `def extract(response, variables):
    """
    Extract data from the HTTP response.
    
    Args:
        response: HTTPResponse object with properties:
            - json_body: Parsed JSON (dict) if response was JSON
            - text_body: Raw text content
            - html_body: Raw HTML content
            - status_code: HTTP status code (int)
            - response_headers: Headers dict
            - response_cookies: Cookies dict
        variables: Dict of all accumulated variables from chain
    
    Returns:
        Extracted value (int, str, list, dict, bool, or None)
    """
    # Your extraction logic here
    return None
`

// ============================================================================
// Validation Patterns
// ============================================================================

const REQUIRED_SIGNATURE = /def\s+extract\s*\(\s*response\s*,\s*variables\s*\)\s*:/
const RETURN_PATTERN = /\breturn\b/

// Forbidden patterns for security validation
const FORBIDDEN_PATTERNS: ForbiddenPattern[] = [
  // Forbidden imports
  [/\bimport\s+os\b/, "python.forbidden_import", "'os' module is not allowed - it provides system access", "forbidden-os-import"],
  [/\bfrom\s+os\b/, "python.forbidden_import", "'os' module is not allowed - it provides system access", "forbidden-os-import"],
  [/\bimport\s+sys\b/, "python.forbidden_import", "'sys' module is not allowed - it provides interpreter access", "forbidden-sys-import"],
  [/\bfrom\s+sys\b/, "python.forbidden_import", "'sys' module is not allowed - it provides interpreter access", "forbidden-sys-import"],
  [/\bimport\s+subprocess\b/, "python.forbidden_import", "'subprocess' module is not allowed - it can execute shell commands", "forbidden-subprocess-import"],
  [/\bfrom\s+subprocess\b/, "python.forbidden_import", "'subprocess' module is not allowed - it can execute shell commands", "forbidden-subprocess-import"],
  [/\bimport\s+shutil\b/, "python.forbidden_import", "'shutil' module is not allowed - it provides file system operations", "forbidden-shutil-import"],
  [/\bimport\s+socket\b/, "python.forbidden_import", "'socket' module is not allowed - use the HTTP workflow for network operations", "forbidden-socket-import"],
  [/\bimport\s+importlib\b/, "python.forbidden_import", "'importlib' module is not allowed - dynamic imports are forbidden", "forbidden-importlib-import"],
  [/\bfrom\s+importlib\b/, "python.forbidden_import", "'importlib' module is not allowed - dynamic imports are forbidden", "forbidden-importlib-import"],
  [/\bimport\s+builtins\b/, "python.forbidden_import", "'builtins' module is not allowed - use standard built-in functions directly", "forbidden-builtins-import"],
  [/\bimport\s+ctypes\b/, "python.forbidden_import", "'ctypes' module is not allowed - it provides low-level memory access", "forbidden-ctypes-import"],
  [/\bimport\s+pickle\b/, "python.forbidden_import", "'pickle' module is not allowed - use 'json' for serialization", "forbidden-pickle-import"],
  // Forbidden builtins
  [/\beval\s*\(/, "python.forbidden_builtin", "'eval()' is not allowed - it can execute arbitrary code", "forbidden-eval"],
  [/\bexec\s*\(/, "python.forbidden_builtin", "'exec()' is not allowed - it can execute arbitrary code", "forbidden-exec"],
  [/\bcompile\s*\(/, "python.forbidden_builtin", "'compile()' is not allowed - it can compile arbitrary code", "forbidden-compile"],
  [/\bopen\s*\(/, "python.forbidden_builtin", "'open()' is not allowed - file system access is forbidden", "forbidden-open"],
  [/\b__import__\s*\(/, "python.forbidden_builtin", "'__import__()' is not allowed - use pre-imported modules only", "forbidden-dunder-import"],
  [/\b__builtins__\b/, "python.forbidden_builtin", "'__builtins__' access is not allowed", "forbidden-builtins-access"],
  [/\bglobals\s*\(\s*\)/, "python.forbidden_builtin", "'globals()' is not allowed - it exposes the global namespace", "forbidden-globals"],
  [/\blocals\s*\(\s*\)/, "python.forbidden_builtin", "'locals()' is not allowed - it exposes the local namespace", "forbidden-locals"],
  [/\bgetattr\s*\([^,]+,\s*['"]__/, "python.forbidden_builtin", "Accessing dunder attributes via getattr is not allowed", "forbidden-dunder-getattr"],
  [/\bsetattr\s*\(/, "python.forbidden_builtin", "'setattr()' is not allowed - modify only local variables", "forbidden-setattr"],
  [/\bdelattr\s*\(/, "python.forbidden_builtin", "'delattr()' is not allowed", "forbidden-delattr"],
]

// ============================================================================
// Validation Logic
// ============================================================================

function findPatternLine(code: string, pattern: RegExp): number | undefined {
  const lines = code.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1
    }
  }
  return undefined
}

function checkBasicSyntax(code: string): { message: string; line: number } | null {
  const lines = code.split("\n")
  const stack: { char: string; line: number }[] = []
  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" }
  const closers: Record<string, string> = { ")": "(", "]": "[", "}": "{" }

  let inString: string | null = null
  let escapeNext = false

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (escapeNext) {
        escapeNext = false
        continue
      }
      
      if (char === "\\") {
        escapeNext = true
        continue
      }

      if ((char === '"' || char === "'") && !inString) {
        if (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''") {
          const tripleQuote = line.slice(i, i + 3)
          if (inString === tripleQuote) {
            inString = null
          } else if (!inString) {
            inString = tripleQuote
          }
          i += 2
          continue
        }
        inString = char
        continue
      }

      if (inString && char === inString[0] && inString.length === 1) {
        inString = null
        continue
      }

      if (inString) continue
      if (char === "#") break

      if (pairs[char]) {
        stack.push({ char, line: lineIdx + 1 })
      } else if (closers[char]) {
        const last = stack.pop()
        if (!last || last.char !== closers[char]) {
          return { message: `Unmatched '${char}'`, line: lineIdx + 1 }
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1]
    return { message: `Unclosed '${unclosed.char}'`, line: unclosed.line }
  }

  return null
}

export function validate(code: string): ValidationResult {
  if (!code || !code.trim()) {
    return {
      valid: false,
      errorCode: "common.empty_code",
      errorMessage: "Code cannot be empty",
      helpArticleId: "empty-code",
    }
  }

  if (!REQUIRED_SIGNATURE.test(code)) {
    return {
      valid: false,
      errorCode: "python.invalid_signature",
      errorMessage: "Function must be defined as: def extract(response, variables):",
      helpArticleId: "invalid-signature",
      line: 1,
    }
  }

  for (const [pattern, errorCode, message, helpArticleId] of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      const line = findPatternLine(code, pattern)
      return {
        valid: false,
        errorCode,
        errorMessage: message,
        helpArticleId,
        line,
      }
    }
  }

  if (!RETURN_PATTERN.test(code)) {
    return {
      valid: false,
      errorCode: "python.missing_return",
      errorMessage: "Function must have at least one return statement",
      helpArticleId: "missing-return",
    }
  }

  const syntaxError = checkBasicSyntax(code)
  if (syntaxError) {
    return {
      valid: false,
      errorCode: "common.syntax_error",
      errorMessage: syntaxError.message,
      line: syntaxError.line,
      helpArticleId: "syntax-error",
    }
  }

  return {
    valid: true,
    errorCode: "common.valid",
  }
}

