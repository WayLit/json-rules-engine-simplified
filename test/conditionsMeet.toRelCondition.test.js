import { toRelCondition } from '../src/conditionsMeet'

test('rel simple condition', () => {
  expect(toRelCondition({ less: '$b' }, { b: 11 })).toEqual({ less: 11 })
})

test('rel complicated condition', () => {
  const condition = {
    decreasedByMoreThanPercent: {
      average: '$averages_monthly.cost',
      target: 20
    }
  }

  const formData = {
    averages_monthly: { cost: 100 }
  }

  const expCondition = {
    decreasedByMoreThanPercent: {
      average: 100,
      target: 20
    }
  }

  expect(toRelCondition(condition, formData)).toEqual(expCondition)
})

test('work with OR condition', () => {
  const cond = { or: [{ lessEq: '$b' }, { greaterEq: '$c' }] }
  const formData = { b: 16, c: 70 }
  const expCond = { or: [{ lessEq: 16 }, { greaterEq: 70 }] }
  expect(toRelCondition(cond, formData)).toEqual(expCond)
})

test('keep non relevant', () => {
  expect(toRelCondition({ range: [20, 40] }, {})).toEqual({ range: [20, 40] })
})
