
import { createAction } from 'redux-actions'
import { createRequestAction } from '@/actions/requests'
import { enginesApi } from '@/api/enginesApi'
import { RESOURCE_PROCESSING_ENGINE } from '@/enums/KnownProcessingEngines'

export const FEATURE_NAME = 'ENGINES'

const storeTableEngines = createAction(
  `${FEATURE_NAME}/STORE_TABLE`,
)

const fetchTableEngines = createRequestAction(
  'fetchTableEngines',
  () => async (dispatch) => {
    dispatch(
      storeTableEngines(
        await enginesApi.getTableEngines(),
      ),
    )
  },
)

const storeProcessingEngines = createAction(
  `${FEATURE_NAME}/STORE_PROCESSING`,
)

const fetchProcessingEngines = createRequestAction(
  'fetchProcessingEngines',
  () => async (dispatch) => {
    const { engines } = await enginesApi.getProcessingEngines()

    dispatch(
      storeProcessingEngines(
        engines.map(({ code, name }) => ({
          code,
          name: RESOURCE_PROCESSING_ENGINE[code] ?? name,
        })),
      ),
    )
  },
)

export {
  storeTableEngines,
  fetchTableEngines,
  storeProcessingEngines,
  fetchProcessingEngines,
}
