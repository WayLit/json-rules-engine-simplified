import predicate, { Predicate } from 'predicate'
import { Condition, Rule } from './types'
import { AND, NOT, OR } from './constants'
import { Schema } from './types'
import {
  extractRefSchema,
  flatMap,
  isObject,
  isRefArray,
  normRef,
  toError
} from './utils'

const UNSUPPORTED_PREDICATES = [
  'and',
  'or',
  'ternary',
  'every',
  'some',
  'curry',
  'partial',
  'complement',
  'mod'
]

export function predicatesFromRule(rule: Rule, schema: Schema): string[] {
  if (isObject(rule)) {
    return flatMap(Object.keys(rule), (p: string) => {
      // @ts-expect-error
      const comparable = rule[p]
      if (isObject(comparable) || p === NOT) {
        if (p === OR || p === AND) {
          if (Array.isArray(comparable)) {
            return flatMap(comparable, (condition: Rule) =>
              predicatesFromRule(condition, schema)
            )
          } else {
            toError(`"${p}" must be an array`)
            return []
          }
        } else {
          const predicates = predicatesFromRule(comparable, schema)
          predicates.push(p)
          return predicates
        }
      } else {
        return predicatesFromRule(p as unknown as Rule, schema)
      }
    })
  } else {
    return [rule as unknown as string]
  }
}

export function predicatesFromCondition(
  condition: Condition,
  schema: Schema
): string[] {
  return flatMap(Object.keys(condition), (ref: string) => {
    const refVal = condition[ref]
    ref = normRef(ref)
    if (ref === OR || ref === AND) {
      if (Array.isArray(refVal)) {
        return flatMap(refVal, c => predicatesFromCondition(c, schema))
      } else {
        toError(`${ref} with ${JSON.stringify(refVal)} must be an Array`)
        return []
      }
    } else if (ref === NOT) {
      return predicatesFromCondition(refVal as Condition, schema)
    } else if (ref.indexOf('.') !== -1) {
      const separator = ref.indexOf('.')
      const schemaField = ref.substring(0, separator)
      const subSchema = extractRefSchema(schemaField, schema)

      if (subSchema) {
        const subSchemaField = ref.substring(separator + 1)
        const newCondition = { [subSchemaField]: refVal }
        return predicatesFromCondition(newCondition, subSchema)
      } else {
        toError(`Can't find schema for ${schemaField}`)
        return []
      }
    } else if (isRefArray(ref, schema)) {
      const refSchema = extractRefSchema(ref, schema)
      return refSchema
        ? predicatesFromCondition(refVal as Condition, refSchema)
        : []
    } else if (schema.properties && schema.properties[ref]) {
      return predicatesFromRule(refVal as Rule, schema)
    } else {
      toError(`Can't validate ${ref}`)
      return []
    }
  })
}

export function listAllPredicates(conditions: Condition[], schema: Schema) {
  const allPredicates = flatMap(conditions, condition =>
    predicatesFromCondition(condition, schema)
  )
  return allPredicates.filter((v, i, a) => allPredicates.indexOf(v) === i)
}

export function listInvalidPredicates(conditions: Condition[], schema: Schema) {
  const refPredicates = listAllPredicates(conditions, schema)
  return refPredicates.filter(
    p =>
      UNSUPPORTED_PREDICATES.includes(p as string) || predicate[p] === undefined
  )
}

export function validatePredicates(conditions: Condition[], schema: Schema) {
  const invalidPredicates = listInvalidPredicates(conditions, schema)
  if (invalidPredicates.length !== 0) {
    toError(`Rule contains invalid predicates ${invalidPredicates}`)
  }
}

export function fieldsFromPredicates(
  predicate: Predicate | Predicate[] | Record<string, Predicate>
): string[] {
  if (Array.isArray(predicate)) {
    return flatMap(predicate, fieldsFromPredicates)
  } else if (isObject(predicate)) {
    return flatMap(Object.keys(predicate), field => {
      const predicateValue = (predicate as Record<string, Predicate>)[field]
      return fieldsFromPredicates(predicateValue)
    })
  // @ts-expect-error
  } else if (typeof predicate === 'string' && predicate.startsWith('$')) {
  // @ts-expect-error
  return [predicate.substring(1)]
  } else {
    return []
  }
}

export function fieldsFromCondition(condition: Condition): string[] {
  return flatMap(Object.keys(condition), (ref: string) => {
    const refCondition = condition[ref]
    if (ref === OR || ref === AND) {
      return flatMap(refCondition as Condition[], fieldsFromCondition)
    } else if (ref === NOT) {
      return fieldsFromCondition(refCondition as Condition)
    } else {
      return [normRef(ref)].concat(
        fieldsFromPredicates(
          refCondition as unknown as Record<string, Predicate>
        )
      )
    }
  })
}

export function listAllFields(conditions: Condition[]) {
  const allFields = flatMap(conditions, fieldsFromCondition)
  return allFields
    .filter((field: string) => field.indexOf('.') === -1)
    .filter((v, i, a) => allFields.indexOf(v) === i)
}

export function listInvalidFields(conditions: Condition[], schema: Schema) {
  const allFields = listAllFields(conditions)
  return allFields.filter(
    (field: string) =>
      !schema.properties || schema.properties[field] === undefined
  )
}

export function validateConditionFields(
  conditions: Condition[],
  schema: Schema
) {
  const invalidFields = listInvalidFields(conditions, schema)
  if (invalidFields.length !== 0) {
    toError(`Rule contains invalid fields ${invalidFields}`)
  }
}
