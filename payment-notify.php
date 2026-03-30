<?php
/**
 * MAGIC VOYAGE — Webhook-уведомление от OCTO Pay
 * OCTO отправляет POST-запрос на этот файл после завершения платежа.
 * Документация: https://help.octo.uz/payment-via-web/one-stage.html
 */

// Принимаем только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Читаем тело запроса
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    exit;
}

// Извлекаем нужные поля
$status      = $data['status']               ?? 'unknown';
$transaction = $data['shop_transaction_id']  ?? '—';
$amount      = $data['total_sum']            ?? '—';
$name        = $data['user_data']['full_name'] ?? '—';
$phone       = $data['user_data']['phone']     ?? '—';
$description = $data['description']           ?? '—';
$octo_id     = $data['octo_pay_id']           ?? '—';
$paid_time   = $data['pay_time']              ?? date('Y-m-d H:i:s');

// Отправляем письмо только при успешной оплате
if ($status === 'succeeded') {
    $to      = 'magic.voyage74@gmail.com';
    $subject = '=?UTF-8?B?' . base64_encode('Новая оплата — MAGIC VOYAGE') . '?=';

    $body = "Получена новая оплата через OCTO Pay.\n\n"
          . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
          . "Сумма:          {$amount} сум\n"
          . "Назначение:     {$description}\n"
          . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
          . "Клиент:         {$name}\n"
          . "Телефон:        {$phone}\n"
          . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
          . "ID транзакции:  {$transaction}\n"
          . "OCTO Pay ID:    {$octo_id}\n"
          . "Время оплаты:   {$paid_time}\n"
          . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $headers = implode("\r\n", [
        'From: MAGIC VOYAGE <noreply@magicvoyage.uz>',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ]);

    mail($to, $subject, base64_encode($body), $headers);
}

// OCTO ожидает HTTP 200 в ответ
http_response_code(200);
echo json_encode(['status' => 'ok']);
