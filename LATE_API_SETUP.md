# 🚀 LATE API Setup Guide

LATE is the social media scheduling API that powers your CMS's social posting features. It provides a unified API for posting to Facebook, X (Twitter), LinkedIn, and 7+ other platforms.

## Why LATE?

- ✅ **Simple Integration** - One API for multiple platforms
- ✅ **Free Tier** - 2 profiles, 10 posts/month (perfect for testing)
- ✅ **Affordable** - $13/month for 120 posts, $33/month unlimited
- ✅ **No Approval Process** - Get API key immediately
- ✅ **Great Docs** - Clear documentation and SDKs
- ✅ **Fast** - 99.97% uptime, sub-50ms response times

---

## Quick Setup (5 Minutes)

### Step 1: Create Account

1. Go to https://www.getlate.dev/
2. Click "Sign Up" (top right)
3. Create account with email and password
4. No credit card required for free tier!

### Step 2: Connect Social Accounts

1. Once logged in, go to **Profiles** or **Settings**
2. Click "Connect Account"
3. Connect your social media accounts:
   - **Facebook**: Authorize LATE to post to your page/profile
   - **X (Twitter)**: Authorize LATE app
   - **LinkedIn**: Authorize LATE to post on your behalf

**Note:** You'll need admin access to the social accounts you're connecting.

### Step 3: Get API Key

1. Go to **Settings** → **API Keys**
2. Click "Create New API Key"
3. Give it a name (e.g., "Civic Narrative CMS")
4. Copy the API key (starts with `late_...`)
5. **Important:** Save it securely - you won't see it again!

### Step 4: Add to Your CMS

1. Open `.env.local` in your CMS project
2. Add your API key:
   ```bash
   LATE_API_KEY=late_your_key_here
   ```
3. Save the file
4. Restart your dev server:
   ```bash
   npm run dev
   ```

---

## Testing the Integration

### Test 1: Check Profiles

1. Log into your CMS admin panel
2. Publish an article
3. Click "Draft Social Posts"
4. If you see the modal open, the integration is working!

### Test 2: Generate Posts

1. Click "Generate Social Posts"
2. AI should generate posts for Facebook, X, and LinkedIn
3. Review the generated content

### Test 3: Schedule a Post

1. Edit one of the generated posts if needed
2. Set a schedule time (or leave blank for immediate)
3. Click "Schedule on LATE" or "Schedule All Posts"
4. Check LATE dashboard - post should appear as scheduled

### Test 4: Verify in LATE Dashboard

1. Go back to https://www.getlate.dev/
2. Check the **Posts** section
3. You should see your scheduled post(s)
4. They'll publish at the scheduled time!

---

## Pricing Plans

| Plan | Price | Profiles | Posts/Month | Use Case |
|------|-------|----------|-------------|----------|
| **Free** | $0 | 2 | 10 | Testing, personal blogs |
| **Build** | $13/mo | 10 | 120 | Small sites, newsletters |
| **Accelerate** | $33/mo | 50 | Unlimited | Production sites, agencies |
| **Unlimited** | $667/mo | Unlimited | Unlimited | Large enterprises |

**Most users start with Free, move to Build ($13/mo) for production**

---

## Platform Support

LATE supports 10+ platforms:

- ✅ **Facebook** - Pages and profiles
- ✅ **X (Twitter)** - Personal and business accounts
- ✅ **LinkedIn** - Personal profiles and company pages
- ✅ **Instagram** - Business accounts
- ✅ **TikTok** - Creator and business accounts
- ✅ **YouTube** - Community posts
- ✅ **Threads** - Meta's Twitter alternative
- ✅ **Reddit** - Subreddits you moderate
- ✅ **Pinterest** - Boards
- ✅ **Bluesky** - Decentralized social

---

## Character Limits by Platform

The CMS automatically enforces these limits:

| Platform | Character Limit | Note |
|----------|----------------|------|
| X (Twitter) | 280 | Includes hashtags, links count as 23 chars |
| Facebook | 63,206 | Practically unlimited |
| LinkedIn | 3,000 | Engagement drops after ~150 words |
| Instagram | 2,200 | First 125 chars show in feed |
| Threads | 500 | Similar to Twitter |

---

## Common Issues & Solutions

### "LATE_API_KEY environment variable is not set"

**Solution:**
1. Check `.env.local` file exists in project root
2. Verify the line reads: `LATE_API_KEY=your_key`
3. Restart dev server: `npm run dev`

### "No profiles found for platform X"

**Solution:**
1. Log into LATE dashboard
2. Go to Profiles
3. Connect the missing platform
4. Refresh your CMS

### "Rate limit exceeded"

**Solution:**
- Free tier: 600 requests/minute
- You're likely fine unless posting hundreds of times
- Upgrade to Build plan for 1,200 requests/minute

### "Post failed to schedule"

**Solution:**
1. Check LATE dashboard for error details
2. Verify social account is still connected
3. Check you haven't exceeded monthly post limit
4. Ensure content meets platform requirements (e.g., no banned links)

### Posts not appearing on social media

**Solution:**
1. Check scheduled time - might be in the future
2. Verify account permissions in LATE dashboard
3. Check LATE dashboard for post status
4. Some platforms have review periods for new apps

---

## API Features Used by CMS

Your CMS uses these LATE API endpoints:

### GET /profiles
Gets list of connected social accounts
- Used when you open "Draft Social Posts"
- Shows which platforms you can post to

### POST /posts
Creates and schedules a post
- Used when you click "Schedule" button
- Supports immediate or scheduled publishing
- Can include media URLs (images/videos)

### GET /posts
Lists your posts
- Can filter by status (scheduled, published, failed)
- Can filter by platform
- Used for social media dashboard (if you build it)

### PATCH /posts/:id
Updates a scheduled post
- Change text, schedule time, or media
- Only works for posts not yet published

### DELETE /posts/:id
Cancels a scheduled post
- Only works for posts not yet published

---

## Best Practices

### Content Strategy

1. **X/Twitter**: Keep under 250 chars, use 1-2 hashtags, ask questions
2. **Facebook**: Be conversational, 40-80 chars gets best engagement
3. **LinkedIn**: Be professional, 150 words max, industry insights

### Scheduling Strategy

1. **Best times to post**:
   - Facebook: 1-3pm weekdays
   - X: 8-10am or 6-9pm weekdays
   - LinkedIn: 7-8am or 5-6pm Tuesday-Thursday

2. **Space out posts**: Don't post to all platforms at same time
3. **Schedule ahead**: Batch create content, schedule for the week

### Media Strategy

1. **Always include images**: 2-3x more engagement
2. **Optimize sizes**:
   - Facebook: 1200x630px
   - X: 1200x675px
   - LinkedIn: 1200x627px
3. **Use your article's featured image** (CMS does this automatically)

---

## Monitoring & Analytics

### In LATE Dashboard

1. Go to **Analytics** (if available in your plan)
2. See post performance
3. Track engagement rates
4. Identify best-performing content

### In Your CMS

1. All scheduled posts are saved to database
2. Check `social_posts` table in Supabase
3. Filter by status: draft, scheduled, published, failed
4. Build custom analytics dashboard (future enhancement)

---

## Upgrading Your Plan

### When to Upgrade

**Upgrade to Build ($13/mo) when:**
- You exceed 10 posts/month
- You need more than 2 social profiles
- You want to schedule more in advance

**Upgrade to Accelerate ($33/mo) when:**
- You're posting daily to multiple platforms
- You manage multiple clients/brands
- You need unlimited posts

### How to Upgrade

1. Go to https://www.getlate.dev/settings/billing
2. Choose your plan
3. Enter payment details
4. Done! Upgrade is instant
5. No code changes needed - same API key works

---

## Alternative: Manual Posting

If you prefer not to use LATE, you can:

1. **Generate posts with AI** (still works)
2. **Copy generated content**
3. **Manually post to social media**

To disable scheduling:
- Just don't click the "Schedule" buttons
- Use the AI-generated content as inspiration
- Post manually through each platform

---

## Getting Help

### LATE Support

- **Docs**: https://docs.getlate.dev/
- **Email**: support@getlate.dev
- **Status Page**: Check API status
- **Discord**: Community support (link on website)

### CMS Integration Issues

- Check `LATE_API_SETUP.md` (this file)
- Review `SETUP_GUIDE.md` for full setup
- Check browser console for errors
- Verify `.env.local` configuration

---

## Security Notes

🔐 **Keep your API key secure:**
- Never commit `.env.local` to git (already in `.gitignore`)
- Don't share your API key publicly
- Regenerate key if compromised (LATE dashboard → API Keys)
- Use separate keys for dev/staging/production

🔒 **LATE security features:**
- API keys are encrypted at rest
- All API calls use HTTPS
- OAuth tokens for social platforms are secure
- LATE never stores your social passwords

---

## API Rate Limits

| Plan | Requests/Minute | Typical Usage |
|------|----------------|---------------|
| Free | 600 | ~10 posts/sec (plenty for CMS) |
| Build | 600 | Same as free |
| Accelerate+ | 1,200 | 20 posts/sec |

**Your CMS typically makes:**
- 1 request to fetch profiles (when opening modal)
- 1 request per post scheduled
- **Total: ~4 requests per article** (with 3 social posts)

You're very unlikely to hit rate limits unless you're doing bulk operations.

---

## Frequently Asked Questions

**Q: Can I post to personal Instagram?**
A: Instagram requires a business account for API access. Connect your business account in LATE.

**Q: Can I schedule Instagram Stories?**
A: Not via API. Instagram doesn't allow Story scheduling through APIs.

**Q: Can I edit a post after publishing?**
A: No. Once published, posts can only be edited on the platform itself.

**Q: Can I delete a scheduled post?**
A: Yes! In LATE dashboard or via API (future CMS feature).

**Q: What happens if I exceed my post limit?**
A: Posts will fail to schedule. Upgrade your plan or wait until next month.

**Q: Can I use this for multiple websites?**
A: Yes! One LATE account can serve multiple websites. Just use the same API key.

**Q: Do links get shortened?**
A: LATE doesn't shorten links. Consider using a link shortener if needed.

---

## Next Steps

Now that LATE is set up:

1. ✅ **Test the integration** - Schedule a test post
2. 📝 **Create your first article** - Use AI to draft
3. 📱 **Generate social posts** - Let AI optimize for each platform
4. 📅 **Schedule ahead** - Queue up your content
5. 📊 **Monitor results** - Check engagement in LATE dashboard

---

**You're all set!** 🎉

Start creating content and let AI handle your social media scheduling!
