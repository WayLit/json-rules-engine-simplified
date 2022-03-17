import conditionsMeet from '../src/conditionsMeet'
import { testInProd } from './utils'

test('sanity checkField', function () {
  expect(() => conditionsMeet('empty', {})).toThrow()
  expect(() => conditionsMeet({}, 0)).toThrow()
})

test('run predicate against array and elements', () => {
  const condition = {
    options: 'empty'
  }
  expect(conditionsMeet(condition, [''])).toBeTruthy()
  expect(conditionsMeet(condition, [])).toBeTruthy()
})

test('handles array of non-objects', () => {
  const condition = {
    options: {
      contains: 'foo'
    }
  }
  expect(conditionsMeet(condition, { options: ['bar'] })).toBeFalsy()
  expect(conditionsMeet(condition, { options: [] })).toBeFalsy()
  expect(conditionsMeet(condition, { options: ['foo', 'bar'] })).toBeTruthy()
})

// throws error
test('handles array of numbers', () => {
  const condition = {
    options: {
      contains: 2
    }
  }
  expect(conditionsMeet(condition, { options: [1, 2] })).toBeTruthy()
  expect(conditionsMeet(condition, { options: [1] })).toBeFalsy()
  expect(conditionsMeet(condition, { options: [] })).toBeFalsy()
})

test('single line', () => {
  const condition = {
    firstName: 'empty'
  }
  expect(conditionsMeet(condition, {})).toBeTruthy()
  expect(conditionsMeet(condition, { firstName: 'some' })).toBeFalsy()
  expect(conditionsMeet(condition, { firstName: '' })).toBeTruthy()
  expect(conditionsMeet(condition, { firstName: undefined })).toBeTruthy()
})

test('default use and', () => {
  const condition = {
    firstName: {
      equal: 'Will'
    },
    lastName: {
      equal: 'Smith'
    }
  }
  expect(conditionsMeet(condition, { firstName: 'Will' })).toBeFalsy()
  expect(conditionsMeet(condition, { lastName: 'Smith' })).toBeFalsy()
  expect(
    conditionsMeet(condition, { firstName: 'Will', lastName: 'Smith' })
  ).toBeTruthy()
})

test('NOT condition', () => {
  const condition = {
    not: {
      firstName: {
        equal: 'Will'
      }
    }
  }
  expect(conditionsMeet(condition, { firstName: 'Will' })).toBeFalsy()
  expect(conditionsMeet(condition, { firstName: 'Smith' })).toBeTruthy()
  expect(
    conditionsMeet(condition, { firstName: 'Will', lastName: 'Smith' })
  ).toBeFalsy()
})

test('invalid condition', () => {
  expect(() => conditionsMeet('empty', {})).toThrow()
  expect(() => conditionsMeet({}, 'empty')).toThrow()
  expect(testInProd(() => conditionsMeet('empty', {}))).toBeFalsy()
  expect(testInProd(() => conditionsMeet({}, 'empty'))).toBeFalsy()
})
