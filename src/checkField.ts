import predicate, { Predicate } from 'predicate'
import { AND, NOT, OR } from './constants'
import { isObject } from './utils'
import { Condition, ConditionType, Rule } from './types'

const doCheckField = (fieldVal: unknown, rule: ConditionType): boolean => {
  if (isObject(rule)) {
    return Object.keys(rule).every(p => {
      const subRule = (rule as Record<string, Condition>)[p]
      if (p === OR || p === AND) {
        if (Array.isArray(subRule)) {
          if (p === OR) {
            return subRule.some(rule => doCheckField(fieldVal, rule))
          } else {
            return subRule.every(rule => doCheckField(fieldVal, rule))
          }
        } else {
          return false
        }
      } else if (p === NOT) {
        return !doCheckField(fieldVal, subRule)
      } else if (predicate[p]) {
        return predicate[p](fieldVal, subRule)
      } else {
        return false
      }
    })
  } else {
    return predicate[rule as string](fieldVal)
  }
}

export default function checkField(fieldVal: unknown, rule: Condition) {
  return doCheckField(fieldVal, rule)
}
