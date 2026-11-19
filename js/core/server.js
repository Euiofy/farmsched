// Teyvat Companion | core / server
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const serverName = function (region = state.region) { return SERVER_NAMES[region] || 'Asia'; };
const cleanServerActivity = function (raw) {
    const out = {};
    if (!raw || typeof raw !== 'object')
        return out;
    for (const region of Object.keys(OFFSETS)) {
        const a = raw[region];
        if (!a || typeof a !== 'object')
            continue;
        const r = cleanCoach(a);
        const pd = a.plannerDone;
        out[region] = {
            done: r.done, dayDone: r.dayDone, skipped: r.skipped, preferred: r.preferred, plannerDone: pd && typeof pd === 'object' && !Array.isArray(pd) ? Object.fromEntries(Object.entries(pd).filter(([d, v]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && Array.isArray(v)).slice(-70).map(([d, v]) => [d, v.slice(0, 130).map(String)])) : {}
        };
    }
    return out;
};
const clearOtherServerPlanHistory = function () { for (const a of Object.values(state.serverActivity)) {
    a.done = {};
    a.dayDone = {};
    a.skipped = {};
    a.preferred = {};
} };
const changeServer = function (region) {
    if (!Object.prototype.hasOwnProperty.call(OFFSETS, region) || region === state.region)
        return;
    const r = state.roadmap;
    state.serverActivity[state.region] = { done: r.done, dayDone: r.dayDone, skipped: r.skipped, preferred: r.preferred, plannerDone: state.planner.done };
    const a = state.serverActivity[region] || {};
    r.done = a.done || {};
    r.dayDone = a.dayDone || {};
    r.skipped = a.skipped || {};
    r.preferred = a.preferred || {};
    state.planner.done = a.plannerDone || {};
    delete state.serverActivity[region];
    state.region = region;
    $('region').value = region;
    materialView.day = null;
    plannerDate = dayKey();
    priorGameDay = dayKey();
    ensureResets();
    save();
    renderAll();
    toast(`${serverName()} server selected · ${parseKey(dayKey()).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })} farming day. Schedule updated.`);
};
const serverShift = function (now = Date.now(), region = state.region) { return now + OFFSETS[region] * 3600000 - 4 * 3600000; };
let dayKey = function (now = Date.now(), region = state.region) { return new Date(serverShift(now, region)).toISOString().slice(0, 10); };
let weekKey = function () {
    const date = new Date(serverShift());
    const dow = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - ((dow + 6) % 7));
    return date.toISOString().slice(0, 10);
};
const nextDaily = function () {
    const shifted = serverShift();
    return (Math.floor(shifted / DAY) + 1) * DAY - OFFSETS[state.region] * 3600000 + 4 * 3600000;
};
const nextWeekly = function () {
    const shifted = serverShift();
    const dow = new Date(shifted).getUTCDay();
    const add = dow === 0 ? 1 : 8 - dow;
    return Math.floor(shifted / DAY) * DAY + add * DAY - OFFSETS[state.region] * 3600000 + 4 * 3600000;
};
const ensureResets = function () {
    let changed = false;
    const dk = dayKey(), wk = weekKey();
    if (state.check.dayKey !== dk) {
        state.check.daily = {};
        state.check.dayKey = dk;
        changed = true;
    }
    if (state.check.weekKey !== wk) {
        state.check.weekly = {};
        state.check.weekKey = wk;
        changed = true;
    }
    if (changed)
        save();
    return changed;
};
const duration = function (ms, compact = false) {
    if (ms <= 0)
        return compact ? 'Ready' : 'Full';
    const min = Math.ceil(ms / 60000);
    const h = Math.floor(min / 60), m = min % 60;
    return h ? `${h}h${m ? ' ' + m + 'm' : ''}` : `${m}m`;
};
const detailedTimer = function (ms) {
    if (ms <= 0)
        return 'Full';
    const sec = Math.ceil(ms / 1000);
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s).padStart(2, '0')}s`;
};
const resolveName = function (input) {
    const value = String(input || '').trim().replace(/\s+/g, ' ');
    if (!value)
        return '';
    const a = Object.keys(CHARACTER_BOOK).find(k => k.toLowerCase() === value.toLowerCase());
    if (a)
        return a;
    return KEY_ALIASES[value] || Object.entries(KEY_ALIASES).find(([k]) => k.toLowerCase() === value.toLowerCase())?.[1] || value;
};
// Bind controls / initialize this section in original startup order.
const initializeServerSection30 = () => {
    $('region').addEventListener('change', e => changeServer(e.target.value));
};
