import https from 'https';

// Your WhatsApp credentials
const PHONE_NUMBER_ID = '662784953591224';
const ACCESS_TOKEN = 'EAAUKJLQZCEecBO2ZCH9AZBTjHlatRZC8ZAaek148n4wHMY83AgABJwZCIZA0MQZAhZAZBd399Rb45VqINnlYZCRTv3ZBqUsAiwbOpZCHHqD4sauZCDXTHLpijT8OZBrVVXiKrwS4HC3KSxm19Td2PZCVRWu5Heb7QK50XoHZBuMERZCYGzlGSUjDKYueglEQlIWwy6MGE82WlT4QZDZD';

// Function to send a test message
function sendTestMessage(toPhoneNumber) {
  return new Promise((resolve, reject) => {
    const messageData = {
      messaging_product: 'whatsapp',
      to: toPhoneNumber,
      type: 'text',
      text: { 
        body: "🧪 Test message from Hoarder WhatsApp Bot!\n\nThis is a test to verify that your WhatsApp number is properly registered and can send messages.\n\nIf you receive this, your setup is working correctly! 🎉" 
      }
    };

    const options = {
      hostname: 'graph.facebook.com',
      path: `/v23.0/${PHONE_NUMBER_ID}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(messageData));
    req.end();
  });
}

// Function to check phone number status
function checkPhoneNumberStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: `/v23.0/${PHONE_NUMBER_ID}?fields=status,verified_name,name_status`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Main test function
async function testWhatsAppSetup() {
  console.log('🧪 Testing WhatsApp setup...\n');

  // Step 1: Check phone number status
  console.log('📱 Checking phone number status...');
  try {
    const statusResponse = await checkPhoneNumberStatus();
    if (statusResponse.status === 200) {
      console.log('✅ Phone number status:', statusResponse.data);
      
      if (statusResponse.data.status === 'CONNECTED') {
        console.log('✅ Phone number is CONNECTED and ready to send messages!');
      } else {
        console.log(`⚠️  Phone number status: ${statusResponse.data.status}`);
        console.log('You may need to complete the registration process first.');
      }
    } else {
      console.log('❌ Failed to get phone number status:', statusResponse.data);
    }
  } catch (error) {
    console.error('❌ Error checking phone number status:', error);
  }

  console.log('\n📝 To test sending a message, run:');
  console.log('node test-whatsapp-message.js <phone_number>');
  console.log('Example: node test-whatsapp-message.js +1234567890');
}

// If a phone number is provided as argument, send a test message
if (process.argv.length > 2) {
  const phoneNumber = process.argv[2];
  console.log(`📤 Sending test message to ${phoneNumber}...`);
  
  sendTestMessage(phoneNumber)
    .then(response => {
      if (response.status === 200) {
        console.log('✅ Test message sent successfully!');
        console.log('Response:', response.data);
      } else {
        console.log('❌ Failed to send test message:', response.data);
      }
    })
    .catch(error => {
      console.error('❌ Error sending test message:', error);
    });
} else {
  // Just check status
  testWhatsAppSetup().catch(console.error);
} 