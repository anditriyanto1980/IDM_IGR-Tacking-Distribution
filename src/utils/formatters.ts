export const formatNumber = (num: number): string => {
  return (num || 0).toLocaleString('id-ID');
};

export const formatPercent = (pct: number, decimals: number = 1): string => {
  if (isNaN(pct)) return '0%';
  return `${pct.toFixed(decimals)}%`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
  } catch {
    return dateStr;
  }
};
