// Game catalog data — keep item names and IDs exact.

'use strict';

const MATERIAL_FORGERY = {
  "Mondstadt": {
    "domain": "Cecilia Garden",
    "series": [
      "Tile of Decarabian's Tower",
      "Boreal Wolf's Milk Tooth",
      "Fetters of the Dandelion Gladiator"
    ]
  },
  "Liyue": {
    "domain": "Hidden Palace of Lianshan Formula",
    "series": [
      "Luminous Sands from Guyun",
      "Mist Veiled Lead Elixir",
      "Grain of Aerosiderite"
    ]
  },
  "Inazuma": {
    "domain": "Court of Flowing Sand",
    "series": [
      "Coral Branch of a Distant Sea",
      "Narukami's Wisdom",
      "Mask of the Wicked Lieutenant"
    ]
  },
  "Sumeru": {
    "domain": "Tower of Abject Pride",
    "series": [
      "Copper Talisman of the Forest Dew",
      "Oasis Garden's Reminiscence",
      "Echo of Scorching Might"
    ]
  },
  "Fontaine": {
    "domain": "Echoes of the Deep Tides",
    "series": [
      "Fragment of an Ancient Chord",
      "Dross of Pure Sacred Dewdrop",
      "Broken Goblet of the Pristine Sea"
    ]
  },
  "Natlan": {
    "domain": "Ancient Watchtower",
    "series": [
      "Blazing Sacrificial Heart's Terror",
      "Delirious Decadence of the Sacred Lord",
      "Night-Wind's Mystic Consideration"
    ]
  },
  "Nod-Krai": {
    "domain": "Lost Mooncourt",
    "series": [
      "Artful Device Fragment",
      "Ember of Long Night Flint",
      "Sundered Glory of the Far-North Scions"
    ]
  },
  "Snezhnaya": {
    "domain": "Scars of Cursed Obsession",
    "series": [
      "Rise of the Pale Star Army",
      "Measured Pour of the Cellared Spiritual Nectar",
      "The Frost Emperor's Revival"
    ]
  }
};

const MATERIAL_ANYTIME = [
  {
    "name": "Character ascension bosses",
    "availability": "everyday",
    "info": "Usually available every day · claim with 40 Original Resin. Match the boss drop to your character."
  },
  {
    "name": "Artifact domains",
    "availability": "everyday",
    "info": "Available every day · 20 Resin per claim; choose the set your team actually needs."
  },
  {
    "name": "Mora & EXP Ley Lines",
    "availability": "everyday",
    "info": "Available every day · 20 Resin per claim."
  },
  {
    "name": "Common enemy materials",
    "availability": "everyday",
    "info": "Farm from overworld enemies on any day; enemies respawn over time."
  },
  {
    "name": "Local specialties",
    "availability": "everyday",
    "info": "Gather on any day when present; many local specialties respawn roughly 48 hours after being collected."
  },
  {
    "name": "Weekly boss materials",
    "availability": "weekly",
    "info": "Challenge bosses when unlocked; rewards from each boss are claimable once per week and reset on Monday."
  }
];

const TALENT_ICON_FIRST_ID = {
  "Freedom": 104301,
  "Resistance": 104304,
  "Ballad": 104307,
  "Prosperity": 104310,
  "Diligence": 104313,
  "Gold": 104316,
  "Transience": 104320,
  "Elegance": 104323,
  "Light": 104326,
  "Admonition": 104329,
  "Ingenuity": 104332,
  "Praxis": 104335,
  "Equity": 104338,
  "Justice": 104341,
  "Order": 104344,
  "Contention": 104347,
  "Kindling": 104350,
  "Conflict": 104353,
  "Moonlight": 104356,
  "Elysium": 104359,
  "Vagrancy": 104362,
  "Charity": 104365,
  "Fortitude": 104368,
  "Glory": 104371
};

const EXACT_MATERIAL_ITEM_IDS = {
  "Hurricane Seed": 113001,
  "Lightning Prism": 113002,
  "Dvalin's Plume": 113003,
  "Dvalin's Claw": 113004,
  "Dvalin's Sigh": 113005,
  "Tail of Boreas": 113006,
  "Ring of Boreas": 113007,
  "Spirit Locket of Boreas": 113008,
  "Basalt Pillar": 113009,
  "Hoarfrost Core": 113010,
  "Everflame Seed": 113011,
  "Cleansing Heart": 113012,
  "Tusk of Monoceros Caeli": 113013,
  "Shard of a Foul Legacy": 113014,
  "Shadow of the Warrior": 113015,
  "Juvenile Jade": 113016,
  "Dragon Lord's Crown": 113017,
  "Bloodjade Branch": 113018,
  "Gilded Scale": 113019,
  "Crystalline Bloom": 113020,
  "Dream Solvent": 113021,
  "Marionette Core": 113022,
  "Perpetual Heart": 113023,
  "Smoldering Pearl": 113024,
  "Molten Moment": 113025,
  "Hellfire Butterfly": 113026,
  "Ashen Heart": 113027,
  "Dew of Repudiation": 113028,
  "Storm Beads": 113029,
  "Riftborn Regalia": 113030,
  "Dragonheir's False Fin": 113031,
  "Mudra of the Malefic General": 113032,
  "Tears of the Calamitous God": 113033,
  "The Meaning of Aeons": 113034,
  "Runic Fang": 113035,
  "Tile of Decarabian's Tower": 114001,
  "Debris of Decarabian's City": 114002,
  "Fragment of Decarabian's Epic": 114003,
  "Scattered Piece of Decarabian's Dream": 114004,
  "Boreal Wolf's Milk Tooth": 114005,
  "Boreal Wolf's Cracked Tooth": 114006,
  "Boreal Wolf's Broken Fang": 114007,
  "Boreal Wolf's Nostalgia": 114008,
  "Fetters of the Dandelion Gladiator": 114009,
  "Chains of the Dandelion Gladiator": 114010,
  "Shackles of the Dandelion Gladiator": 114011,
  "Dream of the Dandelion Gladiator": 114012,
  "Luminous Sands from Guyun": 114013,
  "Lustrous Stone from Guyun": 114014,
  "Relic from Guyun": 114015,
  "Divine Body from Guyun": 114016,
  "Mist Veiled Lead Elixir": 114017,
  "Mist Veiled Mercury Elixir": 114018,
  "Mist Veiled Gold Elixir": 114019,
  "Mist Veiled Primo Elixir": 114020,
  "Grain of Aerosiderite": 114021,
  "Piece of Aerosiderite": 114022,
  "Bit of Aerosiderite": 114023,
  "Chunk of Aerosiderite": 114024,
  "Coral Branch of a Distant Sea": 114025,
  "Jeweled Branch of a Distant Sea": 114026,
  "Jade Branch of a Distant Sea": 114027,
  "Golden Branch of a Distant Sea": 114028,
  "Narukami's Wisdom": 114029,
  "Narukami's Joy": 114030,
  "Narukami's Affection": 114031,
  "Narukami's Valor": 114032,
  "Mask of the Wicked Lieutenant": 114033,
  "Mask of the Tiger's Bite": 114034,
  "Mask of the One-Horned": 114035,
  "Mask of the Kijin": 114036,
  "Slime Condensate": 112002,
  "Slime Secretions": 112003,
  "Slime Concentrate": 112004,
  "Damaged Mask": 112005,
  "Stained Mask": 112006,
  "Ominous Mask": 112007,
  "Divining Scroll": 112008,
  "Sealed Scroll": 112009,
  "Forbidden Curse Scroll": 112010,
  "Firm Arrowhead": 112011,
  "Sharp Arrowhead": 112012,
  "Weathered Arrowhead": 112013,
  "Recruit's Insignia": 112032,
  "Sergeant's Insignia": 112033,
  "Lieutenant's Insignia": 112034,
  "Treasure Hoarder Insignia": 112035,
  "Silver Raven Insignia": 112036,
  "Golden Raven Insignia": 112037,
  "Whopperflower Nectar": 112038,
  "Shimmering Nectar": 112039,
  "Energy Nectar": 112040,
  "Old Handguard": 112044,
  "Kageuchi Handguard": 112045,
  "Famed Handguard": 112046,
  "Fungal Spores": 112059,
  "Luminescent Pollen": 112060,
  "Crystalline Cyst Dust": 112061,
  "Mora": 202,
  "Wanderer's Advice": 104001,
  "Adventurer's Experience": 104002,
  "Hero's Wit": 104003,
  "Enhancement Ore": 104011,
  "Fine Enhancement Ore": 104012,
  "Mystic Enhancement Ore": 104013,
  "Valberry": 100022,
  "Cecilia": 100023,
  "Windwheel Aster": 100024,
  "Jueyun Chili": 100027,
  "Silk Flower": 100029,
  "Glaze Lily": 100030,
  "Qingxin": 100031,
  "Violetgrass": 100034,
  "Small Lamp Grass": 100055,
  "Calla Lily": 100056,
  "Dandelion Seed": 100057,
  "Cor Lapis": 100058,
  "Onikabuto": 101201,
  "Sakura Bloom": 101202,
  "Crystal Marrow": 101203,
  "Dendrobium": 101204,
  "Naku Weed": 101205,
  "Sea Ganoderma": 101206,
  "Sango Pearl": 101207,
  "Majestic Hooked Beak": 113036,
  "Thunderclap Fruitcore": 113037,
  "Perpetual Caliber": 113038,
  "Light Guiding Tetrahedron": 113039,
  "Quelled Creeper": 113040,
  "Puppet Strings": 113041,
  "Mirror of Mushin": 113042,
  "Daka's Bell": 113043,
  "Pseudo-Stamens": 113044,
  "Evergloom Ring": 113045,
  "Worldspan Fern": 113046,
  "Primordial Greenbloom": 113047,
  "Everamber": 113048,
  "Artificed Spare Clockwork Component — Coppelia": 113049,
  "Artificed Spare Clockwork Component — Coppelius": 113050,
  "Emperor's Resolution": 113051,
  "Copper Talisman of the Forest Dew": 114037,
  "Iron Talisman of the Forest Dew": 114038,
  "Silver Talisman of the Forest Dew": 114039,
  "Golden Talisman of the Forest Dew": 114040,
  "Oasis Garden's Reminiscence": 114041,
  "Oasis Garden's Kindness": 114042,
  "Oasis Garden's Mourning": 114043,
  "Oasis Garden's Truth": 114044,
  "Echo of Scorching Might": 114045,
  "Remnant Glow of Scorching Might": 114046,
  "Dream of Scorching Might": 114047,
  "Olden Days of Scorching Might": 114048,
  "Fragment of an Ancient Chord": 114049,
  "Chapter of an Ancient Chord": 114050,
  "Movement of an Ancient Chord": 114051,
  "Echo of an Ancient Chord": 114052,
  "Dross of Pure Sacred Dewdrop": 114053,
  "Sublimation of Pure Sacred Dewdrop": 114054,
  "Spring of Pure Sacred Dewdrop": 114055,
  "Essence of Pure Sacred Dewdrop": 114056,
  "Broken Goblet of the Pristine Sea": 114057,
  "Wine Goblet of the Pristine Sea": 114058,
  "Silver Goblet of the Pristine Sea": 114059,
  "Golden Goblet of the Pristine Sea": 114060,
  "Inactivated Fungal Nucleus": 112062,
  "Dormant Fungal Nucleus": 112063,
  "Robust Fungal Nucleus": 112064,
  "Faded Red Satin": 112065,
  "Trimmed Red Silk": 112066,
  "Rich Red Brocade": 112067,
  "Chaos Storage": 112068,
  "Chaos Module": 112069,
  "Chaos Bolt": 112070,
  "Damaged Prism": 112071,
  "Turbid Prism": 112072,
  "Radiant Prism": 112073,
  "Desiccated Shell": 112074,
  "Sturdy Shell": 112075,
  "Marked Shell": 112076,
  "A Flower Yet to Bloom": 112077,
  "Treasured Flower": 112078,
  "Wanderer's Blooming Flower": 112079,
  "Transoceanic Pearl": 112080,
  "Transoceanic Chunk": 112081,
  "Xenochromatic Crystal": 112082,
  "Meshing Gear": 112083,
  "Mechanical Spur Gear": 112084,
  "Artificed Dynamic Gear": 112085,
  "Drop of Tainted Water": 112086,
  "Scoop of Tainted Water": 112087,
  "Newborn Tainted Hydro Phantasm": 112088,
  "Rift Core": 112089,
  "Foreign Synapse": 112090,
  "Alien Life Core": 112091,
  "Rukkhashava Mushrooms": 101213,
  "Padisarah": 101214,
  "Nilotpala Lotus": 101215,
  "Harra Fruit": 101216,
  "Kalpalata Lotus": 101217,
  "Zaytun Peach": 101218,
  "Sumeru Rose": 101219,
  "Henna Berry": 101220,
  "Ajilenakh Nut": 101221,
  "Sand Grease Pupa": 101222,
  "Mourning Flower": 101223,
  "Trishiraite": 101224,
  "Scarab": 101225,
  "Activated Starshroom": 101226,
  "Scorched Starshroom": 101227,
  "Viparyas": 101228,
  "Pluie Lotus": 101229,
  "Bulle Fruit": 101230,
  "Marcotte": 101231,
  "Beryl Conch": 101232,
  "Romaritime Flower": 101233,
  "Tidalga": 101234,
  "Lumidouce Bell": 101235,
  "Rainbow Rose": 101236,
  "Blazing Sacrificial Heart's Terror": 114061,
  "Blazing Sacrificial Heart's Hesitance": 114062,
  "Blazing Sacrificial Heart's Resolve": 114063,
  "Blazing Sacrificial Heart's Splendor": 114064,
  "Delirious Decadence of the Sacred Lord": 114065,
  "Delirious Desolation of the Sacred Lord": 114066,
  "Delirious Demeanor of the Sacred Lord": 114067,
  "Delirious Divinity of the Sacred Lord": 114068,
  "Night-Wind's Mystic Consideration": 114069,
  "Night-Wind's Mystic Premonition": 114070,
  "Night-Wind's Mystic Augury": 114071,
  "Night-Wind's Mystic Revelation": 114072,
  "Artful Device Fragment": 114073,
  "Artful Device Replica": 114074,
  "Artful Device Inheritance": 114075,
  "Artful Device Wish": 114076,
  "Ember of Long Night Flint": 114077,
  "Afterglow of Long Night Flint": 114078,
  "Flare of Long Night Flint": 114079,
  "Blaze of Long Night Flint": 114080,
  "Sundered Glory of the Far-North Scions": 114081,
  "Unyielding Delusion of the Far-North Scions": 114082,
  "Oblation of the Far-North Scions": 114083,
  "Aureate Radiance of the Far-North Scions": 114084,
  "Rise of the Pale Star Army": 114085,
  "Muster of the Pale Star Army": 114086,
  "Clarion of the Pale Star Army": 114087,
  "Triumph of the Pale Star Army": 114088,
  "Measured Pour of the Cellared Spiritual Nectar": 114089,
  "Intoxication of the Cellared Spiritual Nectar": 114090,
  "Exhilaration of the Cellared Spiritual Nectar": 114091,
  "Revelry of the Cellared Spiritual Nectar": 114092,
  "The Frost Emperor's Revival": 114093,
  "The Frost Emperor's Ceremony": 114094,
  "The Frost Emperor's Lament": 114095,
  "The Frost Emperor's Farewell": 114096,
  "Lightless Mass": 113056,
  "Lightless Eye of the Maelstrom": 113055,
  "Lightless Silk String": 113054,
  "Fading Candle": 113060,
  "Silken Feather": 113061,
  "Denial and Judgment": 113062,
  "Fontemer Unihorn": 113053,
  "Tourbillon Device": 113052,
  "Water That Failed To Transcend": 113057,
  "Cloudseam Scale": 113058,
  "Fragment of a Golden Melody": 113059,
  "Lakelight Lily": 101238,
  "Spring of the First Dewdrop": 101240,
  "Subdetection Unit": 101239
};


// Expanded upgrade catalog. Existing item keys are retained.
const MATERIAL_CATALOG_EXPANSION = [
  {
    "name": "Slime Condensate",
    "type": "enemy",
    "rank": 1,
    "series": "Slimes",
    "where": "Slimes",
    "iconId": 112002
  },
  {
    "name": "Slime Secretions",
    "type": "enemy",
    "rank": 2,
    "series": "Slimes",
    "where": "Slimes",
    "iconId": 112003
  },
  {
    "name": "Slime Concentrate",
    "type": "enemy",
    "rank": 3,
    "series": "Slimes",
    "where": "Slimes",
    "iconId": 112004
  },
  {
    "name": "Damaged Mask",
    "type": "enemy",
    "rank": 1,
    "series": "Hilichurls",
    "where": "Hilichurls",
    "iconId": 112005
  },
  {
    "name": "Stained Mask",
    "type": "enemy",
    "rank": 2,
    "series": "Hilichurls",
    "where": "Hilichurls",
    "iconId": 112006
  },
  {
    "name": "Ominous Mask",
    "type": "enemy",
    "rank": 3,
    "series": "Hilichurls",
    "where": "Hilichurls",
    "iconId": 112007
  },
  {
    "name": "Divining Scroll",
    "type": "enemy",
    "rank": 1,
    "series": "Samachurls",
    "where": "Samachurls",
    "iconId": 112008
  },
  {
    "name": "Sealed Scroll",
    "type": "enemy",
    "rank": 2,
    "series": "Samachurls",
    "where": "Samachurls",
    "iconId": 112009
  },
  {
    "name": "Forbidden Curse Scroll",
    "type": "enemy",
    "rank": 3,
    "series": "Samachurls",
    "where": "Samachurls",
    "iconId": 112010
  },
  {
    "name": "Firm Arrowhead",
    "type": "enemy",
    "rank": 1,
    "series": "Hilichurl shooters",
    "where": "Hilichurl shooters",
    "iconId": 112011
  },
  {
    "name": "Sharp Arrowhead",
    "type": "enemy",
    "rank": 2,
    "series": "Hilichurl shooters",
    "where": "Hilichurl shooters",
    "iconId": 112012
  },
  {
    "name": "Weathered Arrowhead",
    "type": "enemy",
    "rank": 3,
    "series": "Hilichurl shooters",
    "where": "Hilichurl shooters",
    "iconId": 112013
  },
  {
    "name": "Recruit's Insignia",
    "type": "enemy",
    "rank": 1,
    "series": "Fatui Skirmishers",
    "where": "Fatui Skirmishers",
    "iconId": 112032
  },
  {
    "name": "Sergeant's Insignia",
    "type": "enemy",
    "rank": 2,
    "series": "Fatui Skirmishers",
    "where": "Fatui Skirmishers",
    "iconId": 112033
  },
  {
    "name": "Lieutenant's Insignia",
    "type": "enemy",
    "rank": 3,
    "series": "Fatui Skirmishers",
    "where": "Fatui Skirmishers",
    "iconId": 112034
  },
  {
    "name": "Treasure Hoarder Insignia",
    "type": "enemy",
    "rank": 1,
    "series": "Treasure Hoarders",
    "where": "Treasure Hoarders",
    "iconId": 112035
  },
  {
    "name": "Silver Raven Insignia",
    "type": "enemy",
    "rank": 2,
    "series": "Treasure Hoarders",
    "where": "Treasure Hoarders",
    "iconId": 112036
  },
  {
    "name": "Golden Raven Insignia",
    "type": "enemy",
    "rank": 3,
    "series": "Treasure Hoarders",
    "where": "Treasure Hoarders",
    "iconId": 112037
  },
  {
    "name": "Whopperflower Nectar",
    "type": "enemy",
    "rank": 1,
    "series": "Whopperflowers",
    "where": "Whopperflowers",
    "iconId": 112038
  },
  {
    "name": "Shimmering Nectar",
    "type": "enemy",
    "rank": 2,
    "series": "Whopperflowers",
    "where": "Whopperflowers",
    "iconId": 112039
  },
  {
    "name": "Energy Nectar",
    "type": "enemy",
    "rank": 3,
    "series": "Whopperflowers",
    "where": "Whopperflowers",
    "iconId": 112040
  },
  {
    "name": "Old Handguard",
    "type": "enemy",
    "rank": 1,
    "series": "Nobushi and Kairagi",
    "where": "Nobushi and Kairagi",
    "iconId": 112044
  },
  {
    "name": "Kageuchi Handguard",
    "type": "enemy",
    "rank": 2,
    "series": "Nobushi and Kairagi",
    "where": "Nobushi and Kairagi",
    "iconId": 112045
  },
  {
    "name": "Famed Handguard",
    "type": "enemy",
    "rank": 3,
    "series": "Nobushi and Kairagi",
    "where": "Nobushi and Kairagi",
    "iconId": 112046
  },
  {
    "name": "Spectral Husk",
    "type": "enemy",
    "rank": 1,
    "series": "Specters",
    "where": "Specters",
    "iconId": 112053
  },
  {
    "name": "Spectral Heart",
    "type": "enemy",
    "rank": 2,
    "series": "Specters",
    "where": "Specters",
    "iconId": 112054
  },
  {
    "name": "Spectral Nucleus",
    "type": "enemy",
    "rank": 3,
    "series": "Specters",
    "where": "Specters",
    "iconId": 112055
  },
  {
    "name": "Fungal Spores",
    "type": "enemy",
    "rank": 1,
    "series": "Fungi",
    "where": "Fungi",
    "iconId": 112059
  },
  {
    "name": "Luminescent Pollen",
    "type": "enemy",
    "rank": 2,
    "series": "Fungi",
    "where": "Fungi",
    "iconId": 112060
  },
  {
    "name": "Crystalline Cyst Dust",
    "type": "enemy",
    "rank": 3,
    "series": "Fungi",
    "where": "Fungi",
    "iconId": 112061
  },
  {
    "name": "Faded Red Satin",
    "type": "enemy",
    "rank": 1,
    "series": "Eremites",
    "where": "Eremites",
    "iconId": 112065
  },
  {
    "name": "Trimmed Red Silk",
    "type": "enemy",
    "rank": 2,
    "series": "Eremites",
    "where": "Eremites",
    "iconId": 112066
  },
  {
    "name": "Rich Red Brocade",
    "type": "enemy",
    "rank": 3,
    "series": "Eremites",
    "where": "Eremites",
    "iconId": 112067
  },
  {
    "name": "Transoceanic Pearl",
    "type": "enemy",
    "rank": 1,
    "series": "Fontemer Aberrants",
    "where": "Fontemer Aberrants",
    "iconId": 112080
  },
  {
    "name": "Transoceanic Chunk",
    "type": "enemy",
    "rank": 2,
    "series": "Fontemer Aberrants",
    "where": "Fontemer Aberrants",
    "iconId": 112081
  },
  {
    "name": "Xenochromatic Crystal",
    "type": "enemy",
    "rank": 3,
    "series": "Fontemer Aberrants",
    "where": "Fontemer Aberrants",
    "iconId": 112082
  },
  {
    "name": "Meshing Gear",
    "type": "enemy",
    "rank": 1,
    "series": "Clockwork Meka",
    "where": "Clockwork Meka",
    "iconId": 112083
  },
  {
    "name": "Mechanical Spur Gear",
    "type": "enemy",
    "rank": 2,
    "series": "Clockwork Meka",
    "where": "Clockwork Meka",
    "iconId": 112084
  },
  {
    "name": "Artificed Dynamic Gear",
    "type": "enemy",
    "rank": 3,
    "series": "Clockwork Meka",
    "where": "Clockwork Meka",
    "iconId": 112085
  },
  {
    "name": "Juvenile Fang",
    "type": "enemy",
    "rank": 1,
    "series": "Natlan Saurians",
    "where": "Natlan Saurians",
    "iconId": 112101
  },
  {
    "name": "Seasoned Fang",
    "type": "enemy",
    "rank": 2,
    "series": "Natlan Saurians",
    "where": "Natlan Saurians",
    "iconId": 112102
  },
  {
    "name": "Tyrant's Fang",
    "type": "enemy",
    "rank": 3,
    "series": "Natlan Saurians",
    "where": "Natlan Saurians",
    "iconId": 112103
  },
  {
    "name": "Sentry's Wooden Whistle",
    "type": "enemy",
    "rank": 1,
    "series": "Sauroform Tribal Warriors",
    "where": "Sauroform Tribal Warriors",
    "iconId": 112104
  },
  {
    "name": "Warrior's Metal Whistle",
    "type": "enemy",
    "rank": 2,
    "series": "Sauroform Tribal Warriors",
    "where": "Sauroform Tribal Warriors",
    "iconId": 112105
  },
  {
    "name": "Saurian-Crowned Warrior's Golden Whistle",
    "type": "enemy",
    "rank": 3,
    "series": "Sauroform Tribal Warriors",
    "where": "Sauroform Tribal Warriors",
    "iconId": 112106
  },
  {
    "name": "Broken Drive Shaft",
    "type": "enemy",
    "rank": 1,
    "series": "Landcruisers",
    "where": "Landcruisers",
    "iconId": 112122
  },
  {
    "name": "Reinforced Drive Shaft",
    "type": "enemy",
    "rank": 2,
    "series": "Landcruisers",
    "where": "Landcruisers",
    "iconId": 112123
  },
  {
    "name": "Precision Drive Shaft",
    "type": "enemy",
    "rank": 3,
    "series": "Landcruisers",
    "where": "Landcruisers",
    "iconId": 112124
  },
  {
    "name": "Tattered Warrant",
    "type": "enemy",
    "rank": 1,
    "series": "Fatui Oprichniki",
    "where": "Fatui Oprichniki",
    "iconId": 112125
  },
  {
    "name": "Immaculate Warrant",
    "type": "enemy",
    "rank": 2,
    "series": "Fatui Oprichniki",
    "where": "Fatui Oprichniki",
    "iconId": 112126
  },
  {
    "name": "Frost-Etched Warrant",
    "type": "enemy",
    "rank": 3,
    "series": "Fatui Oprichniki",
    "where": "Fatui Oprichniki",
    "iconId": 112127
  },
  {
    "name": "Ethereal Glimmershard",
    "type": "enemy",
    "rank": 1,
    "series": "Fae of Crystalline Flesh",
    "where": "Fae of Crystalline Flesh"
  },
  {
    "name": "Ethereal Crystal",
    "type": "enemy",
    "rank": 2,
    "series": "Fae of Crystalline Flesh",
    "where": "Fae of Crystalline Flesh"
  },
  {
    "name": "Ethereal Crystalscale Stone",
    "type": "enemy",
    "rank": 3,
    "series": "Fae of Crystalline Flesh",
    "where": "Fae of Crystalline Flesh"
  },
  {
    "name": "Chimeric Core",
    "type": "enemy",
    "rank": 1,
    "series": "Aberrant Chimeric Monsters",
    "where": "Aberrant Chimeric Monsters"
  },
  {
    "name": "Symbiotic Chimeric Nucleus",
    "type": "enemy",
    "rank": 2,
    "series": "Aberrant Chimeric Monsters",
    "where": "Aberrant Chimeric Monsters"
  },
  {
    "name": "Prime Chimeric Nexus",
    "type": "enemy",
    "rank": 3,
    "series": "Aberrant Chimeric Monsters",
    "where": "Aberrant Chimeric Monsters"
  },
  {
    "name": "Heavy Horn",
    "type": "enemy",
    "rank": 2,
    "series": "Mitachurls and Lawachurls",
    "where": "Mitachurls and Lawachurls",
    "iconId": 112014
  },
  {
    "name": "Black Bronze Horn",
    "type": "enemy",
    "rank": 3,
    "series": "Mitachurls and Lawachurls",
    "where": "Mitachurls and Lawachurls",
    "iconId": 112015
  },
  {
    "name": "Black Crystal Horn",
    "type": "enemy",
    "rank": 4,
    "series": "Mitachurls and Lawachurls",
    "where": "Mitachurls and Lawachurls",
    "iconId": 112016
  },
  {
    "name": "Gloomy Statuette",
    "type": "enemy",
    "rank": 2,
    "series": "Shadowy Husks",
    "where": "Shadowy Husks",
    "iconId": 112017
  },
  {
    "name": "Dark Statuette",
    "type": "enemy",
    "rank": 3,
    "series": "Shadowy Husks",
    "where": "Shadowy Husks",
    "iconId": 112018
  },
  {
    "name": "Deathly Statuette",
    "type": "enemy",
    "rank": 4,
    "series": "Shadowy Husks",
    "where": "Shadowy Husks",
    "iconId": 112019
  },
  {
    "name": "Dead Ley Line Branch",
    "type": "enemy",
    "rank": 2,
    "series": "Abyss Mages",
    "where": "Abyss Mages",
    "iconId": 112020
  },
  {
    "name": "Dead Ley Line Leaves",
    "type": "enemy",
    "rank": 3,
    "series": "Abyss Mages",
    "where": "Abyss Mages",
    "iconId": 112021
  },
  {
    "name": "Ley Line Sprout",
    "type": "enemy",
    "rank": 4,
    "series": "Abyss Mages",
    "where": "Abyss Mages",
    "iconId": 112022
  },
  {
    "name": "Chaos Device",
    "type": "enemy",
    "rank": 2,
    "series": "Ruin Guards and Ruin Hunters",
    "where": "Ruin Guards and Ruin Hunters",
    "iconId": 112023
  },
  {
    "name": "Chaos Circuit",
    "type": "enemy",
    "rank": 3,
    "series": "Ruin Guards and Ruin Hunters",
    "where": "Ruin Guards and Ruin Hunters",
    "iconId": 112024
  },
  {
    "name": "Chaos Core",
    "type": "enemy",
    "rank": 4,
    "series": "Ruin Guards and Ruin Hunters",
    "where": "Ruin Guards and Ruin Hunters",
    "iconId": 112025
  },
  {
    "name": "Mist Grass Pollen",
    "type": "enemy",
    "rank": 2,
    "series": "Fatui Cicin Mages",
    "where": "Fatui Cicin Mages",
    "iconId": 112026
  },
  {
    "name": "Mist Grass",
    "type": "enemy",
    "rank": 3,
    "series": "Fatui Cicin Mages",
    "where": "Fatui Cicin Mages",
    "iconId": 112027
  },
  {
    "name": "Mist Grass Wick",
    "type": "enemy",
    "rank": 4,
    "series": "Fatui Cicin Mages",
    "where": "Fatui Cicin Mages",
    "iconId": 112028
  },
  {
    "name": "Hunter's Sacrificial Knife",
    "type": "enemy",
    "rank": 2,
    "series": "Fatui Pyro Agents",
    "where": "Fatui Pyro Agents",
    "iconId": 112029
  },
  {
    "name": "Agent's Sacrificial Knife",
    "type": "enemy",
    "rank": 3,
    "series": "Fatui Pyro Agents",
    "where": "Fatui Pyro Agents",
    "iconId": 112030
  },
  {
    "name": "Inspector's Sacrificial Knife",
    "type": "enemy",
    "rank": 4,
    "series": "Fatui Pyro Agents",
    "where": "Fatui Pyro Agents",
    "iconId": 112031
  },
  {
    "name": "Fragile Bone Shard",
    "type": "enemy",
    "rank": 2,
    "series": "Geovishaps",
    "where": "Geovishaps",
    "iconId": 112041
  },
  {
    "name": "Sturdy Bone Shard",
    "type": "enemy",
    "rank": 3,
    "series": "Geovishaps",
    "where": "Geovishaps",
    "iconId": 112042
  },
  {
    "name": "Fossilized Bone Shard",
    "type": "enemy",
    "rank": 4,
    "series": "Geovishaps",
    "where": "Geovishaps",
    "iconId": 112043
  },
  {
    "name": "Chaos Gear",
    "type": "enemy",
    "rank": 2,
    "series": "Ruin Sentinels",
    "where": "Ruin Sentinels",
    "iconId": 112047
  },
  {
    "name": "Chaos Axis",
    "type": "enemy",
    "rank": 3,
    "series": "Ruin Sentinels",
    "where": "Ruin Sentinels",
    "iconId": 112048
  },
  {
    "name": "Chaos Oculus",
    "type": "enemy",
    "rank": 4,
    "series": "Ruin Sentinels",
    "where": "Ruin Sentinels",
    "iconId": 112049
  },
  {
    "name": "Dismal Prism",
    "type": "enemy",
    "rank": 2,
    "series": "Mirror Maidens",
    "where": "Mirror Maidens",
    "iconId": 112050
  },
  {
    "name": "Crystal Prism",
    "type": "enemy",
    "rank": 3,
    "series": "Mirror Maidens",
    "where": "Mirror Maidens",
    "iconId": 112051
  },
  {
    "name": "Polarizing Prism",
    "type": "enemy",
    "rank": 4,
    "series": "Mirror Maidens",
    "where": "Mirror Maidens",
    "iconId": 112052
  },
  {
    "name": "Concealed Claw",
    "type": "enemy",
    "rank": 2,
    "series": "Rifthounds",
    "where": "Rifthounds",
    "iconId": 112056
  },
  {
    "name": "Concealed Unguis",
    "type": "enemy",
    "rank": 3,
    "series": "Rifthounds",
    "where": "Rifthounds",
    "iconId": 112057
  },
  {
    "name": "Concealed Talon",
    "type": "enemy",
    "rank": 4,
    "series": "Rifthounds",
    "where": "Rifthounds",
    "iconId": 112058
  },
  {
    "name": "Inactivated Fungal Nucleus",
    "type": "enemy",
    "rank": 2,
    "series": "Activated or Scorched Fungi",
    "where": "Activated or Scorched Fungi",
    "iconId": 112062
  },
  {
    "name": "Dormant Fungal Nucleus",
    "type": "enemy",
    "rank": 3,
    "series": "Activated or Scorched Fungi",
    "where": "Activated or Scorched Fungi",
    "iconId": 112063
  },
  {
    "name": "Robust Fungal Nucleus",
    "type": "enemy",
    "rank": 4,
    "series": "Activated or Scorched Fungi",
    "where": "Activated or Scorched Fungi",
    "iconId": 112064
  },
  {
    "name": "Chaos Storage",
    "type": "enemy",
    "rank": 2,
    "series": "Ruin Drakes",
    "where": "Ruin Drakes",
    "iconId": 112068
  },
  {
    "name": "Chaos Module",
    "type": "enemy",
    "rank": 3,
    "series": "Ruin Drakes",
    "where": "Ruin Drakes",
    "iconId": 112069
  },
  {
    "name": "Chaos Bolt",
    "type": "enemy",
    "rank": 4,
    "series": "Ruin Drakes",
    "where": "Ruin Drakes",
    "iconId": 112070
  },
  {
    "name": "Damaged Prism",
    "type": "enemy",
    "rank": 2,
    "series": "Primal Constructs",
    "where": "Primal Constructs",
    "iconId": 112071
  },
  {
    "name": "Turbid Prism",
    "type": "enemy",
    "rank": 3,
    "series": "Primal Constructs",
    "where": "Primal Constructs",
    "iconId": 112072
  },
  {
    "name": "Radiant Prism",
    "type": "enemy",
    "rank": 4,
    "series": "Primal Constructs",
    "where": "Primal Constructs",
    "iconId": 112073
  },
  {
    "name": "Desiccated Shell",
    "type": "enemy",
    "rank": 2,
    "series": "Consecrated Beasts",
    "where": "Consecrated Beasts",
    "iconId": 112074
  },
  {
    "name": "Sturdy Shell",
    "type": "enemy",
    "rank": 3,
    "series": "Consecrated Beasts",
    "where": "Consecrated Beasts",
    "iconId": 112075
  },
  {
    "name": "Marked Shell",
    "type": "enemy",
    "rank": 4,
    "series": "Consecrated Beasts",
    "where": "Consecrated Beasts",
    "iconId": 112076
  },
  {
    "name": "A Flower Yet to Bloom",
    "type": "enemy",
    "rank": 2,
    "series": "Hilichurl Rogues",
    "where": "Hilichurl Rogues",
    "iconId": 112077
  },
  {
    "name": "Treasured Flower",
    "type": "enemy",
    "rank": 3,
    "series": "Hilichurl Rogues",
    "where": "Hilichurl Rogues",
    "iconId": 112078
  },
  {
    "name": "Wanderer's Blooming Flower",
    "type": "enemy",
    "rank": 4,
    "series": "Hilichurl Rogues",
    "where": "Hilichurl Rogues",
    "iconId": 112079
  },
  {
    "name": "Drop of Tainted Water",
    "type": "enemy",
    "rank": 2,
    "series": "Tainted Hydro Phantasms",
    "where": "Tainted Hydro Phantasms",
    "iconId": 112086
  },
  {
    "name": "Scoop of Tainted Water",
    "type": "enemy",
    "rank": 3,
    "series": "Tainted Hydro Phantasms",
    "where": "Tainted Hydro Phantasms",
    "iconId": 112087
  },
  {
    "name": "Newborn Tainted Hydro Phantasm",
    "type": "enemy",
    "rank": 4,
    "series": "Tainted Hydro Phantasms",
    "where": "Tainted Hydro Phantasms",
    "iconId": 112088
  },
  {
    "name": "Rift Core",
    "type": "enemy",
    "rank": 2,
    "series": "Breacher Primuses",
    "where": "Breacher Primuses",
    "iconId": 112089
  },
  {
    "name": "Foreign Synapse",
    "type": "enemy",
    "rank": 3,
    "series": "Breacher Primuses",
    "where": "Breacher Primuses",
    "iconId": 112090
  },
  {
    "name": "Alien Life Core",
    "type": "enemy",
    "rank": 4,
    "series": "Breacher Primuses",
    "where": "Breacher Primuses",
    "iconId": 112091
  },
  {
    "name": "Old Operative's Pocket Watch",
    "type": "enemy",
    "rank": 2,
    "series": "Fatui Operatives",
    "where": "Fatui Operatives",
    "iconId": 112092
  },
  {
    "name": "Operative's Standard Pocket Watch",
    "type": "enemy",
    "rank": 3,
    "series": "Fatui Operatives",
    "where": "Fatui Operatives",
    "iconId": 112093
  },
  {
    "name": "Operative's Constancy",
    "type": "enemy",
    "rank": 4,
    "series": "Fatui Operatives",
    "where": "Fatui Operatives",
    "iconId": 112094
  },
  {
    "name": "Feathery Fin",
    "type": "enemy",
    "rank": 2,
    "series": "Xuanwen Beasts",
    "where": "Xuanwen Beasts",
    "iconId": 112095
  },
  {
    "name": "Lunar Fin",
    "type": "enemy",
    "rank": 3,
    "series": "Xuanwen Beasts",
    "where": "Xuanwen Beasts",
    "iconId": 112096
  },
  {
    "name": "Chasmlight Fin",
    "type": "enemy",
    "rank": 4,
    "series": "Xuanwen Beasts",
    "where": "Xuanwen Beasts",
    "iconId": 112097
  },
  {
    "name": "Ruined Hilt",
    "type": "enemy",
    "rank": 2,
    "series": "Praetorian Golems",
    "where": "Praetorian Golems",
    "iconId": 112098
  },
  {
    "name": "Splintered Hilt",
    "type": "enemy",
    "rank": 3,
    "series": "Praetorian Golems",
    "where": "Praetorian Golems",
    "iconId": 112099
  },
  {
    "name": "Still-Smoldering Hilt",
    "type": "enemy",
    "rank": 4,
    "series": "Praetorian Golems",
    "where": "Praetorian Golems",
    "iconId": 112100
  },
  {
    "name": "Shard of a Shattered Will",
    "type": "enemy",
    "rank": 2,
    "series": "Wayob Manifestations",
    "where": "Wayob Manifestations",
    "iconId": 112107
  },
  {
    "name": "Locus of a Clear Will",
    "type": "enemy",
    "rank": 3,
    "series": "Wayob Manifestations",
    "where": "Wayob Manifestations",
    "iconId": 112108
  },
  {
    "name": "Sigil of a Striding Will",
    "type": "enemy",
    "rank": 4,
    "series": "Wayob Manifestations",
    "where": "Wayob Manifestations",
    "iconId": 112109
  },
  {
    "name": "Ignited Stone",
    "type": "enemy",
    "rank": 2,
    "series": "Lava Avatars",
    "where": "Lava Avatars",
    "iconId": 112110
  },
  {
    "name": "Ignited Seed of Life",
    "type": "enemy",
    "rank": 3,
    "series": "Lava Avatars",
    "where": "Lava Avatars",
    "iconId": 112111
  },
  {
    "name": "Ignited Seeing Eye",
    "type": "enemy",
    "rank": 4,
    "series": "Lava Avatars",
    "where": "Lava Avatars",
    "iconId": 112112
  },
  {
    "name": "Axis of the Secret Source",
    "type": "enemy",
    "rank": 2,
    "series": "Secret Source Automatons",
    "where": "Secret Source Automatons",
    "iconId": 112113
  },
  {
    "name": "Sheath of the Secret Source",
    "type": "enemy",
    "rank": 3,
    "series": "Secret Source Automatons",
    "where": "Secret Source Automatons",
    "iconId": 112114
  },
  {
    "name": "Heart of the Secret Source",
    "type": "enemy",
    "rank": 4,
    "series": "Secret Source Automatons",
    "where": "Secret Source Automatons",
    "iconId": 112115
  },
  {
    "name": "Refractive Bud",
    "type": "enemy",
    "rank": 2,
    "series": "Tenebrous Mimiflora",
    "where": "Tenebrous Mimiflora",
    "iconId": 112116
  },
  {
    "name": "Bewildering Broadleaf",
    "type": "enemy",
    "rank": 3,
    "series": "Tenebrous Mimiflora",
    "where": "Tenebrous Mimiflora",
    "iconId": 112117
  },
  {
    "name": "Illusory Leafcoil",
    "type": "enemy",
    "rank": 4,
    "series": "Tenebrous Mimiflora",
    "where": "Tenebrous Mimiflora",
    "iconId": 112118
  },
  {
    "name": "Cold-Cracked Shellshard",
    "type": "enemy",
    "rank": 2,
    "series": "Furnace Shell Mountain Weasels",
    "where": "Furnace Shell Mountain Weasels",
    "iconId": 112119
  },
  {
    "name": "Warm Back-Shell",
    "type": "enemy",
    "rank": 3,
    "series": "Furnace Shell Mountain Weasels",
    "where": "Furnace Shell Mountain Weasels",
    "iconId": 112120
  },
  {
    "name": "Blazing Prismshell",
    "type": "enemy",
    "rank": 4,
    "series": "Furnace Shell Mountain Weasels",
    "where": "Furnace Shell Mountain Weasels",
    "iconId": 112121
  },
  {
    "name": "Frostnight's Glimmer",
    "type": "enemy",
    "rank": 2,
    "series": "Frostnight Scions",
    "where": "Frostnight Scions",
    "iconId": 112128
  },
  {
    "name": "Frostnight's Glow",
    "type": "enemy",
    "rank": 3,
    "series": "Frostnight Scions",
    "where": "Frostnight Scions",
    "iconId": 112129
  },
  {
    "name": "Frostnight's Glory",
    "type": "enemy",
    "rank": 4,
    "series": "Frostnight Scions",
    "where": "Frostnight Scions",
    "iconId": 112130
  },
  {
    "name": "Lightless Bone",
    "type": "enemy",
    "rank": 2,
    "series": "Radiant Beasts",
    "where": "Radiant Beasts",
    "iconId": 112131
  },
  {
    "name": "Glowing Remains",
    "type": "enemy",
    "rank": 3,
    "series": "Radiant Beasts",
    "where": "Radiant Beasts",
    "iconId": 112132
  },
  {
    "name": "Radiant Exoskeleton",
    "type": "enemy",
    "rank": 4,
    "series": "Radiant Beasts",
    "where": "Radiant Beasts",
    "iconId": 112133
  },
  {
    "name": "Mistshroud Manifestation",
    "type": "enemy",
    "rank": 2,
    "series": "Mistshroud enemies",
    "where": "Mistshroud enemies",
    "iconId": 112134
  },
  {
    "name": "Mistshroud Plate",
    "type": "enemy",
    "rank": 3,
    "series": "Mistshroud enemies",
    "where": "Mistshroud enemies",
    "iconId": 112135
  },
  {
    "name": "Mistshroud Helmet",
    "type": "enemy",
    "rank": 4,
    "series": "Mistshroud enemies",
    "where": "Mistshroud enemies",
    "iconId": 112136
  },
  {
    "name": "Fractured Eye of the Deep Shadow",
    "type": "enemy",
    "rank": 2,
    "series": "Deep Shadow materials",
    "where": "Deep Shadow materials"
  },
  {
    "name": "Aberrant Core of the Deep Shadow",
    "type": "enemy",
    "rank": 3,
    "series": "Deep Shadow materials",
    "where": "Deep Shadow materials"
  },
  {
    "name": "Hooked Beak of the Deep Shadow",
    "type": "enemy",
    "rank": 4,
    "series": "Deep Shadow materials",
    "where": "Deep Shadow materials"
  },
  {
    "name": "Faded Flaming Hilt",
    "type": "enemy",
    "rank": 2,
    "series": "Flaming Hilt materials",
    "where": "Flaming Hilt materials"
  },
  {
    "name": "Fractured Flaming Hilt",
    "type": "enemy",
    "rank": 3,
    "series": "Flaming Hilt materials",
    "where": "Flaming Hilt materials"
  },
  {
    "name": "Jeweled Flaming Hilt",
    "type": "enemy",
    "rank": 4,
    "series": "Flaming Hilt materials",
    "where": "Flaming Hilt materials"
  },
  {
    "name": "Fractured Lunar Iron",
    "type": "enemy",
    "rank": 2,
    "series": "Lunar Iron materials",
    "where": "Lunar Iron materials"
  },
  {
    "name": "Depleted Lunar Iron",
    "type": "enemy",
    "rank": 3,
    "series": "Lunar Iron materials",
    "where": "Lunar Iron materials"
  },
  {
    "name": "Unblemished Lunar Iron",
    "type": "enemy",
    "rank": 4,
    "series": "Lunar Iron materials",
    "where": "Lunar Iron materials"
  },
  {
    "name": "Accreted Fragment",
    "type": "enemy",
    "rank": 2,
    "series": "Volkodlak Brutes",
    "where": "Volkodlak Brutes"
  },
  {
    "name": "Accreted Mass",
    "type": "enemy",
    "rank": 3,
    "series": "Volkodlak Brutes",
    "where": "Volkodlak Brutes"
  },
  {
    "name": "Accreted Growth",
    "type": "enemy",
    "rank": 4,
    "series": "Volkodlak Brutes",
    "where": "Volkodlak Brutes"
  },
  {
    "name": "Hollow Root of Life",
    "type": "enemy",
    "rank": 2,
    "series": "Wildwood Leshies",
    "where": "Wildwood Leshies"
  },
  {
    "name": "Sprout Node of Life",
    "type": "enemy",
    "rank": 3,
    "series": "Wildwood Leshies",
    "where": "Wildwood Leshies"
  },
  {
    "name": "Coiled Core of Life",
    "type": "enemy",
    "rank": 4,
    "series": "Wildwood Leshies",
    "where": "Wildwood Leshies"
  },
  {
    "name": "Snowborn Heartshard",
    "type": "enemy",
    "rank": 2,
    "series": "Snowborn enemies",
    "where": "Snowborn enemies"
  },
  {
    "name": "Snowborn Mirrorheart",
    "type": "enemy",
    "rank": 3,
    "series": "Snowborn enemies",
    "where": "Snowborn enemies"
  },
  {
    "name": "Snowborn Heart of Ignorance",
    "type": "enemy",
    "rank": 4,
    "series": "Snowborn enemies",
    "where": "Snowborn enemies"
  },
  {
    "name": "Calla Lily",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt"
  },
  {
    "name": "Cecilia",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt"
  },
  {
    "name": "Dandelion Seed",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt"
  },
  {
    "name": "Philanemo Mushroom",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt",
    "iconId": 100025
  },
  {
    "name": "Small Lamp Grass",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt"
  },
  {
    "name": "Valberry",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt"
  },
  {
    "name": "Windwheel Aster",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt"
  },
  {
    "name": "Wolfhook",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt",
    "iconId": 100021
  },
  {
    "name": "Etherwing Moth",
    "type": "local",
    "rank": 1,
    "region": "Mondstadt",
    "where": "Mondstadt",
    "iconId": 101272
  },
  {
    "name": "Cor Lapis",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue"
  },
  {
    "name": "Glaze Lily",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue"
  },
  {
    "name": "Jueyun Chili",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue"
  },
  {
    "name": "Noctilucous Jade",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue",
    "iconId": 100028
  },
  {
    "name": "Qingxin",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue"
  },
  {
    "name": "Silk Flower",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue"
  },
  {
    "name": "Starconch",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue",
    "iconId": 100033
  },
  {
    "name": "Violetgrass",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue"
  },
  {
    "name": "Clearwater Jade",
    "type": "local",
    "rank": 1,
    "region": "Liyue",
    "where": "Liyue",
    "iconId": 101241
  },
  {
    "name": "Amakumo Fruit",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma",
    "iconId": 101208
  },
  {
    "name": "Crystal Marrow",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Dendrobium",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Fluorescent Fungus",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma",
    "iconId": 101209
  },
  {
    "name": "Naku Weed",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Onikabuto",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Sakura Bloom",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Sango Pearl",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Sea Ganoderma",
    "type": "local",
    "rank": 1,
    "region": "Inazuma",
    "where": "Inazuma"
  },
  {
    "name": "Henna Berry",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Kalpalata Lotus",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Mourning Flower",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Nilotpala Lotus",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Padisarah",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Rukkhashava Mushrooms",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Sand Grease Pupa",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Scarab",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Trishiraite",
    "type": "local",
    "rank": 1,
    "region": "Sumeru",
    "where": "Sumeru"
  },
  {
    "name": "Beryl Conch",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Lakelight Lily",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Lumidouce Bell",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Lumitoile",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine",
    "iconId": 101237
  },
  {
    "name": "Rainbow Rose",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Romaritime Flower",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Spring of the First Dewdrop",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Subdetection Unit",
    "type": "local",
    "rank": 1,
    "region": "Fontaine",
    "where": "Fontaine"
  },
  {
    "name": "Brilliant Chrysanthemum",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan"
  },
  {
    "name": "Dracolite",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan",
    "iconId": 101255
  },
  {
    "name": "Glowing Hornshroom",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan"
  },
  {
    "name": "Quenepa Berry",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan"
  },
  {
    "name": "Saurian Claw Succulent",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan"
  },
  {
    "name": "Skysplit Gembloom",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan",
    "iconId": 101254
  },
  {
    "name": "Sprayfeather Gill",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan"
  },
  {
    "name": "Withering Purpurbloom",
    "type": "local",
    "rank": 1,
    "region": "Natlan",
    "where": "Natlan"
  },
  {
    "name": "Portable Bearing",
    "type": "local",
    "rank": 1,
    "region": "Nod-Krai",
    "where": "Nod-Krai",
    "iconId": 101257
  },
  {
    "name": "Frostlamp Flower",
    "type": "local",
    "rank": 1,
    "region": "Nod-Krai",
    "where": "Nod-Krai",
    "iconId": 101261
  },
  {
    "name": "Moonfall Silver",
    "type": "local",
    "rank": 1,
    "region": "Nod-Krai",
    "where": "Nod-Krai",
    "iconId": 101263
  },
  {
    "name": "Winter Icelea",
    "type": "local",
    "rank": 1,
    "region": "Nod-Krai",
    "where": "Nod-Krai",
    "iconId": 101268
  },
  {
    "name": "Pine Amber",
    "type": "local",
    "rank": 1,
    "region": "Nod-Krai",
    "where": "Nod-Krai"
  },
  {
    "name": "Teardrop of the Moon",
    "type": "local",
    "rank": 1,
    "region": "Nod-Krai",
    "where": "Nod-Krai",
    "iconId": 101270
  },
  {
    "name": "Fairy Wormwood",
    "type": "local",
    "rank": 1,
    "region": "Snezhnaya",
    "where": "Snezhnaya"
  },
  {
    "name": "Kristallfold",
    "type": "local",
    "rank": 1,
    "region": "Snezhnaya",
    "where": "Snezhnaya"
  },
  {
    "name": "Frostfairy Flower",
    "type": "local",
    "rank": 1,
    "region": "Snezhnaya",
    "where": "Snezhnaya"
  },
  {
    "name": "Golden Fern",
    "type": "local",
    "rank": 1,
    "region": "Snezhnaya",
    "where": "Snezhnaya"
  },
  {
    "name": "Flockingweed",
    "type": "local",
    "rank": 1,
    "region": "Snezhnaya",
    "where": "Snezhnaya"
  },
  {
    "name": "Crystalline Bloom",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Perpetual Caliber",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Artificed Spare Clockwork Component — Coppelia",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Artificed Spare Clockwork Component — Coppelius",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Mark of the Binding Blessing",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Overripe Flamegranate",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Gold-Inscribed Secret Source Core",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Ensnaring Gaze",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Talisman of the Enigmatic Land",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Sparkless Statue Core",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Secret Source Airflow Accumulator",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Precision Kuuvahki Stamping Die",
    "type": "boss",
    "rank": 4,
    "iconId": 113077
  },
  {
    "name": "Lightbearing Scale-Feather",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Radiant Antler",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Cyclic Military Kuuvahki Core",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Remnant of the Dreadwing",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Prismatic Severed Tail",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Plume of the Fallen Watcher",
    "type": "boss",
    "rank": 4,
    "iconId": 113086
  },
  {
    "name": "Unscorched Blossom Branch",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Severed Tail of the Sky-Roamer",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Vagabond's Cracked Armor",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Shattered Stability Anchor",
    "type": "boss",
    "rank": 4
  },
  {
    "name": "Eroded Horn",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Eroded Sunfire",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Eroded Scale-Feather",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Ascended Sample: Knight",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Ascended Sample: Rook",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Ascended Sample: Queen",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Mask of the Virtuous Doctor",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Madman's Restraint",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Elixir of the Heretic",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Counterfeit Resin",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Twisted Withered Branch",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Profaned Sprout",
    "type": "weekly",
    "rank": 5
  },
  {
    "name": "Brilliant Diamond Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Brilliant Diamond",
    "iconId": 104101
  },
  {
    "name": "Brilliant Diamond Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Brilliant Diamond",
    "iconId": 104102
  },
  {
    "name": "Brilliant Diamond Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Brilliant Diamond",
    "iconId": 104103
  },
  {
    "name": "Brilliant Diamond Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Brilliant Diamond",
    "iconId": 104104
  },
  {
    "name": "Agnidus Agate Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Agnidus Agate",
    "iconId": 104111
  },
  {
    "name": "Agnidus Agate Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Agnidus Agate",
    "iconId": 104112
  },
  {
    "name": "Agnidus Agate Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Agnidus Agate",
    "iconId": 104113
  },
  {
    "name": "Agnidus Agate Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Agnidus Agate",
    "iconId": 104114
  },
  {
    "name": "Varunada Lazurite Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Varunada Lazurite",
    "iconId": 104121
  },
  {
    "name": "Varunada Lazurite Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Varunada Lazurite",
    "iconId": 104122
  },
  {
    "name": "Varunada Lazurite Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Varunada Lazurite",
    "iconId": 104123
  },
  {
    "name": "Varunada Lazurite Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Varunada Lazurite",
    "iconId": 104124
  },
  {
    "name": "Nagadus Emerald Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Nagadus Emerald",
    "iconId": 104131
  },
  {
    "name": "Nagadus Emerald Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Nagadus Emerald",
    "iconId": 104132
  },
  {
    "name": "Nagadus Emerald Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Nagadus Emerald",
    "iconId": 104133
  },
  {
    "name": "Nagadus Emerald Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Nagadus Emerald",
    "iconId": 104134
  },
  {
    "name": "Vajrada Amethyst Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Vajrada Amethyst",
    "iconId": 104141
  },
  {
    "name": "Vajrada Amethyst Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Vajrada Amethyst",
    "iconId": 104142
  },
  {
    "name": "Vajrada Amethyst Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Vajrada Amethyst",
    "iconId": 104143
  },
  {
    "name": "Vajrada Amethyst Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Vajrada Amethyst",
    "iconId": 104144
  },
  {
    "name": "Vayuda Turquoise Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Vayuda Turquoise",
    "iconId": 104151
  },
  {
    "name": "Vayuda Turquoise Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Vayuda Turquoise",
    "iconId": 104152
  },
  {
    "name": "Vayuda Turquoise Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Vayuda Turquoise",
    "iconId": 104153
  },
  {
    "name": "Vayuda Turquoise Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Vayuda Turquoise",
    "iconId": 104154
  },
  {
    "name": "Shivada Jade Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Shivada Jade",
    "iconId": 104161
  },
  {
    "name": "Shivada Jade Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Shivada Jade",
    "iconId": 104162
  },
  {
    "name": "Shivada Jade Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Shivada Jade",
    "iconId": 104163
  },
  {
    "name": "Shivada Jade Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Shivada Jade",
    "iconId": 104164
  },
  {
    "name": "Prithiva Topaz Sliver",
    "type": "gem",
    "rank": 2,
    "series": "Prithiva Topaz",
    "iconId": 104171
  },
  {
    "name": "Prithiva Topaz Fragment",
    "type": "gem",
    "rank": 3,
    "series": "Prithiva Topaz",
    "iconId": 104172
  },
  {
    "name": "Prithiva Topaz Chunk",
    "type": "gem",
    "rank": 4,
    "series": "Prithiva Topaz",
    "iconId": 104173
  },
  {
    "name": "Prithiva Topaz Gemstone",
    "type": "gem",
    "rank": 5,
    "series": "Prithiva Topaz",
    "iconId": 104174
  },
  {
    "name": "Crown of Insight",
    "type": "other",
    "rank": 5,
    "where": "Events and other in-game rewards",
    "iconId": 104319
  },
  {
    "name": "Dream Solvent",
    "type": "other",
    "rank": 4,
    "where": "Weekly boss rewards",
    "iconId": 113021
  },
  {
    "name": "Dust of Azoth",
    "type": "other",
    "rank": 2,
    "where": "In-game exchange and other rewards"
  },
  {
    "name": "The Cornerstone of Stars and Flames",
    "type": "other",
    "rank": 5,
    "where": "Natlan quest and reputation rewards",
    "iconId": 113063
  }
];
