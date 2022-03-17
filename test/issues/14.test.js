import Engine from '../../src'

test('simple relevant rules work', () => {
  const rules = [
    {
      conditions: {
        a: { less: '$b' }
      },
      event: {
        type: 'match'
      }
    }
  ]
  const engine = new Engine(rules)
  return engine.run({ a: 10, b: 11 }).then(events => {
    expect(events.length).toEqual(1)
    expect(events[0]).toEqual({ type: 'match' })
  })
})

test('complicated rules work', () => {
  const rules = [
    {
      conditions: {
        a: { or: [{ less: '$b' }] }
      },
      event: {
        type: 'match'
      }
    }
  ]
  const engine = new Engine(rules)
  return engine.run({ a: 10, b: 11 }).then(events => {
    expect(events.length).toEqual(1)
    expect(events[0]).toEqual({ type: 'match' })
  })
})

test('validation rel fields work', () => {
  const rules = [
    {
      conditions: {
        a: { less: '$b' }
      },
      event: 'some'
    }
  ]

  const invSchema = {
    type: 'object',
    properties: {
      a: { type: 'object' }
    }
  }

  expect(() => new Engine(rules, invSchema)).toThrow()

  const valSchema = {
    type: 'object',
    properties: {
      a: { type: 'object' },
      b: { type: 'number' }
    }
  }

  expect(() => new Engine(rules, valSchema)).not.toBeUndefined()
})
