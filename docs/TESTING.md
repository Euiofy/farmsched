# Verification and release checklist

## Refactor verification

- Every stylesheet was split at a rule boundary. The complete parsed CSS tree, including declaration values and cascade order, matched the standalone source.
- 22 JavaScript files passed Node.js syntax checks. The checker also verifies the script and stylesheet load order, local fallback asset, and required UI IDs.
- Chromium interaction tests passed at widths of 320, 390 and 1366 pixels. They loaded the separate CSS and JS file contents as independent browser resources; network access to artwork and external catalogs was blocked. Local storage was simulated because direct navigation to local or hosted pages is restricted in the test environment.
- Character and weapon selectors rendered 129 and 138 bundled entries, respectively. Separate plans could be started and switched without losing the other plan. Manual inventory entry, all five navigation destinations, and saving notification preferences passed.
- Reminder eligibility tests confirmed that completing the character plan leaves the weapon reminder active, and completing both leaves no reminder target.

## Before public release

1. Start Live Server from the extracted folder. Confirm the character grid and element filters populate. Switch to Weapons and confirm the grid populates.
2. Open DevTools (F12), check the Console for uncaught errors and the Network tab for missing local files. The browser resource requests should return successful responses.
3. Create a character plan and a weapon plan, refresh, and verify that both persist. Confirm each has the correct seven-column calendar.
4. Create inventory entries and a team, refresh, and test exporting and re-importing a backup. Try the original day-completion and free-day controls.
5. Enable notifications in Settings, set a reminder time, and use Test notification. Verify system permission behavior and that scheduled reminders stop after farming is completed. Keep the site open for scheduling.
6. Test external images and the expanded weapon catalog on an internet connection.
7. Deploy to GitHub Pages and repeat the checks using the actual project-site URL. Test on desktop and a real phone.

Live deployment, actual system notification delivery, complete team and backup workflows and live external resources remain to be verified on the user's device. The optional source checker is not a replacement for these end-to-end checks.
