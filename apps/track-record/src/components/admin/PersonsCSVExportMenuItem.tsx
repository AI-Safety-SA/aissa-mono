'use client'

import { Button } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { EXPORT_FILTERS } from '@/collections/persons/csvExport'

import styles from './PersonsCSVExportMenuItem.module.scss'

const EXPORT_OPTIONS = EXPORT_FILTERS.map((filter) => ({
  filter,
  label:
    filter === 'all'
      ? 'Export All'
      : filter === 'published'
        ? 'Export Published Only'
        : 'Export Unpublished Only',
}))

export const PersonsCSVExportMenuItem = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-export-dropdown="container"]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const fileDate = new Date().toISOString().slice(0, 10)
  const baseURL = '/api/persons/export-csv'

  return (
    <div className={styles.container} data-export-dropdown="container">
      <Button
        buttonStyle="secondary"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        size="small"
      >
        Export CSV
      </Button>

      {isOpen && (
        <div className={styles.dropdown}>
          {EXPORT_OPTIONS.map((option) => (
            <a
              key={option.filter}
              href={`${baseURL}?filter=${option.filter}`}
              className={styles.dropdownLink}
              download={`persons-export-${option.filter}-${fileDate}.csv`}
            >
              {option.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
