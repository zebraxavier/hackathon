# 🚀 AI Chatbot Setup - Quick Guide

## ⚡ 5-Minute Setup

### Step 1: Get Free AI API Key

**Go to Groq (Recommended - Free & Fast):**
1. Visit: https://console.groq.com/
2. Click "Sign Up" (use your email)
3. Verify your email
4. Click "API Keys" in left sidebar
5. Click "Create API Key"
6. Name it: "Clinical Platform"
7. **Copy the key** (starts with `gsk_...`)

### Step 2: Add Key to Backend

1. **Open:** `backend/.env`
2. **Find this line:**
   ```env
   AI_API_KEY=YOUR_AI_API_KEY_HERE
   ```
3. **Replace with your key:**
   ```env
   AI_API_KEY=gsk_your_actual_key_here
   ```
4. **Save the file** (Ctrl+S)

### Step 3: Restart Backend

```bash
# Stop backend (Ctrl+C in terminal)
# Then restart:
cd backend
npm start
```

### Step 4: Test Chatbot

1. **Login:** patient@test.com / test123
2. **Open chatbot** in patient dashboard
3. **Type:** "Hello"
4. **You should see:** AI-powered response!

---

## ✅ Verification

### Backend Console Should Show:
```
✅ Server running on port 5000
✅ MongoDB Connected
```

### When You Send a Message:
```
======================================================================
🤖 AI SERVICE - Processing Message
======================================================================
   User ID: ...
   Message: Hello
✅ Input sanitized
📡 Calling AI API...
✅ AI API call successful
   Tokens used: 250
✅ AI response received and sanitized
======================================================================
```

---

## 🧪 Test Messages

Try these to test the AI:

1. **"Hello"** - Should greet you
2. **"I have a fever"** - Should give first aid advice
3. **"I'm bleeding"** - Should detect emergency
4. **"When is the doctor available?"** - Should give clinic info

---

## 🚨 Troubleshooting

### "AI API key not configured"
- Check `.env` file has your actual key
- Make sure no spaces around the `=` sign
- Restart backend after changing `.env`

### "AI API call failed"
- Verify your API key is valid
- Check internet connection
- Try regenerating key on Groq dashboard

### Chatbot still uses old responses
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check backend console for AI logs

---

## 💰 Cost

**Groq (Recommended):**
- ✅ FREE tier available
- ✅ Very fast responses
- ✅ Good quality (Llama 3 70B)
- ✅ No credit card required

**Rate Limits:**
- Free tier: 30 requests/minute
- More than enough for development

---

## 🔒 Security

✅ API key is ONLY in backend `.env`  
✅ Never exposed to frontend  
✅ Never committed to Git  
✅ Secure backend proxy

---

## 📊 What You Get

**With AI API:**
- Intelligent, context-aware responses
- Natural conversation flow
- Better understanding of medical queries
- Adaptive to user needs

**Without AI API (Fallback):**
- Pre-written safe responses
- Basic first aid guidance
- Clinic information
- Still fully functional

---

## 🎯 Summary

1. Get Groq API key (free)
2. Add to `backend/.env`
3. Restart backend
4. Test chatbot
5. Done! 🎉

**Time:** 5 minutes  
**Cost:** FREE  
**Result:** AI-powered medical chatbot

---

**Need help?** Check `AI_INTEGRATION_COMPLETE.md` for detailed documentation.
