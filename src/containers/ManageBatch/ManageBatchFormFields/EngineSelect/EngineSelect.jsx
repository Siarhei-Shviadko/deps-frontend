
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import { CustomSelect } from '@/components/Select'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'

export const EngineSelect = (props) => {
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const engines = useSelector(processingEnginesSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    !engines.length && dispatch(fetchProcessingEngines())
  }, [dispatch, engines])

  return (
    <CustomSelect
      {...props}
      allowClear={true}
      fetching={areEnginesFetching}
      options={Engine.toAllEnginesOptions(engines)}
    />

  )
}
