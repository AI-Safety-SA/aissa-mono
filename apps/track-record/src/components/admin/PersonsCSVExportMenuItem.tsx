'use client'

import { Button } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export const PersonsCSVExportMenuItem = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Close dropdown when clicking outside
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
    <div style={{ position: 'relative', display: 'inline-block' }} data-export-dropdown="container">
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
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '200px',
            padding: '8px 0',
          }}
        >
          <a
            href={`${baseURL}?filter=all`}
            style={{
              display: 'block',
              padding: '8px 16px',
              textDecoration: 'none',
              color: '#333',
              cursor: 'pointer',
            }}
            download={`persons-export-all-${fileDate}.csv`}
          >
            Export All
          </a>
          <a
            href={`${baseURL}?filter=published`}
            style={{
              display: 'block',
              padding: '8px 16px',
              textDecoration: 'none',
              color: '#333',
              cursor: 'pointer',
            }}
            download={`persons-export-published-${fileDate}.csv`}
          >
            Export Published Only
          </a>
          <a
            href={`${baseURL}?filter=unpublished`}
            style={{
              display: 'block',
              padding: '8px 16px',
              textDecoration: 'none',
              color: '#333',
              cursor: 'pointer',
            }}
            download={`persons-export-unpublished-${fileDate}.csv`}
          >
            Export Unpublished Only
          </a>
        </div>
      )}
    </div>
  )
}
