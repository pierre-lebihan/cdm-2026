export function queryKeyStringValue(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  return null
}

export function queryKeyNumberValue(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  return 0
}

export function queryKeyStringListValue(value: unknown): string[] {
  const strings: string[] = []

  if (!Array.isArray(value)) {
    return strings
  }

  for (const item of value) {
    if (typeof item === 'string') {
      strings.push(item)
    }
  }

  return strings
}
