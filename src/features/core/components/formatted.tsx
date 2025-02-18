// Untuk Convert Tanggal
export const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
};

// Untuk Convert Tanggal/Bulan/Tahun
export const formatDateMonthYear = (dateString: string | Date) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Untuk convert bulan dan tahun
export const formatMonthYear = (dateString: string | Date) => {
  const date = new Date(dateString);
  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
};

// Untuk Convert Angka
export function formatNumber(number : number) {
    if (number < 1000) {
      return number;
    } else if (number >= 1000 && number < 1000000) {
      return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      return (number / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    }
}