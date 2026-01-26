# Scheduling System - JFU

**Ad Scheduling System with Google Calendar Integration**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud Console project

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_SHARED_CALENDAR_ID=your-calendar-id
```

---

## ✨ Features

### Core Functionality
- ✅ **Create Ad** - Schedule new ads with slot validation
- ✅ **Extend Ad** - Extend existing ads with new dates
- ✅ **Cancel Ad** - Cancel scheduled ads
- ✅ **Filter Tabs** - Filter by status (All, Scheduled, Live, Completed, Cancelled)
- ✅ **Slot Validation** - Real-time checking (max 3 new ads, 1 extended ad per day)
- ✅ **Auto-Status Updates** - Database trigger automatically updates status

### Google Calendar Integration
- ✅ **Auto-create Events**:
  - 🔔 Publish reminder: 1 hour before publish time (1 hour duration)
  - 🔻 Takedown reminder: At takedown time (30 min duration)
- ✅ **Notifications**: 5-minute popup before each event
- ✅ **Auto-delete**: Events removed when ad is cancelled

### Real-time Updates
- ✅ **Live Sync**: Changes appear instantly across all users
- ✅ **Multi-user**: Collaborate in real-time
- ✅ **Auto-refresh**: No page refresh needed

---

## 📋 Setup Guide

### 1. Database Setup

Run `supabase-schema.sql` in Supabase SQL Editor to create:
- `users` table
- `ads` table
- Database triggers for auto-status updates
- RPC function for slot validation

### 2. Enable Realtime

In Supabase SQL Editor, run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE ads;
```

### 3. Google Calendar Setup

1. **Enable Google Calendar API**:
   - Go to Google Cloud Console
   - APIs & Services → Library
   - Search "Google Calendar API" → Enable

2. **Share Calendar**:
   - Open Google Calendar
   - Find your calendar
   - Settings → Share with specific people
   - Add your Google account email
   - Permission: "Make changes to events"

3. **Get Calendar ID**:
   - Calendar Settings → Integrate calendar
   - Copy Calendar ID
   - Add to `.env` as `VITE_SHARED_CALENDAR_ID`

### 4. OAuth Setup

1. Google Cloud Console → Credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `http://localhost:5173`
   - Your production URL
4. Copy Client ID to `.env`

---

## 🎯 Usage

### Default Settings
- **Default publish time**: Today at 15:00 WIB
- **Default duration**: 1 day
- **Timezone**: Asia/Jakarta (WIB)

### Business Rules
- Maximum 3 new ads per day
- Maximum 1 extended ad per day (or uses new ad slot)
- Only "new" ads can be extended
- Cancelled ads cannot be extended
- Only scheduled ads can be cancelled

### Ad Lifecycle
1. **Created** → Status: `scheduled`
2. **Publish time reached** → Status: `live` (auto-updated by trigger)
3. **Takedown time reached** → Status: `completed` (auto-updated by trigger)
4. **User cancels** → Status: `cancelled`

---

## 🏗️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)

### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Realtime

### APIs
- Google OAuth 2.0
- Google Calendar API

---

## 📁 Project Structure

```
src/
├── components/     # React components (inline in Dashboard)
├── hooks/          # Custom hooks
│   ├── useAds.js   # CRUD operations + realtime
│   └── useStore.js # Global state
├── lib/            # Utilities
│   ├── supabase.js       # Supabase client
│   ├── calendarApi.js    # Google Calendar API
│   ├── dateUtils.js      # Date helpers
│   └── googleAuth.js     # OAuth config
├── pages/          # Page components
│   ├── Login.jsx         # Login page
│   └── Dashboard.jsx     # Main app
└── store/          # Zustand store
    └── useStore.js
```

---

## 🧪 Testing

### Manual Testing
1. Login with Google account
2. Create new ad → Check appears in list
3. Open 2 browser windows → Create ad in one, watch appear in other
4. Cancel ad → Check status updates + calendar events deleted
5. Check Google Calendar → Verify events created with correct times

### Slot Validation Test
1. Create 3 ads for same date
2. Try to create 4th ad → Should show "slot penuh"
3. Change date → Slots available again

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect GitHub repository
2. Set environment variables
3. Deploy `dist/` folder
4. Update OAuth redirect URIs in Google Cloud Console

---

## 📝 Documentation

- **README.md** - This file (overview & setup)
- **CALENDAR_SETUP.md** - Detailed calendar integration guide
- **supabase-schema.sql** - Database schema

---

## 🐛 Troubleshooting

### Login Issues
- Check OAuth credentials correct
- Verify redirect URI matches
- Check browser console for errors

### Calendar Events Not Created
- Verify Calendar API enabled
- Check calendar shared with correct permissions
- Verify access token in debug panel

### Realtime Not Working
- Check `ALTER PUBLICATION` SQL ran successfully
- Verify browser console shows no errors
- Refresh browser

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables set
3. Check Supabase logs
4. Review setup documentation

---

## 📄 License

MIT

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2026
