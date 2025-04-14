import * as XLSX from "sheetjs-style";
import { saveAs } from "file-saver";

const monthNames = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
};

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${monthNames[month]} ${year}`;
};

export const downloadExcel = (data) => {
  if (!Array.isArray(data) || data.length === 0) return;

  const exportData = data.map(entry => ({
    "Kava Winner": entry.winner,
    "Date": formatDate(entry.date),
    "Position": entry.position,
    "Team Name": entry.team
  }));

  // Count how many times each person has won
  const winnerCount = {};
  data.forEach(entry => {
    winnerCount[entry.winner] = (winnerCount[entry.winner] || 0) + 1;
  });

  // Determine the highest count and all winners who match it
  const maxCount = Math.max(...Object.values(winnerCount));
  const topWinners = Object.entries(winnerCount)
    .filter(([_, count]) => count === maxCount)
    .map(([name]) => name);

  const trophyMessage = `🏆 Best Kava Winner${topWinners.length > 1 ? 's' : ''}: ${topWinners.join(", ")} (${maxCount} wins)`;

  // Add a blank row then the trophy row
  exportData.push({}, { "Kava Winner": trophyMessage });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const headers = Object.keys(exportData[0]).filter(Boolean);

  // Style headers
  headers.forEach((header, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
    worksheet[cellRef].s = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "D9E1F2" } },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } }
      }
    };
  });

  // Style data cells
  for (let r = 1; r < exportData.length + 1; r++) {
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } }
          }
        };
      }
    }
  }

  // Center the final "Best Kava Winner" row across all columns and add gold styling
  const finalRow = exportData.length + 1;
  const mergeRange = {
    s: { r: finalRow - 1, c: 0 },
    e: { r: finalRow - 1, c: headers.length - 1 }
  };
  worksheet["!merges"] = worksheet["!merges"] || [];
  worksheet["!merges"].push(mergeRange);

  const trophyCellRef = XLSX.utils.encode_cell({ r: finalRow - 1, c: 0 });
  worksheet[trophyCellRef].s = {
    font: { bold: true, color: { rgb: "FFD700" }, sz: 12 }, // gold font color
    alignment: { horizontal: "center", vertical: "center" }
  };

  const dataOnly = exportData.slice(0, data.length); 

  worksheet["!cols"] = headers.map(key => ({
    wch: Math.max(
      key.length,
      ...dataOnly.map(row => (row[key] ? row[key].toString().length : 10))
    ) + 4
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "WCC_Awards");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream"
  });

  const year = new Date().getFullYear();
  saveAs(blob, `WCC_${year}.xlsx`);
};
