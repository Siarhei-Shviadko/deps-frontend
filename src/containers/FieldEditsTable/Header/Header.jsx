import PropTypes from 'prop-types'
import { CustomSelect } from '@/components/Select'
import { Localization, localize } from '@/localization/i18n'
import { TOP_LIMIT_OPTIONS } from '../constants'
import {
  Title,
  TopSelect,
  TopSelectLabel,
  TopSelectWrapper,
  Wrapper,
} from './Header.styles'

export const Header = ({ topLimit, setTopLimit }) => {
  const handleTopLimitChange = (value) => {
    setTopLimit(Number(value))
  }

  return (
    <Wrapper>
      <Title>
        {localize(Localization.FIELD_EDITS_TITLE, { top: topLimit })}
      </Title>
      <TopSelectWrapper>
        <TopSelectLabel>
          {localize(Localization.TOP)}
        </TopSelectLabel>
        <TopSelect>
          <CustomSelect
            allowSearch={false}
            fetching={false}
            onChange={handleTopLimitChange}
            options={TOP_LIMIT_OPTIONS}
            value={String(topLimit)}
          />
        </TopSelect>
      </TopSelectWrapper>
    </Wrapper>
  )
}

Header.propTypes = {
  topLimit: PropTypes.number.isRequired,
  setTopLimit: PropTypes.func.isRequired,
}
