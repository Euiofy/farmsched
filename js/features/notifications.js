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
    reminderPrefs = reminderNormalize({ enabled: $('reminder-enabled').checked, time: $('reminder-time').value, spam: $('reminder-spam').checked, push: $('reminder-push').checked, interval: $('reminder-interval').value, limit: $('reminder-limit').value });
    try {
        localStorage.setItem(REMINDER_KEY, JSON.stringify(reminderPrefs));
    }
    catch { }
};
const reminderTargets = function (key) {
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
    if (!p.enabled)
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
let ntfyBusy = false;
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
    if (ntfyBusy || (!active && !localStorage.getItem(NTFY_KEY)) || (!manual && Date.now() < ntfyPausedUntil))
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
    if (await reminderPermission()) {
        const options = { body: n.body, tag: 'teyvat-farm-' + n.id };
        try {
            const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
            if (reg && reg.active) {
                await reg.showNotification(n.title, options);
                return 'system';
            }
        }
        catch (e) {
            console.warn('Service worker notification unavailable', e);
        }
        try {
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
        await reminderShowWeb(n);
    }
    finally {
        browserSending = false;
    }
};
const nativeSync = function () { return reminderBrowserTick(); };
// Existing save/reset hook; no native dependency.
const reminderSave = async function () {
    reminderPersist();
    reminderUI();
    if (!reminderPrefs.enabled) {
        reminderStatus('Reminders are off.');
        void ntfySync();
        return;
    }
    if (reminderPrefs.push) {
        reminderStatus('Scheduling phone reminders…');
        const r = await ntfySync(true);
        const next = reminderNext();
        if (!r)
            reminderStatus('Still syncing the previous change. Try again in a moment.');
        else if (r.error)
            reminderStatus(ntfyReason(r.error));
        else if (!next)
            reminderStatus('Saved, but nothing is scheduled: reminders only fire when you have a started character or weapon plan with unfinished farming for the day.');
        else
            reminderStatus(`Saved. ${r.scheduled} phone reminder(s) scheduled; next: ${next}. ` + (r.pending ? 'The rest will be scheduled over the next few minutes while this site stays open.' : 'Open this site at least every 3 days.'));
        return;
    }
    const allowed = await reminderPermission(true);
    const next = reminderNext();
    const blocked = allowed ? '' : ' System notifications are unavailable or blocked here, so you will only get an in-page alert while this tab is open and visible.';
    reminderStatus((next ? `Saved. Next reminder: ${next}. Keep this website open.` : 'Saved, but nothing is scheduled: reminders only fire when you have a started character or weapon plan with unfinished farming for the day.') + blocked);
    await reminderBrowserTick();
};
const reminderInit = function () {
    reminderReady = true;
    if ('serviceWorker' in navigator && window.isSecureContext)
        navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker not registered', e));
    reminderUI();
    if (reminderPrefs.enabled)
        reminderStatus('Reminders are saved on this device. Keep this website open.');
    $('reminder-enabled').addEventListener('change', () => {
        reminderOptions();
        void reminderSave();
    });
    $('reminder-spam').addEventListener('change', reminderOptions);
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
    window.addEventListener('storage', e => { if (e.key === REMINDER_KEY) {
        reminderPrefs = reminderRead();
        reminderUI();
    } });
    setInterval(reminderBrowserTick, 15000);
    setInterval(() => void ntfySync(), 60000);
    void reminderBrowserTick();
    void ntfySync();
};
