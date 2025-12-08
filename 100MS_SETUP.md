# 100ms Template Setup Guide

## ⚠️ Critical Issue: "Invalid Role" Error

The error `ServerErrors: 'invalid role'` means your 100ms template doesn't have the required roles configured.

## Quick Fix Steps

### 1. Go to 100ms Dashboard
Visit: https://dashboard.100ms.live

### 2. Create/Edit Template

1. Navigate to **Templates** in the left sidebar
2. Click **Create Template** or edit an existing one
3. Choose **Audio Conferencing** template type

### 3. Configure Roles

You need **3 roles** with these exact names:

#### Role: `host`
- **Permissions**:
  - ✅ Publish audio: Yes
  - ✅ Subscribe to peers: All peers
  - ✅ Change any peer's role: Yes
  - ✅ Mute peers: Yes
  - ✅ Remove peers: Yes
  - ✅ End room: Yes

#### Role: `listener`
- **Permissions**:
  - ❌ Publish audio: No
  - ✅ Subscribe to peers: All peers
  - ❌ Publish video: No
  
**Important**: Set this as the **default role** when someone joins

#### Role: `speaker`
- **Permissions**:
  - ✅ Publish audio: Yes
  - ✅ Subscribe to peers: All peers
  - ❌ Publish video: No

### 4. Enable Role Changes

In template settings:
- Enable **"Allow role changes"**
- Set **"Who can change roles"** to `host` only

### 5. Get Template ID

1. After saving, copy the **Template ID** (looks like: `64c0...`)
2. Add it to your `.env`:

```bash
NEXT_PUBLIC_100MS_TEMPLATE_ID=your-template-id-here
```

### 6. Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

## Testing After Setup

1. **Go Live**: Should work without "invalid role" error
2. **Listen**: Should join as listener successfully  
3. **Request to Speak**: Should create request in Firestore
4. **Approve Request**: Should promote listener → speaker
5. **Speak**: Approved user should be able to unmute

## Common Issues

### "Room leave called when no room is connected"
✅ **Fixed** - Added connection state guards

### "Invalid role"
❌ **Needs template configuration** - Follow steps above

### Can't hear audio
- Check browser permissions (microphone allowed)
- Verify speaker role has "Publish audio" enabled
- Check 100ms dashboard for active sessions

## Environment Variables Checklist

```bash
# Required
NEXT_PUBLIC_100MS_ACCESS_KEY=your-access-key
NEXT_PUBLIC_100MS_APP_SECRET=your-app-secret

# Add this now
NEXT_PUBLIC_100MS_TEMPLATE_ID=your-template-id
```

---

Once you've completed these steps, the "invalid role" error should be resolved! 🎉
