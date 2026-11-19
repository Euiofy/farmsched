// Teyvat Companion | data / characters
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const characterPortraitRarity = function (name) { return name === 'Aloy' ? 'collab' : (CHARACTER_RARITY[name] || ''); };
const elementIconHtml = function (element) {
    if (!ELEMENT_ICON_KNOWN[element])
        return `<span class="picker-element-glyph picker-element-glyph-all" aria-hidden="true">✦</span>`;
    return `<span class="picker-element-art" role="img" aria-label="${element} element"><span class="picker-element-glyph" aria-hidden="true">${PICKER_ELEMENT_MARKS[element]}</span><img class="picker-element-icon" src="${ELEMENT_ICON_ROOT}${ELEMENT_ICON_KNOWN[element]}.png" data-element-icon="${element}" data-element-stage="0" alt="" loading="eager" decoding="async" referrerpolicy="no-referrer"></span>`;
};
const pickerSlug = function (name) { return PICKER_SLUG_OVERRIDES[name] || name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-'); };
const officialAvatarKey = function (name) { return OFFICIAL_AVATAR_KEYS[name] || name.replace(/[^a-zA-Z0-9]/g, ''); };
const portraitCandidates = function (name) {
    const key = encodeURIComponent(officialAvatarKey(name));
    const base = 'UI_AvatarIcon_' + key;
    return [
        ENKA_GAME_ICON_ROOT + base + '.png',
        ENKA_GAME_ICON_ROOT + base + '_Circle.png',
        HOYO_GAME_ICON_ROOT + base + '.png',
        GENSHIN_ASSET_MIRROR + base + '.png',
        'https://genshin.jmp.blue/characters/' + encodeURIComponent(pickerSlug(name)) + '/icon-big'
    ];
};
const pickPortrait = function (name) { return portraitCandidates(name)[0]; };
const coachAvatarHtml = function (name) { return `<span class="coach-today-avatar" data-character-rarity="${characterPortraitRarity(name)}"><span class="picker-initials">${esc(pickInitials(name))}</span><img src="${esc(pickPortrait(name))}" loading="lazy" decoding="async" alt="Official in-game portrait of ${esc(name)}" data-portrait-name="${esc(name)}" data-portrait-stage="0"></span>`; };
const pickInitials = function (name) { return name.split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase(); };
const pickerPortraitHtml = function (name) {
    const element = CHARACTER_ELEMENT[name] || 'Geo';
    return `<div class="picker-portrait" data-character-rarity="${characterPortraitRarity(name)}" style="--element-color:${PICKER_ELEMENT_COLORS[element]}"><span class="picker-initials">${esc(pickInitials(name))}</span><img src="${esc(pickPortrait(name))}" loading="lazy" decoding="async" alt="Official in-game portrait of ${esc(name)}" data-portrait-name="${esc(name)}" data-portrait-stage="0"><span class="picker-element-mark" style="--element-color:${PICKER_ELEMENT_COLORS[element]}" title="${element}" aria-label="${element}">${elementIconHtml(element)}</span></div>`;
};
const COACH_DEFAULT = function () { return { weeks: 4, started: '', startedAt: 0, budget: 160, trackMaterials: false, people: [], stock: {}, extras: [], done: {}, dayDone: {}, skipped: {}, preferred: {}, excludedBooks: [] }; };
const cleanCoach = function (raw) {
    const s = COACH_DEFAULT();
    if (!raw || typeof raw !== 'object')
        return s;
    s.weeks = raw.weeks === 3 ? 3 : 4;
    s.started = /^\d{4}-\d{2}-\d{2}$/.test(raw.started || '') ? raw.started : '';
    s.startedAt = Number.isFinite(raw.startedAt) && raw.startedAt > 0 && raw.startedAt <= Date.now() ? raw.startedAt : 0;
    s.budget = number(raw.budget ?? 160, 20, 200);
    s.trackMaterials = raw.trackMaterials === true;
    if (Array.isArray(raw.excludedBooks))
        s.excludedBooks = [...new Set(raw.excludedBooks.filter(k => typeof k === 'string' && /^[\w \-]+:(Teachings|Guide|Philosophies)$/.test(k) && Object.prototype.hasOwnProperty.call(BOOKS, k.split(':')[0])))].slice(0, 150);
    if (Array.isArray(raw.people))
        s.people = Array.from(new Set(raw.people.map(x => resolveName(String(x || '').slice(0, 75))).filter(Boolean))).slice(0, 3);
    if (raw.stock && typeof raw.stock === 'object' && !Array.isArray(raw.stock))
        s.stock = Object.fromEntries(Object.entries(raw.stock).filter(([k]) => /^[\w \-]+:(Teachings|Guide|Philosophies)$/.test(k)).slice(0, 150).map(([k, v]) => [k, number(v, 0, 999999)]));
    if (Array.isArray(raw.extras))
        s.extras = raw.extras.slice(0, 75).filter(x => x && typeof x === 'object').map(x => ({
            id: String(x.id || '').slice(0, 50), character: String(x.character || '').slice(0, 75), name: String(x.name || '').slice(0, 70), itemId: String(x.itemId || '').slice(0, 100), category: ['talent', 'boss', 'local', 'weekly', 'weapon', 'artifact', 'mora', 'enemy', 'other'].includes(x.category) ? x.category : 'other', need: number(x.need, 1, 999999), owned: number(x.owned, 0, 999999), day: ['any', 'mon', 'tue', 'wed', 'weekly'].includes(x.day) ? x.day : 'any', resin: number(x.resin ?? 0, 0, 200), where: String(x.where || '').slice(0, 100)
        })).filter(x => x.id && x.name && x.character);
    if (raw.preferred && typeof raw.preferred === 'object' && !Array.isArray(raw.preferred))
        s.preferred = Object.fromEntries(Object.entries(raw.preferred).filter(([d, id]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && typeof id === 'string').slice(-100));
    for (const key of ['done', 'skipped'])
        if (raw[key] && typeof raw[key] === 'object' && !Array.isArray(raw[key]))
            s[key] = Object.fromEntries(Object.entries(raw[key]).filter(([d]) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-100).map(([d, v]) => [d, key === 'done' && Array.isArray(v) ? v.map(String).slice(0, 60) : Boolean(v)]));
    // One completion per game-server day, independent of randomized book rarities.
    if (raw.dayDone && typeof raw.dayDone === 'object' && !Array.isArray(raw.dayDone))
        s.dayDone = Object.fromEntries(Object.entries(raw.dayDone).filter(([d, v]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && v === true).slice(-100));
    return s;
};
const talentBookFor = function (ch, kind, level) {
    if (isTraveler(ch.name)) {
        const element = (ch.name.match(/^Traveler \(([^)]+)\)$/) || [])[1];
        const books = element === 'Geo' && kind === 'n' ? TRAVELER_BOOK_SETS.Anemo : TRAVELER_BOOK_SETS[element];
        return books?.[(level - 1) % 3] || '';
    }
    return getBook(ch);
};
const requiredBooks = function (ch, kind, from, to) {
    const needs = {};
    for (let level = number(from, 1, 10); level < number(to, 1, 10); level++) {
        const book = talentBookFor(ch, kind, level), cost = COACH_COSTS[level];
        if (!BOOKS[book] || !cost)
            continue;
        for (let i = 0; i < COACH_RARITIES.length; i++) {
            const count = cost[i];
            if (count) {
                const key = book + ':' + COACH_RARITIES[i];
                needs[key] = (needs[key] || 0) + count;
            }
        }
    }
    return needs;
};
const consumeBooksForUpgrade = function (ch, kind, oldLevel, newLevel) {
    const spent = requiredBooks(ch, kind, oldLevel, newLevel);
    for (const [key, count] of Object.entries(spent)) {
        let remainder = count;
        const [book, rar] = key.split(':');
        const material = bookMaterialName(book, rar).toLowerCase();
        for (const f of state.farm.filter(x => x.material.toLowerCase() === material)) {
            const used = Math.min(f.owned, remainder);
            f.owned -= used;
            remainder -= used;
            if (!remainder)
                break;
        }
        const shared = state.farm.filter(x => x.material.toLowerCase() === material);
        state.roadmap.stock[key] = shared.length ? shared.reduce((n, f) => n + f.owned, 0) : Math.max(0, number(state.roadmap.stock[key] || 0) - count);
    }
};
