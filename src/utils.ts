import selectn from 'selectn'
import { FormData, Schema } from './types'

export function normRef(ref: string) {
  return ref.replace(/\$/g, '.')
}

export function selectRef(field: string, formData: FormData) {
  const ref = normRef(field)
  return selectn(ref, formData)
}

export function isObject(obj: unknown): boolean {
  return typeof obj === 'object' && obj !== null
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function toArray<T>(event: T | T[]): T[] {
  if (Array.isArray(event)) {
    return event
  } else {
    return [event]
  }
}

export function toError(message: string) {
  if (isDevelopment()) {
    throw new ReferenceError(message)
  } else {
    console?.error(message)
  }
}

export function isRefArray<S extends Schema>(
  field: string,
  schema: S
): boolean {
  const _field = schema.properties && schema.properties[field]
  if (_field == null || typeof _field === 'boolean') return false

  // @ts-expect-error
  return _field.type === 'array' && _field.items && _field.items.$ref
}

function fetchSchema(ref: string, schema: Schema) {
  if (ref.startsWith('#/')) {
    return (
      ref
        .substring(2)
        .split('/')
        // @ts-expect-error
        .reduce((schema, field) => schema[field], schema)
    )
  } else {
    toError(
      'Only local references supported at this point use json-schema-deref'
    )
    return undefined
  }
}

export function extractRefSchema<S extends Schema>(
  field: string,
  schema: Schema
): Schema | undefined {
  const { properties } = schema
  if (!properties || !properties[field]) {
    toError(`${field} not defined in properties`)
    return undefined
    // @ts-expect-error
  } else if (properties[field].type === 'array') {
    if (isRefArray(field, schema)) {
      // @ts-expect-error

      return fetchSchema(properties[field].items.$ref, schema)
    } else {
      // @ts-expect-error
      return properties[field].items
    }
    // @ts-expect-error
  } else if (properties[field] && properties[field].$ref) {
    // @ts-expect-error

    return fetchSchema(properties[field].$ref, schema)
    // @ts-expect-error
  } else if (properties[field] && properties[field].type === 'object') {
    return properties[field] as Schema
  } else {
    toError(`${field} has no $ref field ref schema extraction is impossible`)
    return undefined
  }
}

const concat = <T>(x: T[], y: T[]): T[] => x.concat(y)

export const flatMap = <T, V>(xs: T[], f: (x: T) => V[]): V[] =>
  xs.map(f).reduce(concat, [])
