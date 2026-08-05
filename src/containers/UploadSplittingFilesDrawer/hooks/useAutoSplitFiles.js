
import { useCallback, useState } from 'react'
import { useSplitFileMutation } from '@/apiRTK/filesApi'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { notifySuccess, notifyWarning } from '@/utils/notification'

const BULK_REQUESTS_LIMIT = 3

export const useAutoSplitFiles = () => {
  const [completedRequests, setCompletedRequests] = useState(0)

  const [splitFile] = useSplitFileMutation()

  const resetRequestsCounter = useCallback(() => {
    setCompletedRequests(0)
  }, [])

  const splitSingleFile = useCallback(async (fileData) => {
    await splitFile(fileData).unwrap()
    setCompletedRequests((prev) => prev + 1)
  }, [splitFile])

  const autoSplitFiles = useCallback(async (files) => {
    try {
      const promiseCallbacks = files.reduce((acc, fileData, index) => {
        const chunkIndex = Math.floor(index / BULK_REQUESTS_LIMIT)
        if (!acc[chunkIndex]) {
          acc[chunkIndex] = []
        }
        acc[chunkIndex].push(() => splitSingleFile(fileData))
        return acc
      }, [])

      for await (const chunk of promiseCallbacks) {
        await Promise.all(chunk.map((fn) => fn()))
      }

      notifySuccess(localize(Localization.AUTO_SPLITTING_STARTED))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [splitSingleFile])

  return {
    autoSplitFiles,
    completedRequests,
    resetRequestsCounter,
  }
}
