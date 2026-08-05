
import { useCallback, useState } from 'react'
import { useUploadFileMutation } from '@/apiRTK/batchesApi'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { notifyWarning } from '@/utils/notification'

const BULK_REQUESTS_LIMIT = 3

export const useUploadSplittingFiles = () => {
  const [completedRequests, setCompletedRequests] = useState(0)

  const [uploadFileToStorage] = useUploadFileMutation()

  const resetRequestsCounter = useCallback(() => {
    setCompletedRequests(0)
  }, [])

  const uploadFile = useCallback(async ({ file, documentTypeId }) => {
    const { path } = await uploadFileToStorage(file).unwrap()

    setCompletedRequests((prev) => prev + 1)

    return {
      path,
      name: file.name,
      documentTypeId,
    }
  }, [uploadFileToStorage])

  const uploadSplittingFiles = useCallback(async (files) => {
    try {
      const promiseToUploadCallbacks = files.reduce((acc, file, index) => {
        const chunkIndex = Math.floor(index / BULK_REQUESTS_LIMIT)
        if (!acc[chunkIndex]) {
          acc[chunkIndex] = []
        }
        acc[chunkIndex].push(() => uploadFile(file))
        return acc
      }, [])

      const uploadedData = []

      for await (const uploadChunk of promiseToUploadCallbacks) {
        const filesWithPaths = await Promise.all(uploadChunk.map((upload) => upload()))
        uploadedData.push(...filesWithPaths)
      }

      return uploadedData
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [uploadFile])

  return {
    uploadSplittingFiles,
    completedRequests,
    resetRequestsCounter,
  }
}
