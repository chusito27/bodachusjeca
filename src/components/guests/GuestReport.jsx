import { useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { GUEST_GROUPS, RSVP_STATUS } from '../../utils/constants'
import Button from '../ui/Button'
import { IoDownloadOutline } from 'react-icons/io5'

const GOLD = '#C06B84'
const DARK = '#333333'
const LIGHT_BG = '#F9F9F6'
const BORDER = '#E0E0E0'

const groupLabel = (value) => GUEST_GROUPS.find(g => g.value === value)?.label || value
const rsvpLabel = (value) => RSVP_STATUS.find(r => r.value === value)?.label || value

export default function GuestReport({ guests, stats, onClose, weddingName, weddingDate }) {
  const reportRef = useRef()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `invitados-${(weddingName || 'boda').toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }
      await html2pdf().set(opt).from(reportRef.current).save()
    } finally {
      setExporting(false)
    }
  }

  const sortedGuests = [...guests].sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group)
    return (a.name || '').localeCompare(b.name || '')
  })

  const groupBreakdown = GUEST_GROUPS.map(g => {
    const inGroup = guests.filter(guest => guest.group === g.value)
    return {
      label: g.label,
      total: inGroup.length,
      confirmed: inGroup.filter(x => x.rsvpStatus === 'confirmado').length,
      pending: inGroup.filter(x => x.rsvpStatus === 'pendiente').length,
      declined: inGroup.filter(x => x.rsvpStatus === 'declinado').length
    }
  }).filter(g => g.total > 0)

  const guestsWithRestrictions = guests.filter(g => g.dietaryRestrictions?.trim())

  const confirmationRate = stats.total > 0
    ? ((stats.confirmed / stats.total) * 100).toFixed(1)
    : '0.0'

  const thStyle = {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: `2px solid ${GOLD}`,
    fontSize: '11px',
    fontWeight: '600',
    color: DARK,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  const tdStyle = {
    padding: '6px 12px',
    borderBottom: `1px solid ${BORDER}`,
    fontSize: '11px',
    color: DARK,
    pageBreakInside: 'avoid'
  }

  const statBoxStyle = (accent = false) => ({
    padding: '12px 16px',
    backgroundColor: accent ? GOLD : '#FFFFFF',
    border: `1px solid ${accent ? GOLD : BORDER}`,
    borderRadius: '8px',
    textAlign: 'center'
  })

  return (
    <div>
      {/* Action buttons - outside reportRef so they don't appear in PDF */}
      <div className="flex gap-3 justify-end mb-4">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        <Button onClick={handleExport} disabled={exporting}>
          <IoDownloadOutline className="mr-1" />
          {exporting ? 'Generando...' : 'Exportar PDF'}
        </Button>
      </div>

      {/* Printable report */}
      <div ref={reportRef} style={{ backgroundColor: '#FFFFFF', color: DARK, fontFamily: 'Arial, Helvetica, sans-serif', padding: '24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: `3px solid ${GOLD}`, paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: GOLD, margin: '0 0 4px 0' }}>
            {weddingName || 'Boda'}
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 2px 0' }}>
            {weddingDate ? new Date(weddingDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </p>
          <p style={{ fontSize: '11px', color: '#999', margin: '0' }}>
            Reporte generado el {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Summary */}
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: DARK, marginBottom: '12px', borderLeft: `4px solid ${GOLD}`, paddingLeft: '8px' }}>
          Resumen General
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={statBoxStyle()}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: GOLD }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Total Invitados</div>
          </div>
          <div style={statBoxStyle()}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#22C55E' }}>{stats.confirmed}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Confirmados</div>
          </div>
          <div style={statBoxStyle()}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{stats.pending}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Pendientes</div>
          </div>
          <div style={statBoxStyle()}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>{stats.declined}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Declinados</div>
          </div>
          <div style={statBoxStyle()}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: GOLD }}>{stats.plusOnes}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Acompañantes (+1)</div>
          </div>
          <div style={statBoxStyle()}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: GOLD }}>{stats.totalChildren}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Hijos</div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '24px' }}>
          Tasa de confirmación: <strong style={{ color: GOLD }}>{confirmationRate}%</strong>
        </p>

        {/* Group Breakdown */}
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: DARK, marginBottom: '12px', borderLeft: `4px solid ${GOLD}`, paddingLeft: '8px' }}>
          Desglose por Grupo
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Grupo</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Confirmados</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Pendientes</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Declinados</th>
            </tr>
          </thead>
          <tbody>
            {groupBreakdown.map((g, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : LIGHT_BG }}>
                <td style={tdStyle}><strong>{g.label}</strong></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{g.total}</td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#22C55E' }}>{g.confirmed}</td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#F59E0B' }}>{g.pending}</td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#EF4444' }}>{g.declined}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Full Guest List */}
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: DARK, marginBottom: '12px', borderLeft: `4px solid ${GOLD}`, paddingLeft: '8px' }}>
          Lista Completa de Invitados
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '30px' }}>#</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Grupo</th>
              <th style={thStyle}>RSVP</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Teléfono</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>+1</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Hijos</th>
              <th style={thStyle}>Restricciones</th>
              <th style={thStyle}>Notas</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.map((guest, i) => (
              <tr key={guest.id} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : LIGHT_BG, pageBreakInside: 'avoid' }}>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>{i + 1}</td>
                <td style={{ ...tdStyle, fontWeight: '500' }}>{guest.name || '—'}</td>
                <td style={tdStyle}>{groupLabel(guest.group)}</td>
                <td style={{
                  ...tdStyle,
                  fontWeight: '500',
                  color: guest.rsvpStatus === 'confirmado' ? '#22C55E'
                    : guest.rsvpStatus === 'declinado' ? '#EF4444'
                    : '#F59E0B'
                }}>
                  {rsvpLabel(guest.rsvpStatus)}
                </td>
                <td style={{ ...tdStyle, fontSize: '10px' }}>{guest.email || '—'}</td>
                <td style={tdStyle}>{guest.phone || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {guest.plusOne ? (guest.plusOneName || 'Sí') : 'No'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {guest.children?.length > 0
                    ? guest.children.map(c => c.name).join(', ')
                    : '—'}
                </td>
                <td style={{ ...tdStyle, fontSize: '10px' }}>{guest.dietaryRestrictions || '—'}</td>
                <td style={{ ...tdStyle, fontSize: '10px' }}>{guest.notes || '—'}</td>
              </tr>
            ))}
            {sortedGuests.length === 0 && (
              <tr>
                <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', color: '#999', padding: '24px' }}>
                  No hay invitados registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Dietary Restrictions */}
        {guestsWithRestrictions.length > 0 && (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: DARK, marginBottom: '12px', borderLeft: `4px solid ${GOLD}`, paddingLeft: '8px' }}>
              Restricciones Alimentarias
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Invitado</th>
                  <th style={thStyle}>Grupo</th>
                  <th style={thStyle}>Restricción</th>
                </tr>
              </thead>
              <tbody>
                {guestsWithRestrictions.map((guest, i) => (
                  <tr key={guest.id} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : LIGHT_BG, pageBreakInside: 'avoid' }}>
                    <td style={{ ...tdStyle, fontWeight: '500' }}>{guest.name}</td>
                    <td style={tdStyle}>{groupLabel(guest.group)}</td>
                    <td style={tdStyle}>{guest.dietaryRestrictions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
