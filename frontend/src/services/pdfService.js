import jsPDF from "jspdf";

// Roboto fontu Türkçe karakterleri (ş, ğ, ı, İ, ö, ü, ç) destekler.
// jsPDF'in varsayılan Helvetica fontu desteklemediği için fontu gömüyoruz.
const FONT_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf";
const FONT_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Bold.ttf";

// ArrayBuffer'ı base64'e çevir (jsPDF addFileToVFS base64 bekliyor)
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function loadFont(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

let fontsLoaded = false;

async function ensureFonts(doc) {
  const regular = await loadFont(FONT_URL);
  const bold = await loadFont(FONT_BOLD_URL);

  doc.addFileToVFS("Roboto-Regular.ttf", regular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

  doc.addFileToVFS("Roboto-Bold.ttf", bold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
}

export async function generateTripPdf(trip, days, exchangeRate) {
  const doc = new jsPDF();

  await ensureFonts(doc);
  doc.setFont("Roboto", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const maxWidth = pageWidth - marginLeft * 2;
  let y = 20;

  // Marka rengi (brand-700 ~ #0e7490 → RGB)
  const brand = [14, 116, 144];
  const inkDark = [30, 41, 59];
  const inkMid = [100, 116, 139];

  function formatCost(amount) {
    const base = `${amount} ${trip.currency}`;
    if (
      !exchangeRate ||
      !trip.destination_currency ||
      trip.destination_currency === trip.currency
    ) {
      return base;
    }
    const converted = (amount * exchangeRate).toFixed(0);
    return `${base} (~${converted} ${trip.destination_currency})`;
  }

  function addPageIfNeeded(neededSpace = 10) {
    if (y + neededSpace > 275) {
      doc.addPage();
      y = 20;
    }
  }

  // --- Başlık şeridi ---
  doc.setFillColor(brand[0], brand[1], brand[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFontSize(18);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(trip.destination, marginLeft, 15);

  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");
  doc.text(
  `${trip.duration_days} gün  ·  ${trip.people_count} kişi  ·  ${formatCost(trip.budget)}`,
  marginLeft,
  22
);

  y = 40;

  days.forEach((day) => {
    addPageIfNeeded(20);

    // --- Gün başlığı şeridi ---
    doc.setFillColor(236, 254, 255); // brand-50 açık ton
    doc.rect(marginLeft - 3, y - 5, maxWidth + 6, 9, "F");

    doc.setFontSize(12);
    doc.setFont("Roboto", "bold");
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text(`${day.day_number}. Gün`, marginLeft, y);

    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    doc.setTextColor(inkMid[0], inkMid[1], inkMid[2]);
    doc.text(day.date, marginLeft + 28, y);
    y += 8;

    if (day.summary) {
      doc.setFontSize(9);
      doc.setFont("Roboto", "normal");
      doc.setTextColor(inkMid[0], inkMid[1], inkMid[2]);
      const summaryLines = doc.splitTextToSize(day.summary, maxWidth);
      doc.text(summaryLines, marginLeft, y);
      y += summaryLines.length * 4.5 + 4;
    }

    day.trip_activities.forEach((activity) => {
      addPageIfNeeded(22);

      // Saat (marka renginde, kalın)
      doc.setFontSize(9);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(brand[0], brand[1], brand[2]);
      doc.text(activity.time_slot || "", marginLeft, y);

      // Başlık (koyu, kalın)
      doc.setFontSize(10);
      doc.setFont("Roboto", "bold");
      doc.setTextColor(inkDark[0], inkDark[1], inkDark[2]);
      const titleLines = doc.splitTextToSize(activity.title, maxWidth - 28);
      doc.text(titleLines, marginLeft + 28, y);
      y += Math.max(titleLines.length * 5, 5);

      // Açıklama (gri, normal)
      if (activity.description) {
        doc.setFontSize(9);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(inkMid[0], inkMid[1], inkMid[2]);
        const descLines = doc.splitTextToSize(
          activity.description,
          maxWidth - 28,
        );
        doc.text(descLines, marginLeft + 28, y);
        y += descLines.length * 4.3 + 1;
      }

      // Maliyet (küçük, marka renginde)
      if (activity.estimated_cost != null) {
        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(brand[0], brand[1], brand[2]);
        doc.text(
          `~ ${formatCost(activity.estimated_cost)}`,
          marginLeft + 28,
          y,
        );
        y += 5;
      }

      y += 4;
    });

    // Günler arası ince ayırıcı çizgi
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, marginLeft + maxWidth, y);
    y += 8;
  });

  // --- Alt bilgi (her sayfaya) ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("Roboto", "normal");
    doc.setTextColor(inkMid[0], inkMid[1], inkMid[2]);
    doc.text(
      "TravelMind AI ile oluşturuldu",
      marginLeft,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      pageWidth - marginLeft,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" },
    );
  }

  doc.save(`${trip.destination.replace(/[^a-zA-Z0-9]/g, "-")}-plani.pdf`);
}
