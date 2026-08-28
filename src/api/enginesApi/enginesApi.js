
import { apiMap } from '@/utils/apiMap'
import { apiRequest } from '@/utils/apiRequest'

const getTableEngines = () => apiRequest.get(apiMap.tables.v1.tableEngines())

const getProcessingEngines = () => apiRequest.get(apiMap.apiGatewayV2.v5.tools.parsing.engines())

export {
  getTableEngines,
  getProcessingEngines,
}
