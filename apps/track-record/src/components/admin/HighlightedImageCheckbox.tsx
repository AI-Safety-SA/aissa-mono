'use client'

import { useField, useFormFields, useForm } from '@payloadcms/ui'
import { useCallback } from 'react'
import type { CheckboxFieldClientComponent } from 'payload'

/**
 * Custom checkbox component for isHighlighted field in image galleries.
 * Ensures only one image can be highlighted at a time by automatically
 * unchecking other images when one is checked.
 */
export const HighlightedImageCheckbox: CheckboxFieldClientComponent = ({
  path,
  field,
}) => {
  const { value, setValue } = useField<boolean>({ path })
  const { dispatchFields } = useForm()

  // Get the parent array path (e.g., "images" from "images.0.isHighlighted")
  const pathParts = path.split('.')
  const arrayPath = pathParts.slice(0, -2).join('.')
  const currentIndex = parseInt(pathParts[pathParts.length - 2] || '0', 10)

  // Get sibling field paths
  const siblingPaths = useFormFields(([fields]) => {
    const arrayField = fields[arrayPath]
    const images = (arrayField?.value as Array<unknown> | undefined) || []
    const paths: string[] = []
    
    if (Array.isArray(images)) {
      images.forEach((_, index) => {
        if (index !== currentIndex) {
          paths.push(`${arrayPath}.${index}.isHighlighted`)
        }
      })
    }
    
    return paths
  })

  const handleChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        // First, uncheck all sibling images using dispatchFields
        siblingPaths.forEach((siblingPath) => {
          dispatchFields({
            type: 'UPDATE',
            path: siblingPath,
            value: false,
          })
        })
        
        // Then set this one to true
        setValue(true)
      } else {
        setValue(false)
      }
    },
    [setValue, siblingPaths, dispatchFields],
  )

  // Get label text (handle both string and i18n object)
  const labelText =
    typeof field.label === 'string'
      ? field.label
      : field.label?.en || 'Highlighted'

  // Get description text (handle both string and i18n object)
  const descriptionText =
    field.admin?.description &&
    (typeof field.admin.description === 'string'
      ? field.admin.description
      : field.admin.description?.en || '')

  // Use the default checkbox but with our custom onChange handler
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => handleChange(e.target.checked)}
        />
        <span>{labelText}</span>
      </label>
      {descriptionText && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {descriptionText}
        </div>
      )}
    </div>
  )
}
