# Release Guide for Chrome Web Store

## Version 1.0.2 Release Package

### Files Ready for Upload

✅ **hint-1.0.2.zip** (298KB)
- Contains all necessary files for Chrome Web Store
- Includes: manifest.json, background script, content script, popup UI, assets

### Chrome Web Store Publishing Steps

1. **Login to Chrome Developer Dashboard**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Login with your Google developer account

2. **Upload New Version**
   - Click on "Hint - AI Prompt Assistant" extension
   - Click "Package" → "Upload new package"
   - Select `hint-1.0.2.zip` file
   - Wait for validation to complete

3. **Update Store Listing** (if needed)
   - Review the auto-populated fields
   - Update screenshots if UI has changed significantly
   - Update description if new features are added

4. **Submit for Review**
   - Click "Submit for review"
   - Review process typically takes 1-3 days
   - You'll receive email notification when approved

### Release Notes for Store Listing

**Version 1.0.2 - Major Design Update**

🎨 **What's New:**
- Complete redesign with Apple's Liquid Glass design system (iOS 17+ style)
- Beautiful glass morphism effects throughout the interface
- Enhanced visual feedback and animations
- Custom designed scrollbars with color-matching

🚀 **Performance Improvements:**
- 50-70% fewer re-renders during scrolling
- Smoother animations and interactions
- Optimized position tracking
- Better memory usage

✨ **Features:**
- Smart empty state handling - button disables when input is empty
- Improved positioning system that adapts to different layouts
- Enhanced hover effects and interactions

🐛 **Bug Fixes:**
- Fixed button position when text area grows
- Fixed glass effects scrolling with content
- Fixed border radius overflow issues
- Fixed password visibility icon position

### Technical Details

**Build Info:**
- Build date: 2025-11-19
- React: 19.2.0
- TypeScript: 5.9.3
- Vite: 7.2.2

**Bundle Sizes:**
- popup: 202.12 kB (63.01 kB gzipped)
- background: 101.95 kB (27.24 kB gzipped)
- content: 628.75 kB (185.07 kB gzipped)
- Total: ~933 kB (~275 kB gzipped)

**Supported Sites:**
- ChatGPT (openai.com, chatgpt.com)
- Claude (claude.ai)
- Gemini (gemini.google.com)
- DeepSeek (chat.deepseek.com)
- Yuanbao (yuanbao.tencent.com)
- Grok (grok.com)

### Post-Release Checklist

- [ ] Upload hint-1.0.2.zip to Chrome Web Store
- [ ] Update store listing description
- [ ] Update screenshots (if needed)
- [ ] Submit for review
- [ ] Monitor review status
- [ ] Update GitHub release notes
- [ ] Tag release: `git tag v1.0.2 && git push origin v1.0.2`
- [ ] Announce release to users
- [ ] Monitor user feedback

### Rollback Plan (if needed)

If critical issues are found after release:

1. Download previous version (1.0.1) from Chrome Web Store
2. Upload as new version with incremental patch (1.0.3)
3. Submit emergency review request
4. Fix issues in development branch
5. Release hotfix version

### Contact

For questions or issues:
- Developer: royzeng
- Email: [Your Email]
- Repository: [GitHub URL]
