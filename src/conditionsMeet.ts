import { Condition, FormData, Rule } from './types'
import checkField from './checkField'
import { AND, NOT, OR } from './constants'
import { isObject, selectRef, toError } from './utils'

export function toRelCondition(refCondition: string, formData: FormData): string
export function toRelCondition(
  refCondition: Condition,
  formData: FormData
): Condition
export function toRelCondition(
  refCondition: Condition[],
  formData: FormData
): Condition[]
export function toRelCondition(
  refCondition: Record<string, Condition>,
  formData: FormData
): Record<string, Condition>
export function toRelCondition(
  refCondition: string | Condition | Condition[] | Record<string, Condition>,
  formData: FormData
): string | Condition | Condition[] | Record<string, Condition> {
  if (Array.isArray(refCondition)) {
    return refCondition.map(cond => toRelCondition(cond, formData))
  } else if (isObject(refCondition)) {
    return Object.keys(refCondition).reduce((agg, field) => {
      // @ts-expect-error
      agg[field] = toRelCondition(refCondition[field], formData)
      return agg
    }, {})
  } else if (typeof refCondition === 'string' && refCondition.startsWith('$')) {
    return selectRef(refCondition.substring(1), formData)
  } else {
    return refCondition
  }
}

export default function conditionsMeet(
  condition: Condition,
  formData: FormData
): boolean {
  if (!isObject(condition) || !isObject(formData)) {
    toError(
      `Rule ${JSON.stringify(condition)} with ${formData} can't be processed`
    )
    return false
  }
  return Object.keys(condition).every((ref: string) => {
    const refCondition = condition[ref]
    if (ref === OR) {
      return (refCondition as Condition[]).some((rule: Condition) =>
        conditionsMeet(rule, formData)
      )
    } else if (ref === AND) {
      return (refCondition as Condition[]).every((rule: Condition) =>
        conditionsMeet(rule, formData)
      )
    } else if (ref === NOT) {
      return !conditionsMeet(refCondition as Condition, formData)
    } else {
      const refVal = selectRef(ref, formData)
      if (Array.isArray(refVal)) {
        const condMeatOnce = refVal.some(val =>
          isObject(val) ? conditionsMeet(refCondition as Condition, val) : false
        )
        // It's either true for an element in an array or for the whole array
        return (
          condMeatOnce ||
          checkField(
            refVal,
            toRelCondition(refCondition as Condition, formData)
          )
        )
      } else {
        return checkField(
          refVal,
          toRelCondition(refCondition as Condition, formData)
        )
      }
    }
  })
}
