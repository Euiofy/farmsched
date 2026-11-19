// Teyvat Companion | core / storage
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
let fresh = function () { return {
    region: 'Asia', serverActivity: {}, resin: { amount: 0, at: Date.now(), synced: false }, wish: { primos: 0, fates: 0, pity: 0, goal: 90, target: '', guaranteed: false }, check: { dayKey: '', weekKey: '', daily: {}, weekly: {}, customDaily: [], customWeekly: [] }, farm: [], planner: { characters: [], teams: [], activeTeamId: '', done: {} }, roadmap: COACH_DEFAULT(), weaponJourney: cleanWeaponJourney(null)
}; };
const normalize = function (raw) {
    const s = fresh();
    if (!raw || typeof raw !== 'object')
        return s;
    s.region = Object.prototype.hasOwnProperty.call(OFFSETS, raw.region) ? raw.region : 'Asia';
    if (raw.resin && typeof raw.resin === 'object')
        s.resin = { amount: number(raw.resin.amount, 0, 200), at: clamp(Number(raw.resin.at) || Date.now(), 1, Date.now() + DAY), synced: raw.resin.synced === true };
    if (raw.wish && typeof raw.wish === 'object')
        s.wish = {
            primos: number(raw.wish.primos), fates: number(raw.wish.fates), pity: number(raw.wish.pity, 0, 89), goal: number(raw.wish.goal, 1, 10000), target: String(raw.wish.target || '').slice(0, 70), guaranteed: raw.wish.guaranteed === true
        };
    const c = raw.check;
    if (c && typeof c === 'object') {
        s.check.dayKey = String(c.dayKey || '');
        s.check.weekKey = String(c.weekKey || '');
        s.check.daily = (c.daily && typeof c.daily === 'object' && !Array.isArray(c.daily)) ? c.daily : {};
        s.check.weekly = (c.weekly && typeof c.weekly === 'object' && !Array.isArray(c.weekly)) ? c.weekly : {};
        for (const [from, to] of [['customDaily', 'customDaily'], ['customWeekly', 'customWeekly']])
            if (Array.isArray(c[from]))
                s.check[to] = c[from].slice(0, 80).filter(t => t && typeof t.id === 'string' && typeof t.name === 'string').map(t => ({ id: t.id.slice(0, 60), name: t.name.slice(0, 90) }));
    }
    if (Array.isArray(raw.farm))
        s.farm = raw.farm.slice(0, 200).filter(f => f && typeof f === 'object').map(f => ({
            id: String(f.id || '').slice(0, 60), character: String(f.character || '').slice(0, 65), material: String(f.material || '').slice(0, 75), itemId: String(f.itemId || '').slice(0, 100), owned: number(f.owned, 0, 999999), target: number(f.target, 1, 999999), days: ['any', 'mon', 'tue', 'wed'].includes(f.days) ? f.days : 'any'
        })).filter(f => f.id && f.character && f.material);
    const q = raw.planner;
    if (q && typeof q === 'object') {
        if (Array.isArray(q.characters))
            s.planner.characters = q.characters.slice(0, 130).filter(x => x && typeof x.name === 'string' && x.name.trim()).map(x => ({
                name: String(x.name).slice(0, 75), priority: ['high', 'medium', 'low'].includes(x.priority) ? x.priority : 'medium', focus: ['auto', 'n', 's', 'b'].includes(x.focus) ? x.focus : 'auto',
                talents: Object.fromEntries(['n', 's', 'b'].map(k => [k, number(x.talents?.[k] ?? 1, 1, 10)])),
                target: Object.fromEntries(['n', 's', 'b'].map(k => [k, number(x.target?.[k] ?? 8, 1, 10)])),
                book: CHARACTER_BOOK[resolveName(x.name)] || (Object.prototype.hasOwnProperty.call(BOOKS, x.book) ? x.book : '')
            }));
        if (Array.isArray(q.teams))
            s.planner.teams = q.teams.slice(0, 35).filter(x => x && Array.isArray(x.members)).map(x => ({ id: String(x.id || '').slice(0, 50), name: String(x.name || 'My team').slice(0, 70), members: x.members.slice(0, 4).map(y => String(y || '').slice(0, 75)) }));
        s.planner.activeTeamId = String(q.activeTeamId || '').slice(0, 50);
        if (q.done && typeof q.done === 'object' && !Array.isArray(q.done)) {
            s.planner.done = Object.fromEntries(Object.entries(q.done).slice(-70).filter(([key, value]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(value)).map(([key, value]) => [key, value.slice(0, 130).map(String)]));
        }
    }
    s.roadmap = cleanCoach(raw.roadmap);
    s.weaponJourney = cleanWeaponJourney(raw.weaponJourney);
    s.serverActivity = cleanServerActivity(raw.serverActivity);
    delete s.serverActivity[s.region];
    return s;
};
// Bind controls / initialize this section in original startup order.
const initializeStorageSection3 = () => {
    try {
        state = normalize(JSON.parse(localStorage.getItem(STORAGE)));
    }
    catch {
        state = fresh();
    }
};
const save = function () {
    try {
        localStorage.setItem(STORAGE, JSON.stringify(state));
    }
    catch { }
    queueNativeSync();
};
