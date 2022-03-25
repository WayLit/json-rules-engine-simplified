declare module 'predicate' {
  export interface Predicate {
    [key: string]: (fieldVal: unknown, rule?: unknown) => boolean
  }
  const defs: Predicate
  export default defs
}
