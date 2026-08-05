
import PropTypes from 'prop-types'
import {
  useMemo,
  useState,
  createContext,
  useCallback,
} from 'react'
import { pdfSegmentShape } from '@/containers/PdfSplitting/models'

export const PdfSegmentsContext = createContext(null)

export const PdfSegmentsProvider = ({
  children,
  onChange,
  defaultSegments,
  defaultBatchName,
  allowAreaSelection,
}) => {
  const [segments, setSegments] = useState(defaultSegments ?? [])
  const [initialSegment, setInitialSegment] = useState(null)
  const [activeUserPage, setActiveUserPage] = useState(null)
  const [isDraggable, setIsDraggable] = useState(false)
  const [batchName, setBatchName] = useState(defaultBatchName)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const updateActiveUserPage = useCallback((userPages) => {
    const changedUserPage = userPages.find((uP) => uP.id === activeUserPage.id)

    setActiveUserPage(changedUserPage)
  }, [activeUserPage])

  const onSegmentsChange = useCallback((segments) => {
    setSegments(segments)
    onChange?.(segments)
  }, [onChange])

  const handleGroupChange = useCallback((group) => {
    setSelectedGroup(group)

    if (group) {
      const updatedSegments = segments.map((segment) => {
        const isInGroup = group.documentTypeIds?.includes(segment.documentTypeId)

        return isInGroup ? segment : {
          ...segment,
          documentTypeId: null,
        }
      })

      onSegmentsChange(updatedSegments)
    }
  }, [segments, onSegmentsChange])

  const value = useMemo(
    () => ({
      initialSegment,
      setInitialSegment,
      segments,
      setSegments: onSegmentsChange,
      activeUserPage,
      setActiveUserPage,
      updateActiveUserPage,
      isDraggable,
      setIsDraggable,
      batchName,
      setBatchName,
      selectedGroup,
      setSelectedGroup: handleGroupChange,
      allowAreaSelection: allowAreaSelection ?? false,
    }),
    [
      activeUserPage,
      allowAreaSelection,
      initialSegment,
      segments,
      isDraggable,
      onSegmentsChange,
      batchName,
      updateActiveUserPage,
      selectedGroup,
      handleGroupChange,
    ],
  )

  return (
    <PdfSegmentsContext.Provider value={value}>
      {children}
    </PdfSegmentsContext.Provider>
  )
}

PdfSegmentsProvider.propTypes = {
  allowAreaSelection: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  defaultSegments: PropTypes.arrayOf(pdfSegmentShape),
  defaultBatchName: PropTypes.string,
}
