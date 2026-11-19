// Game catalog data — keep item names and IDs exact.

'use strict';

// Shared image-first catalog for manual inventory entry. Entries are individual game items,
// not generic categories; image sources are community-hosted mirrors of Genshin item icons.

const WEAPON_RARITIES = {
  "Tile of Decarabian's Tower": [
    "Tile of Decarabian's Tower",
    "Debris of Decarabian's City",
    "Fragment of Decarabian's Epic",
    "Scattered Piece of Decarabian's Dream"
  ],
  "Boreal Wolf's Milk Tooth": [
    "Boreal Wolf's Milk Tooth",
    "Boreal Wolf's Cracked Tooth",
    "Boreal Wolf's Broken Fang",
    "Boreal Wolf's Nostalgia"
  ],
  "Fetters of the Dandelion Gladiator": [
    "Fetters of the Dandelion Gladiator",
    "Chains of the Dandelion Gladiator",
    "Shackles of the Dandelion Gladiator",
    "Dream of the Dandelion Gladiator"
  ],
  "Luminous Sands from Guyun": [
    "Luminous Sands from Guyun",
    "Lustrous Stone from Guyun",
    "Relic from Guyun",
    "Divine Body from Guyun"
  ],
  "Mist Veiled Lead Elixir": [
    "Mist Veiled Lead Elixir",
    "Mist Veiled Mercury Elixir",
    "Mist Veiled Gold Elixir",
    "Mist Veiled Primo Elixir"
  ],
  "Grain of Aerosiderite": [
    "Grain of Aerosiderite",
    "Piece of Aerosiderite",
    "Bit of Aerosiderite",
    "Chunk of Aerosiderite"
  ],
  "Coral Branch of a Distant Sea": [
    "Coral Branch of a Distant Sea",
    "Jeweled Branch of a Distant Sea",
    "Jade Branch of a Distant Sea",
    "Golden Branch of a Distant Sea"
  ],
  "Narukami's Wisdom": [
    "Narukami's Wisdom",
    "Narukami's Joy",
    "Narukami's Affection",
    "Narukami's Valor"
  ],
  "Mask of the Wicked Lieutenant": [
    "Mask of the Wicked Lieutenant",
    "Mask of the Tiger's Bite",
    "Mask of the One-Horned",
    "Mask of the Kijin"
  ],
  "Copper Talisman of the Forest Dew": [
    "Copper Talisman of the Forest Dew",
    "Iron Talisman of the Forest Dew",
    "Silver Talisman of the Forest Dew",
    "Golden Talisman of the Forest Dew"
  ],
  "Oasis Garden's Reminiscence": [
    "Oasis Garden's Reminiscence",
    "Oasis Garden's Kindness",
    "Oasis Garden's Mourning",
    "Oasis Garden's Truth"
  ],
  "Echo of Scorching Might": [
    "Echo of Scorching Might",
    "Remnant Glow of Scorching Might",
    "Dream of Scorching Might",
    "Olden Days of Scorching Might"
  ],
  "Fragment of an Ancient Chord": [
    "Fragment of an Ancient Chord",
    "Chapter of an Ancient Chord",
    "Movement of an Ancient Chord",
    "Echo of an Ancient Chord"
  ],
  "Dross of Pure Sacred Dewdrop": [
    "Dross of Pure Sacred Dewdrop",
    "Sublimation of Pure Sacred Dewdrop",
    "Spring of Pure Sacred Dewdrop",
    "Essence of Pure Sacred Dewdrop"
  ],
  "Broken Goblet of the Pristine Sea": [
    "Broken Goblet of the Pristine Sea",
    "Wine Goblet of the Pristine Sea",
    "Silver Goblet of the Pristine Sea",
    "Golden Goblet of the Pristine Sea"
  ],
  "Blazing Sacrificial Heart's Terror": [
    "Blazing Sacrificial Heart's Terror",
    "Blazing Sacrificial Heart's Hesitance",
    "Blazing Sacrificial Heart's Resolve",
    "Blazing Sacrificial Heart's Splendor"
  ],
  "Delirious Decadence of the Sacred Lord": [
    "Delirious Decadence of the Sacred Lord",
    "Delirious Desolation of the Sacred Lord",
    "Delirious Demeanor of the Sacred Lord",
    "Delirious Divinity of the Sacred Lord"
  ],
  "Night-Wind's Mystic Consideration": [
    "Night-Wind's Mystic Consideration",
    "Night-Wind's Mystic Premonition",
    "Night-Wind's Mystic Augury",
    "Night-Wind's Mystic Revelation"
  ],
  "Artful Device Fragment": [
    "Artful Device Fragment",
    "Artful Device Replica",
    "Artful Device Inheritance",
    "Artful Device Wish"
  ],
  "Ember of Long Night Flint": [
    "Ember of Long Night Flint",
    "Afterglow of Long Night Flint",
    "Flare of Long Night Flint",
    "Blaze of Long Night Flint"
  ],
  "Sundered Glory of the Far-North Scions": [
    "Sundered Glory of the Far-North Scions",
    "Unyielding Delusion of the Far-North Scions",
    "Oblation of the Far-North Scions",
    "Aureate Radiance of the Far-North Scions"
  ],
  "Rise of the Pale Star Army": [
    "Rise of the Pale Star Army",
    "Muster of the Pale Star Army",
    "Clarion of the Pale Star Army",
    "Triumph of the Pale Star Army"
  ],
  "Measured Pour of the Cellared Spiritual Nectar": [
    "Measured Pour of the Cellared Spiritual Nectar",
    "Intoxication of the Cellared Spiritual Nectar",
    "Exhilaration of the Cellared Spiritual Nectar",
    "Revelry of the Cellared Spiritual Nectar"
  ],
  "The Frost Emperor's Revival": [
    "The Frost Emperor's Revival",
    "The Frost Emperor's Ceremony",
    "The Frost Emperor's Lament",
    "The Frost Emperor's Farewell"
  ]
};

const WEAPON_STARTERS = [
  {
    "name": "Favonius Sword",
    "rarity": 4,
    "icon": "UI_EquipIcon_Sword_Zephyrus",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Skyward Harp",
    "rarity": 5,
    "icon": "UI_EquipIcon_Bow_Dvalin",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Sacrificial Sword",
    "rarity": 4,
    "icon": "UI_EquipIcon_Sword_Fossil",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Prototype Rancour",
    "rarity": 4,
    "icon": "UI_EquipIcon_Sword_Proto",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "The Catch",
    "rarity": 4,
    "icon": "UI_EquipIcon_Pole_Mori",
    "series": "Mask of the Wicked Lieutenant"
  }
];

const WEAPON_ADDITIONS = [
  {
    "name": "Aquila Favonia",
    "rarity": 5,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Song of Broken Pines",
    "rarity": 5,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Cinnabar Spindle",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Favonius Codex",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Mitternachts Waltz",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Royal Grimoire",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Royal Longsword",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Snow-Tombed Starsilver",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "The Alley Flash",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "The Bell",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "The Stringless",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "The Viridescent Hunt",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Wolf-Fang",
    "rarity": 4,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Cool Steel",
    "rarity": 3,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Ferrous Shadow",
    "rarity": 3,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Magic Guide",
    "rarity": 3,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Raven Bow",
    "rarity": 3,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Pocket Grimoire",
    "rarity": 2,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Silver Sword",
    "rarity": 2,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Apprentice's Notes",
    "rarity": 1,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Dull Blade",
    "rarity": 1,
    "icon": "",
    "series": "Tile of Decarabian's Tower"
  },
  {
    "name": "Elegy for the End",
    "rarity": 5,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Skyward Atlas",
    "rarity": 5,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Skyward Blade",
    "rarity": 5,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Skyward Pride",
    "rarity": 5,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Ballad of the Boundless Blue",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Deathmatch",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Dodoco Tales",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Dragonspine Spear",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Missive Windspear",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Sacrificial Bow",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Sacrificial Greatsword",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Sword of Descension",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "The Black Sword",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "The Flute",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "The Widsith",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Wine and Song",
    "rarity": 4,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Bloodtainted Greatsword",
    "rarity": 3,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Harbinger of Dawn",
    "rarity": 3,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Sharpshooter's Oath",
    "rarity": 3,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Thrilling Tales of Dragon Slayers",
    "rarity": 3,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Old Merc's Pal",
    "rarity": 2,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Seasoned Hunter's Bow",
    "rarity": 2,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Hunter's Bow",
    "rarity": 1,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Waster Greatsword",
    "rarity": 1,
    "icon": "",
    "series": "Boreal Wolf's Milk Tooth"
  },
  {
    "name": "Amos' Bow",
    "rarity": 5,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Freedom-Sworn",
    "rarity": 5,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Lost Prayer to the Sacred Winds",
    "rarity": 5,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Skyward Spine",
    "rarity": 5,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Wolf's Gravestone",
    "rarity": 5,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Alley Hunter",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Favonius Greatsword",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Favonius Lance",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Favonius Warbow",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Festering Desire",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Frostbearer",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Mailed Flower",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Royal Bow",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Royal Greatsword",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Sacrificial Fragments",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Windblume Ode",
    "rarity": 4,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Otherworldly Story",
    "rarity": 3,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Recurve Bow",
    "rarity": 3,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Traveler's Handy Sword",
    "rarity": 3,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "White Iron Greatsword",
    "rarity": 3,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Iron Point",
    "rarity": 2,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Beginner's Protector",
    "rarity": 1,
    "icon": "",
    "series": "Fetters of the Dandelion Gladiator"
  },
  {
    "name": "Aqua Simulacra",
    "rarity": 5,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Jadefall's Splendor",
    "rarity": 5,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Primordial Jade Winged-Spear",
    "rarity": 5,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Summit Shaper",
    "rarity": 5,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Blackcliff Agate",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Blackcliff Longsword",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Blackcliff Warbow",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Crescent Pike",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Lion's Roar",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Lithic Blade",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Rust",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Sacrificial Jade",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Solar Pearl",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Whiteblind",
    "rarity": 4,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Dark Iron Sword",
    "rarity": 3,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Emerald Orb",
    "rarity": 3,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Slingshot",
    "rarity": 3,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "White Tassel",
    "rarity": 3,
    "icon": "",
    "series": "Luminous Sands from Guyun"
  },
  {
    "name": "Calamity Queller",
    "rarity": 5,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Crane's Echoing Call",
    "rarity": 5,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Primordial Jade Cutter",
    "rarity": 5,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "The Unforged",
    "rarity": 5,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Blackcliff Pole",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Blackcliff Slasher",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Dragon's Bane",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Eye of Perception",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Prototype Amber",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Prototype Crescent",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Rainslasher",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Royal Spear",
    "rarity": 4,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Debate Club",
    "rarity": 3,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Fillet Blade",
    "rarity": 3,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Halberd",
    "rarity": 3,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Messenger",
    "rarity": 3,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Twin Nephrite",
    "rarity": 3,
    "icon": "",
    "series": "Mist Veiled Lead Elixir"
  },
  {
    "name": "Memory of Dust",
    "rarity": 5,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Staff of Homa",
    "rarity": 5,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Vortex Vanquisher",
    "rarity": 5,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Cloudforged",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Compound Bow",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Fading Twilight",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Iron Sting",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Lithic Spear",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Luxurious Sea-Lord",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Mappa Mare",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Prototype Archaic",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Prototype Starglitter",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Serpent Spine",
    "rarity": 4,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Black Tassel",
    "rarity": 3,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Skyrider Greatsword",
    "rarity": 3,
    "icon": "",
    "series": "Grain of Aerosiderite"
  },
  {
    "name": "Everlasting Moonglow",
    "rarity": 5,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Mistsplitter Reforged",
    "rarity": 5,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Uraku Misugiri",
    "rarity": 5,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Akuoumaru",
    "rarity": 4,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Amenoma Kageuchi",
    "rarity": 4,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Hakushin Ring",
    "rarity": 4,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Oathsworn Eye",
    "rarity": 4,
    "icon": "",
    "series": "Coral Branch of a Distant Sea"
  },
  {
    "name": "Haran Geppaku Futsu",
    "rarity": 5,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Redhorn Stonethresher",
    "rarity": 5,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Sunny Morning Sleep-In",
    "rarity": 5,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Thundering Pulse",
    "rarity": 5,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Hamayumi",
    "rarity": 4,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Katsuragikiri Nagamasa",
    "rarity": 4,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Mouun's Moon",
    "rarity": 4,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Predator",
    "rarity": 4,
    "icon": "",
    "series": "Narukami's Wisdom"
  },
  {
    "name": "Toukabou Shigure",
    "rarity": 4,
    "icon": "",
    "series": "Narukami's Wisdom"
  }
];
