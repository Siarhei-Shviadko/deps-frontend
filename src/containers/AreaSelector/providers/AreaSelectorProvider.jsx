import PropTypes from 'prop-types'
import { boundingBoxShape } from '@/models/SplittingProposal'
import { AreaCreateProvider } from './AreaCreateProvider'
import { AreaResizeProvider } from './AreaResizeProvider'

export const AreaSelectorProvider = ({ coordinates, onChange, children }) => (
  <AreaCreateProvider onChange={onChange}>
    <AreaResizeProvider
      coordinates={coordinates}
      onChange={onChange}
    >
      {children}
    </AreaResizeProvider>
  </AreaCreateProvider>
)

AreaSelectorProvider.propTypes = {
  coordinates: boundingBoxShape,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}
