export const mapSplittedFileDataToDto = ({
  documentTypeId,
  engine,
  llmType,
  parsingFeatures,
  labels,
  groupId,
  needsSplittingProposalReview,
}) => ({
  documentTypeId: documentTypeId ?? null,
  classificationEnabled: true,
  engine: engine ?? null,
  language: null,
  llmType: llmType ?? null,
  parsingFeatures: parsingFeatures?.length ? parsingFeatures : null,
  needsUnifier: true,
  needsExtraction: true,
  assignedToMe: true,
  labels: labels?.length ? labels.map((label) => label.name) : null,
  groupId: groupId ?? null,
  needsSplittingProposalReview,
})

export const mapSplitFileDataToDto = ({
  file,
  ...rest
}) => {
  const dto = new FormData()
  dto.append('file', file)

  const mappedRestValues = mapSplittedFileDataToDto(rest)

  Object.entries(mappedRestValues).forEach(([key, value]) => {
    if (value == null) {
      return
    }

    const valueToAppend = (
      Array.isArray(value)
        ? JSON.stringify(value)
        : value
    )

    dto.append(key, valueToAppend)
  })

  return dto
}

export const mapFileDataToDto = (formData) => {
  const dto = new FormData()
  const {
    labels,
    group,
    assignedToMe,
    needsExtraction,
    llmType,
    parsingFeatures,
    ...rest
  } = formData

  Object.entries(rest).forEach(([key, value]) => {
    dto.append(key, value)
  })

  dto.append('needsExtraction', needsExtraction ?? false)
  dto.append('assignedToMe', assignedToMe ?? true)
  dto.append('needsUnifier', true)
  dto.append('labels', JSON.stringify(labels.map((label) => label.name)))
  dto.append('parsingFeatures', JSON.stringify(parsingFeatures))
  dto.append('groupId', group?.id ?? null)
  dto.append('llmType', llmType ?? null)

  return dto
}
