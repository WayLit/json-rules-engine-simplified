export function testInProd(f) {
  process.env.NODE_ENV = 'production'
  const res = f()
  process.env.NODE_ENV = 'test'
  return res
}
