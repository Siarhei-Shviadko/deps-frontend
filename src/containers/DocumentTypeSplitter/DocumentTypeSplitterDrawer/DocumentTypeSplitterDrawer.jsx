import PropTypes from 'prop-types'
import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import {
  Form,
  FormValidationMode,
} from '@/components/Form'
import { Spin } from '@/components/Spin'
import { Localization, localize } from '@/localization/i18n'
import { splitterShape } from '@/models/Splitter'
import { theme } from '@/theme/theme.default'
import {
  StyledDrawer,
  DrawerFooterWrapper,
  Wrapper,
} from './DocumentTypeSplitterDrawer.styles'
import { getFormDefaultValues } from './utils'

export const DocumentTypeSplitterDrawer = ({
  renderTrigger,
  splitter,
  documentTypeId,
  onSubmit,
  isLoading,
  children,
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)

  const methods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    defaultValues: getFormDefaultValues(splitter, documentTypeId),
    shouldUnregister: true,
  })

  const {
    getValues,
    handleSubmit,
    formState: {
      isValid,
      isDirty,
    },
  } = methods

  const toggleDrawer = useCallback(() => {
    setIsDrawerVisible((prev) => !prev)
  }, [])

  const onSubmitButtonClick = useCallback(async () => {
    const { splitter } = getValues()

    await onSubmit(splitter)
  }, [getValues, onSubmit])

  const DrawerFooter = useMemo(() => (
    <DrawerFooterWrapper>
      <Button.Secondary
        disabled={isLoading}
        onClick={toggleDrawer}
      >
        {localize(Localization.CANCEL)}
      </Button.Secondary>
      <Button.Secondary
        disabled={!isValid || !isDirty}
        loading={isLoading}
        onClick={onSubmitButtonClick}
      >
        {localize(Localization.SAVE)}
      </Button.Secondary>
    </DrawerFooterWrapper>
  ), [
    isLoading,
    isDirty,
    isValid,
    onSubmitButtonClick,
    toggleDrawer,
  ])

  const drawerTitle = splitter
    ? localize(Localization.EDIT_SPLITTER)
    : localize(Localization.ADD_SPLITTER)

  const onDrawerClick = (e) => {
    e.stopPropagation()
  }

  return (
    <Wrapper onClick={onDrawerClick}>
      {renderTrigger(toggleDrawer)}
      {
        isDrawerVisible && (
          <StyledDrawer
            destroyOnClose
            footer={DrawerFooter}
            hasCloseIcon={false}
            onClose={toggleDrawer}
            open={isDrawerVisible}
            title={drawerTitle}
            width={theme.size.drawerWidth}
          >
            <Spin spinning={isLoading}>
              <FormProvider {...methods}>
                <Form
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmitButtonClick}
                >
                  {children}
                </Form>
              </FormProvider>
            </Spin>
          </StyledDrawer>
        )
      }
    </Wrapper>
  )
}

DocumentTypeSplitterDrawer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  renderTrigger: PropTypes.func.isRequired,
  documentTypeId: PropTypes.string.isRequired,
  splitter: splitterShape,
  children: PropTypes.node.isRequired,
}
