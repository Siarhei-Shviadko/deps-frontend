
import { renderHook } from '@testing-library/react-hooks/dom'
import { PdfSegmentsProvider } from '@/containers/PdfSplitting/providers'
import { usePdfSegments } from './usePdfSegments'

test('retrieves the context value provided by PdfSegmentsContext', () => {
  const wrapper = ({ children }) => (
    <PdfSegmentsProvider>
      {children}
    </PdfSegmentsProvider>
  )

  const { result } = renderHook(() => usePdfSegments(), { wrapper })

  expect(result.current).toEqual({
    initialSegment: null,
    setInitialSegment: expect.any(Function),
    segments: [],
    setSegments: expect.any(Function),
    activeUserPage: null,
    setActiveUserPage: expect.any(Function),
    isDraggable: false,
    setIsDraggable: expect.any(Function),
    batchName: undefined,
    setBatchName: expect.any(Function),
    updateActiveUserPage: expect.any(Function),
    selectedGroup: null,
    setSelectedGroup: expect.any(Function),
    allowAreaSelection: false,
  })
})
