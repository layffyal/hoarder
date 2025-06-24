# 📱 WhatsApp Bot Setup Guide

This guide will help you set up the WhatsApp bot functionality for your Hoarder bookmarking platform.

## 🚀 Overview

The WhatsApp bot allows users to save bookmarks by simply sending links to a WhatsApp number. The bot automatically:
- Extracts metadata from URLs
- Generates AI tags
- Saves bookmarks to the user's account
- Sends confirmation messages

## 📋 Prerequisites

1. **WhatsApp Business API Account**
   - Sign up at [Meta for Developers](https://developers.facebook.com/)
   - Create a WhatsApp Business App
   - Get your phone number ID and access token

2. **Supabase Project**
   - Your existing Hoarder project
   - Service role key for the webhook

3. **Domain with HTTPS**
   - For webhook endpoint (Vercel provides this automatically)

## 🔧 Setup Steps

### 1. Database Setup

Run the updated SQL schema in your Supabase SQL Editor:

```sql
-- The schema is already included in supabase-setup.sql
-- This creates the user_phone_numbers table
```

### 2. Deploy the Edge Function

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy whatsapp-webhook
   ```

### 3. Configure Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add these environment variables:

```env
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

### 4. Set Up WhatsApp Webhook

1. **Get your webhook URL**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/whatsapp-webhook
   ```

2. **Configure in Meta Developer Console**:
   - Go to your WhatsApp Business App
   - Navigate to Configuration > Webhooks
   - Add your webhook URL
   - Set the verify token to match `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to `messages` events

### 5. Test the Integration

1. **Link a phone number** in your Hoarder app settings
2. **Send a test message** to your WhatsApp bot number
3. **Check the logs** in Supabase Edge Functions

## 🔐 Security Considerations

1. **Verify Token**: Use a strong, unique verify token
2. **Access Control**: The webhook validates phone numbers against your database
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Error Handling**: The bot gracefully handles errors and notifies users

## 📱 User Experience Flow

1. **User links phone number** in Hoarder settings
2. **User sends any link** to the WhatsApp bot
3. **Bot processes the link**:
   - Extracts metadata
   - Generates AI tags
   - Saves to user's account
4. **Bot sends confirmation** with bookmark details
5. **User sees bookmark** in their Hoarder dashboard

## 🛠️ Customization

### Bot Messages

You can customize the bot's responses by editing the message templates in `supabase/functions/whatsapp-webhook/index.ts`:

```typescript
// Welcome message
await sendWhatsAppMessage(phoneNumber, 
  "Hi! Send me any link and I'll save it to your Hoarder account. 📚\n\n" +
  "To get started, link your phone number in your Hoarder settings."
)

// Success message
await sendWhatsAppMessage(phoneNumber,
  `✅ Saved: ${metadata.title}\n\nTags: ${tags.join(', ')}\n\nView it in your Hoarder dashboard! 📚`
)
```

### Metadata Extraction

The bot uses the same metadata extraction logic as the web app. You can enhance it by:

1. **Adding more proxy services** for better success rates
2. **Implementing platform-specific extractors** (Twitter API, etc.)
3. **Adding image extraction** for better previews

### Tag Generation

Customize the AI tag generation by modifying the `generateTags` function:

```typescript
function generateTags(title: string, description?: string, platform?: string): string[] {
  // Add your custom keywords and logic here
  const customKeywords = [
    'your', 'custom', 'keywords', 'here'
  ]
  // ... rest of the function
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Webhook verification fails**:
   - Check that `WHATSAPP_VERIFY_TOKEN` matches in both places
   - Ensure your webhook URL is accessible

2. **Messages not being processed**:
   - Check Supabase Edge Function logs
   - Verify environment variables are set correctly
   - Ensure phone number is linked in the database

3. **Bookmarks not saving**:
   - Check database permissions
   - Verify user exists and phone number is linked
   - Check for any database constraint violations

### Debugging

1. **Check Edge Function logs**:
   ```bash
   supabase functions logs whatsapp-webhook
   ```

2. **Test webhook locally**:
   ```bash
   supabase functions serve whatsapp-webhook
   ```

3. **Monitor database**:
   - Check the `user_phone_numbers` table
   - Monitor the `bookmarks` table for new entries

## 🔮 Future Enhancements

1. **Message Templates**: Use WhatsApp's message template API for better formatting
2. **Media Support**: Handle images, videos, and documents
3. **Voice Messages**: Convert voice to text for hands-free bookmarking
4. **Smart Replies**: Suggest related bookmarks or tags
5. **Batch Processing**: Handle multiple links in one message
6. **Analytics**: Track usage patterns and popular content

## 📞 Support

If you encounter issues:

1. Check the [Meta WhatsApp Business API documentation](https://developers.facebook.com/docs/whatsapp)
2. Review Supabase Edge Function logs
3. Test with the WhatsApp Business API testing tools
4. Check the [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions)

---

**Note**: This is a production-ready implementation. For actual deployment, make sure to:
- Use a real WhatsApp Business API account
- Implement proper error handling and monitoring
- Add rate limiting and security measures
- Test thoroughly with real users 