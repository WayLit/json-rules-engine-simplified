import { JSONSchema7, JSONSchema7Definition } from 'json-schema'

export interface FormData {
  [key: string]: unknown
}

export type Schema = JSONSchema7
export type ConditionType = string | Condition[] | Condition | Rule
export interface Condition {
  [key: string]: ConditionType
}
export interface Rule {
  conditions: Condition
  event: Event | Event[]
}

export interface Params {
  [key: string]: unknown
}
export interface Event {
  type: string
  params: Params
}
