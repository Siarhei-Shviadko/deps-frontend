
import PropTypes from 'prop-types'
import { useRef } from 'react'
import { Carousel } from '@/components/Carousel'
import { AngleDownIcon } from '@/components/Icons/AngleDownIcon'
import { Input } from '@/components/Input'
import { documentTypeShape } from '@/models/DocumentType'
import {
  Spin,
  Controls,
  PrevButton,
  NextButton,
} from './GroupDocumentTypeSelect.styles'

const GroupDocumentTypeSelect = ({
  allowSelectDocumentType,
  documentTypes,
  onChange,
  isFetching,
}) => {
  const sliderRef = useRef(null)

  const isButtonDisabled = documentTypes.length === 1

  const showPrev = () => {
    sliderRef.current?.prev()
  }

  const showNext = () => {
    sliderRef.current?.next()
  }

  const beforeChange = (_, index) => {
    onChange(documentTypes[index].code)
  }

  const setRef = (ref) => {
    sliderRef.current = ref
  }

  if (!allowSelectDocumentType) {
    const [{ code, name }] = documentTypes
    return (
      <Input
        key={code}
        disabled
        value={name}
      />
    )
  }

  return (
    <Spin spinning={isFetching}>
      <Carousel
        ref={setRef}
        beforeChange={beforeChange}
        dots={false}
      >
        {
          documentTypes.map((dt) => (
            <Input
              key={dt.code}
              disabled
              value={dt.name}
            />
          ))
        }
      </Carousel>
      <Controls>
        <PrevButton
          disabled={isButtonDisabled}
          icon={<AngleDownIcon />}
          onClick={showPrev}
        />
        <NextButton
          disabled={isButtonDisabled}
          icon={<AngleDownIcon />}
          onClick={showNext}
        />
      </Controls>
    </Spin>
  )
}

GroupDocumentTypeSelect.propTypes = {
  allowSelectDocumentType: PropTypes.bool.isRequired,
  documentTypes: PropTypes.arrayOf(
    documentTypeShape.isRequired,
  ).isRequired,
  isFetching: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export {
  GroupDocumentTypeSelect,
}
