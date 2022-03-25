import { FormData, Rule, Schema } from './types'
import applicableActions from './applicableActions'
import { isDevelopment, isObject, toArray, toError } from './utils'
import { validateConditionFields, validatePredicates } from './validation'

const validate = (schema: Schema) => {
  const isSchemaDefined = schema !== undefined && schema !== null
  if (isDevelopment() && isSchemaDefined) {
    if (!isObject(schema)) {
      toError(`Expected valid schema object, but got - ${schema}`)
    }
    return (rule: Rule) => {
      validatePredicates([rule.conditions], schema)
      validateConditionFields([rule.conditions], schema)
    }
  } else {
    return () => {}
  }
}

class Engine {
  public rules: Rule[]
  public validate

  constructor(rules: Rule[], schema: Schema) {
    this.rules = []
    this.validate = validate(schema)

    if (rules) {
      toArray(rules).forEach(rule => this.addRule(rule))
    }
  }

  addRule = (rule: Rule) => {
    this.validate(rule)
    this.rules.push(rule)
  }

  run = (formData: FormData) =>
    Promise.resolve(applicableActions(this.rules, formData))
}

export default Engine
