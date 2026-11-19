// Application bootstrap. Preserve the order of state initialization and event binding.
'use strict';

// utils — startup
initializeUtilsSection1();
const $ = id => document.getElementById(id);
const ico = name => `<svg width="15" height="15" aria-hidden="true"><use href="#${name}"></use></svg>`;
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const number = (v, min = 0, max = 99999999) => clamp(Number.isFinite(Number(v)) ? Math.floor(Number(v)) : min, min, max);
const fmt = n => Math.round(n).toLocaleString('en-US');
const INTERVAL = 8 * 60 * 1000, DAY = 24 * 60 * 60 * 1000, STORAGE = 'teyvat_companion_v2';

// server — startup
const OFFSETS = { Asia: 8, Europe: 1, America: -5, TW: 8 };
const SERVER_NAMES = { Asia: 'Asia', Europe: 'Europe', America: 'America', TW: 'TW / HK / MO' };

// characters — startup
const PICKER_ELEMENT_COLORS = { All: '#d7dfe2', Pyro: '#ea796c', Hydro: '#6ebbe6', Anemo: '#71c6ad', Electro: '#ba9ced', Dendro: '#90c47a', Cryo: '#a2d8e9', Geo: '#e1bd6b' };
// Clean, transparent game-element PNGs mirrored from the in-game assets.
// Source: https://github.com/vishnugt/genshin-character-builder/tree/master/icons
// These are remote files (not local embeds) and therefore require internet access.
const PICKER_ELEMENT_MARKS = { All: '✦', Pyro: 'Py', Hydro: 'Hy', Anemo: 'An', Electro: 'El', Dendro: 'De', Cryo: 'Cr', Geo: 'Ge' };
const ELEMENT_ICON_ROOT = 'https://raw.githubusercontent.com/vishnugt/genshin-character-builder/master/icons/element_';
const ELEMENT_ICON_BACKUP = 'https://cdn.jsdelivr.net/gh/vishnugt/genshin-character-builder@master/icons/element_';
const ELEMENT_ICON_KNOWN = { Pyro: 'pyro', Hydro: 'hydro', Anemo: 'anemo', Electro: 'electro', Dendro: 'dendro', Cryo: 'cryo', Geo: 'geo' };

// character picker — startup
const pickerState = { coach: { query: '', element: 'All', selected: [] }, planner: { query: '', element: 'All', selected: [] }, team: { query: '', element: 'All', selected: [] } };
let activeTeamSlot = 0, activeTeamContext = 'draft', editingTeamId = '', savedTeamDraft = null;

// characters — startup
// Use only safe known slug components from bundled character names, not user-provided URLs.
const TRAVELER_ELEMENTS = ['Anemo', 'Geo', 'Electro', 'Dendro', 'Hydro', 'Pyro', 'Cryo'];
const isTraveler = name => /^Traveler \(.*\)$/.test(name);
const travelerId = element => 'Traveler (' + element + ')';
// Game icon filenames are not always the same as the English character names.
// These aliases follow Enka.Network's published Genshin profile portrait manifest (pfps.json).
const PICKER_SLUG_OVERRIDES = {
    'Kamisato Ayaka': 'ayaka', 'Kamisato Ayato': 'ayato', 'Sangonomiya Kokomi': 'kokomi', 'Kaedehara Kazuha': 'kazuha', 'Raiden Shogun': 'raiden-shogun', 'Arataki Itto': 'arataki-itto', 'Kujou Sara': 'kujou-sara', 'Kuki Shinobu': 'kuki-shinobu', 'Shikanoin Heizou': 'shikanoin-heizou', 'Yae Miko': 'yae-miko', 'Yun Jin': 'yun-jin', 'Lan Yan': 'lan-yan', 'Yumemizuki Mizuki': 'mizuki', 'Xianyun': 'xianyun'
};
// Official portrait artwork mirrored by Enka; use normal game icons first, then circular icons.
// Enka's pfps.json catalogs the actual canonical keys, including Aino, Lauma,
// Flins, Durin, Nefer, Columbina, Varka, Valeriy and Mitya.
const ENKA_GAME_ICON_ROOT = 'https://enka.network/ui/';
const HOYO_GAME_ICON_ROOT = 'https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/';
const GENSHIN_ASSET_MIRROR = 'https://gi.yatta.moe/assets/UI/';

// character picker — startup
const COACH_ROTATION_LABELS = { mon: 'Monday / Thursday', tue: 'Tuesday / Friday', wed: 'Wednesday / Saturday' };
const COACH_ROTATION_ORDER = ['mon', 'tue', 'wed'];

// planner — startup
let rosterPageIndex = 0;
const ROSTER_VIEW_KEY = 'teyvat_roster_portrait_view';
let rosterPortraitView = false;
initializePlannerSection2();

// storage — startup
const defaultDaily = [{ id: 'd-commission', name: 'Claim four Daily Commission / Encounter Point rewards' }, { id: 'd-katheryne', name: 'Claim your Adventurers’ Guild bonus' }, { id: 'd-resin', name: 'Spend or store Original Resin' }, { id: 'd-expedition', name: 'Collect and resend expeditions' }, { id: 'd-events', name: 'Check ongoing event rewards' }];
const defaultWeekly = [{ id: 'w-boss', name: 'Claim weekly boss rewards' }, { id: 'w-battle', name: 'Review weekly Battle Pass tasks' }, { id: 'w-event', name: 'Check time-limited events and deadlines' }];
let state;
initializeStorageSection3();

// storage — startup
let currentPage = 'roadmap', farmFilter = 'all', toastTimer;
let farmOwnerKey = '', farmOwnerIndex = 0, farmOwnerGroups = [];

// navigation — startup
let nativeTimer;

// materials — startup
// Weekly material schedule; all lookups are local and use the same BOOKS table as the farming planner.
const MATERIAL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MATERIAL_REGION_NAMES = ['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Nod-Krai', 'Snezhnaya'];
const materialView = { day: null, type: 'all', region: 'all', query: '' };
// Talent icons use real UI_ItemIcon numeric IDs, not the unsupported /materials/<name>/icon route.
const MATERIAL_ICON_ROOT = 'https://genshin.jmp.blue/materials/';
const TALENT_IMAGE_ENDPOINTS = [
    id => 'https://static.nanoka.cc/gi/UI/UI_ItemIcon_' + id + '.webp',
    id => 'https://enka.network/ui/UI_ItemIcon_' + id + '.png',
    id => 'https://gi.yatta.moe/assets/UI/UI_ItemIcon_' + id + '.png'
];
const OFFLINE_GUIDE_FREEDOM = "./assets/guide-to-freedom.png";
const MATERIAL_CATEGORY_TABS = [
    ['all', 'All items'], ['talent', 'Talent books'], ['weapon', 'Weapon ascension'], ['boss', 'Boss drops'], ['local', 'Local specialties'], ['enemy', 'Enemy drops'], ['weekly', 'Weekly bosses'], ['mora', 'Mora / EXP']
];
const MATERIAL_CATALOG = makeMaterialCatalog();
initializeMaterialsSection4();
const MATERIAL_CATALOG_BY_ID = new Map(MATERIAL_CATALOG.map(item => [item.id, item]));
const MATERIAL_CATALOG_BY_NAME = new Map(MATERIAL_CATALOG.map(item => [item.name.toLowerCase(), item]));
initializeMaterialsSection5();

// material picker — startup
const materialPicker = { target: 'farm', category: 'talent', query: '', selected: { farm: null, coach: null } };

// material picker — startup
initializeMaterialPickerSection6();

// materials — startup
// Weapon data: genshin-db v5 public catalog. Match actual ascension item names/IDs, not weapon region.
const WEAPON_USERS_ENDPOINT = 'https://genshin-db-api.vercel.app/api/v5/weapons?query=names&matchCategories=true&verboseCategories=true';
const weaponUsersCacheKey = 'pjb.weapon-users.catalog.v1';
let weaponUsersData = null, weaponUsersLoading = null, weaponUsersRequest = 0;
// Factual fallback for the example series; explicitly labelled partial if the catalog is unreachable.
const WEAPON_USERS_FALLBACK = { "Boreal Wolf's Milk Tooth": [
        "Sacrificial Bow", "The Widsith", "Sacrificial Greatsword", "The Flute", "Sharpshooter's Oath", "Bloodtainted Greatsword", "Harbinger of Dawn", "Skyward Harp", "Skyward Atlas", "Skyward Pride", "Skyward Blade", "Sword of Descension", "The Black Sword", "Deathmatch", "Thrilling Tales of Dragon Slayers", "Dragonspine Spear", "Elegy for the End", "Wine and Song", "Dodoco Tales", "Missive Windspear", "Ballad of the Boundless Blue"
    ].map(name => ({ name, rarity: ['Skyward Harp', 'Skyward Atlas', 'Skyward Pride', 'Skyward Blade', 'Elegy for the End'].includes(name) ? 5 : ["Sharpshooter's Oath", 'Bloodtainted Greatsword', 'Harbinger of Dawn', 'Thrilling Tales of Dragon Slayers'].includes(name) ? 3 : 4, icon: '' })) };
let materialFloatingFrame = 0;
initializeMaterialsSection7();

// inventory — startup
const farmRemoveDialog = $('farm-remove-dialog'), farmRemoveSelected = new Set();
let farmRemoveBackdrop = false;
initializeInventorySection8();

// server — startup
// -- Build Planner. All roster input is user-entered. --
const parseKey = value => new Date(value + 'T12:00:00Z');
const fmtDate = value => parseKey(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
const advanceKey = (key, days) => {
    const d = parseKey(key);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};
const dayRotation = dateKey => {
    const dow = parseKey(dateKey).getUTCDay();
    return dow === 0 ? 'any' : [1, 4].includes(dow) ? 'mon' : [2, 5].includes(dow) ? 'tue' : 'wed';
};

// planner — startup
const preferredTalent = ch => ch.focus !== 'auto' ? ch.focus : ({ 'Normal': 'n', 'Skill': 's', 'Burst': 'b' }[FOCUS_HINTS[ch.name]] || 's');
const talentLabel = { n: 'Normal Attack', s: 'Elemental Skill', b: 'Elemental Burst' };
const getBook = ch => CHARACTER_BOOK[ch.name] || ch.book || '';
const bookDays = book => BOOKS[book]?.rotation || '';
const activeTeam = () => state.planner.teams.find(t => t.id === state.planner.activeTeamId) || null;
const isBuilt = (name) => state.planner.characters.some(c => c.name === name);

// notifications — startup
// Browser-only reminders: all preferences and delivery history stay on this device.
const REMINDER_KEY = 'teyvat-farming-reminders-v1', REMINDER_SENT_KEY = 'teyvat-farming-reminders-sent-v1';
let reminderPrefs = reminderRead(), reminderReady = false, browserSending = false;

// navigation — startup
initializeNavigationSection9();

// teams — startup
const teamGripSvg = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.7"/><circle cx="15" cy="5" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="19" r="1.7"/><circle cx="15" cy="19" r="1.7"/></svg>';
let visibleSavedTeamId = '', visibleSavedTeamIndex = 0;
const teamRemoveDialog = $('team-remove-dialog'), teamRemoveSelected = new Set();
let teamRemoveBackdrop = false;
initializeTeamsSection10();
const savedTeamPicker = $('saved-team-picker');
initializeTeamsSection11();
let savedTeamBackdropPressed = false;
initializeTeamsSection12();
const otherTeamsDialog = $('other-teams-dialog');
initializeTeamsSection13();
let otherTeamsBackdropPressed = false;
initializeTeamsSection14();

// planner — startup
let plannerDate = '';
let priorGameDay = '';
initializePlannerSection15();
// Preserve the first visible item when crossing responsive page-size breakpoints.
let previousRosterPageSize = rosterPageSize();
initializePlannerSection16();
const ROSTER_COLLAPSE_KEY = 'teyvat_roster_collapsed';
let rosterCollapsed = false, collapsedRosterScroll = 0;
initializePlannerSection17();
const rosterRemoveDialog = $('roster-remove-dialog');
const rosterRemoveSelected = new Set();
let rosterRemoveBackdropDown = false;
initializePlannerSection18();
const rosterStatsDialog = $('roster-stats-dialog');
let rosterStatsName = '', rosterStatsScroll = 0, rosterStatsBackdropDown = false;
initializePlannerSection19();

// teams — startup
initializeTeamsSection20();
// A pointer-based swap works with mouse, touch and pen without native HTML drag limitations.
let teamMoveSelection = null, teamDrag = null, teamSuppressClickUntil = 0;
initializeTeamsSection21();

// planner — startup
initializePlannerSection22();

// characters — startup
const COACH_RARITIES = ['Teachings', 'Guide', 'Philosophies'];
const COACH_EMOJI = { books: '📖', boss: '⚔', local: '🌿', weekly: '🛡', weapon: '⚒', artifact: '✦', mora: '💰', enemy: '🎯', other: '📦' };

// journey — startup
initializeJourneySection23();
// Date details dialog: footer Close, Esc (native dialog), or backdrop click.
const coachDateModal = $('coach-day-dialog');
initializeJourneySection24();

// settings — startup
initializeSettingsSection25();

// journey — startup
initializeJourneySection26();
const previousRenderRoadmap = renderRoadmap;
initializeJourneySection27();

// navigation — startup
initializeNavigationSection28();

// materials — startup
initializeMaterialsSection29();

// server — startup
initializeServerSection30();

// inventory — startup
initializeInventorySection31();

// settings — startup
initializeSettingsSection32();

// weapon journey — startup
WEAPON_STARTERS.push(...WEAPON_ADDITIONS);
let weaponPlanRows = WEAPON_STARTERS.slice().sort((a, b) => a.name.localeCompare(b.name)), weaponDraft = [], weaponPlanRarity = 0, weaponCatalogStatus = 'idle';
initializeWeaponJourneySection33();

// navigation — startup
initializePlanEditor();
initializeNavigationSection34();
