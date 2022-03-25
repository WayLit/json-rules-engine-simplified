import { FormData, Rule, Event } from './types'
import conditionsMeet from './conditionsMeet'
import { flatMap, toArray } from './utils'

export default function applicableActions(rules: Rule[], formData: FormData) {
  return flatMap(rules, ({ conditions, event }) => {
    if (conditionsMeet(conditions, formData)) {
      return toArray(event)
    } else {
      return []
    }
  })
}
