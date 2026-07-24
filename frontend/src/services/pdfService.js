import jsPDF from 'jspdf'

export function generateTripPdf(trip, days) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginLeft = 15
  const maxWidth = pageWidth - marginLeft * 2
  let y = 20

  function addPageIfNeeded(neededSpace = 10) {
    if (y + neededSpace > 280) {
      doc.addPage()
      y = 20
    }
  }

  // Başlık
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text(trip.destination, marginLeft, y)
  y += 8

  // Özet bilgi satırı
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(
    `${trip.duration_days} gun - ${trip.people_count} kisi - ${trip.budget} ${trip.currency}`,
    marginLeft,
    y
  )
  y += 12

  days.forEach((day) => {
    addPageIfNeeded(15)

    // Gün başlığı
    doc.setFontSize(13)
    doc.setFont(undefined, 'bold')
    doc.text(`Gun ${day.day_number} - ${day.date}`, marginLeft, y)
    y += 7

    if (day.summary) {
      doc.setFontSize(9)
      doc.setFont(undefined, 'italic')
      const summaryLines = doc.splitTextToSize(day.summary, maxWidth)
      doc.text(summaryLines, marginLeft, y)
      y += summaryLines.length * 5 + 3
    }

    day.trip_activities.forEach((activity) => {
      addPageIfNeeded(20)

      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text(`${activity.time_slot || ''}  ${activity.title}`, marginLeft, y)
      y += 5

      if (activity.description) {
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        const descLines = doc.splitTextToSize(activity.description, maxWidth)
        doc.text(descLines, marginLeft, y)
        y += descLines.length * 4.5
      }

      if (activity.estimated_cost != null) {
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        doc.text(`Tahmini maliyet: ${activity.estimated_cost} ${trip.currency}`, marginLeft, y)
        y += 5
      }

      y += 4
    })

    y += 4
  })

  doc.save(`${trip.destination.replace(/[^a-zA-Z0-9]/g, '-')}-plani.pdf`)
}