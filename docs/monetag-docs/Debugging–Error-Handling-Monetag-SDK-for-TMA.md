# Debugging & Error Handling | Monetag SDK (for TMA)
Ad Integration [#](#ad-integration)
-----------------------------------

Proper error handling is critical for ensuring a smooth user experience and maintaining the stability of your monetization setup. This section covers common sources of problems and how to detect, debug, and resolve them when using the Monetag SDK.

### How to Catch Errors from the SDK [#](#how-to-catch-errors-from-the-sdk)

The SDK methods (like `show_XXX()`) return Promises. If something goes wrong — such as an ad failing to load, being blocked, or timing out — the Promise will reject.

Always use `.catch()` to avoid unhandled rejections and control the fallback logic.

```
show_XXX().then(() => {
  // success logic
}).catch(() => {
  // handle failure: show message or fallback ad
})

```


React example:

```
adHandler().then(() => {
  // success
}).catch(() => {
  // error fallback
})

```


### Common Causes of Failure [#](#common-causes-of-failure)

1.  **Ad inventory not available**
    
    Monetag may not have a suitable ad to show at the moment of the request.
    
    **Solution:** Use `.catch()` and fallback to another action or ad source.
    
2.  **Called outside of user interaction (for Rewarded Popup)**
    
    Browsers block new tabs unless triggered by a real user action like a button click.
    
    **Solution:** Always call `show_XXX({ type: 'pop' })` inside an onClick handler or similar user gesture.
    
3.  **Incorrect or missing zone ID**
    
    If the script uses the wrong `data-zone` or you initialize `createAdHandler()` with a sub-zone instead of the main zone, the SDK won’t work correctly.
    
    **Solution:** Double-check the zone ID in your Monetag dashboard. Use only the **main** zone ID provided for the SDK.
    
4.  **SDK not fully loaded**
    
    Attempting to call SDK methods before the script has been fully loaded and parsed will result in a `ReferenceError`.
    
    **Solution:** Always call ad functions after the SDK script is loaded, or inside a `useEffect()` / `DOMContentLoaded` / similar lifecycle hook.
    
5.  **Telegram WebView limitations**
    
    Sometimes ads are blocked or behave unexpectedly inside Telegram WebView on certain devices.
    
    **Solution:** Test on both Android and iOS Telegram apps, and ensure that Telegram’s Web App API is initialized.
    
6.  **Popup blocked by browser**
    
    If the browser prevents opening a new tab (common on mobile Safari), the Rewarded Popup will fail.
    
    **Solution:** Make sure the popup is tied directly to a user interaction, and always use `.catch()` to handle rejection.
    

### Debugging Checklist [#](#debugging-checklist)

*   ✅ Are you using the correct (main) zone ID?
*   ✅ Is the SDK script properly loaded before calling any functions?
*   ✅ Is `.catch()` implemented for every ad function?
*   ✅ Is the ad triggered from inside a user action if it’s a popup?
*   ✅ Is `ymid` passed consistently for postback tracking?
*   ✅ Have you tested in the actual Telegram environment, not just a desktop browser?

### Tools for Debugging [#](#tools-for-debugging)

*   Use `console.log()` statements inside `.then()` and `.catch()` to trace behavior.
*   Monitor browser DevTools Console for warnings, failed requests, or JS errors.
*   Inspect network activity to verify that SDK scripts load correctly.
*   Watch for blocked popups or CORS issues in the browser console.

### Example: Graceful Fallback on Failure [#](#example-graceful-fallback-on-failure)

```
show_XXX({ type: 'preload', ymid: 'event-123' }).then(() => {
  show_XXX({ ymid: 'event-123' }).catch(() => {
    showOtherAd()
  })
}).catch(() => {
  showOtherAd()
})

```


Debugging and handling errors properly will make your ad integration much more stable, improve user experience, and reduce support questions from your team or partners.