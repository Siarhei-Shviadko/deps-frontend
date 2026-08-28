
import { handleActions } from 'redux-actions'
import {
  storeProcessingEngines,
  storeTableEngines,
} from '@/actions/engines'

const initialState = {
  table: [],
  processing: [],
}

const enginesReducer = handleActions(
  new Map([
    [
      storeTableEngines,
      (state, action) => (
        {
          ...state,
          table: action.payload,
        }
      ),
    ], [
      storeProcessingEngines,
      (state, action) => (
        {
          ...state,
          processing: action.payload,
        }
      ),
    ],
  ]),
  initialState,
)

export {
  enginesReducer,
}
