import https from 'https';

// Your WhatsApp credentials
const PHONE_NUMBER_ID = '662784953591224';
const ACCESS_TOKEN = 'EAAUKJLQZCEecBO2ZCH9AZBTjHlatRZC8ZAaek148n4wHMY83AgABJwZCIZA0MQZAhZAZBd399Rb45VqINnlYZCRTv3ZBqUsAiwbOpZCHHqD4sauZCDXTHLpijT8OZBrVVXiKrwS4HC3KSxm19Td2PZCVRWu5Heb7QK50XoHZBuMERZCYGzlGSUjDKYueglEQlIWwy6MGE82WlT4QZDZD';

// Function to make API requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: url,
      method: method,
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Function to check phone number status
async function checkPhoneNumberStatus() {
  console.log('🔍 Checking phone number status...');
  
  try {
    const response = await makeRequest(`/v23.0/${PHONE_NUMBER_ID}?fields=status,verified_name,name_status`);
    
    if (response.status === 200) {
      console.log('✅ Phone number status:', response.data);
      return response.data;
    } else {
      console.log('❌ Failed to get phone number status:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking phone number status:', error);
    return null;
  }
}

// Function to update display name
async function updateDisplayName(displayName) {
  console.log(`📝 Updating display name to: ${displayName}`);
  
  try {
    const response = await makeRequest(
      `/v23.0/${PHONE_NUMBER_ID}`,
      'POST',
      { new_display_name: displayName }
    );
    
    if (response.status === 200) {
      console.log('✅ Display name updated successfully');
      return true;
    } else {
      console.log('❌ Failed to update display name:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating display name:', error);
    return false;
  }
}

// Function to update business profile
async function updateBusinessProfile() {
  console.log('🏢 Updating business profile...');
  
  const profileData = {
    about: "Your personal bookmarking assistant. Save and organize links from anywhere!",
    description: "Hoarder helps you save, organize, and discover content from across the web. Send us any link and we'll save it with smart tags and metadata.",
    email: "support@hoarder.app",
    messaging_product: "whatsapp",
    vertical: "OTHER",
    websites: ["https://hoarder.app"]
  };
  
  try {
    const response = await makeRequest(
      `/v23.0/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      'POST',
      profileData
    );
    
    if (response.status === 200) {
      console.log('✅ Business profile updated successfully');
      return true;
    } else {
      console.log('❌ Failed to update business profile:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating business profile:', error);
    return false;
  }
}

// Function to set two-step verification PIN
async function setTwoStepVerification(pin) {
  console.log('🔐 Setting two-step verification PIN...');
  
  try {
    const response = await makeRequest(
      `/v23.0/${PHONE_NUMBER_ID}`,
      'POST',
      { pin: pin }
    );
    
    if (response.status === 200) {
      console.log('✅ Two-step verification PIN set successfully');
      return true;
    } else {
      console.log('❌ Failed to set two-step verification PIN:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error setting two-step verification PIN:', error);
    return false;
  }
}

// Main function to register the phone number
async function registerWhatsAppNumber() {
  console.log('🚀 Starting WhatsApp phone number registration...\n');
  
  // Step 1: Check current status
  const status = await checkPhoneNumberStatus();
  if (!status) {
    console.log('❌ Cannot proceed without phone number status');
    return;
  }
  
  console.log(`📱 Phone Number ID: ${PHONE_NUMBER_ID}`);
  console.log(`📊 Current Status: ${status.status || 'Unknown'}`);
  console.log(`📛 Display Name: ${status.verified_name || 'Not set'}`);
  console.log(`✅ Name Status: ${status.name_status || 'Unknown'}\n`);
  
  // Step 2: Update display name
  const displayNameUpdated = await updateDisplayName('Hoarder');
  
  // Step 3: Update business profile
  const profileUpdated = await updateBusinessProfile();
  
  // Step 4: Set two-step verification (optional - you can set your own PIN)
  // const pinSet = await setTwoStepVerification('123456');
  
  console.log('\n📋 Registration Summary:');
  console.log(`Display Name: ${displayNameUpdated ? '✅ Updated' : '❌ Failed'}`);
  console.log(`Business Profile: ${profileUpdated ? '✅ Updated' : '❌ Failed'}`);
  console.log(`Two-Step Verification: ⚠️  Manual setup required`);
  
  console.log('\n🎉 Registration process completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Set up your two-step verification PIN in WhatsApp Manager');
  console.log('2. Configure your webhook URL in Meta Developer Console');
  console.log('3. Test sending a message to verify everything works');
  console.log('\n🔗 Useful links:');
  console.log('- WhatsApp Manager: https://business.facebook.com/wa/manage/');
  console.log('- Meta Developer Console: https://developers.facebook.com/');
}

// Run the registration
registerWhatsAppNumber().catch(console.error); 