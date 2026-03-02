type StagedScalarWrapper = {
  __communityScalar: true
  value: boolean | null | number | string
}

function isPrimitive(value: unknown): value is boolean | null | number | string {
  return value === null || ['boolean', 'number', 'string'].includes(typeof value)
}

export function encodeStagedProfileValue(value: unknown): unknown {
  if (isPrimitive(value)) {
    return {
      __communityScalar: true,
      value,
    } satisfies StagedScalarWrapper
  }

  return value
}

export function decodeStagedProfileValue(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }

  const record = value as Record<string, unknown>
  if (record.__communityScalar === true && Object.prototype.hasOwnProperty.call(record, 'value')) {
    return record.value
  }

  return value
}
