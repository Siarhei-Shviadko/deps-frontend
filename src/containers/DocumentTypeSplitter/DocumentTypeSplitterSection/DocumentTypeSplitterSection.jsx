import PropTypes from 'prop-types'
import { useState } from 'react'
import { ButtonType } from '@/components/Button'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { TrashIcon } from '@/components/Icons/TrashIcon'
import { Localization, localize } from '@/localization/i18n'
import { childrenShape } from '@/utils/propTypes'
import {
  CreateButton,
  RemoveSplitterButton,
  SplitterTitle,
  SplitterWrapper,
} from './DocumentTypeSplitterSection.styles'

export const DocumentTypeSplitterSection = ({
  children,
  areChildrenVisible = false,
  onVisibilityChange,
}) => {
  const [showForm, setShowForm] = useState(areChildrenVisible)

  const toggleSplitterForm = () => {
    setShowForm((prev) => {
      onVisibilityChange?.(!prev)
      return !prev
    })
  }

  if (showForm) {
    return (
      <SplitterWrapper>
        <SplitterTitle>
          {localize(Localization.SPLITTER_CONFIG)}
          <RemoveSplitterButton
            icon={<TrashIcon />}
            onClick={toggleSplitterForm}
            type={ButtonType.LINK}
          >
            {localize(Localization.REMOVE_SPLITTER)}
          </RemoveSplitterButton>
        </SplitterTitle>
        {children}
      </SplitterWrapper>
    )
  }

  return (
    <CreateButton
      onClick={toggleSplitterForm}
      type={ButtonType.LINK}
    >
      <PlusIcon />
      {localize(Localization.ADD_SPLITTER)}
    </CreateButton>
  )
}

DocumentTypeSplitterSection.propTypes = {
  children: childrenShape,
  areChildrenVisible: PropTypes.bool,
  onVisibilityChange: PropTypes.func,
}
