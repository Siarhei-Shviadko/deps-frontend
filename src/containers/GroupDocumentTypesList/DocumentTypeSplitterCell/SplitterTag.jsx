import { useDeleteSplitterMutation } from '@/apiRTK/splittingApi'
import { LongText } from '@/components/LongText'
import { Modal } from '@/components/Modal'
import { Tag } from '@/components/Tag'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { splitterShape } from '@/models/Splitter'
import { notifySuccess, notifyWarning } from '@/utils/notification'

export const SplitterTag = ({ splitter }) => {
  const [deleteSplitter] = useDeleteSplitterMutation()

  const handleRemove = async () => {
    try {
      await deleteSplitter(splitter.id).unwrap()
      notifySuccess(localize(Localization.SPLITTER_SUCCESS_DELETION, {
        name: splitter.name,
      }))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  const onRemoveClick = () => {
    Modal.confirm({
      title: localize(Localization.DELETE_SPLITTER_CONFIRM_MESSAGE, {
        name: splitter.name,
      }),
      onOk: handleRemove,
    })
  }

  return (
    <Tag onClose={onRemoveClick}>
      <LongText text={splitter.name} />
    </Tag>
  )
}

SplitterTag.propTypes = {
  splitter: splitterShape.isRequired,
}
