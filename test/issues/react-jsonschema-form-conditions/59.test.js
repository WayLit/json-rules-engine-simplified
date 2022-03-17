import Engine from '../../../src/index'

const rulesWithTwoEvents = {
  conditions: {
    hasBenefitsReference: { is: true }
  },
  event: [
    {
      type: 'require',
      params: {
        field: 'hasBD2Reference'
      }
    },
    {
      type: 'require',
      params: {
        field: 'BD2Reference'
      }
    }
  ]
}

const rulesWithSingleEvent = {
  conditions: {
    hasBenefitsReference: { is: true }
  },
  event: [
    {
      type: 'require',
      params: {
        field: ['hasBD2Reference', 'BD2Reference']
      }
    }
  ]
}

const schema = {
  type: 'object',
  properties: {
    hasBenefitsReference: {
      title: 'Do you have a Benefits Reference Number?',
      type: 'boolean'
    },
    benefitsReference: {
      title: 'Benefits Reference Number',
      type: 'string'
    },
    hasBD2Reference: {
      title: 'Do you have a BD2 Number?',
      type: 'boolean'
    },
    BD2Reference: {
      title: 'BD2 Number',
      type: 'string'
    }
  }
}

test('creation with two events on creation', () => {
  const engine = new Engine([rulesWithTwoEvents], schema)

  return engine.run({ hasBenefitsReference: true }).then(events => {
    expect(events.length).toEqual(2)
    expect(events).toEqual(rulesWithTwoEvents.event)
  })
})

test('creation with two events on add', () => {
  const engine = new Engine([], schema)

  engine.addRule(rulesWithTwoEvents)

  return engine.run({ hasBenefitsReference: true }).then(events => {
    expect(events.length).toEqual(2)
    expect(events).toEqual(rulesWithTwoEvents.event)
  })
})

test('creation with single event on creatin', () => {
  const engine = new Engine([rulesWithSingleEvent], schema)

  return engine.run({ hasBenefitsReference: true }).then(events => {
    expect(events.length).toEqual(1)
    expect(events).toEqual(rulesWithSingleEvent.event)
  })
})

test('creation with single event on add', () => {
  const engine = new Engine([], schema)

  engine.addRule(rulesWithSingleEvent)

  return engine.run({ hasBenefitsReference: true }).then(events => {
    expect(events.length).toEqual(1)
    expect(events).toEqual(rulesWithSingleEvent.event)
  })
})
