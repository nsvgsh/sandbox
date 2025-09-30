```
BotsTelegram Mini Apps
```
# Telegram Mini Apps

With **Mini Apps** developers can use JavaScript to create **infinitely flexible interfaces** that can be launched right inside Telegram — and can completely replace **any website**.
Like bots, to users, and **Mini Apps** much more support. seamless authorization, payments via third-party payment providers (with Google Pay and Apple Pay out of the box), delivering tailored push notifications

### To see a Mini App in action, try our sample @DurgerKingBot.

## Recent changes

### July 3, 2025

**Bot API 9.**
Added the method hideKeyboard to the class WebApp.

### April 11, 2025

**Bot API 9.**
Added the Added the fifield eld DeviceStorageSecureStorage, allowing Mini Apps to use persistent local storage on the user's device., allowing Mini Apps to use a secure local storage on the user's device for sensitive data.

### November 17, 2024

**Bot API 8.**

### This is the largest update in the history of Telegram mini apps – adding more than 10 new features and monetization options for

### developers. To read more about all these changes, check out this dedicated blog post.

**Full-screen Mode**
Mini Apps are now able to experiences. become full-screen in both portrait and **landscape mode** – allowing them to host **more games** , play **widescreen media** and support **immersive** user
Added the methods Added the fields safeAreaInsetrequestFullscreen and contentSafeAreaInset and exitFullscreen to toggle full-screen mode., allowing Mini Apps to ensure that their content properly respects the device's safe area margins.
Further added the Added the events activatedfields isActive, deactivated and isFullscreen, safeAreaChanged to the class , contentSafeAreaChangedWebApp. , fullscreenChanged and fullscreenFailed.

**Homescreen Shortcuts**
Mini Apps can now be accessed via Added the method addToHomeScreendirect shortcuts to create a shortcut for users to add to their home screens. added to the **home screen** of mobile devices.
Added the method Added the events homeScreenAddedcheckHomeScreenStatus and homeScreenChecked to determine the status and support of the home screen shortcut for the Mini App on the current device..

**Emoji Status**
Mini Apps can now prompt users to set their Added the method setEmojiStatus to let users manually conemoji status – or request access to later sync it automatically with in-game badges, third-party APIs and more.firm a custom emoji as their new status via a native dialog.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```
```
Home API Protocol Schema
```

```
Added the method Added the events emojiStatusSetrequestEmojiStatusAccess, emojiStatusFailed for obtaining permission to later update a user's emoji status via the Bot API method and emojiStatusAccessRequested. setUserEmojiStatus.
```
**Media Sharing and File Downloads**
Users can now Added the method share mediashareMessage directly from Mini Apps – sending to share media from Mini Apps to Telegram chats. Also see **referral codes** , custom memes, artwork and more to PreparedInlineMessage **any chat**. or posting them as a story.
Added the method Added the events shareMessageSentdownloadFile, introducing support for a , shareMessageFailed and **native popup** fileDownloadRequested that prompts users to download. files from the Mini App.

**Geolocation Access**
Mini Apps can now request **maps** for events. geolocation access to users, allowing them to build virtually any location-based service, from **games** with dynamic points of interest to **interactive**
Added the Added the fieventseld LocationManager locationManagerUpdated to the class and WebApplocationRequested..

**Device Motion Tracking**
Mini Apps can now track detailed Added the fields isOrientationLockeddevice motion data, Accelerometer, , allowing them to implement better productivity tools, immersive DeviceOrientation and Gyroscope to the class WebApp. **VR experiences** and more.
Added the methods Added the events accelerometerStartedlockOrientation and , unlockOrientationaccelerometerStopped to control the screen orientation., accelerometerChanged, accelerometerFailed, deviceOrientationStarted, deviceOrientationStopped,
deviceOrientationChanged, deviceOrientationFailed, gyroscopeStarted, gyroscopeStopped, gyroscopeChanged, gyroscopeFailed.
**Subscription Plans and Gifts for Telegram Stars**
Mini Apps now support Mini Apps can use their balance of **paid subscriptions** Telegram Stars powered by to **send gifts** Telegram Stars to their users. – **monetizing their efforts** with multiple tiers of content and features.
You can read more on implementing Paid Subscriptions and Gifts in our Bot API documentation.
**Loading Screen Customization**
Mini Apps can customize their loading screen, adding You can access these customization settings in @BotFather **their own icon** via /mybots > Select Bot > Bot Settings > Con and **specific colors** for light and dark themes.figure Mini App > Enable Mini App

**Hardware-specific Optimizations**
Mini Apps running on Android can now receive capabilities. basic information about a device's processing hardware, allowing them to **optimize user experience** based on the device's
This information includes the OS, App and SDK's respective versions as well as the device's model and performance class.
**General**
The Third parties (e.g., Mini App builders, external SDKs etc.) that receive or process data on behalf of Mini Apps are now able to field photo_url in the class WebAppUser is now available to all Mini Apps, allowing them to access a user's profile photo if their privacy settings allow for it.validate it without knowing the App's bot token.
Debugging options have been expanded to include full support for **iOS devices**. You can use these tools to find app-specific issues in your Mini App.

### September 6, 2024

**Bot API 7.**
Added the Added the event field SecondaryButtonsecondaryButtonClicked to the class. WebApp.
Renamed the class Added the field bottomBarColorMainButton to the class and the method BottomButtonsetBottomBarColor. to the class WebApp.
Added the field bottom_bar_bg_color to the class ThemeParams.

### July 31, 2024

**Bot API 7.**
Added the option for bots to set a Added the method shareToStory to the class Main Mini AppWebApp, which can be previewed and launched directly from a button in the bot's pro. file or a link.

### July 7, 2024

**Bot API 7.**
Added the Added the event field isVerticalSwipesEnabledscanQrPopupClosed. and the methods enableVerticalSwipes, disableVerticalSwipes to the class WebApp.

### July 1, 2024

**Bot API 7.**
Added the Changed the default opening mode for field section_separator_color to the class Direct Link Mini AppsThemeParams..

### March 31, 2024

**Bot API 7.**
Added the field BiometricManager to the class WebApp.

### December 29, 2023

**Bot API 7.**
Added the Added the fifield elds SettingsButtonheader_bg_color to the class , accent_text_colorWebApp., section_bg_color, section_header_text_color, subtitle_text_color, destructive_text_color to the class ThemeParams.
Mini Apps no longer close when the method WebApp.openTelegramLink is called.

### September 22, 2023

**Bot API 6.**
Added the Added the methods field CloudStoragerequestWriteAccess to the class and WebApprequestContact. to the class WebApp.
Added the Added the events fields added_to_attachment_menuwriteAccessRequested and and contactRequestedallows_write_to_pm. to the class WebAppUser.
Added the ability to set any header color using the setHeaderColor method.

### April 21, 2023

**Bot API 6.**
Added support for launching Mini Apps from inline query results and from a direct link.Added the method switchInlineQuery to the class WebApp.

### December 30, 2022

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

**Bot API 6.**
Added the WebApp. field platform, the optional parameter options to the method openLink and the methods showScanQrPopup, closeScanQrPopup, readTextFromClipboard to the class
Added the events qrTextReceived, clipboardTextReceived.

### August 12, 2022

**Bot API 6.**
Added the WebApp. field isClosingConfirmationEnabled and the methods enableClosingConfirmation, disableClosingConfirmation, showPopup, showAlert, showConfirm to the class
Added the Added the event field is_premiumpopupClosed to the class. WebAppUser.

### June 20, 2022

**Bot API 6.**
Added the ability to use bots added to the attachment menu in group, supergroup and channel chats.Added support for t.me links that can be used to select the chat in which the attachment menu with the bot will be opened.
Added the openTelegramLinkfields version, openInvoice, headerColor to the class , backgroundColorWebApp. , BackButton, HapticFeedback and the methods isVersionAtLeast, setHeaderColor, setBackgroundColor, openLink,
Added the Added the method field secondary_bg_coloroffClick to the class to the class MainButtonThemeParams..
Added the Added the fieventselds chat backButtonClicked, can_send_after, to the class settingsButtonClickedWebAppInitData, invoiceClosed..

## Designing Mini Apps

### Color Schemes

Mini Apps always receive data about the user's current between **Day and Night** modes or use various custom themes **color theme**. in real time, so you can adjust the appearance of your interfaces to match it. For example, when users switch

### Jump to technical information

### Design Guidelines

Telegram apps are known for being snappy, smooth and following a consistent cross-platform design. Your Mini App should ideally reflect these principles.
All elements should be responsive and designed with a mobile-Interactive elements should mimic the style, behavior, and intent of UI components that already exist.first approach.
All included animations should be smooth, ideally 60fps.All inputs and images should contain labels for accessibility purposes.
The app should deliver a seamless experience by monitoring the Ensure that the appʼs interface respects the safe area and content safe areadynamic theme-based colors to avoid overlapping with control elements, especially when using fullscreen mode. provided by the API and using them accordingly.
For Android devices, consider the additional information in the User-Agent (see visual effects on low-performance devices to ensure smooth performance. User-Agent details) and adjust for the deviceʼs performance class, minimizing animations and

## Implementing Mini Apps

Telegram currently supports seven dibutton, via inline mode, from a direct linkfferent ways of launching Mini Apps: the main Mini App from a – and even from the attachment menu. profile button, from a keyboard button, from an inline button, from the bot menu

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

### Keyboard Button Mini Apps

### TL;DR: Mini Apps launched from a web_app type keyboard button can send data back to the bot in a service message using

### Telegram.WebApp.sendData. This makes it possible for the bot to produce a response without communicating with any external servers.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

Users can interact with bots using Telegram: photos and videos, files, locations, contacts and polls. For even more custom keyboards, buttons under bot messagesflexibility, bots can utilize the full power of , as well as by sending freeform **text messagesHTML5** or any of the to create user-friendly input interfaces. **attachment types** supported by

You can send a **web_app** type KeyboardButton that opens a Mini App from the specified URL.
To transmit data from the user back to the bot, the Mini App can call the bot can continue communicating with the user after receiving it. Telegram.WebApp.sendData method. Data will be transmitted to the bot as a String in a service message. The

**Good for:
Сustom data input interfaces** wheel” and chooses one of the available options, etc.) (a personalized calendar for selecting dates; selecting data from a list with advanced search options; a randomizer that lets the user “spin a
**Reusable components** that do not depend on a particular bot.

### Inline Button Mini Apps

### TL;DR: For more interactive Mini Apps like @DurgerKingBot, use a web_app type Inline KeyboardButton, which gets basic user information

### and can be used to send a message on behalf of the user to the chat with the bot.

If receiving text data alone is insufficient or you need a more advanced and personalized interface, you can open a Mini App using a **web_app** type Inline KeyboardButton.
From the button, a Mini App will open with the URL specilanguage_code) and a unique identifier for the session, **query_id** fied in the button. In addition to the user's , which allows messages on behalf of the user to be sent back to the bot.theme settings, it will receive basic user information (ID, name, username,

The bot can call the Bot API method continue communicating with the user.answerWebAppQuery to send an inline message from the user back to the bot and close the Mini App. After receiving the message, the bot can

**Good for:**
Fully-The use cases are efledged web services and integrations of any kind.ffectively **unlimited**.

### Launching Mini Apps from the Menu Button

### TL;DR: Mini Apps can be launched from a customized menu button. This simply offers a quicker way to access the app and is otherwise

### identical to launching a mini app from an inline button.

By default, chats with bots always show a convenient instead. **menu button** that provides quick access to all listed commands. With Bot API 6.0, this button can be used to **launch a Mini App**

To configure the menu button, you must specify the text it should show and the Mini App URL. There are two ways to set these parameters:
To customize the button for To customize the button for both **all usersall users** , use and @BotFather **specific users** (the /setmenubutton, use the setChatMenuButton command or Bot Settings > Menu Button method in the Bot API. For example, change the button text according to the user's).
language, or show links to different Mini Apps based on a user's settings in your bot.
Apart from this, Mini Apps opened via the menu button work in the exact same way as when using inline buttons.

### @DurgerKingBot allows launching its Mini App both from an inline button and from the menu button.

### Launching the main Mini App

### TL;DR: If your bot is a mini app, you can add a prominent Launch app button as well as high-quality demo videos and screenshots to the

### botʼs profile. To do this, go to @BotFather and set up your bot's Main Mini App.

If your bot is a mini app, you can unlock a number of features that streamline and simplify the way in which users view and interact with it. To do this, go to bot's **Main Mini App**. @BotFather and set up your

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

After setting a main mini app, you'll be able to upload detailed allowing users to open your app directly from its profile. Bots that enabled a main mini app will be displayed in the **media preview demos** to publicly highlight your app's key features on its proApps tab of the search for users who have launched them.file. A **Launch app** button will also appear,

### Media previews support multiple languages – so you can upload translated versions of your previews that will be shown to users based on

### their app language.

A bot's link, it will be passed to the Mini App in the **main Mini App** can also be opened in the current chat by direct link in the format start_param field and in the GET parameter tgWebAppStartParamhttps://t.me/botusername?startapp.. If a non-empty startapp parameter is included in the

**Examples**
https://t.me/botusername?startapphttps://t.me/botusername?startapp=command
https://t.me/botusername?startapp=command&mode=compact
In this mode, Mini Apps can use the multiple chat members – to create live whiteboards, group orders, multiplayer games and similar apps.chat_type and chat_instance parameters to keep track of the current chat context. This introduces support for **concurrent** and **shared** usage by

By default, the main Mini App opens to full-screen height, and users cannot reduce them to half-height. However, you can change this behavior via parameter mode=compact in the link to the Mini App, in which case it will open to half-screen height by default. @BotFather or by including the

**Good for:**
Fully-Cooperative, multiplayer or teamwork-oriented services within a chat context.fledged web services and integrations that any user can open in one tap.
The use cases are effectively **unlimited**.

### Successful bots which enable a main Mini App and accept payments in Telegram Stars may be featured in the Telegram Mini App Store. To

### increase the chances of being featured, we recommend uploading high-quality media showcasing your app on your bot's profile and following

### our design guidelines.

### Inline Mode Mini Apps

### TL;DR: Mini Apps launched via web_app type InlineQueryResultsButton can be used anywhere in inline mode. Users can create content in a

### web interface and then seamlessly send it to the current chat via inline mode.

You can use the **Mini App** from the specibutton parameter in the fied URL. Once done, you can call the answerInlineQuery method to display a special 'Switch to Mini App' button either above or in place of the inline results. This button will Telegram.WebApp.switchInlineQuery method to send the user back to inline mode. **open a**

Inline Mini Apps have actively pick a result. **no access** to the chat – they can't read messages or send new ones on behalf of the user. To send messages, the user must be redirected to **inline mode** and

**Good for:**
Fully-fledged web services and integrations in inline mode.

### Direct Link Mini Apps

### TL;DR: Mini App Bots can be launched from a direct link in any chat. They support a startapp parameter and are aware of the current chat

### context.

You can use direct links to field and in the GET parameter **open a Mini App** tgWebAppStartParam directly in the current chat. If a non-empty. startapp parameter is included in the link, it will be passed to the Mini App in the start_param

In this mode, Mini Apps can use the multiple chat members – to create live whiteboards, group orders, multiplayer games and similar apps.chat_type and chat_instance parameters to keep track of the current chat context. This introduces support for **concurrent** and **shared** usage by

Mini Apps opened from a direct link have **inline mode** and actively pick a result. **no access** to the chat – they can't read messages or send new ones on behalf of the user. To send messages, the user must be redirected to

Starting from including the parameter Bot API 7. 6 , by default, Mini Apps of this type open to full-screen height, and users cannot reduce them to half-height. However, you can change this behavior bymode=compact in the link to the Mini App, in which case it will open to half-screen height by default.

**Examples**
https://t.me/botusername/appnamehttps://t.me/botusername/appname?startapp=command
https://t.me/botusername/appname?startapp=command&mode=compact
**Good for:**
Fully-Cooperative, multiplayer or teamwork-oriented services within a chat context.fledged web services and integrations that any user can open in one tap.
The use cases are effectively **unlimited**.

### Launching Mini Apps from the Attachment Menu

### TL;DR: Mini App Bots can request to be added directly to a user's attachment menu, allowing them to be quickly launched from any chat. To

### try this mode, open this attachment menu link for @DurgerKingBot, then use the menu in any type of chat.

Mini App Bots can request to be added directly to a user's attachment menu, allowing them to be quickly launched from your mini app can be started from the attachment menu (private, groups, supergroups or channels). **any type of chat**. You can configure in which types of chats

Attachment menu integration is currently only available for major advertisers on the Telegram Ad Platform. However, **all bots** can use it in the test server environment.
To enable this feature for your bot, open Then specify the URL that will be opened to launch the bot's Mini App via its icon in the attachment menu.@BotFather from an account on the test server and send the /setattach command – or go to Bot Settings > Configure Attachment Menu.

You can add a 'Settings' item to the context menu of your Mini App using event. @BotFather. When users select this option from the menu, your bot will receive a settingsButtonClicked

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

In addition to the user's name, username, phototheme settings) or the chat info (, the bot will receive basic user information (ID, type, title, username, photo) and a unique identiID, name, usernamefier for the web view session , language_code, photo), as well as public info about the chat partner ( **query_id** , which allows messages of any type to beID,
sent to the chat on behalf of the user that opened the bot.
The bot can call the Bot API method answerWebAppQuery, which sends an inline message from the user via the bot to the chat where it was launched and closes the Mini App.

### You can read more about adding bots to the attachment menu here.

## Initializing Mini Apps

To connect your Mini App to the Telegram client, place the script telegram-web-app.js in the <head> tag before any other scripts, using this code:
<script src="https://telegram.org/js/telegram-web-app.js?59"></script>
Once the script is connected, a window.Telegram.WebApp object will become available with the following fields:
**Field Type Description**
initData String A string with raw data transferred to the Mini App, convenient for **WARNING:** Validate data from this field before using it on the bot's server.validating data.
initDataUnsafe WebAppInitData An object with input data transferred to the Mini App. **WARNING:** Data from this field should not be trusted. You should only use data from initData on the bot's server
and only after it has been validated.
version String The version of the Bot API available in the user's Telegram app.
platform String The name of the platform of the user's Telegram app.
colorScheme String The color scheme currently used in the Telegram app. Either “light” or “dark”.Also available as the CSS variable var(--tg-color-scheme).
themeParams ThemeParams An object containing the current theme settings used in the Telegram app.
isActive Boolean Bot API 8. 0 + True, if the Mini App is currently active. False, if the Mini App is minimized.
isExpanded Boolean Truescreen and can be expanded to the full height using the , if the Mini App is expanded to the maximum available height. False, if the Mini App occupies part of the **expand()** method.
viewportHeight Float The current height of the visible area of the Mini App. Also available in CSS as the variable height). var(--tg-viewport-
The application can display just the top part of the Mini App, with its lower part remaining outside the screen area.From this position, the user can “pull” the Mini App to its maximum height, while the bot can do the same by calling
the updated in real time. **expand()** method. As the position of the Mini App changes, the current height value of the visible area will be
Please note that the refresh rate of this value is not sushould not be used to pin interface elements to the bottom of the visible area. It's more appropriate to use the valuefficient to smoothly follow the lower border of the window. It
of the viewportStableHeight field for this purpose.
viewportStableHeight Float The height of the visible area of the Mini App in its last stable state. Also available in CSS as a variable viewport-stable-height). var(--tg-
The application can display just the top part of the Mini App, with its lower part remaining outside the screen area.From this position, the user can “pull” the Mini App to its maximum height, while the bot can do the same by calling
the the position of the Mini App changes with user gestures or during animations. The value of **expand()** method. Unlike the value of viewportHeight, the value of viewportStableHeightviewportStableHeight does not change as
will be updated after all gestures and animations are completed and the Mini App reaches its final size.
Note the when the stable state of the height of the visible area changes.event _viewportChanged_ with the passed parameter _isStateStable=true_ , which will allow you to track
headerColor String Current header color in the #RRGGBB format.
backgroundColor String Current background color in the #RRGGBB format.
bottomBarColor String Current bottom bar color in the #RRGGBB format.
isClosingConfirmationEnabled Boolean Truedialog is disabled., if the confirmation dialog is enabled while the user is trying to close the Mini App. False, if the confirmation
isVerticalSwipesEnabled Boolean Truethe Mini App are disabled. In any case, the user will still be able to minimize and close the Mini App by swiping the, if vertical swipes to close or minimize the Mini App are enabled. False, if vertical swipes to close or minimize
Mini App's header.
isFullscreen Boolean True, if the Mini App is currently being displayed in fullscreen mode.
isOrientationLocked Boolean Truerotation., if the Mini Appʼs orientation is currently locked. False, if orientation changes freely based on the deviceʼs
safeAreaInset SafeAreaInset An object representing the device's safe area insets, accounting for system UI elements like notches or navigationbars.
contentSafeAreaInset ContentSafeAreaInset An object representing the safe area for displaying content within the app, free from overlapping Telegram UIelements.
BackButton BackButton An object for controlling the back button which can be displayed in the header of the Mini App in the Telegraminterface.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```
```
NEW
```
```
NEW
NEW
NEW
NEW
```

**Field Type Description**
MainButton BottomButton An object for controlling the main button, which is displayed at the bottom of the Mini App in the Telegraminterface.

SecondaryButton BottomButton An object for controlling the secondary button, which is displayed at the bottom of the Mini App in the Telegraminterface.

SettingsButton SettingsButton An object for controlling the Settings item in the context menu of the Mini App in the Telegram interface.
HapticFeedback HapticFeedback An object for controlling haptic feedback.
CloudStorage CloudStorage An object for controlling cloud storage.
BiometricManager BiometricManager An object for controlling biometrics on the device.
Accelerometer Accelerometer An object for accessing accelerometer data on the device.
DeviceOrientation DeviceOrientation An object for accessing device orientation data on the device.
Gyroscope Gyroscope An object for accessing gyroscope data on the device.
LocationManager LocationManager An object for controlling location on the device.
DeviceStorage DeviceStorage An object for storing and retrieving data from the device's local storage.
SecureStorage SecureStorage An object for storing and retrieving data from the device's secure storage.
isVersionAtLeast(version) Function Returns true if the user's app supports a version of the Bot API that is equal to or higher than the version passed asthe parameter.

setHeaderColor(color) Function and Bot Asecondary_bg_colorPI 6. 1 + A method that sets the app header color in the. #RRGGBB format. You can also use keywords bg_color

```
Up to Telegram.WebApp.themeParams.secondary_bg_colorBot API 6. 9 You can only pass Telegram.WebApp.themeParams.bg_color as a color or bg_color, secondary_bg_color or keywords.
```
setBackgroundColor(color) Function bg_colorBot API (^6) and. 1 + A method that sets the app background color in the secondary_bg_color. #RRGGBB format. You can also use keywords
setBottomBarColor(color) Function keywords Bot API 7. (^1) bg_color 0 + A method that sets the app's bottom bar color in the , secondary_bg_color, and bottom_bar_bg_color. This color is also applied to the navigation bar#RRGGBB format. You can also use the
on Android.
enableClosingConfirmation() Function Bot API 6. 2 + A method that enables a confirmation dialog while the user is trying to close the Mini App.
disableClosingConfirmation() Function Bot API 6. 2 + A method that disables the confirmation dialog while the user is trying to close the Mini App.
enableVerticalSwipes() Function recommended to always enable swipes unless they conBot API 7. 7 + A method that enables vertical swipes to close or minimize the Mini App. For user convenience, it isflict with the Mini App's own gestures.
disableVerticalSwipes() Function your Mini App uses swipe gestures that may conBot API 7. 7 + A method that disables vertical swipes to close or minimize the Mini App. This method is useful ifflict with the gestures for minimizing and closing the app.
requestFullscreen() Function in fullscreen mode, it is recommended that the Mini App sets the header color using the Bot API 8. 0 + A method that requests opening the Mini App in fullscreen mode. Although the header is transparentsetHeaderColor method.
This color helps determine a contrasting color for the status bar and other UI controls.
exitFullscreen() Function Bot API 8. 0 + A method that requests exiting fullscreen mode.
lockOrientation() Function locked, the orientation remains Bot API 8. 0 + A method that locks the Mini Appʼs orientation to its current mode (either portrait or landscape). Oncefixed, regardless of device rotation. This is useful if a stable orientation is needed
during specific interactions.
unlockOrientation() Function this to restore automatic orientation adjustments based on the device orientation.Bot API 8. 0 + A method that unlocks the Mini Appʼs orientation, allowing it to follow the device's rotation freely. Use
addToHomeScreen() Function the icon, the Bot API 8. 0 + A method that prompts the user to add the Mini App to the home screen. After successfully addinghomeScreenAdded event will be triggered if supported by the device. Note that if the device cannot
determine the installation status, the event may not be received even if the icon has been added.
checkHomeScreenStatus([callback]) Function added. If an optional Bot API 8. 0 + A method that checks if adding to the home screen is supported and if the Mini App has already beencallback parameter is provided, the callback function will be called with a single argument
status- **unsupported** , which is a string indicating the home screen status. Possible values for – the feature is not supported, and it is not possible to add the icon to the home screen,status are:

- already been added, **unknown** – the feature is supported, and the icon can be added, but it is not possible to determine if the icon has
- - **addedmissed** – the icon has already been added to the home screen, – the icon has not been added to the home screen.

onEvent(eventType, eventHandler) Function A method that sets the app event handler. Check the list of available events.
offEvent(eventType, eventHandler) Function A method that deletes a previously set event handler.
sendData(data) Function A method used to send data to the bot. When this method is called, a service message is sent to the bot containingthe data data of the length up to 4096 bytes, and the Mini App is closed. See the field web_app_data in the class
Message.
This method is only available for Mini Apps launched via a Keyboard button.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```
```
NEW
NEW
NEW
NEW
NEW
NEW
```
```
NEW
```
```
NEW
NEW
```
```
NEW
NEW
```
```
NEW
```

**Field Type Description**
switchInlineQuery(query[,choose_chat_types]) Function fiBeld. Query may be empty, in which case only the bot's username will be inserted. If an optional ot API 6. 7 + A method that inserts the bot's username and the specified inline query in the current chat's inputchoose_chat_types
parameter was passed, the client prompts the user to choose a specibot's username and the specified inline query in the input field. You can specify which types of chats the user will befic chat, then opens that chat and inserts the
able to choose from. It can be one or more of the following types: users, bots, groups, channels.
openLink(url[, options]) Function A method that opens a link in an external browser. The Mini App will Bot API 6. 4 + If the optional options parameter is passed with the field nottry_instant_view=true be closed. , the link will be
opened in Instant View mode if possible.
Note that this method can be called only in response to user interaction with the Mini App interface (e.g. a clickinside the Mini App or on the main button)

openTelegramLink(url) Function A method that opens a telegram link inside the Telegram app. The Mini App will called. not be closed after this method is

Up to Bot API 7. 0 The Mini App will be closed after this method is called.
openInvoice(url[, callback]) Function when the invoice is closed. If an optional Bot API 6. 1 + A method that opens an invoice using the link callback parameter was passed, the url. The Mini App will receive the callback function will be called and theevent invoiceClosed
invoice status will be passed as the first argument.
shareToStory(media_url[, params]) Function HTTPS URL. An optional Bot API 7. 8 + A method that opens the native story editor with the media speciparams argument of the type StoryShareParams describes additional sharing settings.fied in the media_url parameter as an

shareMessage(msg_id[, callback]) Function callbackBot API (^8) parameter is provided, the. 0 + A method that opens a dialog allowing the user to share a message provided by the bot. If an optionalcallback function will be called with a boolean as the first argument, indicating
whether the message was successfully sent. The message id passed to this method must belong to aPreparedInlineMessage previously obtained via the Bot API method savePreparedInlineMessage.
setEmojiStatus(custom_emoji_id[,params, callback]) Function optional Bot API (^8) params. 0 + A method that opens a dialog allowing the user to set the speci argument of type EmojiStatusParams specifies additional settings, such as duration. If an optionalfied custom emoji as their status. An
callbackwhether the status was set. parameter is provided, the callback function will be called with a boolean as the first argument, indicating
Note: this method opens a native dialog and cannot be used to set the emoji status without manual user interaction.For fully programmatic changes, you should instead use the Bot API method setUserEmojiStatus after obtaining
authorization to do so via the Mini App method requestEmojiStatusAccess.
requestEmojiStatusAccess([callback]) Function If an optional Bot API 8. 0 + A method that shows a native popup requesting permission for the bot to manage user's emoji status.callback parameter was passed, the callback function will be called when the popup is closed and the
first argument will be a boolean indicating whether the user granted this access.
downloadFile(params[, callback]) Function argument of type Bot API 8. 0 + A method that displays a native popup prompting the user to download a DownloadFileParams. If an optional callback parameter is provided, the file specicallbackfi function will beed by the params
called when the popup is closed, with the download request. first argument as a boolean indicating whether the user accepted the
hideKeyboard() Function not active.Bot API 9. 1 + A method that hides the on-screen keyboard, if it is currently visible. Does nothing if the keyboard is
showPopup(params[, callback]) Function The Mini App will receive the Bot API 6. 2 + A method that shows a native popup described by the event popupClosed when the popup is closed. If an optional params argument of the type callbackPopupParams parameter was.
passed, the argument. callback function will be called and the field id of the pressed button will be passed as the first
showAlert(message[, callback]) Function was passed, the Bot API 6. 2 + A method that shows callback function will be called when the popup is closed.message in a simple alert with a 'Close' button. If an optional callback parameter
showConfirm(message[, callback]) Function optional Bot API (^6) callback. 2 + A method that shows parameter was passed, the message in a simple concallback function will be called when the popup is closed and the firmation window with 'OK' and 'Cancel' buttons. If anfirst
argument will be a boolean indicating whether the user pressed the 'OK' button.
showScanQrPopup(params[, callback]) Function type Bot AScanQrPopupParamsPI 6. 4 + A method that shows a native popup for scanning a QR code described by the. The Mini App will receive the event qrTextReceived every time the scanner catches a codeparams argument of the
with text data. If an optional the QR code will be passed as the callbackfirst argument. Returning parameter was passed, the true inside this callback function causes the popup tocallback function will be called and the text from
be closed. Starting from native popup for scanning a QR code.Bot API 7. 7 , the Mini App will receive the scanQrPopupClosed event if the user closes the
closeScanQrPopup() Function method. Run it if you received valid data in the Bot API 6. 4 + A method that closes the native popup for scanning a QR code opened with the event qrTextReceived. showScanQrPopup
readTextFromClipboard([callback]) Function clipboardTextReceivedBot API 6. 4 + A method that requests text from the clipboard. The Mini App will receive the. If an optional callback parameter was passed, the callback function will be called and theevent
text from the clipboard will be passed as the first argument.
Note: this method can be called only for Mini Apps launched from the attachment menu and only in response to auser interaction with the Mini App interface (e.g. a click inside the Mini App or on the main button).
requestWriteAccess([callback]) Function If an optional Bot API 6. 9 + A method that shows a native popup requesting permission for the bot to send messages to the user.callback parameter was passed, the callback function will be called when the popup is closed and the
first argument will be a boolean indicating whether the user granted this access.
requestContact([callback]) Function callbackBot API (^6) parameter was passed, the. 9 + A method that shows a native popup prompting the user for their phone number. If an optionalcallback function will be called when the popup is closed and the first argument
will be a boolean indicating whether the user shared its phone number.
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
Designing Mini Apps
Color Schemes
Design Guidelines
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
NEW
NEW
NEW
NEW


```
Field Type Description
ready() Function A method that informs the Telegram app that the Mini App is ready to be displayed.It is recommended to call this method as early as possible, as soon as all essential interface elements are loaded.
Once this method is called, the loading placeholder is hidden and the Mini App is shown.If the method is not called, the placeholder will be hidden only when the page is fully loaded.
expand() Function A method that expands the Mini App to the maximum available height. To the maximum height, refer to the value of the Telegram.WebApp.isExpandedfind out if the Mini App is expanded to parameter
close() Function A method that closes the Mini App.
```
### ThemeParams

Mini Apps can adjust the appearance of the interface to match the Telegram user's app in real time. This object contains the user's current theme settings:
**Field Type Description**
bg_color String OptionalAlso available as the CSS variable. Background color in the var(--tg-theme-bg-color)#RRGGBB format..
text_color String OptionalAlso available as the CSS variable. Main text color in the #RRGGBBvar(--tg-theme-text-color) format..
hint_color String OptionalAlso available as the CSS variable. Hint text color in the #RRGGBBvar(--tg-theme-hint-color) format..
link_color String OptionalAlso available as the CSS variable. Link color in the #RRGGBBvar(--tg-theme-link-color) format..
button_color String OptionalAlso available as the CSS variable. Button color in the #RRGGBBvar(--tg-theme-button-color) format..
button_text_color String OptionalAlso available as the CSS variable. Button text color in the #RRGGBBvar(--tg-theme-button-text-color) format..
secondary_bg_color String OptionalAlso available as the CSS variable. Bot API 6. 1 + Secondary background color in the var(--tg-theme-secondary-bg-color)#RRGGBB format..
header_bg_color String OptionalAlso available as the CSS variable. Bot API 7. 0 + Header background color in the var(--tg-theme-header-bg-color)#RRGGBB format..
bottom_bar_bg_color String OptionalAlso available as the CSS variable. Bot API 7. 10 + Bottom background color in the var(--tg-theme-bottom-bar-bg-color)#RRGGBB format..
accent_text_color String OptionalAlso available as the CSS variable. Bot API 7. 0 + Accent text color in the var(--tg-theme-accent-text-color)#RRGGBB format..

section_bg_color String Optionalsecondary_bg_color. Bot API 7. (^0) .+ Background color for the section in the #RRGGBB format. It is recommended to use this in conjunction with
Also available as the CSS variable var(--tg-theme-section-bg-color).
section_header_text_color String OptionalAlso available as the CSS variable. Bot API 7. 0 + Header text color for the section in the var(--tg-theme-section-header-text-color)#RRGGBB format..
section_separator_color String OptionalAlso available as the CSS variable. Bot API 7. 6 + Section separator color in the var(--tg-theme-section-separator-color)#RRGGBB format..
subtitle_text_color String OptionalAlso available as the CSS variable. Bot API 7. 0 + Subtitle text color in the var(--tg-theme-subtitle-text-color)#RRGGBB format..
destructive_text_color String OptionalAlso available as the CSS variable. Bot API 7. 0 + Text color for destructive actions in the var(--tg-theme-destructive-text-color)#RRGGBB format..
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
Designing Mini Apps
Color Schemes
Design Guidelines
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment


### StoryShareParams

This object describes additional sharing settings for the native story editor.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

```
Field Type Description
text String Optional. The caption to be added to the media, 0-200 characters for regular users and 0-2048 characters for premium subscribers.
widget_link StoryWidgetLink Optional. An object that describes a widget link to be included in the story. Note that only premium subscribers can post stories with links.
```
### StoryWidgetLink

This object describes a widget link to be included in the story.
**Field Type Description**
url String The URL to be included in the story.
name String Optional. The name to be displayed for the widget link, 0-48 characters.

### ScanQrPopupParams

This object describes the native popup for scanning QR codes.
**Field Type Description**
text String Optional. The text to be displayed under the 'Scan QR' heading, 0-64 characters.

### PopupParams

This object describes the native popup.
**Field Type Description**
title String Optional. The text to be displayed in the popup title, 0-64 characters.
message String The message to be displayed in the body of the popup, 1-256 characters.
buttons Array of PopupButton Optional. List of buttons to be displayed in the popup, 1-3 buttons. Set to [{“type”:“close”}] by default.

### PopupButton

This object describes the native popup button.
**Field Type Description**
id String OptionalIf the button is pressed, its. Identifier of the button, 0-64 characters. Set to empty string by default.id is returned in the callback and the popupClosed event.
type String OptionalCan be one of these values:. Type of the button. Set to default by default.

- - defaultok, a button with the localized text “OK”,, a button with the default style,
- - closecancel, a button with the localized text “Close”,, a button with the localized text “Cancel”,
- destructive, a button with a style that indicates a destructive action (e.g. “Remove”, “Delete”, etc.).
text String Optional. The text to be displayed on the button, 0-64 characters. Required if type is default or destructive. Irrelevant for other types.

### EmojiStatusParams

This object describes additional settings for setting an emoji status.
**Field Type Description**
duration Integer Optional. The duration for which the status will remain set, in seconds.

### DownloadFileParams

This object describes the parameters for the file download request.

### Note: To ensure consistent file download behavior across platforms, include the HTTP headers Content-Disposition: attachment;

### filename="<file_name>" and Access-Control-Allow-Origin: https://web.telegram.org in the server response. Without these headers, the

### download may not work as expected, especially on web platforms.

```
Field Type Description
url String The HTTPS URL of the file to be downloaded.
file_name String The suggested name for the downloaded file.
```
### SafeAreaInset

This object represents the system-denotches or navigation bars. fined safe area insets, providing padding values to ensure content remains within visible boundaries, avoiding overlap with system UI elements like

```
Field Type Description
top Integer The top inset in pixels, representing the space to avoid at the top of the screen. Also available as the CSS variable var(--tg-safe-area-inset-top).
bottom Integer The bottom inset in pixels, representing the space to avoid at the bottom of the screen. Also available as the CSS variable var(--tg-safe-area-inset-bottom).
left Integer The left inset in pixels, representing the space to avoid on the left side of the screen. Also available as the CSS variable var(--tg-safe-area-inset-left).
```
```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

```
Field Type Description
right Integer The right inset in pixels, representing the space to avoid on the right side of the screen. Also available as the CSS variable var(--tg-safe-area-inset-right).
```
### ContentSafeAreaInset

This object represents the content-defined safe area insets, providing padding values to ensure content remains within visible boundaries, avoiding overlap with Telegram UI elements.
**Field Type Description**
top Integer The top inset in pixels, representing the space to avoid at the top of the content area. Also available as the CSS variable top). var(--tg-content-safe-area-inset-
bottom Integer The bottom inset in pixels, representing the space to avoid at the bottom of the content area. Also available as the CSS variable inset-bottom). var(--tg-content-safe-area-
left Integer The left inset in pixels, representing the space to avoid on the left side of the content area. Also available as the CSS variable inset-left). var(--tg-content-safe-area-
right Integer The right inset in pixels, representing the space to avoid on the right side of the content area. Also available as the CSS variable inset-right). var(--tg-content-safe-area-

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

### BackButton

This object controls the **back** button, which can be displayed in the header of the Mini App in the Telegram interface.
**Field Type Description**
isVisible Boolean Shows whether the button is visible. Set to false by default.
onClick(callback) Function Bot API 6. 1 + A method that sets the button press event handler. An alias for Telegram.WebApp.onEvent('backButtonClicked', callback)
offClick(callback) Function Bot API 6. 1 + A method that removes the button press event handler. An alias for Telegram.WebApp.offEvent('backButtonClicked', callback)
show() Function Bot API 6. 1 + A method to make the button active and visible.
hide() Function Bot API 6. 1 + A method to hide the button.

All these methods return the BackButton object so they can be chained.

### BottomButton

This object controls the button that is displayed at the bottom of the Mini App in the Telegram interface.
**Field Type Description**
type String Readonly. Type of the button. It can be either main for the main button or secondary for the secondary button.
text String Current button text. Set to Continue for the main button and Cancel for the secondary button by default.
color String Current button color. Set to by default. themeParams.button_color for the main button and themeParams.bottom_bar_bg_color for the secondary button
textColor String Current button text color. Set to button by default. themeParams.button_text_color for the main button and themeParams.button_color for the secondary
isVisible Boolean Shows whether the button is visible. Set to false by default.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
Debug Mode for Mini Apps
```

```
Field Type Description
isActive Boolean Shows whether the button is active. Set to true by default.
hasShineEffect Boolean Bot API 7. 10 + Shows whether the button has a shine effect. Set to false by default.
position String visible. Set to Bot API 7. 10 +left Position of the secondary button. Not de by default. fined for the main button. It applies only if both the main and secondary buttons are
Supported values:- left, displayed to the left of the main button,
```
- - righttop, displayed above the main button,, displayed to the right of the main button,
- bottom, displayed below the main button.
isProgressVisible Boolean Readonly. Shows whether the button is displaying a loading indicator.
setText(text) Function A method to set the button text.
onClick(callback) Function A method that sets the button's press event handler. An alias for Telegram.WebApp.onEvent('mainButtonClicked', callback)
offClick(callback) Function A method that removes the button's press event handler. An alias for Telegram.WebApp.offEvent('mainButtonClicked', callback)
show() Function A method to make the button visible.Note that opening the Mini App from the attachment menu hides the main button until the user interacts with the Mini App interface.
hide() Function A method to hide the button.
enable() Function A method to enable the button.
disable() Function A method to disable the button.
showProgress(leaveActive) Function A method to show a loading indicator on the button.It is recommended to display loading progress if the action tied to the button may take a long time. By default, the button is disabled while
the action is in progress. If the parameter leaveActive=true is passed, the button remains enabled.
hideProgress() Function A method to hide the loading indicator.
setParams(params) Function A method to set the button parameters. The **text** - button text; params parameter is an object containing one or several fields that need to be changed:
**colortext_color** - button color; - button text color;
**has_shine_effectposition** - position of the secondary button; - Bot API 7. 10 + enable shine effect;
**is_activeis_visible** - enable the button; - show the button.

All these methods return the BottomButton object so they can be chained.

### SettingsButton

This object controls the **Settings** item in the context menu of the Mini App in the Telegram interface.
**Field Type Description**
isVisible Boolean Shows whether the context menu item is visible. Set to false by default.
onClick(callback) Function BTelegram.WebApp.onEvent('settingsButtonClicked', callback)ot API 7. 0 + A method that sets the press event handler for the Settings item in the context menu. An alias for
offClick(callback) Function BTelegram.WebApp.offEvent('settingsButtonClicked', callback)ot API 7. 0 + A method that removes the press event handler from the Settings item in the context menu. An alias for
show() Function Bot API 7. 0 + A method to make the Settings item in the context menu visible.
hide() Function Bot API 7. 0 + A method to hide the Settings item in the context menu.

All these methods return the SettingsButton object so they can be chained.

### HapticFeedback

This object controls haptic feedback.
**Field Type Description**
impactOccurred(style) Function can be one of these values:Bot API 6. 1 + A method tells that an impact occurred. The Telegram app may play the appropriate haptics based on style value passed. Style

- - lightmedium, indicates a collision between small or lightweight UI objects,, indicates a collision between medium-sized or medium-weight UI objects,
- - heavyrigid, indicates a collision between hard or in, indicates a collision between large or heavyweight UI objects,flexible UI objects,
- soft, indicates a collision between soft or flexible UI objects.
notificationOccurred(type) Function haptics based on type value passed. Type can be one of these values:Bot API 6. 1 + A method tells that a task or action has succeeded, failed, or produced a warning. The Telegram app may play the appropriate
- - errorsuccess, indicates that a task or action has failed,, indicates that a task or action has completed successfully,
- warning, indicates that a task or action produced a warning.
selectionChanged() Function Bot API 6. 1 + A method tells that the user has changed a selection. The Telegram app may play the appropriate haptics.
Do not use this feedback when the user makes or confirms a selection; use it only when the selection changes.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

All these methods return the HapticFeedback object so they can be chained.

### CloudStorage

This object controls the cloud storage. Each bot can store up to 1024 items per user in the cloud storage.
**Field Type Description**

setItem(key, value[,callback]) Function zBo, t (^) 0-9API (^) , 6 ._ 9 + and A method that stores a value in the cloud storage using the speci- are allowed. The value should contain 0-4096 characters. You can store up to 1024 keys in the cloud storage. If an optionalfied key. The key should contain 1-128 characters, only A-Z, a-
callbacksuccess, the parameter was passed, the first argument will be nullcallback and the second argument will be a boolean indicating whether the value was stored. function will be called. In case of an error, the first argument will contain the error. In case of
getItem(key, callback) Function Ba-zot A, PI0-9 6. (^9) , +_ A method that receives a value from the cloud storage using the speci and - are allowed. In case of an error, the callback function will be called and the fied key. The key should contain 1-128 characters, only first argument will contain the error. In case ofA-Z,
success, the first argument will be null and the value will be passed as the second argument.
getItems(keys,callback) Function ZBo, t (^) a-zAPI (^) , 6 .0-9 9 + A method that receives values from the cloud storage using the speci, _ and - are allowed. In case of an error, the callback function will be called and the fied keys. The keys should contain 1-128 characters, only first argument will contain the error. In caseA-
of success, the first argument will be null and the values will be passed as the second argument.
removeItem(key[,callback]) Function ZBo, t (^) a-zAPI (^) , 6 .0-9 9 + A method that removes a value from the cloud storage using the speci, _ and - are allowed. If an optional callback parameter was passed, the fied key. The key should contain 1-128 characters, only callback function will be called. In case of an error, theA-
fiwhether the value was removed.rst argument will contain the error. In case of success, the first argument will be null and the second argument will be a boolean indicating
removeItems(keys[,callback]) Function ZBo, t (^) a-zAPI (^) , 6 .0-9 9 + A method that removes values from the cloud storage using the speci, _ and - are allowed. If an optional callback parameter was passed, the fied keys. The keys should contain 1-128 characters, only callback function will be called. In case of an error, theA-
fiwhether the values were removed.rst argument will contain the error. In case of success, the first argument will be null and the second argument will be a boolean indicating
getKeys(callback) Function the Bot (^) fiArst argument will contain the error. In case of success, the PI 6. 9 + A method that receives the list of all keys stored in the cloud storage. In case of an error, the first argument will be null and the list of keys will be passed as the secondcallback function will be called and
argument.
All these methods return the CloudStorage object, so they can be chained.

### BiometricManager

This object controls biometrics on the device. Before the first use of this object, it needs to be initialized using the init method.
**Field Type Description**
isInited Boolean Shows whether biometrics object is initialized.
isBiometricAvailable Boolean Shows whether biometrics is available on the current device.
biometricType String The type of biometrics currently available on the device. Can be one of these values:- finger, fingerprint-based biometrics,

- - faceunknown, face-based biometrics,, biometrics of an unknown type.
isAccessRequested Boolean Shows whether permission to use biometrics has been requested.
isAccessGranted Boolean Shows whether permission to use biometrics has been granted.
isBiometricTokenSaved Boolean Shows whether the token is saved in secure storage on the device.
deviceId String A unique device identifier that can be used to match the token to the device.

init([callback]) Function callbackBot API (^7) parameter was passed, the. 2 + A method that initializes the BiometricManager object. It should be called before the object's callback function will be called when the object is initialized. first use. If an optional
requestAccess(params[,callback]) Function BiometricRequestAccessParamsBot API 7. 2 + A method that requests permission to use biometrics according to the. If an optional callback parameter was passed, the callbackparams function will be called and the argument of type first
argument will be a boolean indicating whether the user granted access.
authenticate(params[, callback]) Function BiometricAuthenticateParamsBot API 7. 2 + A method that authenticates the user using biometrics according to the. If an optional callback parameter was passed, the callbackparams function will be called and the argument of type first argument
will be a boolean indicating whether the user authenticated successfully. If so, the second argument will be a biometric token.
updateBiometricToken(token,[callback]) Function If an optional Bot API 7. 2 + A method that updates the biometric token in secure storage on the device. To remove the token, pass an empty string.callback parameter was passed, the callback function will be called and the first argument will be a boolean indicating
whether the token was updated.
openSettings() Function who haven't granted it yet.Bot API 7. 2 + A method that opens the biometric access settings for bots. Useful when you need to request biometrics access to users
Note that this method can be called only in response to user interaction with the Mini App interface (e.g. a click inside the Mini App oron the main button)
All these methods return the BiometricManager object so they can be chained.

### BiometricRequestAccessParams

This object describes the native popup for requesting permission to use biometrics.
**Field Type Description**
reason String Optional. The text to be displayed to a user in the popup describing why the bot needs access to biometrics, 0-128 characters.

### BiometricAuthenticateParams

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

This object describes the native popup for authenticating the user using biometrics.
**Field Type Description**
reason String Optionalauthentication, 0-128 characters.. The text to be displayed to a user in the popup describing why you are asking them to authenticate and what action you will be taking based on that

### Accelerometer

This object provides access to accelerometer data on the device.
**Field Type Description**
isStarted Boolean Indicates whether accelerometer tracking is currently active.
x Float The current acceleration in the X-axis, measured in m/s².
y Float The current acceleration in the Y-axis, measured in m/s².
z Float The current acceleration in the Z-axis, measured in m/s².

start(params[,callback]) Function callbackBot API (^8) function will be called with a boolean indicating whether tracking was successfully started.. 0 + Starts tracking accelerometer data using params of type AccelerometerStartParams. If an optional callback parameter is provided, the
stop([callback]) Function indicating whether tracking was successfully stopped.Bot API 8. 0 + Stops tracking accelerometer data. If an optional callback parameter is provided, the callback function will be called with a boolean
All these methods return the Accelerometer object so they can be chained.

### AccelerometerStartParams

This object defines the parameters for starting accelerometer tracking.
**Field Type Description**
refresh_rate Integer Optional.supported on all platforms, so the actual tracking frequency may di The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000. Set to ffer from the specified value. 1000 by default. Note that refresh_rate may not be

### DeviceOrientation

This object provides access to orientation data on the device.
**Field Type Description**
isStarted Boolean Indicates whether device orientation tracking is currently active.
absolute Boolean A boolean that indicates whether or not the device is providing orientation data in absolute values.
alpha Float The rotation around the Z-axis, measured in radians.
beta Float The rotation around the X-axis, measured in radians.
gamma Float The rotation around the Y-axis, measured in radians.
start(params[,callback]) Function provided, the Bot API 8. 0 + Starts tracking device orientation data using callback function will be called with a boolean indicating whether tracking was successfully started.params of type DeviceOrientationStartParams. If an optional callback parameter is
stop([callback]) Function boolean indicating whether tracking was successfully stopped.Bot API 8. 0 + Stops tracking device orientation data. If an optional callback parameter is provided, the callback function will be called with a

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

All these methods return the DeviceOrientation object so they can be chained.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

Recent changes

July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022

```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
```
Testing Mini Apps

Using bots in the test environment


### DeviceOrientationStartParams

This object defines the parameters for starting device orientation tracking.
**Field Type Description**
refresh_rate Integer Optional.supported on all platforms, so the actual tracking frequency may di The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000. Set to ffer from the specified value. 1000 by default. Note that refresh_rate may not be
need_absolute Boolean Optional.implementing features like a compass in your app. If relative data is su Pass true to receive absolute orientation data, allowing you to determine the device's attitude relative to magnetic north. Use this option iffficient, pass false. Set to false by default.
**Note:** is passed. Check the Keep in mind that some devices may not support absolute orientation data. In such cases, you will receive relative data even if DeviceOrientation.absolute parameter to determine whether the data provided is absolute or relative. need_absolute=true

### Gyroscope

This object provides access to gyroscope data on the device.
**Field Type Description**
isStarted Boolean Indicates whether gyroscope tracking is currently active.
x Float The current rotation rate around the X-axis, measured in rad/s.
y Float The current rotation rate around the Y-axis, measured in rad/s.
z Float The current rotation rate around the Z-axis, measured in rad/s.

start(params[,callback]) Function callbackBot API (^8) function will be called with a boolean indicating whether tracking was successfully started.. 0 + Starts tracking gyroscope data using params of type GyroscopeStartParams. If an optional callback parameter is provided, the
stop([callback]) Function indicating whether tracking was successfully stopped.Bot API 8. 0 + Stops tracking gyroscope data. If an optional callback parameter is provided, the callback function will be called with a boolean
All these methods return the Gyroscope object so they can be chained.
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
Designing Mini Apps
Color Schemes
Design Guidelines
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment


### GyroscopeStartParams

This object defines the parameters for starting gyroscope tracking.
**Field Type Description**
refresh_rate Integer Optional.supported on all platforms, so the actual tracking frequency may di The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000. Set to ffer from the specified value. 1000 by default. Note that refresh_rate may not be

### LocationManager

This object controls location access on the device. Before the first use of this object, it needs to be initialized using the init method.
**Field Type Description**
isInited Boolean Shows whether the LocationManager object has been initialized.
isLocationAvailable Boolean Shows whether location services are available on the current device.
isAccessRequested Boolean Shows whether permission to use location has been requested.
isAccessGranted Boolean Shows whether permission to use location has been granted.
init([callback]) Function parameter is provided, the Bot API 8. 0 + A method that initializes the LocationManager object. It should be called before the object's callback function will be called when the object is initialized. first use. If an optional callback
getLocation(callback) Function not granted, or an object of type Bot API 8. 0 + A method that requests location data. The LocationData as the first argument if access was successful.callback function will be called with null as the first argument if access to location was
openSettings() Function granted it yet.Bot API 8. 0 + A method that opens the location access settings for bots. Useful when you need to request location access from users who haven't
Note that this method can be called only in response to user interaction with the Mini App interface (e.g., a click inside the Mini App or on themain button).

All these methods return the LocationManager object so they can be chained.

### LocationData

This object contains data about the current location.
**Field Type Description**
latitude Float Latitude in degrees.
longitude Float Longitude in degrees.
altitude Float Altitude above sea level in meters. null if altitude data is not available on the device.
course Float The direction the device is moving in degrees (0 = North, 90 = East, 180 = South, 270 = West). null if course data is not available on the device.
speed Float The speed of the device in m/s. null if speed data is not available on the device.
horizontal_accuracy Float Accuracy of the latitude and longitude values in meters. null if horizontal accuracy data is not available on the device.
vertical_accuracy Float Accuracy of the altitude value in meters. null if vertical accuracy data is not available on the device.
course_accuracy Float Accuracy of the course value in degrees. null if course accuracy data is not available on the device.
speed_accuracy Float Accuracy of the speed value in m/s. null if speed accuracy data is not available on the device.

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

### DeviceStorage

This object provides access to persistent local storage on the userʼs device. It is conceptually similar to the browser's data is stored locally and is available only to the bot that created it. Each bot can store up to **5 MB per user** using this storage.localStorage API, but integrated within the Telegram client. All

```
Field Type Description
```
setItem(key, value[,callback]) Function callbackBot API (^9) function will be called. In case of an error, the. 0 + A method that stores a value in the device's local storage using the specifirst argument will contain the error. In case of success, the fied key. If an optional callbackfirst argument will be parameter was passed, thenull and
the second argument will be a boolean indicating whether the value was stored.
getItem(key,callback) Function be called and the Bot API 9. 0 + A method that receives a value from the device's local storage using the specifirst argument will contain the error. In case of success, the first argument will be fied key. In case of an error, the null and the value will be passed as thecallback function will
second argument.
removeItem(key[,callback]) Function passed, the Bot API 9. 0 +callback A method that removes a value from the device's local storage using the speci function will be called. In case of an error, the first argument will contain the error. In case of success, the fied key. If an optional callback parameter wasfirst argument will
be null and the second argument will be a boolean indicating whether the value was removed.
clear([callback]) Function passed, the Bot API 9. 0 +callback A method that clears all keys previously stored by the bot in the device's local storage. If an optional function will be called. In case of an error, the first argument will contain the error. In case of success, the callback parameter wasfirst argument will
be null and the second argument will be a boolean indicating whether all values were removed.
All these methods return the DeviceStorage object, so they can be chained.

### SecureStorage

This object provides access to a secure storage on the userʼs device for sensitive data. On stored values are encrypted at rest and inaccessible to unauthorized applications. **iOS** , it uses the system **Keychain** ; on **Android** , it uses the **Keystore**. This ensures that all

Secure storage is suitable for storing tokens, secrets, authentication state, and other sensitive user-specific information. Each bot can store up to **10 items per user**.
**Field Type Description**

setItem(key, value[,callback]) Function the Bot (^) callbackAPI 9. 0 + function will be called. In case of an error, the A method that stores a value in the device's secure storage using the specifirst argument will contain the error. In case of success, the fied key. If an optional callbackfi parameter was passed,rst argument will be null
and the second argument will be a boolean indicating whether the value was stored.
getItem(key,callback) Function be called and the Bot API 9. 0 + A method that receives a value from the device's secure storage using the specifirst argument will contain the error. In case of success, the first argument will be fied key. In case of an error, the null and the value will be passed as the secondcallback function will
argument. If the key was not found, the second argument will be restored from the current device. null, and the third argument will be a boolean indicating whether the key can be
restoreItem(key[,callback]) Function the value. If the user declines or an error occurs, the Bot API 9. 0 + Attempts to restore a key that previously existed on the current device. When called, the user will be asked for permission to restorefirst argument in the callback will contain the error. If restored successfully, the first
argument will be null and the second argument will contain the restored value.
removeItem(key[,callback]) Function passed, the Bot API 9. 0 +callback A method that removes a value from the device's secure storage using the speci function will be called. In case of an error, the first argument will contain the error. In case of success, the fied key. If an optional callback parameter wasfirst argument will
be null and the second argument will be a boolean indicating whether the value was removed.
clear([callback]) Function passed, the Bot API 9. 0 +callback A method that clears all keys previously stored by the bot in the device's secure storage. If an optional function will be called. In case of an error, the first argument will contain the error. In case of success, the callback parameter wasfirst argument will
be null and the second argument will be a boolean indicating whether all values were removed.
All these methods return the SecureStorage object, so they can be chained.

### WebAppInitData

This object contains data that is transferred to the Mini App when it is opened. It is empty if the Mini App was launched from a keyboard button or from inline mode.
**Field Type Description**
query_id String Optional. A unique identifier for the Mini App session, required for sending messages via the answerWebAppQuery method.
user WebAppUser Optional. An object containing data about the current user.
receiver WebAppUser Optional.Returned only for private chats and only for Mini Apps launched via the attachment menu. An object containing data about the chat partner of the current user in the chat where the bot was launched via the attachment menu.
chat WebAppChat Optional.group chats – only for Mini Apps launched via the attachment menu. An object containing data about the chat where the bot was launched via the attachment menu. Returned for supergroups, channels and
chat_type String Optional.“group”, “supergroup”, or “channel”. Returned only for Mini Apps launched from direct links. Type of the chat from which the Mini App was opened. Can be either “sender” for a private chat with the user opening the link, “private”,
chat_instance String Optional.direct link. Global identifier, uniquely corresponding to the chat from which the Mini App was opened. Returned only for Mini Apps launched from a
start_param String Optional. The value of the startattach parameter, passed via link. Only returned for Mini Apps when launched from the attachment menu via link.
The value of the interface right away.start_param parameter will also be passed in the GET-parameter tgWebAppStartParam, so the Mini App can load the correct
can_send_after Integer Optional. Time in seconds, after which a message can be sent via the answerWebAppQuery method.
auth_date Integer Unix time when the form was opened.
hash String A hash of all passed parameters, which the bot server can use to check their validity.
signature String A signature of all passed parameters (except hash), which the third party can use to check their validity.

### WebAppUser

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
Debug Mode for Mini Apps
```
```
NEW
```

This object contains the data of the Mini App user.
**Field Type Description**
id Integer A unique identidifficulty/silent defects in interpreting it. It has at most 52 signifier for the user or bot. This number may have more than 32 significant bits, so a 64-bit integer or a double-precision ficant bits and some programming languages may havefloat type is safe for
storing this identifier.
is_bot Boolean Optional. True, if this user is a bot. Returns in the receiver field only.
first_name String First name of the user or bot.
last_name String Optional. Last name of the user or bot.
username String Optional. Username of the user or bot.
language_code String Optional. IETF language tag of the user's language. Returns in user field only.
is_premium True Optional. True, if this user is a Telegram Premium user.
added_to_attachment_menu True Optional. True, if this user added the bot to the attachment menu.
allows_write_to_pm True Optional. True, if this user allowed the bot to message them.
photo_url String Optional. URL of the userʼs profile photo. The photo can be in .jpeg or .svg formats.

### WebAppChat

This object represents a chat.
**Field Type Description**
id Integer Unique identiinterpreting it. But it has at most 52 signifier for this chat. This number may have more than 32 significant bits, so a signed 64-bit integer or double-precision ficant bits and some programming languages may have difloat type are safe for storing this identifficulty/silent defects infier.
type String Type of chat, can be either “group”, “supergroup” or “channel”
title String Title of the chat
username String Optional. Username of the chat
photo_url String Optional. URL of the chatʼs photo. The photo can be in .jpeg or .svg formats. Only returned for Mini Apps launched from the attachment menu.

### Validating data received via the Mini App

To validate data received via the Mini App, one should send the data from the series of field-value pairs. Telegram.WebApp.initData field to the bot's backend. The data is a query string, which is composed of a

You can verify the integrity of the data received by comparing the received **string** with the secret key, which is the HMAC-SHA-256 signature of the bot's tokenhash parameter with the hexadecimal representation of the with the constant string WebAppData used as a key.HMAC-SHA-256 signature of the **data-check-**

**Data-check-string** <auth_date>\nquery_id=<query_id>\nuser=<user>' is a chain of all received fields, sorted alphabetically, in the format. key=<value> with a line feed character ('\n', 0x0A) used as separator – e.g., 'auth_date=

The full check might look like:
data_check_string = ...secret_key = HMAC_SHA256(<bot_token>, "WebAppData")
if (hex(HMAC_SHA256(data_check_string, secret_key)) == hash) { // data is from Telegram
}
To prevent the use of outdated data, you can additionally check the auth_date field, which contains a Unix timestamp of when it was received by the Mini App.
Once validated, the data may be used on your server. Complex data types are represented as JSON-serialized objects.

### Validating data for Third-Party Use

Telegram.WebApp.initData If you need to share the data with a third party, they can validate the data without requiring access to your field and your bot_id. bot's token. Simply provide them with the data from the
The integrity of the data can be veri **string**. The verification is performed using the public key provided by Telegram.fied by validating the received signature parameter, which is the base64url-encoded representation of the Ed25519 signature of the **data-check-**

**Data-check-string** 1. Prepend the bot_id is constructed as follows:, followed by : and the constant string WebAppData.

2. Add a 3. Append all received line feed character (fields (except '\n', 0x0A).hash and signature), sorted alphabetically, in the format key=<value>.
4. Separate each key-value pair with a line feed character ('\n', 0x0A).
**Example:** '12345678:WebAppData\nauth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>'

The verification process might look like this:
data_check_string = ...public_key = "<Telegram_public_key>"
if (Ed25519_verify(public_key, data_check_string, signature)) { // data is valid and originated from Telegram
}

### Telegram provides the following Ed25519 public keys for signature verification:

### Test environment: 40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec (hex)

### Production: e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d (hex)

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```
```
NEW
```

To prevent the use of outdated data, the third party should additionally validate the Mini App. auth_date field. This field contains a Unix timestamp indicating when the data was received by the

Once validated, the data may be used. Complex data types are represented as JSON-serialized objects.

### Events Available for Mini Apps

The Mini App can receive events from the Telegram app, onto which a handler can be attached using the eventHandler the this object refers to Telegram.WebApp, the set of parameters sent to the handler depends on the event type. Below is a list of possible events:Telegram.WebApp.onEvent(eventType, eventHandler) method. Inside

```
eventType Description
```
activated (^) eventHandlerBot API 8. 0 + Occurs when the Mini App becomes active (e.g., opened from minimized state or selected among tabs). receives no parameters.
deactivated (^) eventHandlerBot API 8. 0 + Occurs when the Mini App becomes inactive (e.g., minimized or moved to an inactive tab). receives no parameters.
themeChanged Occurs whenever theme settings are changed in the user's Telegram app (including switching to night mode).eventHandler receives no parameters, new theme settings and color scheme can be received via this.themeParams and this.colorScheme
respectively.
viewportChanged Occurs when the visible section of the Mini App is changed.eventHandler receives an object with the single field isStateStable. If isStateStable is true, the resizing of the Mini App is finished. If it is false, the
resizing is ongoing (the user is expanding or collapsing the Mini App or an animated object is playing). The current value of the visible sectionʼsheight is available in this.viewportHeight.
safeAreaChanged (^) eventHandlerBot API 8. 0 + Occurs when the device's safe area insets change (e.g., due to orientation change or screen adjustments). receives no parameters. The current inset values can be accessed via this.safeAreaInset.
contentSafeAreaChanged (^) eventHandlerBot API 8. 0 + Occurs when the safe area for content changes (e.g., due to orientation change or screen adjustments). receives no parameters. The current inset values can be accessed via this.contentSafeAreaInset.
mainButtonClicked Occurs when the eventHandler receives no parameters.main button is pressed.
secondaryButtonClicked eventHandlerBot API 7. 10 + receives no parameters. Occurs when the secondary button is pressed.
backButtonClicked eventHandlerBot API 6. 1 + Occurrs when the receives no parameters.back button is pressed.
settingsButtonClicked eventHandlerBot API 6. 1 + Occurrs when the Settings item in context menu is pressed. receives no parameters.
invoiceClosed eventHandlerBot API 6. 1 + Occurrs when the opened invoice is closed. receives an object with the two fields: url – invoice link provided and status – one of the invoice statuses:

- - **paidcancelled** – invoice was paid successfully, – user closed this invoice without paying,
- - **failedpending** – user tried to pay, but the payment was failed, – the payment is still processing. The bot will receive a service message about a successful payment when the payment is successfully
paid.
popupClosed eventHandlerBot API 6. 2 + Occurrs when the opened popup is closed. receives an object with the single field button_id – the value of the field id of the pressed button. If no buttons were pressed, the
field button_id will be null.
qrTextReceived eventHandlerBot API 6. 4 + Occurs when the QR code scanner catches a code with text data. receives an object with the single field data containing text data from the QR code.
scanQrPopupClosed eventHandlerBot API 7. 7 + Occurs when the QR code scanner popup is closed by the user. receives no parameters.
clipboardTextReceived eventHandlerBot API 6. 4 + Occurrs when the receives an object with the single readTextFromClipboardfield data method is called. containing text data from the clipboard. If the clipboard contains non-text data, the field
data will be an empty string. If the Mini App has no access to the clipboard, the field data will be null.
writeAccessRequested eventHandlerBot API 6. 9 + Occurs when the write permission was requested. receives an object with the single field status containing one of the statuses:
- - **allowedcancelled** – user granted write permission to the bot, – user declined this request.
contactRequested eventHandlerBot API 6. 9 + Occurrs when the user's phone number was requested. receives an object with the single field status containing one of the statuses:
- - **sentcancelled** – user shared their phone number with the bot, – user declined this request.
biometricManagerUpdated eventHandlerBot API 7. 2 + Occurs whenever BiometricManager object is changed. receives no parameters.
biometricAuthRequested eventHandlerBot API 7. 2 + Occurs whenever biometric authentication was requested. receives an object with the field isAuthenticated containing a boolean indicating whether the user was authenticated successfully. If
isAuthenticated is true, the field biometricToken will contain the biometric token stored in secure storage on the device.
biometricTokenUpdated eventHandlerBot API 7. 2 + Occurs whenever the biometric token was updated. receives an object with the single field isUpdated, containing a boolean indicating whether the token was updated.

fullscreenChanged (^) eventHandlerBot API 8. 0 + Occurs whenever the Mini App enters or exits fullscreen mode. receives no parameters. The current fullscreen state can be checked via this.isFullscreen.
fullscreenFailed (^) eventHandlerBot API 8. 0 + Occurs if a request to enter fullscreen mode fails. receives an object with the single field error, describing the reason for the failure. Possible values for error are:
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
Designing Mini Apps
Color Schemes
Design Guidelines
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
NEW
NEW
NEW
NEW
NEW
NEW


**eventType Description
UNSUPPORTEDALREADY_FULLSCREEN** – Fullscreen mode is not supported on this device or platform. – The Mini App is already in fullscreen mode.

homeScreenAdded (^) eventHandlerBot API 8. 0 + Occurs when the Mini App is successfully added to the home screen. receives no parameters.
homeScreenChecked (^) eventHandlerBot API 8. 0 + Occurs after checking the home screen status. receives an object with the field status, which is a string indicating the current home screen status. Possible values for status are:

- - **unsupportedunknown** – the feature is supported, and the icon can be added, but it is not possible to determine if the icon has already been added, – the feature is not supported, and it is not possible to add the icon to the home screen,
- - **addedmissed** – the icon has already been added to the home screen, – the icon has not been added to the home screen.

accelerometerStarted (^) eventHandlerBot API 8. 0 + Occurs when accelerometer tracking has started successfully. receives no parameters.
accelerometerStopped (^) eventHandlerBot API 8. 0 + Occurs when accelerometer tracking has stopped. receives no parameters.
accelerometerChanged (^) eventHandlerBot API 8. 0 + Occurs with the speci receives no parameters, the current acceleration values can be received via fied frequency after calling the start method, sending the current accelerometer data.this.x, this.y and this.z respectively.
accelerometerFailed (^) eventHandlerBot API 8. 0 + Occurs if a request to start accelerometer tracking fails. receives an object with the single field error, describing the reason for the failure. Possible values for error are:
**UNSUPPORTED** – Accelerometer tracking is not supported on this device or platform.
deviceOrientationStarted eventHandlerBot API 8. 0 + Occurs when device orientation tracking has started successfully. receives no parameters.
deviceOrientationStopped eventHandlerBot API 8. 0 + Occurs when device orientation tracking has stopped. receives no parameters.
deviceOrientationChanged eventHandlerBot API 8. 0 + Occurs with the speci receives no parameters, the current device orientation values can be received via fied frequency after calling the start method, sending the current orientation data.this.alpha, this.beta and this.gamma respectively.
deviceOrientationFailed (^) eventHandlerBot API 8. 0 + Occurs if a request to start device orientation tracking fails. receives an object with the single field error, describing the reason for the failure. Possible values for error are:
**UNSUPPORTED** – Device orientation tracking is not supported on this device or platform.
gyroscopeStarted (^) eventHandlerBot API 8. 0 + Occurs when gyroscope tracking has started successfully. receives no parameters.
gyroscopeStopped (^) eventHandlerBot API 8. 0 + Occurs when gyroscope tracking has stopped. receives no parameters.
gyroscopeChanged (^) eventHandlerBot API 8. 0 + Occurs with the speci receives no parameters, the current rotation rates can be received via fied frequency after calling the start method, sending the current gyroscope data.this.x, this.y and this.z respectively.
gyroscopeFailed (^) eventHandlerBot API 8. 0 + Occurs if a request to start gyroscope tracking fails. receives an object with the single field error, describing the reason for the failure. Possible values for error are:
**UNSUPPORTED** – Gyroscope tracking is not supported on this device or platform.
locationManagerUpdated (^) eventHandlerBot API 8. 0 + Occurs whenever LocationManager object is changed. receives no parameters.
locationRequested (^) eventHandlerBot API 8. 0 + Occurs when location data is requested. receives an object with the single field locationData of type LocationData, containing the current location information.
shareMessageSent (^) eventHandlerBot API 8. 0 + Occurs when the message is successfully shared by the user. receives no parameters.
shareMessageFailed (^) eventHandlerBot API 8. 0 + Occurs if sharing the message fails. receives an object with the single field error, describing the reason for the failure. Possible values for error are:
**UNSUPPORTEDMESSAGE_EXPIRED** – The feature is not supported by the client. – The message could not be retrieved because it has expired.
**MESSAGE_SEND_FAILEDUSER_DECLINED** – The user closed the dialog without sharing the message. – An error occurred while attempting to send the message.
**UNKNOWN_ERROR** – An unknown error occurred.
emojiStatusSet (^) eventHandlerBot API 8. 0 + Occurs when the emoji status is successfully set. receives no parameters.
emojiStatusFailed (^) eventHandlerBot API 8. 0 + Occurs if setting the emoji status fails. receives an object with the single field error, describing the reason for the failure. Possible values for error are:
**UNSUPPORTEDSUGGESTED_EMOJI_INVALID** – The feature is not supported by the client. – One or more emoji identifiers are invalid.
**DURATION_INVALIDUSER_DECLINED** – The user closed the dialog without setting a status. – The specified duration is invalid.
**SERVER_ERRORUNKNOWN_ERROR** – A server error occurred when attempting to set the status. – An unknown error occurred.
emojiStatusAccessRequested eventHandlerBot API 8. 0 + Occurs when the write permission was requested. receives an object with the single field status containing one of the statuses:

- - **allowedcancelled** – user granted emoji status permission to the bot, – user declined this request.

fileDownloadRequested (^) eventHandlerBot API 8. 0 + Occurs when the user responds to the receives an object with the single field fistatusle download request. containing one of the statuses:
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
Designing Mini Apps
Color Schemes
Design Guidelines
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW
NEW


```
eventType Description
```
- - **downloadingcancelled** – user declined this request. – the file download has started,

### Adding Bots to the Attachment Menu

Attachment menu integration is currently only available for major advertisers on the on the test server to set up the integration. Telegram Ad Platform. However, **all bots** can use it in the test server environment. Talk to Botfather

A special link is used to add bots to the attachment menu:

orhttps://t.me/botusername?startattach
https://t.me/botusername?startattach=command

### For example, open this attachment menu link for @DurgerKingBot, then use the menu in any private chat.

Opening the link prompts the user to add the bot to their attachment menu. If the bot has already been added, the attachment menu will open in the current chat and redirect to thebot there (if the link is opened from a 1-on-1 chat). If a non-empty startattach parameter was included in the link, it will be passed to the Mini App in the start_param field and in the
GET parameter tgWebAppStartParam.
The following link formats are also supported:
https://t.me/username?attach=botusernamehttps://t.me/username?attach=botusername&startattach=command
https://t.me/+1234567890?attach=botusernamehttps://t.me/+1234567890?attach=botusername&startattach=command

These links open the Mini App in the attachment menu in the chat with a specinon-empty startattach parameter was included in the link, it will be passed to the Mini App in the fic user. If the bot wasn't already added to the attachment menu, the user will be prompted to do so. If astart_param field and in the GET parameter tgWebAppStartParam.

```
Bot API 6. 1 + supports a new link format:
https://t.me/botusername?startattach&choose=users+botshttps://t.me/botusername?startattach=command&choose=groups+channels
```
Opening such a link prompts the user to choose a speciprompted to do so. You can specify which types of chats the user will be able to choose from. It can be one or more of the following types: fic chat and opens the attachment menu in that chat. If the bot wasn't already added to the attachment menu, the user will beusers, bots, groups, channels separated by a
+ sign. If a non-empty startattach parameter was included in the link, it will be passed to the Mini App in the start_param field and in the GET parameter tgWebAppStartParam.

### Additional Data in User-Agent

When the Mini App is running on Android, additional information is appended to the User-Agent string to provide more context about the app environment. This information includesthe app version, device model, Android version, SDK version, and device performance class, formatted as follows:

Telegram-Android/{app_version} ({manufacturer} {model}; Android {android_version}; SDK {sdk_version}; {performance_class})
where:
**{app_version}{manufacturer} {model}** is the version of the Telegram app (e.g., represents the deviceʼs manufacturer and model (e.g., 11.3.3), Google sdk_gphone64_arm64),
**{android_version}{sdk_version}** indicates the Android SDK version (e.g., is the Android OS version running on the device (e.g., 34 ), 14 ),
**{performance_class}** specifies the device performance class as LOW, AVERAGE, or HIGH, indicating the device's performance capacity.

### Example

#### Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.136 Mobile Safari/537.36 Telegram-

#### Android/11.3.3 (Google sdk_gphone64_arm64; Android 14; SDK 34; LOW)

We recommend using this information to optimize your Mini App based on the device's capabilities. For instance, you can adjust animations and visual eperformance devices to ensure a smooth experience for all users, regardless of device specifications. ffects in games on low-

## Testing Mini Apps

### Using bots in the test environment

To log in to the test environment, use either of the following:
**iOS:Telegram Desktop:** tap 10 times on the Settings icon > Accounts > Login to another account > Test. open ☰ Settings > Shift + Alt + Right click ʻAdd Accountʼ and select ʻTest Serverʼ.
**macOS:** click the Settings icon 10 times to open the Debug Menu, ⌘ + click ʻAdd Accountʼ and log in via phone number.
The test environment is completely separate from the main environment, so you will need to create a **new user account** and a **new bot** with @BotFather.
After receiving your bot token, you can send requests to the Bot API in this format:
https://api.telegram.org/bot<token>/test/METHOD_NAME

### Note: When working with the test environment, you may use HTTP links without TLS to test your Mini App.

### Debug Mode for Mini Apps

Use these tools to find app-specific issues in your Mini App:
**iOS**
In Telegram tap 10 times on the Settings icon and toggle on Connect your phone to your computer using a USB cable. Allow Web View Inspection.
Open Safari on your Mac, then go to Launch your Mini App on the iOS device – it will appear in the Develop > [Your Device Name]Develop in the menu bar. menu under your device.

**Android**

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

```
Enable USB-DebuggingIn Telegram Settings, scroll all the way down, press and hold on the on your device. version number two times.
Choose Connect your phone to your computer and open Enable WebView Debug in the Debug Settings.chrome://inspect/#devices in Chrome – you will see your Mini App there when you launch it on your phone.
```
**Telegram Desktop on Windows and Linux**
Download and launch the Go to Settings > Advanced > Experimental settings > Enable webview inspectionBeta Version of Telegram Desktop on **Windows** or **Linux**. (not supported on Telegram Desktop for macOS yet).
Right click in the WebView and choose Inspect.
**Telegram macOS**
Download and launch the Quickly click 5 times on the Settings icon to open the debug menu and enable “Debug Mini Apps”.Beta Version of Telegram macOS.
Right click in the Mini App and choose Inspect Element.
Telegram
Telegram is a cloud-based mobile and desktop messaging app with a focus on security and speed.
About
FAQPrivacy
Press
Mobile Apps
iPhone/iPadAndroid
Mobile Web
Desktop Apps
PC/Mac/LinuxmacOS
Web-browser
Platform
APITranslations
Instant View
About
Blog
Press
ModerationGo up

```
Recent changes
July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022
```
```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
Testing Mini Apps
Using bots in the test environment
```

Recent changes

July 3, 2025
April 11, 2025
November 17, 2024
September 6, 2024
July 31, 2024
July 7, 2024
July 1, 2024
March 31, 2024
December 29, 2023
September 22, 2023
April 21, 2023
December 30, 2022
August 12, 2022
June 20, 2022

```
Designing Mini Apps
Color Schemes
Design Guidelines
```
```
Implementing Mini Apps
Keyboard Button Mini Apps
Inline Button Mini Apps
Launching Mini Apps from the Menu Button
Launching the main Mini App
Inline Mode Mini Apps
Direct Link Mini Apps
Launching Mini Apps from the Attachment Menu
```
```
Initializing Mini Apps
ThemeParams
StoryShareParams
StoryWidgetLink
ScanQrPopupParams
PopupParams
PopupButton
EmojiStatusParams
DownloadFileParams
SafeAreaInset
ContentSafeAreaInset
BackButton
BottomButton
SettingsButton
HapticFeedback
CloudStorage
BiometricManager
BiometricRequestAccessParams
BiometricAuthenticateParams
Accelerometer
AccelerometerStartParams
DeviceOrientation
DeviceOrientationStartParams
Gyroscope
GyroscopeStartParams
LocationManager
LocationData
DeviceStorage
SecureStorage
WebAppInitData
WebAppUser
WebAppChat
Validating data received via the Mini App
Validating data for Third-Party Use
Events Available for Mini Apps
Adding Bots to the Attachment Menu
Additional Data in User-Agent
```
Testing Mini Apps

Using bots in the test environment


