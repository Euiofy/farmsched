// Teyvat Companion | features / notifications
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const reminderNormalize = function (raw) {
    const r = raw || {};
    return {
        enabled: r.enabled === true, time: /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(r.time || '') ? r.time : '18:00', spam: r.spam === true, push: r.push === true, interval: [15, 30, 60, 120].includes(+r.interval) ? +r.interval : 60, limit: [3, 5, 10].includes(+r.limit) ? +r.limit : 3
    };
};
const reminderRead = function () { try {
    return reminderNormalize(JSON.parse(localStorage.getItem(REMINDER_KEY)));
}
catch {
    return reminderNormalize(null);
} };
// A persistent summary makes it obvious whether preferences are saved, changed,
// or need attention. This is not a promise that the phone received a push.
let reminderFeedbackVersion = 0;
const reminderTimeLabel = function (time) {
    const [hour, minute] = time.split(':').map(Number);
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
const reminderFormPrefs = function () {
    return reminderNormalize({ enabled: $('reminder-enabled').checked, time: $('reminder-time').value, spam: $('reminder-spam').checked, push: $('reminder-push').checked, interval: $('reminder-interval').value, limit: $('reminder-limit').value });
};
const reminderDescription = function (prefs) {
    if (!prefs.enabled)
        return 'Reminders are disabled on this device.';
    const method = prefs.push ? 'Phone push via ntfy' : 'Browser alerts';
    const repeat = prefs.spam ? ` · Repeat every ${prefs.interval} min (up to ${prefs.limit} follow-ups)` : '';
    return `Daily at ${reminderTimeLabel(prefs.time)} · ${method}${repeat}`;
};
const reminderFeedbackSet = function (stateName, title, detail, badge) {
    $('reminder-feedback-symbol').textContent = { off: '–', saved: '✓', unsaved: '✎', saving: '…', warning: '!' }[stateName] || '✓';
    $('reminder-feedback').dataset.state = stateName;
    $('reminder-feedback-title').textContent = title;
    $('reminder-feedback-detail').textContent = detail;
    $('reminder-feedback-badge').textContent = badge;
};
const reminderFeedbackSaved = function () {
    const enabled = reminderPrefs.enabled, quiet = enabled && reminderDayQuiet(dayKey());
    reminderFeedbackSet(enabled ? 'saved' : 'off', !enabled ? 'Reminders are off' : quiet ? 'Farming finished · Paimon is quiet' : 'Reminder preferences saved', quiet ? `No more farming reminders today. They resume after the ${serverName()} server reset.` : reminderDescription(reminderPrefs), !enabled ? 'Off' : quiet ? 'Paused today' : 'Saved');
    $('reminder-save').textContent = 'Save reminders';
};
const reminderFeedbackDirty = function () {
    if (!reminderReady)
        return;
    reminderFeedbackVersion++;
    const pending = reminderFormPrefs();
    if (JSON.stringify(pending) === JSON.stringify(reminderPrefs)) {
        reminderFeedbackSaved();
        return;
    }
    reminderFeedbackSet('unsaved', 'Unsaved reminder changes', 'Press Save reminders to apply: ' + reminderDescription(pending), 'Not saved');
    reminderStatus('Your latest reminder changes have not been saved yet.');
    $('reminder-save').textContent = 'Save changes';
};
const reminderStatus = function (text) { $('reminder-status').textContent = text; };
const reminderOptions = function () {
    $('reminder-options').hidden = !$('reminder-enabled').checked;
    $('reminder-spam-options').hidden = !$('reminder-spam').checked;
    const push = $('reminder-push').checked;
    $('reminder-push-options').hidden = !push;
    if (push) {
        const topic = ntfyRead().topic;
        $('reminder-push-topic').textContent = topic;
        $('reminder-push-open').href = 'ntfy://ntfy.sh/' + topic;
    }
};
const reminderUI = function () {
    const p = reminderPrefs;
    $('reminder-enabled').checked = p.enabled;
    $('reminder-time').value = p.time;
    $('reminder-spam').checked = p.spam;
    $('reminder-push').checked = p.push;
    $('reminder-interval').value = String(p.interval);
    $('reminder-limit').value = String(p.limit);
    reminderOptions();
    $('reminder-platform-note').textContent = 'Keep this website open for reminders. System notifications depend on browser permissions; in-page alerts are the fallback. Background tabs may delay reminders.';
};
const reminderPersist = function () {
    const next = reminderFormPrefs();
    try {
        localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
        reminderPrefs = next;
        return true;
    }
    catch {
        return false;
    }
};
// A completed session quiets *all* Paimon reminders for this server day,
// even when the other farming plan has unfinished material targets.
// Store the pause separately from the plans, so restarting a plan cannot
// unexpectedly bring today's already-cancelled reminders back.
const REMINDER_QUIET_KEY = 'teyvat-farming-reminder-quiet-days-v1';
const reminderQuietRead = function () {
    try {
        const raw = JSON.parse(localStorage.getItem(REMINDER_QUIET_KEY));
        return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    }
    catch { return {}; }
};
const reminderQuietToken = (key, region = state.region) => `${region}:${key}`;
const reminderDayQuiet = function (key, region = state.region) {
    if (reminderQuietRead()[reminderQuietToken(key, region)] === true)
        return true;
    if (region !== state.region)
        return false;
    return !!state.roadmap.dayDone?.[key] || state.weaponJourney.activity?.[region]?.[key] === 'done';
};
const reminderQuietWrite = function (key, quiet) {
    const days = reminderQuietRead(), token = reminderQuietToken(key);
    if (quiet) days[token] = true;
    else delete days[token];
    // Retain only recent dates. The next game day is never muted by yesterday.
    const recent = Object.fromEntries(Object.entries(days).filter(([k, v]) =>
        v === true && /^.+:\d{4}-\d{2}-\d{2}$/.test(k) && k.slice(-10) >= advanceKey(key, -14)));
    try { localStorage.setItem(REMINDER_QUIET_KEY, JSON.stringify(recent)); }
    catch { /* Persisted dayDone/activity still suppresses existing plans. */ }
};
const reminderFinishToday = function () {
    const key = dayKey();
    reminderQuietWrite(key, true);
    // Run immediately: ntfy's future messages must be cancelled, not just
    // omitted from the next once-a-minute planning pass.
    void ntfySync(true).then(r => {
        if (r?.error) {
            reminderFeedbackSet('warning', 'Farming done · Phone cancellation failed', 'Browser alerts are stopped, but previously queued phone pushes may still arrive. Retry syncing in Settings.', 'Check sync');
            reminderStatus('Today is quiet in the browser. Phone reminder cancellation needs an internet connection; retry from Settings. ' + ntfyReason(r.error));
        }
    });
    if (reminderReady && $('reminder-feedback').dataset.state !== 'unsaved')
        reminderFeedbackSaved();
};
const reminderResumeIfUndone = function () {
    const key = dayKey();
    if (state.roadmap.dayDone?.[key] || state.weaponJourney.activity?.[state.region]?.[key] === 'done')
        return; // The other farming plan is still marked done.
    reminderQuietWrite(key, false);
    void ntfySync(true);
    if (reminderReady && $('reminder-feedback').dataset.state !== 'unsaved')
        reminderFeedbackSaved();
};
const reminderTargets = function (key) {
    if (reminderDayQuiet(key)) return [];
    const result = [];
    const r = state.roadmap;
    if (r.started && key >= coachPlanStart() && key < advanceKey(coachPlanStart(), r.weeks * 7)) {
        const g = coachActive(key).top;
        if (g)
            result.push(g.kind === 'books' ? `${g.character || g.characters?.join(' & ') || 'Character'} — ${g.book} books` : (g.character ? `${g.character} — ${g.name}` : g.name));
    }
    const w = state.weaponJourney, choice = weaponPlanChoice(key);
    if (choice && !w.activity?.[state.region]?.[key])
        result.push(`${choice.name} — ${choice.series}`);
    return result.filter(Boolean);
};
const reminderSlots = function (key, p = reminderPrefs) {
    if (!p.enabled || reminderDayQuiet(key))
        return [];
    const targets = reminderTargets(key);
    if (!targets.length)
        return [];
    const [h, m] = p.time.split(':').map(Number);
    const start = Date.parse(key + 'T00:00:00Z') - OFFSETS[state.region] * 3600000 + 4 * 3600000, end = start + DAY;
    const d = new Date(start);
    d.setHours(h, m, 0, 0);
    if (+d < start) {
        d.setDate(d.getDate() + 1);
        d.setHours(h, m, 0, 0);
    }
    const rows = [];
    for (let i = 0; i <= (p.spam ? p.limit : 0); i++) {
        const at = +d + i * p.interval * 60000;
        if (at < start || at >= end)
            continue;
        rows.push({
            id: `${state.region}:${key}:${i}`, at, day: key, index: i, title: i === 0 ? 'Time to farm, Traveler!' : i === 1 ? "YOU DIDN'T DO YOUR FARMING YET!!" : 'PAIMON IS GETTING IMPATIENT!!', body: (i === 0 ? 'Today’s farming: ' : i === 1 ? 'Paimon is waiting! ' : 'Those materials won’t farm themselves! ') + targets.join(' • ')
        });
    }
    return rows;
};
// Phone push through ntfy.sh. Each upcoming reminder is handed to ntfy as a delayed message
// (ntfy allows up to 3 days ahead), so the phone's ntfy app delivers it even if this site is closed.
// Messages carry a sequence ID so they can be cancelled when plans change or farming is finished.
const NTFY_KEY = 'teyvat-farming-ntfy-v1', NTFY_BASE = 'https://ntfy.sh/';
let ntfyBusy = false, ntfyResyncQueued = false;
const ntfyWrite = function (d) { try {
    localStorage.setItem(NTFY_KEY, JSON.stringify(d));
}
catch { } };
const ntfyRead = function () {
    let d = null;
    try {
        d = JSON.parse(localStorage.getItem(NTFY_KEY));
    }
    catch { }
    d = d && typeof d === 'object' ? d : {};
    d.sent = d.sent && typeof d.sent === 'object' ? d.sent : {};
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(d.topic || '')) {
        d.topic = 'teyvat-' + Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, '0')).join('');
        ntfyWrite(d);
    }
    return d;
};
const ntfyFail = res => Object.assign(new Error('ntfy ' + res.status), { status: res.status });
const ntfyReason = function (e) {
    const status = e && e.status;
    if (status === 429)
        return 'ntfy.sh is rate-limiting this device (too many requests). Wait a few minutes, then try again.';
    if (status)
        return `ntfy.sh rejected the request (HTTP ${status}).`;
    return 'Could not connect to ntfy.sh. Check your internet and turn off any VPN, private DNS or ad blocker that might block it.';
};
const ntfyPublish = async function (topic, seq, n, at) {
    const headers = { Title: n.title.replace(/[^\x20-\x7E]/g, ''), Priority: 'high' };
    if (at)
        headers.Delay = String(Math.floor(at / 1000));
    if (/^https?:$/.test(location.protocol))
        headers.Click = location.origin + location.pathname;
    const res = await fetch(NTFY_BASE + topic + (seq ? '/' + seq : ''), { method: 'POST', headers, body: n.body });
    if (!res.ok)
        throw ntfyFail(res);
};
const ntfyCancel = async function (topic, seq) {
    const res = await fetch(NTFY_BASE + topic + '/' + seq, { method: 'DELETE' });
    if (!res.ok && res.status !== 404)
        throw ntfyFail(res);
};
let ntfyPausedUntil = 0;
const ntfySync = async function (manual) {
    const active = reminderPrefs.enabled && reminderPrefs.push;
    if (ntfyBusy) {
        // Done/Undo can happen while another sync is publishing messages.
        // Replay a fresh sync afterwards so stale queued notifications get cancelled.
        if (manual) ntfyResyncQueued = true;
        return;
    }
    if ((!active && !localStorage.getItem(NTFY_KEY)) || (!manual && Date.now() < ntfyPausedUntil))
        return;
    ntfyBusy = true;
    const d = ntfyRead(), now = Date.now(), want = {};
    let error = null, calls = 0, pending = false;
    try {
        if (active)
            for (let i = 0; i < 4; i++)
                for (const n of reminderSlots(dayKey(now + i * DAY)))
                    if (n.at > now && n.at < now + 71 * 3600000)
                        want['teyvat-' + n.id.replace(/[^A-Za-z0-9]/g, '-')] = n;
        for (const [seq, s] of Object.entries(d.sent)) {
            const w = want[seq];
            if (w && w.at === s.at && w.body === s.body)
                continue;
            if (s.at <= now) {
                delete d.sent[seq];
                continue;
            }
            if (calls >= 20) {
                pending = true;
                continue;
            }
            calls++;
            await ntfyCancel(d.topic, seq);
            delete d.sent[seq];
        }
        for (const [seq, n] of Object.entries(want)) {
            // A player might finish farming while an older network request
            // is still resolving. Never queue *additional* spam for a quiet day.
            if (n.day && reminderDayQuiet(n.day))
                continue;
            if (d.sent[seq] || n.at < now + 15000)
                continue;
            if (calls >= 20) {
                pending = true;
                break;
            }
            calls++;
            await ntfyPublish(d.topic, seq, n, n.at);
            d.sent[seq] = { at: n.at, body: n.body };
        }
    }
    catch (e) {
        error = e;
        ntfyPausedUntil = Date.now() + 5 * 60000;
    }
    finally {
        ntfyWrite(d);
        ntfyBusy = false;
        if (ntfyResyncQueued) {
            ntfyResyncQueued = false;
            queueMicrotask(() => { void ntfySync(true); });
        }
    }
    return { error, pending, scheduled: Object.values(d.sent).filter(s => s.at > now).length };
};
const reminderPermission = async function (request = false) {
    if (!('Notification' in window) || !window.isSecureContext)
        return false;
    try {
        return (request && Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission) === 'granted';
    }
    catch {
        return false;
    }
};
const reminderShowWeb = async function (n) {
    // A permission prompt can take long enough for the player to finish today.
    if (n.day && reminderDayQuiet(n.day)) return 'suppressed';
    if (await reminderPermission()) {
        if (n.day && reminderDayQuiet(n.day)) return 'suppressed';
        const options = { body: n.body, tag: 'teyvat-farm-' + n.id };
        try {
            const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
            if (reg && reg.active) {
                if (n.day && reminderDayQuiet(n.day)) return 'suppressed';
                await reg.showNotification(n.title, options);
                return 'system';
            }
        }
        catch (e) {
            console.warn('Service worker notification unavailable', e);
        }
        try {
            if (n.day && reminderDayQuiet(n.day)) return 'suppressed';
            const note = new Notification(n.title, options);
            note.onclick = () => {
                window.focus();
                page('roadmap');
                note.close();
            };
            return 'system';
        }
        catch (e) {
            console.warn('Browser system notification unavailable', e);
        }
    }
    if (n.day && reminderDayQuiet(n.day)) return 'suppressed';
    toast(n.title + ' ' + n.body);
    return 'in-page';
};
// Describes the next reminder (or why there is none) so Save never reports success silently.
const reminderNext = function () {
    const now = Date.now();
    for (let i = 0; i < 2; i++) {
        const row = reminderSlots(dayKey(now + i * DAY)).find(n => n.at > now - 5 * 60000);
        if (row)
            return new Date(row.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    }
    return '';
};
const reminderBrowserTick = async function () {
    if (!reminderReady || !reminderPrefs.enabled || reminderPrefs.push || browserSending)
        return;
    const now = Date.now(), rows = reminderSlots(dayKey(now)).filter(n => n.at <= now && n.at > now - 5 * 60000);
    const n = rows.at(-1);
    if (!n)
        return;
    browserSending = true;
    try {
        let sent = {};
        try {
            sent = JSON.parse(localStorage.getItem(REMINDER_SENT_KEY) || '{}') || {};
        }
        catch { }
        if (sent[n.id])
            return;
        sent = Object.fromEntries(Object.entries(sent).filter(([, t]) => now - t < 7 * DAY));
        // A delayed tab should not replay a stack of missed notifications.
        for (const row of rows)
            sent[row.id] = now;
        try {
            localStorage.setItem(REMINDER_SENT_KEY, JSON.stringify(sent));
        }
        catch { }
        if (!reminderDayQuiet(n.day))
            await reminderShowWeb(n);
    }
    finally {
        browserSending = false;
    }
};
const nativeSync = function () { return reminderBrowserTick(); };
// Existing save/reset hook; no native dependency.
const reminderSave = async function () {
    const version = ++reminderFeedbackVersion;
    const intended = reminderFormPrefs();
    reminderFeedbackSet('saving', 'Saving reminder settings…', reminderDescription(intended), 'Saving');
    $('reminder-save').textContent = 'Saving…';
    if (!reminderPersist()) {
        if (version === reminderFeedbackVersion) {
            reminderFeedbackSet('warning', 'Could not save reminder settings', 'Local storage is unavailable. These changes may be lost after closing this tab.', 'Not saved');
            $('reminder-save').textContent = 'Retry save';
            reminderStatus('Browser storage is unavailable. Check private browsing or storage permissions.');
        }
        return;
    }
    reminderUI();
    if (!reminderPrefs.enabled) {
        const r = await ntfySync(true);
        if (version !== reminderFeedbackVersion) return;
        if (r?.error) {
            reminderFeedbackSet('warning', 'Reminders off locally · Phone sync failed', 'Old phone notifications may still be queued. Try saving again when connected.', 'Check setup');
            reminderStatus(ntfyReason(r.error));
        }
        else if (!r && localStorage.getItem(NTFY_KEY)) {
            reminderFeedbackSet('saving', 'Reminders off locally · Phone update pending', 'Previous phone notifications may still be queued. Try Save again shortly.', 'Pending');
            reminderStatus('Waiting for a previous phone reminder sync to finish.');
        }
        else {
            reminderFeedbackSaved();
            reminderStatus('Your reminders are turned off.');
            toast('Reminders turned off');
        }
        return;
    }
    if (reminderPrefs.push) {
        reminderStatus('Updating phone reminder schedule…');
        const r = await ntfySync(true);
        if (version !== reminderFeedbackVersion) return;
        const next = reminderNext();
        if (!r) {
            reminderFeedbackSet('saving', 'Preferences saved · Phone update pending', reminderDescription(reminderPrefs), 'Pending');
            reminderStatus('Another phone sync is still running. Try Save again shortly.');
        }
        else if (r.error) {
            reminderFeedbackSet('warning', 'Saved here · Phone sync failed', reminderDescription(reminderPrefs), 'Check setup');
            reminderStatus(ntfyReason(r.error));
        }
        else {
            if (reminderDayQuiet(dayKey())) reminderFeedbackSaved();
            else reminderFeedbackSet('saved', 'Phone reminder preferences updated', reminderDescription(reminderPrefs), 'Saved');
            reminderStatus(!next ? 'Saved, but no upcoming farming task is scheduled yet.' : `${r.scheduled} phone reminder(s) accepted for scheduling; next: ${next}. ` + (r.pending ? 'Other reminders remain pending; keep this site open to finish syncing.' : 'Open this site at least every 3 days to keep scheduling ahead.'));
            toast('Reminder settings saved');
        }
        $('reminder-save').textContent = 'Save reminders';
        return;
    }
    const allowed = await reminderPermission(true);
    if (version !== reminderFeedbackVersion) return;
    const next = reminderNext();
    if (reminderDayQuiet(dayKey()))
        reminderFeedbackSaved();
    else
        reminderFeedbackSet('saved', allowed ? 'Reminder settings saved' : 'Saved · Browser alerts only', reminderDescription(reminderPrefs), 'Saved');
    reminderStatus((next ? `Next reminder: ${next}. Keep this website open.` : 'No upcoming farming task is scheduled yet.') + (allowed ? '' : ' System notifications are unavailable or blocked; in-page alerts require this tab to be open and visible.'));
    $('reminder-save').textContent = 'Save reminders';
    toast('Reminder settings saved');
    await reminderBrowserTick();
};
const reminderInit = function () {
    reminderReady = true;
    if ('serviceWorker' in navigator && window.isSecureContext)
        navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker not registered', e));
    reminderUI();
    reminderFeedbackSaved();
    if (reminderPrefs.enabled)
        reminderStatus('These preferences are stored on this device. Phone push delivery depends on ntfy setup; browser alerts require this site to be open.');
    $('reminder-enabled').addEventListener('change', () => {
        reminderOptions();
        void reminderSave();
    });
    $('reminder-spam').addEventListener('change', () => { reminderOptions(); reminderFeedbackDirty(); });
    for (const id of ['reminder-time', 'reminder-interval', 'reminder-limit']) {
        $(id).addEventListener('input', reminderFeedbackDirty);
        $(id).addEventListener('change', reminderFeedbackDirty);
    }
    $('reminder-push').addEventListener('change', () => {
        reminderOptions();
        void reminderSave();
    });
    $('reminder-push-copy').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(ntfyRead().topic);
            reminderStatus('Topic copied.');
        }
        catch {
            reminderStatus('Copy failed. Select the topic text and copy it manually.');
        }
    });
    $('reminder-save').addEventListener('click', () => void reminderSave());
    $('reminder-test').addEventListener('click', async () => {
        if ($('reminder-push').checked) {
            try {
                await ntfyPublish(ntfyRead().topic, '', { title: 'Time to farm, Traveler!', body: 'Paimon is testing your farming notifications.' }, 0);
                reminderStatus('ntfy.sh accepted the test message. If your phone shows nothing, the problem is on the phone side (subscription, notification permission or battery settings).');
            }
            catch (e) {
                reminderStatus(ntfyReason(e));
            }
            return;
        }
        await reminderPermission(true);
        const mode = await reminderShowWeb({ id: 'test', title: 'Time to farm, Traveler!', body: 'Paimon is testing your farming notifications.' });
        reminderStatus(mode === 'system' ? 'Test notification sent.' : 'Test shown as an in-page alert.');
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) {
        void reminderBrowserTick();
        void ntfySync();
    } });
    window.addEventListener('online', () => { void ntfySync(true); });
    window.addEventListener('storage', e => {
        if (e.key === REMINDER_QUIET_KEY) {
            // Keep another open tab from re-queueing already cancelled spam.
            if ($('reminder-feedback').dataset.state !== 'unsaved') reminderFeedbackSaved();
            void ntfySync(true);
        }
        if (e.key === REMINDER_KEY) {
        reminderFeedbackVersion++;
        reminderPrefs = reminderRead();
        reminderUI();
        reminderFeedbackSaved();
    } });
    setInterval(reminderBrowserTick, 15000);
    setInterval(() => void ntfySync(), 60000);
    void reminderBrowserTick();
    void ntfySync();
};
