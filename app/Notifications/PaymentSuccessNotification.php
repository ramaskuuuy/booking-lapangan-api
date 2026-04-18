<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Payment $payment) {}

    /**
     * Channel pengiriman notifikasi
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Kirim via Email
     */
    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->payment->booking;

        return (new MailMessage)
            ->subject('Pembayaran Berhasil - ' . $this->payment->generateInvoice())
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Pembayaran Anda telah berhasil diproses.')
            ->line('Detail Booking:')
            ->line('Court   : ' . $booking->court->name)
            ->line('Tanggal : ' . $booking->date->format('d M Y'))
            ->line('Waktu   : ' . $booking->start_time . ' - ' . $booking->end_time)
            ->line('Total   : Rp ' . number_format($this->payment->amount, 0, ',', '.'))
            ->action('Lihat Detail Booking', url('/bookings/' . $booking->id))
            ->line('Terima kasih telah menggunakan layanan kami!');
    }

    /**
     * Simpan ke database notifications
     */
    public function toDatabase(object $notifiable): array
    {
        $booking = $this->payment->booking;

        return [
            'type'       => 'payment_success',
            'message'    => 'Pembayaran berhasil untuk booking court ' . $booking->court->name,
            'booking_id' => $booking->id,
            'payment_id' => $this->payment->id,
            'amount'     => $this->payment->amount,
            'invoice'    => $this->payment->generateInvoice(),
        ];
    }

    /**
     * Kirim via WhatsApp (custom channel)
     * Implementasikan WhatsAppChannel sesuai provider yang digunakan (Fonnte, Twilio, dll)
     */
    public function sendWhatsApp(object $notifiable): void
    {
        // Contoh implementasi dengan HTTP request ke API WhatsApp
        // $message = "Pembayaran berhasil! Invoice: " . $this->payment->generateInvoice();
        // WhatsAppService::send($notifiable->phone, $message);
    }
}
