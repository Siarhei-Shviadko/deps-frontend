
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { LongText } from '@/components/LongText'
import { optionShape } from '@/components/Select'
import { Tooltip } from '@/components/Tooltip'
import { childrenShape } from '@/utils/propTypes'
import { Select, Tag } from './CustomSelect.styles'

const { Option } = Select

const SelectMode = {
  MULTIPLE: 'multiple',
  TAGS: 'tags',
}

const OPTION_LABEL_PROP = 'label'

const TEST_ID = 'CustomSelect'

class CustomSelect extends PureComponent {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    allowSearch: PropTypes.bool,
    allowClear: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(optionShape).isRequired,
    dropdownRender: PropTypes.func,
    onSearch: PropTypes.func,
    onClear: PropTypes.func,
    onBlur: PropTypes.func,
    onPopupScroll: PropTypes.func,
    suffixIcon: PropTypes.element,
    dropdownMatchSelectWidth: PropTypes.bool,
    disabled: PropTypes.bool,
    fetching: PropTypes.bool.isRequired,
    className: PropTypes.string,
    identifier: PropTypes.string,
    maxTagCount: PropTypes.number,
    maxTagPlaceholder: PropTypes.oneOfType([
      PropTypes.func,
      childrenShape,
    ]),
    mode: PropTypes.string,
    showArrow: PropTypes.bool,
    onDropdownVisibleChange: PropTypes.func,
    onInputKeyDown: PropTypes.func,
    open: PropTypes.bool,
    tagRender: PropTypes.func,
    innerRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
    defaultValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    getTooltipContainer: PropTypes.func,
  }

  static defaultProps = {
    fetching: false,
  }

  filterOption = (input, option) => {
    const content = typeof option.children === 'string' ? option.children : option.text

    if (!content) {
      return false
    }

    return content.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }

  renderOption = (option) => option.renderOption
    ? option.renderOption()
    : option.text

  getTooltipContainer = (trigger) =>
    trigger.closest('.ant-select')?.parentNode || document.body

  renderTooltip = (option) => (
    <Tooltip
      getPopupContainer={this.props.getTooltipContainer ?? this.getTooltipContainer}
      placement={option.tooltip?.placement}
      title={option.tooltip?.title}
    >
      {this.renderOption(option)}
    </Tooltip>
  )

  renderOptions = () => this.props.options.map((o) => (
    <Select.Option
      key={o.value}
      disabled={o.disabled}
      label={o.renderLabel?.()}
      text={o.text}
      value={o.value}
    >
      {
        o.tooltip
          ? this.renderTooltip(o)
          : this.renderOption(o)
      }
    </Select.Option>
  ))

  tagRender = (props) => {
    if (this.props.tagRender) {
      return this.props.tagRender(props)
    }

    const { label, onClose } = props

    const onPreventMouseDown = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    return (
      <Tag
        key={label}
        closable
        onClose={onClose}
        onMouseDown={onPreventMouseDown}
      >
        <LongText text={label} />
      </Tag>
    )
  }

  isCustomOptionLabel = () => this.props.options.every((option) => !!option.renderLabel)

  getContainer = (trigger) => trigger.parentNode

  onClickHandler = (e) => {
    e.stopPropagation()
  }

  render = () => (
    <Select
      key={this.props.identifier}
      ref={this.props.innerRef}
      allowClear={this.props.allowClear}
      className={this.props.className}
      data-testid={TEST_ID}
      defaultValue={this.props.defaultValue}
      disabled={this.props.disabled}
      dropdownMatchSelectWidth={this.props.dropdownMatchSelectWidth}
      dropdownRender={this.props.dropdownRender}
      filterOption={this.filterOption}
      getPopupContainer={this.getContainer}
      loading={this.props.fetching}
      maxTagCount={this.props.maxTagCount}
      maxTagPlaceholder={this.props.maxTagPlaceholder}
      mode={this.props.mode}
      onBlur={this.props.onBlur}
      onChange={this.props.onChange}
      onClear={this.props.onClear}
      onClick={this.onClickHandler}
      onDropdownVisibleChange={this.props.onDropdownVisibleChange}
      onInputKeyDown={this.props.onInputKeyDown}
      onPopupScroll={this.props.onPopupScroll}
      onSearch={this.props.onSearch}
      open={this.props.open}
      placeholder={this.props.placeholder}
      showArrow={this.props.showArrow}
      showSearch={this.props.allowSearch}
      suffixIcon={this.props.suffixIcon}
      tagRender={this.tagRender}
      value={this.props.value}
      {
        ...this.isCustomOptionLabel() && {
          optionLabelProp: OPTION_LABEL_PROP,
        }
      }
    >
      {this.renderOptions()}
    </Select>
  )
}

CustomSelect.Option = Option

export {
  CustomSelect,
  SelectMode,
}
