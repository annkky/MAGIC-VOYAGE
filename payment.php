<?php
/**
 * MAGIC VOYAGE — Обработчик платежа через OCTO Pay
 * Одностадийная оплата (auto_capture = true)
 *
 * Документация: https://help.octo.uz/payment-via-web/one-stage.html
 */

// ===== КОНФИГУРАЦИЯ (из файла вне public_html) =====
$config_path = dirname(__DIR__) . '/config.php'; // /home/username/config.php
if (!file_exists($config_path)) {
    http_response_code(500);
    exit('Ошибка конфигурации сервера.');
}
require_once $config_path;

define('OCTO_API_URL', 'https://secure.octo.uz/prepare_payment');

// ===== ВХОДНЫЕ ДАННЫЕ =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: payment.html');
    exit;
}

// Санитизация и валидация
$description  = trim(htmlspecialchars($_POST['description']  ?? '', ENT_QUOTES, 'UTF-8'));
$amount_raw   = $_POST['amount']      ?? '';
$currency     = 'UZS';
$client_name  = trim(htmlspecialchars($_POST['client_name']  ?? '', ENT_QUOTES, 'UTF-8'));
$client_phone = trim(preg_replace('/[^\d+\s\-()]/', '', $_POST['client_phone'] ?? ''));

// Валидация суммы
$amount = filter_var($amount_raw, FILTER_VALIDATE_INT);
if ($amount === false || $amount <= 0) {
    redirect_with_error('Некорректная сумма платежа.');
}

// Обязательные поля
if (empty($description) || mb_strlen($description) < 3) {
    redirect_with_error('Укажите назначение платежа.');
}
if (empty($client_name) || mb_strlen($client_name) < 2) {
    redirect_with_error('Укажите ваше имя.');
}
if (empty($client_phone) || !preg_match('/^\+?[\d\s\-()]{7,20}$/', $client_phone)) {
    redirect_with_error('Укажите корректный номер телефона.');
}

// ===== УНИКАЛЬНЫЙ ID ТРАНЗАКЦИИ =====
$shop_transaction_id = 'MV-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(5)));

// ===== ТЕЛО ЗАПРОСА К OCTO API =====
$payload = [
    'octo_shop_id'        => OCTO_SHOP_ID,
    'octo_secret'         => OCTO_SECRET,
    'shop_transaction_id' => $shop_transaction_id,
    'init_time'           => date('Y-m-d H:i:s'),
    'description'         => $description . ' — ' . $client_name . ' ' . $client_phone,
    'total_sum'           => (int) $amount,
    'currency'            => $currency,
    'auto_capture'        => true,   // одностадийная оплата — списание сразу
    'return_url'          => RETURN_URL,
    'notify_url'          => NOTIFY_URL,
    'language'            => 'ru',
    'ttl'                 => 15,     // форма оплаты действительна 15 минут
];

// Добавляем test-флаг только в тестовом режиме
if (TEST_MODE) {
    $payload['test'] = true;
}

// ===== ЗАПРОС К OCTO API =====
$response = octo_request($payload);

if ($response === null) {
    redirect_with_error('Ошибка соединения с платёжным сервисом. Попробуйте позже.');
}

// Проверяем ответ
if (isset($response['error']) && $response['error'] !== 0) {
    $msg = $response['errMessage'] ?? 'Неизвестная ошибка OCTO Pay.';
    redirect_with_error('Ошибка платёжной системы: ' . htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'));
}

$pay_url = $response['data']['octo_pay_url'] ?? null;
if (empty($pay_url)) {
    redirect_with_error('Не удалось получить ссылку для оплаты.');
}

// ===== РЕДИРЕКТ НА СТРАНИЦУ ОПЛАТЫ OCTO =====
header('Location: ' . $pay_url);
exit;


// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

/**
 * Отправляет POST-запрос к OCTO API и возвращает массив с ответом.
 * При ошибке возвращает null.
 */
function octo_request(array $payload): ?array
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);

    $ch = curl_init(OCTO_API_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $json,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Content-Length: ' . strlen($json),
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $body  = curl_exec($ch);
    $errno = curl_errno($ch);
    curl_close($ch);

    if ($errno || $body === false) {
        return null;
    }

    return json_decode($body, true);
}

/**
 * Перенаправляет пользователя на страницу ошибки с сообщением.
 */
function redirect_with_error(string $message): never
{
    $msg = urlencode($message);
    header('Location: payment-fail.html?msg=' . $msg);
    exit;
}
