// Game catalog data — keep item names and IDs exact.

'use strict';

const TEAM_TEMPLATES = [
  {
    "name": "Raiden National",
    "style": "Vaporize / Overload",
    "members": [
      "Raiden Shogun",
      "Xiangling",
      "Xingqiu",
      "Bennett"
    ],
    "tip": "Strong Burst-focused rotation with energy and reactions."
  },
  {
    "name": "Hyperbloom Core",
    "style": "Hyperbloom",
    "members": [
      "Nahida",
      "Xingqiu",
      "Kuki Shinobu",
      "Yelan"
    ],
    "tip": "Dendro + Hydro seeds triggered by Electro; EM matters on the trigger."
  },
  {
    "name": "Neuvillette Carry",
    "style": "Charged Attack / Buffs",
    "members": [
      "Neuvillette",
      "Furina",
      "Kaedehara Kazuha",
      "Xilonen"
    ],
    "tip": "Build Neuvillette’s charged attack damage and team buffs."
  },
  {
    "name": "Hu Tao Double Hydro",
    "style": "Vaporize",
    "members": [
      "Hu Tao",
      "Yelan",
      "Xingqiu",
      "Zhongli"
    ],
    "tip": "Off-field Hydro supports Hu Tao’s charged attacks."
  },
  {
    "name": "Ayaka Freeze",
    "style": "Freeze",
    "members": [
      "Kamisato Ayaka",
      "Shenhe",
      "Kaedehara Kazuha",
      "Sangonomiya Kokomi"
    ],
    "tip": "Grouped enemies, Cryo buffs and Ayaka’s Burst damage."
  },
  {
    "name": "Keqing Aggravate",
    "style": "Aggravate",
    "members": [
      "Keqing",
      "Fischl",
      "Nahida",
      "Kaedehara Kazuha"
    ],
    "tip": "Electro damage with Dendro Quicken aura."
  },
  {
    "name": "Arlecchino Vaporize",
    "style": "Vaporize",
    "members": [
      "Arlecchino",
      "Yelan",
      "Bennett",
      "Zhongli"
    ],
    "tip": "On-field Pyro damage supported by buffs and protection."
  },
  {
    "name": "Navia Geo Core",
    "style": "Crystallize / Geo",
    "members": [
      "Navia",
      "Xilonen",
      "Bennett",
      "Xiangling"
    ],
    "tip": "Geo damage and Crystallize support from Pyro teammates."
  },
  {
    "name": "Mavuika Carry",
    "style": "Pyro Carry",
    "members": [
      "Mavuika",
      "Xilonen",
      "Citlali",
      "Bennett"
    ],
    "tip": "Pyro damage and support buffs; review rotation requirements."
  },
  {
    "name": "Xiao Plunge",
    "style": "Plunging Attacks",
    "members": [
      "Xiao",
      "Xianyun",
      "Furina",
      "Faruzan"
    ],
    "tip": "Build plunging damage with Anemo buffs and team support."
  },
  {
    "name": "Classic National",
    "style": "Vaporize / Swirl",
    "members": [
      "Xiangling",
      "Xingqiu",
      "Bennett",
      "Sucrose"
    ],
    "tip": "An accessible reaction-oriented core."
  },
  {
    "name": "Nilou Bloom",
    "style": "Bloom",
    "members": [
      "Nilou",
      "Nahida",
      "Collei",
      "Sangonomiya Kokomi"
    ],
    "tip": "Hydro and Dendro only for Nilou’s Bountiful Core condition."
  }
];
