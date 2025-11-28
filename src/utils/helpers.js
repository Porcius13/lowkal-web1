// Tarih formatlama yardımcıları
export const formatDate = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "";
  }
};

export const formatTime = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

