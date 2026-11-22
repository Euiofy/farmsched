// Teyvat Companion | data / materials
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
// Resolve item artwork by exact name as well as game ID. Different mirrors
// may have different coverage, especially for newly released materials.
const materialArtworkKey = name => String(name || '').trim().normalize('NFKC')
    .toLowerCase().replace(/[’‘']/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const materialWikiImageUrl = function (name) {
    const filename = 'Item_' + String(name || '').trim().replace(/[’‘]/g, "'").replace(/\s+/g, '_') + '.png';
    return 'https://genshin-impact.fandom.com/wiki/Special:FilePath/' + encodeURIComponent(filename);
};
const materialExactItemId = function (name) {
    // Keep support for the expanded inventory catalog when installed.
    const expanded = typeof MATERIAL_CATALOG_EXPANSION !== 'undefined'
        ? MATERIAL_CATALOG_EXPANSION.find(item => item.name === name) : null;
    if (Number.isInteger(expanded?.iconId))
        return expanded.iconId;
    return Object.prototype.hasOwnProperty.call(EXACT_MATERIAL_ITEM_IDS, name) ? EXACT_MATERIAL_ITEM_IDS[name] : null;
};
const materialBookNameById = function (id) {
    for (const [series, first] of Object.entries(TALENT_ICON_FIRST_ID)) {
        if (id >= first && id <= first + 2)
            return talentOfficialNames(series)[id - first];
    }
    return '';
};
const materialImageCandidates = function (name, id, isWeapon) {
    const itemId = Number.isInteger(id) ? id : materialExactItemId(name);
    // Book IDs can also be resolved for the older book-only renderers.
    name = String(name || '').trim() || materialBookNameById(itemId);
    const key = materialArtworkKey(name);
    const local = (typeof window !== 'undefined' && window.LOCAL_ITEM_ICONS)
        ? (window.LOCAL_ITEM_ICONS[itemId] || window.LOCAL_ITEM_ICONS[key]) : null;
    const nameHosts = key ? [
        'https://images.genshin-builds.com/genshin/materials/' + key + '.png',
        'https://paimon.moe/images/items/' + key + '.png',
        'https://i2.wp.com/images.genshin-builds.com/genshin/materials/' + key + '.png?quality=100&strip=all&w=120'
    ] : [];
    const itemHosts = Number.isInteger(itemId) ? [
        ...TALENT_IMAGE_ENDPOINTS.map(endpoint => endpoint(itemId)),
        'https://res.cloudinary.com/genshin/image/upload/sprites/UI_ItemIcon_' + itemId + '.png'
    ] : [];
    // Prefer name-matched artwork over guessed filenames and numeric IDs.
    const wiki = name ? [materialWikiImageUrl(name),
        'https://genshin-impact.fandom.com/wiki/Special:FilePath/' + encodeURIComponent('Item ' + name + '.png')] : [];
    return [...new Set([local, itemId === 104302 ? OFFLINE_GUIDE_FREEDOM : null,
        ...nameHosts, ...itemHosts, ...wiki].filter(Boolean))];
};
const materialImageForName = function (name, id, isWeapon = false) { return materialImageCandidates(name, id, isWeapon)[0]; };
const materialItemImgTag = function (name, id, isWeapon = false) {
    const itemId = Number.isInteger(id) ? id : materialExactItemId(name);
    return `<img src="${esc(materialImageForName(name, itemId, isWeapon) || '')}" alt="" loading="lazy" decoding="async" data-game-item-name="${esc(name)}" data-game-item-id="${itemId ?? ''}" data-game-item-weapon="${isWeapon ? '1' : '0'}" data-game-item-stage="0">`;
};
const materialItemImageFallback = function (img) {
    const generic = img.hasAttribute('data-game-item-name');
    const book = img.hasAttribute('data-material-id');
    if (!generic && !book)
        return false;
    if (img.classList.contains('is-failed'))
        return true;
    const raw = generic ? img.dataset.gameItemId : img.dataset.materialId;
    const id = raw != null && raw !== '' && Number.isInteger(Number(raw)) ? Number(raw) : null;
    const name = generic ? img.dataset.gameItemName : (img.dataset.materialIcon || materialBookNameById(id));
    const sources = materialImageCandidates(name, id, img.dataset.gameItemWeapon === '1');
    const stageKey = generic ? 'gameItemStage' : 'materialStage';
    // Match the failed URL when possible; the stage is a fallback for a
    // relative/local URL or a previously loaded version of the markup.
    const current = img.getAttribute('src');
    const matched = sources.indexOf(current);
    const next = (matched >= 0 ? matched : Number(img.dataset[stageKey] || '0')) + 1;
    if (next < sources.length) {
        img.dataset[stageKey] = String(next);
        img.src = sources[next];
    } else {
        img.classList.add('is-failed');
        img.title = 'Artwork unavailable from the image providers';
    }
    return true;
};
const materialSlug = function (text) { return String(text || '').toLowerCase().replace(/&/g, ' and ').replace(/[\'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };
const titleWords = function (text, count = 2) { return String(text || '').split(/\s+/).filter(Boolean).slice(0, count).map(w => w[0]?.toUpperCase() + w.slice(1, 3)).join(' '); };
const talentIconSeries = function (name) {
    const special = { Moonlight: 'guide-to-moonlight', Elysium: 'guide-to-elysium', Vagrancy: 'guide-to-vagrancy', Charity: 'guide-to-charity', Fortitude: 'guide-to-fortitude', Glory: 'guide-to-glory' };
    return special[name] || ('guide-to-' + materialSlug(name));
};
const talentOfficialNames = function (name) { return ['Teachings of ' + name, 'Guide to ' + name, 'Philosophies of ' + name]; };
const talentOfficialKeys = function (name) {
    const first = TALENT_ICON_FIRST_ID[name];
    return first ? [first, first + 1, first + 2] : [];
};
const materialDisplayName = function (entry) { return entry.type === 'talent' ? entry.name + ' Books' : entry.name; };
const materialBookIconUrl = function (id) { return materialImageForName(materialBookNameById(id), id); };
const materialExtraNames = function (entry) {
    if (entry.type !== 'talent')
        return '';
    const names = talentOfficialNames(entry.name), keys = talentOfficialKeys(entry.name), short = ['2★', '3★', '4★'];
    return `<span class="material-book-set">${names.map((label, i) => `<span class="material-book-chip"><span class="material-book-chip-icon" role="img" aria-label="${esc(label)} official book artwork"><span class="material-entry-fallback">${short[i]}</span><img src="${materialBookIconUrl(keys[i])}" alt="" loading="lazy" decoding="async" data-material-id="${keys[i]}" data-material-stage="0" data-material-icon="${esc(label)}"></span><span class="material-book-chip-label">${esc(label)}</span></span>`).join('')}</span>`;
};
const otherMaterialIconName = function (name) {
    const map = {
        'Character ascension bosses': 'everflame-seed', 'Artifact domains': 'condensed-resin', 'Mora & EXP Ley Lines': 'mora', 'Common enemy materials': 'slime-condensate', 'Local specialties': 'calla-lily', 'Weekly boss materials': 'dvalins-claw'
    };
    return map[name] || materialSlug(name);
};
const materialIconKey = function (entry) {
    if (entry.type === 'talent')
        return talentIconSeries(entry.name);
    if (entry.type === 'weapon')
        return materialSlug(entry.name);
    return otherMaterialIconName(entry.name);
};
const materialWeaponTierIcons = function (entry) {
    const tierNames = WEAPON_RARITIES[entry.name] || [entry.name];
    const tiers = ['2★', '3★', '4★', '5★'];
    return `<span class="material-weapon-set" aria-label="${esc(entry.name)} weapon ascension materials">${tierNames.map((name, i) => `<span class="material-weapon-chip" role="img" aria-label="${esc(name)}"><span class="material-weapon-chip-art"><span class="material-entry-fallback">${tiers[i] || '✧'}</span>${materialItemImgTag(name, materialExactItemId(name), true)}</span><span class="material-weapon-chip-name" title="${esc(name)}">${esc(name)}</span></span>`).join('')}</span>`;
};
const materialIconHtml = function (entry) {
    const representatives = {
        'Character ascension bosses': 'Everflame Seed', 'Artifact domains': 'Mystic Enhancement Ore', 'Mora & EXP Ley Lines': 'Mora', 'Common enemy materials': 'Slime Condensate', 'Local specialties': 'Windwheel Aster', 'Weekly boss materials': "Dvalin's Claw"
    };
    const name = representatives[entry.name] || entry.name;
    const label = entry.type === 'talent' ? 'BOOK' : entry.type === 'weapon' ? 'MAT' : titleWords(entry.name, 2);
    return `<span class="material-entry-icon" aria-hidden="true"><span class="material-entry-fallback">${esc(label)}</span>${materialItemImgTag(name)}</span>`;
};
const makeMaterialCatalog = function () {
    const result = [];
    for (const [series, meta] of Object.entries(BOOKS)) {
        const names = talentOfficialNames(series), ids = talentOfficialKeys(series);
        names.forEach((name, i) => result.push({ id: 'talent:' + materialSlug(name), name, type: 'talent', region: meta.region, series, rank: i + 2, day: meta.rotation, where: meta.domain, resin: 20, iconId: ids[i] }));
    }
    for (const [region, meta] of Object.entries(MATERIAL_FORGERY)) {
        meta.series.forEach((series, i) => {
            const tiers = WEAPON_RARITIES[series] || [series];
            tiers.forEach((name, j) => result.push({ id: 'weapon:' + materialSlug(name), name, type: 'weapon', region, series, rank: j + 2, day: ['mon', 'tue', 'wed'][i], where: meta.domain, resin: 20 }));
        });
    }
    const extraById = new Map();
    const addExtra = (item) => {
        const id = item.type + ':' + materialSlug(item.name);
        const base = { id, name: item.name, type: item.type, region: '', series: '', rank: 0,
            day: item.type === 'weekly' ? 'weekly' : 'any', where: '',
            resin: item.type === 'boss' ? 40 : item.type === 'weekly' ? 30 : 0 };
        extraById.set(id, { ...base, ...extraById.get(id), ...item });
    };
    for (const [type, names] of Object.entries(EXTRA_CATALOG_ITEMS))
        for (const name of names)
            addExtra({ type, name });
    if (typeof MATERIAL_CATALOG_EXPANSION !== 'undefined')
        for (const item of MATERIAL_CATALOG_EXPANSION)
            addExtra(item);
    result.push(...extraById.values());
    return result;
};
// Bind controls / initialize this section in original startup order.
const initializeMaterialsSection4 = () => {
    MATERIAL_CATALOG.forEach(item => { if (!Number.isInteger(item.iconId)) {
        const id = materialExactItemId(item.name);
        if (Number.isInteger(id))
            item.iconId = id;
    } });
};
/* PJB_MATERIAL_RARITY_V1 — visual-only extension, no inventory modifications. */
const pjbInstallMaterialRarity = function () {
    const norm = s => String(s || '').trim().normalize('NFKC').replace(/[‘’]/g, "'").toLowerCase();
    const lookup = new Map();
    const explicit = {
        "Mora": 3, "Hero's Wit": 4, "Adventurer's Experience": 3, "Wanderer's Advice": 2, "Mystic Enhancement Ore": 3, "Fine Enhancement Ore": 2, "Enhancement Ore": 1, "Condensed Resin": 4, "Original Resin": 3, "Fragile Resin": 4, "Transient Resin": 4, "Crown of Insight": 5
    };
    const common = [
        ['Slime Condensate', 'Slime Secretions', 'Slime Concentrate'], ['Damaged Mask', 'Stained Mask', 'Ominous Mask'], ['Firm Arrowhead', 'Sharp Arrowhead', 'Weathered Arrowhead'], ['Divining Scroll', 'Sealed Scroll', 'Forbidden Curse Scroll'], ['Treasure Hoarder Insignia', 'Silver Raven Insignia', 'Golden Raven Insignia'], ["Recruit's Insignia", "Sergeant's Insignia", "Lieutenant's Insignia"], ['Whopperflower Nectar', 'Shimmering Nectar', 'Energy Nectar'], ['Old Handguard', 'Kageuchi Handguard', 'Famed Handguard'], ['Fungal Spores', 'Luminescent Pollen', 'Crystalline Cyst Dust']
    ];
    for (const names of common)
        names.forEach((name, i) => explicit[name] = i + 1);
    for (const [name, rank] of Object.entries(explicit))
        lookup.set(norm(name), rank);
    for (const item of MATERIAL_CATALOG) {
        const supplied = Number(item.rank || item.rarity || 0);
        const rank = supplied >= 1 && supplied <= 5 ? supplied : lookup.get(norm(item.name)) || ({ boss: 4, local: 1, weekly: 5 })[item.type];
        if (rank)
            lookup.set(norm(item.name), rank);
    }
    const byId = new Map(MATERIAL_CATALOG.filter(x => x.iconId != null).map(x => [String(x.iconId), lookup.get(norm(x.name))]));
    const selector = '.material-icon-art,.material-book-chip-icon,.material-weapon-chip-art,.material-entry-icon,.coach-modal-book-icon,.coach-modal-other-icon.has-material-photo,.coach-stock-icon.has-material-photo';
    function apply(el) {
        const img = el.querySelector('img');
        const name = img?.dataset.gameItemName || img?.dataset.materialIcon || '';
        const id = img?.dataset.gameItemId || img?.dataset.materialId;
        const rank = lookup.get(norm(name)) || byId.get(id);
        if (rank)
            el.dataset.materialRarity = String(rank);
        else
            delete el.dataset.materialRarity;
    }
    function scan(root) {
        if (root.nodeType !== 1)
            return;
        if (root.matches(selector))
            apply(root);
        root.querySelectorAll(selector).forEach(apply);
    }
    function start() {
        scan(document.body);
        new MutationObserver(records => { for (const record of records) {
            if (record.type === 'childList') {
                if (record.target.nodeType === 1) {
                    const parent = record.target.closest(selector);
                    if (parent)
                        apply(parent);
                }
                for (const el of record.addedNodes)
                    scan(el);
            }
            else if (record.target.nodeType === 1) {
                const parent = record.target.closest(selector);
                if (parent)
                    apply(parent);
            }
        } }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-game-item-name', 'data-game-item-id', 'data-material-icon', 'data-material-id'] });
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', start, { once: true });
    else
        start();
};
// Bind controls / initialize this section in original startup order.
const initializeMaterialsSection5 = () => {
    pjbInstallMaterialRarity();
};
