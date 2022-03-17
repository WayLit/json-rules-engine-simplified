import predicate from 'predicate'
import { AND, NOT, OR } from './constants'
import { isObject } from './utils'

const doCheckField = (fieldVal, rule) => {
  if (isObject(rule)) {
    return Object.keys(rule).every(p => {
      const subRule = rule[p]
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
    return predicate[rule](fieldVal)
  }
}

export default function checkField(fieldVal, rule) {
  return doCheckField(fieldVal, rule)
}
