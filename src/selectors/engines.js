
import get from 'lodash/get'
import { createSelector } from 'reselect'

const enginesSelector = (state) => get(state, 'engines')

const tableEnginesSelector = createSelector(
  [enginesSelector],
  (engines) => get(engines, 'table'),
)

const processingEnginesSelector = createSelector(
  [enginesSelector],
  (engines) => get(engines, 'processing'),
)

export {
  enginesSelector,
  tableEnginesSelector,
  processingEnginesSelector,
}
