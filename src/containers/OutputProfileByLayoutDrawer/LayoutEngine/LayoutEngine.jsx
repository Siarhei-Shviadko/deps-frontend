
import PropTypes from 'prop-types'
import {
  useCallback,
  useEffect,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { localize, Localization } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import {
  CustomSelect,
  Label,
  Wrapper,
} from './LayoutEngine.styles'

const LayoutEngine = ({
  engine,
  updateProfile,
}) => {
  const engines = useSelector(processingEnginesSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProcessingEngines())
  }, [dispatch])

  const onChange = useCallback((engine) => {
    updateProfile((profile) => {
      const { schema } = profile

      return {
        ...profile,
        schema: {
          ...schema,
          parsingType: engine,
        },
      }
    })
  }, [
    updateProfile,
  ])

  return (
    <Wrapper>
      <Label>
        {localize(Localization.ENGINE)}
      </Label>
      <CustomSelect
        fetching={areEnginesFetching}
        onChange={onChange}
        options={Engine.toAllEnginesOptions(engines)}
        placeholder={localize(Localization.SELECT_ENGINE)}
        value={engine}
      />
    </Wrapper>
  )
}

LayoutEngine.propTypes = {
  engine: PropTypes.oneOf(Object.values(KnownProcessingEngines)),
  updateProfile: PropTypes.func.isRequired,
}

export {
  LayoutEngine,
}
