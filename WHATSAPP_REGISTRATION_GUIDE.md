# 📱 WhatsApp Business Phone Number Registration Guide

This guide will help you register your WhatsApp business phone number for the Hoarder bookmarking platform.

## 🚀 Quick Start

### 1. Run the Registration Script

First, let's register your WhatsApp number using the provided credentials:

```bash
node register-whatsapp-number.js
```

This script will:
- Check your phone number status
- Update the display name to "Hoarder"
- Set up the business profile
- Provide next steps for two-step verification

### 2. Test Your Setup

Check if your phone number is properly registered:

```bash
node test-whatsapp-message.js
```

To send a test message to a specific number:

```bash
node test-whatsapp-message.js +1234567890
```

## 🔧 Environment Variables Setup

### For Supabase Edge Functions

You need to set these environment variables in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions**
3. Add the following environment variables:

```env
WHATSAPP_PHONE_NUMBER_ID=662784953591224
WHATSAPP_ACCESS_TOKEN=EAAUKJLQZCEecBO2ZCH9AZBTjHlatRZC8ZAaek148n4wHMY83AgABJwZCIZA0MQZAhZAZBd399Rb45VqINnlYZCRTv3ZBqUsAiwbOpZCHHqD4sauZCDXTHLpijT8OZBrVVXiKrwS4HC3KSxm19Td2PZCVRWu5Heb7QK50XoHZBuMERZCYGzlGSUjDKYueglEQlIWwy6MGE82WlT4QZDZD
WHATSAPP_VERIFY_TOKEN=hoarder_webhook_token_2024
```

### For Local Development

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# WhatsApp Configuration
VITE_WHATSAPP_PHONE_NUMBER_ID=662784953591224
VITE_WHATSAPP_ACCESS_TOKEN=EAAUKJLQZCEecBO2ZCH9AZBTjHlatRZC8ZAaek148n4wHMY83AgABJwZCIZA0MQZAhZAZBd399Rb45VqINnlYZCRTv3ZBqUsAiwbOpZCHHqD4sauZCDXTHLpijT8OZBrVVXiKrwS4HC3KSxm19Td2PZCVRWu5Heb7QK50XoHZBuMERZCYGzlGSUjDKYueglEQlIWwy6MGE82WlT4QZDZD
```

## 📋 Manual Registration Steps

If the automated script doesn't work, follow these manual steps:

### 1. WhatsApp Manager Setup

1. Go to [WhatsApp Manager](https://business.facebook.com/wa/manage/)
2. Select your business account
3. Navigate to **Account tools** > **Phone numbers**
4. Find your phone number (ID: 662784953591224)
5. Click on it to access settings

### 2. Display Name Setup

1. In the **Profile** tab, click **Edit** next to Display name
2. Set the display name to: `Hoarder`
3. Follow the verification process
4. Wait for approval (can take up to 24 hours)

### 3. Business Profile Setup

1. In the **Profile** tab, fill in:
   - **About**: "Your personal bookmarking assistant. Save and organize links from anywhere!"
   - **Description**: "Hoarder helps you save, organize, and discover content from across the web. Send us any link and we'll save it with smart tags and metadata."
   - **Email**: support@hoarder.app
   - **Website**: https://hoarder.app
   - **Vertical**: Technology

### 4. Two-Step Verification

1. In the **Two-step verification** tab
2. Click **Change PIN**
3. Set a secure 6-digit PIN
4. Save it securely - you'll need it for future changes

## 🔗 Webhook Configuration

### 1. Get Your Webhook URL

Your webhook URL will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/whatsapp-webhook
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

### 2. Configure in Meta Developer Console

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your WhatsApp Business App
3. Navigate to **Configuration** > **Webhooks**
4. Add your webhook URL
5. Set the verify token to: `hoarder_webhook_token_2024`
6. Subscribe to `messages` events

### 3. Deploy Edge Functions

```bash
# Deploy the webhook function
supabase functions deploy whatsapp-webhook

# Deploy the welcome message function
supabase functions deploy send-welcome-message
```

## 🧪 Testing Your Setup

### 1. Test Phone Number Status

```bash
node test-whatsapp-message.js
```

Expected output:
```
✅ Phone number is CONNECTED and ready to send messages!
```

### 2. Test Message Sending

```bash
node test-whatsapp-message.js +YOUR_PHONE_NUMBER
```

You should receive a test message on your phone.

### 3. Test Webhook

1. Link your phone number in the Hoarder app
2. Send a link to your WhatsApp bot number
3. Check if the bookmark is saved in your dashboard

## 🚨 Troubleshooting

### Common Issues

1. **Phone number not connected**
   - Check if the number is properly registered in WhatsApp Manager
   - Verify the access token is valid
   - Ensure two-step verification is set up

2. **Messages not sending**
   - Check if the phone number status is "CONNECTED"
   - Verify the access token hasn't expired
   - Check the API version (should be v23.0)

3. **Webhook not receiving messages**
   - Verify the webhook URL is accessible
   - Check that the verify token matches
   - Ensure the webhook is subscribed to "messages" events

4. **Edge function errors**
   - Check Supabase Edge Function logs
   - Verify environment variables are set correctly
   - Ensure the function is deployed

### Debug Commands

```bash
# Check phone number status
curl "https://graph.facebook.com/v23.0/662784953591224?fields=status,verified_name,name_status" \
  -H "Authorization: Bearer EAAUKJLQZCEecBO2ZCH9AZBTjHlatRZC8ZAaek148n4wHMY83AgABJwZCIZA0MQZAhZAZBd399Rb45VqINnlYZCRTv3ZBqUsAiwbOpZCHHqD4sauZCDXTHLpijT8OZBrVVXiKrwS4HC3KSxm19Td2PZCVRWu5Heb7QK50XoHZBuMERZCYGzlGSUjDKYueglEQlIWwy6MGE82WlT4QZDZD"

# Check edge function logs
supabase functions logs whatsapp-webhook
supabase functions logs send-welcome-message
```

## 📞 Support

If you encounter issues:

1. Check the [Meta WhatsApp Business API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers)
2. Review the troubleshooting section above
3. Check Supabase Edge Function logs
4. Test with the provided scripts

## 🔐 Security Notes

- Keep your access token secure and don't commit it to version control
- Use environment variables for all sensitive data
- Regularly rotate your access tokens
- Monitor your API usage to stay within limits

---

**Next Steps**: After completing this setup, your WhatsApp bot will be able to:
- Receive messages from users
- Process links and save bookmarks
- Send confirmation messages
- Provide help and support

🎉 **Congratulations!** Your WhatsApp business phone number is now ready to serve Hoarder users! 