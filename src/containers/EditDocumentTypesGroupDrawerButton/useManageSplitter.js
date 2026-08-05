
import { useCallback } from 'react'
import {
  useCreateSplitterMutation,
  useDeleteSplitterMutation,
  useUpdateSplitterMutation,
} from '@/apiRTK/splittingApi'

const useManageSplitter = (group) => {
  const [
    createSplitter,
    { isLoading: isSplitterCreating },
  ] = useCreateSplitterMutation()

  const [
    updateSplitter,
    { isLoading: isSplitterUpdating },
  ] = useUpdateSplitterMutation()

  const [
    deleteSplitter,
    { isLoading: isSplitterDeleting },
  ] = useDeleteSplitterMutation()

  const isLoading = isSplitterCreating || isSplitterUpdating || isSplitterDeleting

  const manageSplitter = useCallback(async (splitter) => {
    const existingSplitter = group.splitters.find((s) => !s.documentTypeId)

    if (!splitter && !existingSplitter) {
      return
    }

    if (!splitter && existingSplitter) {
      await deleteSplitter(existingSplitter.id).unwrap()

      return
    }

    const { splittingMode, ...rest } = splitter

    if (existingSplitter) {
      await updateSplitter({
        id: existingSplitter.id,
        ...rest,
      }).unwrap()

      return
    }

    await createSplitter({
      groupId: group.id,
      mode: splittingMode,
      ...rest,
    }).unwrap()
  }, [
    createSplitter,
    deleteSplitter,
    group.id,
    group.splitters,
    updateSplitter,
  ])

  return {
    manageSplitter,
    isLoading,
  }
}

export { useManageSplitter }
