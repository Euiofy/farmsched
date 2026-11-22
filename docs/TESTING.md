# Verification and release checklist

## Refactor verification

- Every stylesheet was split at a rule boundary. The complete parsed CSS tree, including declaration values and cascade order, matched the standalone source.
- 22 JavaScript files passed Node.js syntax checks. The checker also verifies the script and stylesheet load order, local fallback asset, and required UI IDs.
- Chromium interaction tests passed at widths of 320, 390 and 1366 pixels. They loaded the separate CSS and JS file contents as independent browser resources; network access to artwork and external catalogs was blocked. Local storage was simulated because direct navigation to local or hosted pages is restricted in the test environment.
- Character and weapon selectors rendered 129 and 138 bundled entries, respectively. Separate plans could be started and switched without losing the other plan. Manual inventory entry, all five navigation destinations, and saving notification preferences passed.
- Reminder eligibility tests confirm that pressing Done for today in either character or weapon mode silences every remaining reminder for that server day, even if the other plan still has tasks. Undo restores reminders only when neither plan remains marked done.

## Before public release

1. Start Live Server from the extracted folder. Confirm the character grid and element filters populate. Switch to Weapons and confirm the grid populates.
2. Open DevTools (F12), check the Console for uncaught errors and the Network tab for missing local files. The browser resource requests should return successful responses.
3. Create a character plan and a weapon plan, refresh, and verify that both persist. Confirm each has the correct seven-column calendar.
4. Create inventory entries and a team, refresh, and test exporting and re-importing a backup. Try the original day-completion and free-day controls.
5. Enable notifications in Settings, set a reminder time, and use Test notification. Verify system permission behavior and that scheduled reminders stop after farming is completed. Keep the site open for scheduling.
6. Test external images and the expanded weapon catalog on an internet connection.
7. Deploy to GitHub Pages and repeat the checks using the actual project-site URL. Test on desktop and a real phone.

Live deployment, actual system notification delivery, complete team and backup workflows and live external resources remain to be verified on the user's device. The optional source checker is not a replacement for these end-to-end checks.

## Single-character farming plan (2026-11 update)

- Character setup accepts 1, 2 or 3 selections; an empty selection cannot start a plan.
- One normal character or one Traveler form can start a plan. Overlapping book rotations remain blocked only when multiple characters are selected.
- Change character can replace a 2- or 3-character active plan with just one, without resetting the starting date, duration, recorded completion days or saved stock.
- The existing farming calendar shows that character on their available talent-book days, with free/flex dates remaining available. Weapon plans are unchanged.

## Reminder save confirmation

- In Settings → Farming notifications, see a persistent status panel reading Off or Saved with the selected time and delivery method.
- Change reminder time, repeat mode, interval or limit: panel changes to “Unsaved reminder changes” until Save reminders is pressed.
- Save browser reminders: a visible Saved indicator persists, including when no farming task is scheduled.
- Toggle reminders or phone push: preferences auto-save, and the panel reflects the updated state.
- With ntfy unreachable or blocked, the panel must say “Saved here · Phone sync failed” instead of claiming successful phone scheduling.
- After reloading, the panel describes settings actually stored on the device. Check both mobile and desktop widths.

## Paimon Spam Mode — Done for today

- Enable farming reminders and Paimon Spam Mode, with a character and weapon plan both active. Mark **Done for today** in one plan: all later browser reminders for that server day disappear, even if another plan has unfinished tasks.
- For Android ntfy, existing delayed messages for that day are cancelled immediately (when online). If sync was busy, a second pass is queued. Confirm next-day notifications remain scheduled.
- Undo completion: reminders may resume unless a second plan remains marked done. Free day / co-op does not automatically mark the session done.
- Restart the plan after finishing: the server-day pause still applies. After the next 4 AM reset, reminders can resume. A different selected game server has a separate daily pause.
- With multiple website tabs open, changes to the pause key should trigger re-sync in other tabs. When offline, queued ntfy phone messages cannot be guaranteed cancelled until connectivity is restored.
