import PropTypes from 'prop-types'
import { memo } from 'react'
import { splitterShape } from '@/models/Splitter'
import { AddSplitterDrawerButton } from '../AddSplitterDrawerButton'
import { EditSplitterDrawerButton } from '../EditSplitterDrawerButton'
import { Wrapper } from './DocumentTypeSplitterCell.styles'
import { SplitterTag } from './SplitterTag'

export const DocumentTypeSplitterCell = memo(({
  splitter,
  documentTypeId,
}) => {
  if (!splitter) {
    return (
      <AddSplitterDrawerButton documentTypeId={documentTypeId} />
    )
  }

  return (
    <Wrapper>
      <SplitterTag splitter={splitter} />
      <EditSplitterDrawerButton splitter={splitter} />
    </Wrapper>
  )
})

DocumentTypeSplitterCell.propTypes = {
  splitter: splitterShape,
  documentTypeId: PropTypes.string.isRequired,
}
