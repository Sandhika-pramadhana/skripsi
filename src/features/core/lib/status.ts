/* eslint-disable no-unused-vars */
import { TransactionStatus } from "@/types/def";

export function getStatusLabel(statusCode: string): string {
    const labels: { [key in TransactionStatus]: string } = {
      [TransactionStatus.PesananDibuat]: "Pesanan Dibuat",
      [TransactionStatus.PesananTerbayar]: "Pesanan Terbayar",
      [TransactionStatus.KurirDitugaskan]: "Kurir Ditugaskan",
      [TransactionStatus.PickupBerhasil]: "Pickup Berhasil",
      [TransactionStatus.DalamProsesPengiriman]: "Dalam Proses Pengiriman",
      [TransactionStatus.DalamProsesPengantaran]: "Dalam Proses Pengantaran",
      [TransactionStatus.KirimanTiba]: "Kiriman Tiba",
      [TransactionStatus.KurangBayar]: "Kurang Bayar",
      [TransactionStatus.PesananDibatalkan]: "Pesanan Dibatalkan",
      [TransactionStatus.GagalAntar]: "Gagal Antar"
    };
    return labels[statusCode as TransactionStatus] || "Status Tidak Dikenal";
}

export function getStatusClass(statusCode: string): string {
    switch (statusCode) {
      case TransactionStatus.PesananDibatalkan:
      case TransactionStatus.GagalAntar:
        return "bg-red-500";
      case TransactionStatus.KurirDitugaskan:
      case TransactionStatus.PickupBerhasil:
      case TransactionStatus.DalamProsesPengiriman:
      case TransactionStatus.DalamProsesPengantaran:
        return "bg-yellow-500";
      case TransactionStatus.KirimanTiba:
      case TransactionStatus.PesananTerbayar:
        return "bg-green-500";
      default:
        return "badge-primary";
    }
}