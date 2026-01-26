# Google Calendar Integration - Quick Setup

## ✅ Prerequisites

Sebelum mulai, pastikan sudah punya:
- [x] Google Cloud Console project
- [x] OAuth credentials configured
- [x] Google Calendar created & shared

---

## 🚀 Quick Setup Steps

### 1. Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **Scheduling System - JFU**
3. Go to **APIs & Services** → **Library**
4. Search: **"Google Calendar API"**
5. Click **"Enable"**

### 2. Update OAuth Scopes

OAuth sudah include calendar scope:
```javascript
'https://www.googleapis.com/auth/calendar.events'
```

✅ Already configured in `src/lib/googleAuth.js`

### 3. Share Calendar

1. Open [Google Calendar](https://calendar.google.com)
2. Find calendar: **"Jadwal Iklan JFU"**
3. Click 3 dots → **"Settings and sharing"**
4. Under **"Share with specific people"**:
   - Add your Google account email
   - Permission: **"Make changes to events"**
5. Click **"Send"**

### 4. Test Integration

1. **Logout** dari aplikasi (untuk refresh OAuth token dengan calendar scope)
2. **Login** lagi
3. **Create new ad**:
   - Title: "Test Calendar Integration"
   - Customer: "PT Test"
   - Date: Tomorrow 15:00
   - Duration: 1 day
4. **Check Google Calendar**:
   - Should see 2 events:
     - 🔔 Publish reminder (1 hour before)
     - 🔻 Takedown reminder (at takedown time)

---

## 🎯 How It Works

### When Creating Ad:
1. Ad saved to database
2. Calendar API called to create 2 events:
   - **Publish Reminder**: 1 hour before publish time (Blue)
   - **Takedown Reminder**: At takedown time (Red)
3. Event IDs saved to database

### When Cancelling Ad:
1. Ad status updated to "cancelled"
2. Calendar events deleted automatically

### When Extending Ad:
1. New ad record created
2. New calendar events created for new dates

---

## 🐛 Troubleshooting

### Issue: Calendar events not created

**Check**:
1. Calendar ID correct in `.env`
2. Calendar shared with your account
3. Google Calendar API enabled
4. User logged in with calendar scope

**Solution**:
- Logout and login again
- Check browser console for errors
- Verify calendar ID: `c_6788a2bdd3c617b3b7d755a3a6124305b8b4d3dc97717f528b943a9d10c55af3@group.calendar.google.com`

### Issue: "Insufficient permissions"

**Solution**:
- Make sure calendar is shared with "Make changes to events" permission
- Logout and login again to refresh token

### Issue: Events created but not visible

**Solution**:
- Check you're viewing the correct calendar
- Refresh Google Calendar page
- Check event time zone (should be Asia/Jakarta)

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Google Calendar API enabled
- [ ] Calendar shared with your account
- [ ] User can login successfully
- [ ] Create ad → 2 events appear in calendar
- [ ] Cancel ad → Events deleted from calendar
- [ ] Extend ad → New events created

---

## 📝 Notes

- Calendar integration is **optional** - app works without it
- If calendar fails, ad still created successfully
- Calendar errors logged to console (non-blocking)
- Events use Asia/Jakarta timezone
- Event colors: Blue (publish), Red (takedown)

---

## 🎉 Success!

Kalau semua steps di atas berhasil, Google Calendar integration sudah aktif! 

Setiap kali create/extend ad, calendar events akan otomatis dibuat.
Setiap kali cancel ad, calendar events akan otomatis dihapus.

**No manual calendar management needed!** 🚀
