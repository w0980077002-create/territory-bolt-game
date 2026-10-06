import type {
  GameState,
  Chapter,
  Enemy,
  Equipment,
  InventoryItem,
  Quest,
  Achievement,
  Follower,
  ShopItem,
} from './types';

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export { RARITY_COLORS };

export const EQUIPMENT_SLOTS: { id: Equipment['slot']; nameKey: string; icon: string }[] = [
  { id: 'helmet', nameKey: 'slots.helmet', icon: '⛑️' },
  { id: 'amulet', nameKey: 'slots.amulet', icon: '📿' },
  { id: 'armor', nameKey: 'slots.armor', icon: '🥋' },
  { id: 'weapon', nameKey: 'slots.weapon', icon: '⚔️' },
  { id: 'shield', nameKey: 'slots.shield', icon: '🛡️' },
  { id: 'ring', nameKey: 'slots.ring', icon: '💍' },
  { id: 'boots', nameKey: 'slots.boots', icon: '🥾' },
];

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function createInitialGame(): GameState {
  return {
    player: {
      name: '',
      level: 1,
      xp: 0,
      xpToNext: xpForLevel(1),
      gold: 100,
      gems: 10,
      redGems: 0,
      energy: 20,
      maxEnergy: 20,
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 5,
        critChance: 5,
        critDamage: 50,
      },
      equipped: {},
    },
    inventory: [
      {
        id: 'potion_hp_1',
        name: '',
        nameKey: 'items.potionHp',
        icon: '🧪',
        type: 'potion',
        rarity: 'common',
        qty: 3,
        description: '',
        descKey: 'items.potionHpDesc',
        effect: { stat: 'hp', value: 50, duration: 'instant' },
      },
    ],
    currentChapter: 1,
    chapterWins: 0,
    totalBattlesWon: 0,
    totalBossesDefeated: 0,
    followers: [
      {
        id: 'follower_1',
        name: '',
        nameKey: 'follower.name',
        icon: '🛡️',
        level: 1,
        attack: 5,
        defense: 10,
        unlocked: false,
        description: '',
        descKey: 'follower.desc',
      },
    ],
    forgeMaterials: 0,
    storyProgress: 0,
    lastEnergyAt: Date.now(),
    dailyResetDay: new Date().toDateString(),
    belt: Array(7).fill(null),
    activeDays: 1,
    battleStones: 10,
    settings: { speed: 1, auto: false },
    blessing: { day: '', charges: 0 },
    dailyReward: { streak: 0, lastDay: '' },
    mailClaimed: [],
    trialLevel: 1,
    quests: createInitialQuests(),
    achievements: createInitialAchievements(),
  };
}

function makeEnemy(
  id: string,
  name: string,
  art: string,
  hp: number,
  attack: number,
  defense: number,
  isBoss: boolean,
  rewardGold: number,
  rewardXp: number,
  rewardLoot?: InventoryItem,
): Enemy {
  return { id, name, art, hp, maxHp: hp, attack, defense, isBoss, rewardGold, rewardXp, rewardLoot };
}

const ENEMY_KEYS = ['enemies.goblin', 'enemies.boar', 'enemies.bandit', 'enemies.wolf', 'enemies.troll'];
const ENEMY_ARTS = ['/enemy-goblin.webp', '/enemy-boar.webp', '/enemy-bandit.webp', '/enemy-wolf.webp', '/enemy-troll.webp'];

const BOSS_KEYS = [
  'enemies.boss1', 'enemies.boss2', 'enemies.boss3', 'enemies.boss4', 'enemies.boss5',
  'enemies.boss6', 'enemies.boss7', 'enemies.boss8', 'enemies.boss9', 'enemies.boss10',
];

export const PVE_STONE_COST = 1;

export function chapterTitleKey(num: number): string {
  const idx = ((num - 1) % 10) + 1;
  return `chapters.ch${idx}`;
}

export function generateChapter(num: number): Chapter {
  const baseHp = 60 + num * 20;
  const baseAtk = 12 + num * 4;
  const baseDef = 3 + num * 2;

  const enemies: Enemy[] = ENEMY_KEYS.map((key, i) =>
    makeEnemy(
      `ch${num}_enemy_${i}`,
      key,
      ENEMY_ARTS[i],
      Math.floor(baseHp * (0.8 + i * 0.1)),
      Math.floor(baseAtk * (0.8 + i * 0.1)),
      Math.floor(baseDef * (0.8 + i * 0.1)),
      false,
      15 + num * 5,
      20 + num * 8,
    ),
  );

  const boss = makeEnemy(
    `ch${num}_boss`,
    BOSS_KEYS[(num - 1) % BOSS_KEYS.length],
    '/enemy-boss.webp',
    Math.floor(baseHp * 2.2),
    Math.floor(baseAtk * 1.15),
    Math.floor(baseDef * 2),
    true,
    50 + num * 15,
    80 + num * 20,
    generateLoot(num),
  );

  return {
    number: num,
    title: chapterTitleKey(num),
    titleKey: chapterTitleKey(num),
    enemies,
    boss,
    winsNeeded: enemies.length,
    rewardGold: 30 + num * 10,
    rewardXp: 50 + num * 15,
  };
}

export function generateTrial(num: number): Enemy {
  const baseHp = 60 + num * 20;
  const baseAtk = 12 + num * 4;
  const baseDef = 3 + num * 2;
  return makeEnemy(
    `trial_${num}`,
    'enemies.trialGuard',
    '/enemy-viking.webp',
    Math.floor(baseHp * 1.8),
    Math.floor(baseAtk * 1.2),
    Math.floor(baseDef * 1.5),
    false,
    40 + num * 12,
    40 + num * 10,
  );
}

function generateLoot(chapter: number): InventoryItem {
  const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];
  const rarity = rarities[Math.min(Math.floor(chapter / 10), 3)];
  const isWeapon = Math.random() > 0.5;
  const nameKey = isWeapon ? 'items.winnerBlade' : 'items.warriorArmor';
  const eq: Equipment = {
    id: `loot_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    slot: isWeapon ? 'weapon' : 'armor',
    name: '',
    nameKey,
    icon: isWeapon ? '⚔️' : '🛡️',
    rarity,
    attack: isWeapon ? 10 + chapter * 3 : 0,
    defense: !isWeapon ? 5 + chapter * 2 : 0,
    hp: !isWeapon ? 20 + chapter * 5 : 0,
    level: chapter,
  };
  return {
    id: eq.id,
    name: '',
    nameKey,
    icon: eq.icon,
    type: 'equipment',
    rarity,
    qty: 1,
    description: '',
    descKey: 'items.levelRarity',
    equipment: eq,
  };
}

export function createInitialQuests(): Quest[] {
  return [
    {
      id: 'q_daily_1',
      title: '',
      titleKey: 'questsData.qDaily1Title',
      description: '',
      descKey: 'questsData.qDaily1Desc',
      icon: '⚔️',
      target: 3,
      current: 0,
      rewardGold: 50,
      rewardXp: 30,
      rewardGems: 1,
      rewardStones: 2,
      claimed: false,
      type: 'daily',
    },
    {
      id: 'q_daily_2',
      title: '',
      titleKey: 'questsData.qDaily2Title',
      description: '',
      descKey: 'questsData.qDaily2Desc',
      icon: '🛒',
      target: 50,
      current: 0,
      rewardGold: 30,
      rewardXp: 20,
      rewardGems: 1,
      claimed: false,
      type: 'daily',
    },
    {
      id: 'q_daily_3',
      title: '',
      titleKey: 'questsData.qDaily3Title',
      description: '',
      descKey: 'questsData.qDaily3Desc',
      icon: '🏟️',
      target: 3,
      current: 0,
      rewardGold: 80,
      rewardXp: 50,
      rewardGems: 2,
      rewardStones: 2,
      claimed: false,
      type: 'daily',
    },
    {
      id: 'q_weekly_1',
      title: '',
      titleKey: 'questsData.qWeekly1Title',
      description: '',
      descKey: 'questsData.qWeekly1Desc',
      icon: '🐉',
      target: 1,
      current: 0,
      rewardGold: 100,
      rewardXp: 80,
      rewardGems: 5,
      claimed: false,
      type: 'weekly',
    },
    {
      id: 'q_story_1',
      title: '',
      titleKey: 'questsData.qStory1Title',
      description: '',
      descKey: 'questsData.qStory1Desc',
      icon: '🗺️',
      target: 5,
      current: 0,
      rewardGold: 200,
      rewardXp: 150,
      rewardGems: 10,
      claimed: false,
      type: 'story',
    },
  ];
}

function createInitialAchievements(): Achievement[] {
  return [
    {
      id: 'ach_1',
      title: '',
      titleKey: 'achievements.ach1Title',
      description: '',
      descKey: 'achievements.ach1Desc',
      icon: '🥇',
      target: 1,
      current: 0,
      rewardGems: 5,
      claimed: false,
    },
    {
      id: 'ach_2',
      title: '',
      titleKey: 'achievements.ach2Title',
      description: '',
      descKey: 'achievements.ach2Desc',
      icon: '🥈',
      target: 10,
      current: 0,
      rewardGems: 10,
      claimed: false,
    },
    {
      id: 'ach_3',
      title: '',
      titleKey: 'achievements.ach3Title',
      description: '',
      descKey: 'achievements.ach3Desc',
      icon: '🗺️',
      target: 10,
      current: 0,
      rewardGems: 20,
      claimed: false,
    },
    {
      id: 'ach_4',
      title: '',
      titleKey: 'achievements.ach4Title',
      description: '',
      descKey: 'achievements.ach4Desc',
      icon: '👑',
      target: 5,
      current: 0,
      rewardGems: 15,
      claimed: false,
    },
    {
      id: 'ach_5',
      title: '',
      titleKey: 'achievements.ach5Title',
      description: '',
      descKey: 'achievements.ach5Desc',
      icon: '💰',
      target: 1000,
      current: 0,
      rewardGems: 10,
      claimed: false,
    },
  ];
}

let shopEquipmentCache: ShopItem[] | null = null;

function generateShopEquipment(): ShopItem[] {
  if (shopEquipmentCache) return shopEquipmentCache;

  const items: ShopItem[] = [
    {
      id: 'shop_weapon_warrior',
      name: '',
      nameKey: 'items.warriorSword',
      icon: '⚔️',
      type: 'equipment',
      rarity: 'common',
      priceGold: 100,
      description: '',
      descKey: 'items.warriorSwordDesc',
      equipment: {
        id: 'shop_weapon_warrior_eq',
        slot: 'weapon',
        name: '',
        nameKey: 'items.warriorSword',
        icon: '⚔️',
        rarity: 'common',
        attack: 8,
        level: 1,
      },
    },
    {
      id: 'shop_weapon_knight',
      name: '',
      nameKey: 'items.knightBlade',
      icon: '🗡️',
      type: 'equipment',
      rarity: 'rare',
      priceGold: 300,
      description: '',
      descKey: 'items.knightBladeDesc',
      equipment: {
        id: 'shop_weapon_knight_eq',
        slot: 'weapon',
        name: '',
        nameKey: 'items.knightBlade',
        icon: '🗡️',
        rarity: 'rare',
        attack: 18,
        critChance: 3,
        level: 3,
      },
    },
    {
      id: 'shop_weapon_hero',
      name: '',
      nameKey: 'items.heroSword',
      icon: '🔱',
      type: 'equipment',
      rarity: 'epic',
      priceGems: 30,
      priceGold: 0,
      description: '',
      descKey: 'items.heroSwordDesc',
      equipment: {
        id: 'shop_weapon_hero_eq',
        slot: 'weapon',
        name: '',
        nameKey: 'items.heroSword',
        icon: '🔱',
        rarity: 'epic',
        attack: 35,
        critChance: 8,
        level: 5,
      },
    },
    {
      id: 'shop_armor_leather',
      name: '',
      nameKey: 'items.leatherArmor',
      icon: '🦺',
      type: 'equipment',
      rarity: 'common',
      priceGold: 100,
      description: '',
      descKey: 'items.leatherArmorDesc',
      equipment: {
        id: 'shop_armor_leather_eq',
        slot: 'armor',
        name: '',
        nameKey: 'items.leatherArmor',
        icon: '🦺',
        rarity: 'common',
        defense: 5,
        hp: 30,
        level: 1,
      },
    },
    {
      id: 'shop_armor_plate',
      name: '',
      nameKey: 'items.plateArmor',
      icon: '🛡️',
      type: 'equipment',
      rarity: 'rare',
      priceGold: 350,
      description: '',
      descKey: 'items.plateArmorDesc',
      equipment: {
        id: 'shop_armor_plate_eq',
        slot: 'armor',
        name: '',
        nameKey: 'items.plateArmor',
        icon: '🛡️',
        rarity: 'rare',
        defense: 12,
        hp: 80,
        level: 3,
      },
    },
    {
      id: 'shop_helmet_iron',
      name: '',
      nameKey: 'items.ironHelmet',
      icon: '⛑️',
      type: 'equipment',
      rarity: 'common',
      priceGold: 80,
      description: '',
      descKey: 'items.ironHelmetDesc',
      equipment: {
        id: 'shop_helmet_iron_eq',
        slot: 'helmet',
        name: '',
        nameKey: 'items.ironHelmet',
        icon: '⛑️',
        rarity: 'common',
        defense: 3,
        hp: 20,
        level: 1,
      },
    },
    {
      id: 'shop_boots_swift',
      name: '',
      nameKey: 'items.swiftBoots',
      icon: '🥾',
      type: 'equipment',
      rarity: 'rare',
      priceGold: 200,
      description: '',
      descKey: 'items.swiftBootsDesc',
      equipment: {
        id: 'shop_boots_swift_eq',
        slot: 'boots',
        name: '',
        nameKey: 'items.swiftBoots',
        icon: '🥾',
        rarity: 'rare',
        defense: 4,
        hp: 40,
        critChance: 2,
        level: 2,
      },
    },
    {
      id: 'shop_ring_power',
      name: '',
      nameKey: 'items.powerRing',
      icon: '💍',
      type: 'equipment',
      rarity: 'epic',
      priceGems: 50,
      priceGold: 0,
      description: '',
      descKey: 'items.powerRingDesc',
      equipment: {
        id: 'shop_ring_power_eq',
        slot: 'ring',
        name: '',
        nameKey: 'items.powerRing',
        icon: '💍',
        rarity: 'epic',
        attack: 15,
        critChance: 5,
        level: 5,
      },
    },
    {
      id: 'shop_shield_oak',
      name: '',
      nameKey: 'items.oakShield',
      icon: '🛡️',
      type: 'equipment',
      rarity: 'common',
      priceGold: 120,
      description: '',
      descKey: 'items.oakShieldDesc',
      equipment: {
        id: 'shop_shield_oak_eq',
        slot: 'shield',
        name: '',
        nameKey: 'items.oakShield',
        icon: '🛡️',
        rarity: 'common',
        defense: 5,
        hp: 25,
        level: 2,
      },
    },
    {
      id: 'shop_amulet_raven',
      name: '',
      nameKey: 'items.ravenAmulet',
      icon: '📿',
      type: 'equipment',
      rarity: 'rare',
      priceGold: 260,
      description: '',
      descKey: 'items.ravenAmuletDesc',
      equipment: {
        id: 'shop_amulet_raven_eq',
        slot: 'amulet',
        name: '',
        nameKey: 'items.ravenAmulet',
        icon: '📿',
        rarity: 'rare',
        attack: 6,
        critChance: 3,
        level: 3,
      },
    },
  ];

  shopEquipmentCache = items;
  return items;
}

export function generateShopItems(chapter: number): ShopItem[] {
  const consumables: ShopItem[] = [
    {
      id: 'shop_potion_hp',
      name: '',
      nameKey: 'items.potionHp',
      icon: '🧪',
      type: 'potion',
      rarity: 'common',
      priceGold: 25,
      description: '',
      descKey: 'items.potionHpShopDesc',
      effect: { stat: 'hp', value: 50, duration: 'instant' },
    },
    {
      id: 'shop_potion_hp_large',
      name: '',
      nameKey: 'items.potionHpLarge',
      icon: '⚗️',
      type: 'potion',
      rarity: 'rare',
      priceGold: 60,
      description: '',
      descKey: 'items.potionHpLargeDesc',
      effect: { stat: 'hp', value: 150, duration: 'instant' },
    },
    {
      id: 'shop_elixir_atk',
      name: '',
      nameKey: 'items.elixirAtk',
      icon: '💪',
      type: 'elixir',
      rarity: 'rare',
      priceGold: 80,
      description: '',
      descKey: 'items.elixirAtkDesc',
      effect: { stat: 'attack', value: 10, duration: 'battle' },
    },
    {
      id: 'shop_elixir_def',
      name: '',
      nameKey: 'items.elixirDef',
      icon: '🛡️',
      type: 'elixir',
      rarity: 'rare',
      priceGold: 80,
      description: '',
      descKey: 'items.elixirDefDesc',
      effect: { stat: 'defense', value: 10, duration: 'battle' },
    },
    {
      id: 'shop_elixir_crit',
      name: '',
      nameKey: 'items.elixirCrit',
      icon: '🎯',
      type: 'elixir',
      rarity: 'epic',
      priceGold: 150,
      description: '',
      descKey: 'items.elixirCritDesc',
      effect: { stat: 'critChance', value: 15, duration: 'battle' },
    },
    {
      id: 'shop_arena_time',
      name: '',
      nameKey: 'items.arenaTime',
      icon: '⏳',
      type: 'arena',
      rarity: 'rare',
      priceGold: 60,
      description: '',
      descKey: 'items.arenaTimeDesc',
      arenaEffect: 'time',
    },
    {
      id: 'shop_arena_adrenaline',
      name: '',
      nameKey: 'items.arenaAdrenaline',
      icon: '💉',
      type: 'arena',
      rarity: 'epic',
      priceGold: 0,
      priceGems: 3,
      description: '',
      descKey: 'items.arenaAdrenalineDesc',
      arenaEffect: 'adrenaline',
    },
    {
      id: 'shop_stone_1',
      name: '',
      nameKey: 'items.stone',
      icon: '',
      type: 'stone',
      rarity: 'rare',
      priceGold: 0,
      priceGems: 2,
      amount: 1,
      description: '',
      descKey: 'items.stoneDesc',
    },
    {
      id: 'shop_stone_5',
      name: '',
      nameKey: 'items.stoneBundle',
      icon: '',
      type: 'stone',
      rarity: 'epic',
      priceGold: 0,
      priceGems: 8,
      amount: 5,
      description: '',
      descKey: 'items.stoneBundleDesc',
    },
    {
      id: 'shop_gem_pack_1',
      name: '',
      nameKey: 'items.gemPackSmall',
      icon: '💎',
      type: 'gem_pack',
      rarity: 'rare',
      priceGems: 0,
      priceGold: 200,
      amount: 5,
      description: '',
      descKey: 'items.gemPackSmallDesc',
    },
    {
      id: 'shop_gem_pack_2',
      name: '',
      nameKey: 'items.gemPackLarge',
      icon: '💎',
      type: 'gem_pack',
      rarity: 'epic',
      priceGems: 0,
      priceGold: 500,
      amount: 15,
      description: '',
      descKey: 'items.gemPackLargeDesc',
    },
    {
      id: 'shop_forge_material',
      name: '',
      nameKey: 'items.forgeMaterial',
      icon: '🔩',
      type: 'material',
      rarity: 'common',
      priceGold: 50,
      description: '',
      descKey: 'items.forgeMaterialDesc',
    },
  ];

  const equipment = generateShopEquipment();
  return [...consumables, ...equipment];
}

export function getComputedStats(state: GameState): GameState['player']['stats'] {
  const base = { ...state.player.stats };
  for (const eq of Object.values(state.player.equipped)) {
    if (!eq) continue;
    if (eq.attack) base.attack += eq.attack;
    if (eq.defense) base.defense += eq.defense;
    if (eq.hp) {
      base.maxHp += eq.hp;
      base.hp += eq.hp;
    }
    if (eq.critChance) base.critChance += eq.critChance;
  }
  return base;
}
