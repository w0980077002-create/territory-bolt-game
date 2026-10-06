import { useSyncExternalStore } from 'react';

export type Lang = 'ru' | 'en';

const STORAGE_KEY = 'territory_lang';

let currentLang: Lang = loadLang();

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {}
  return 'ru';
}

const listeners = new Set<() => void>();

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    () => {
      const fn = () => {};
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getLang,
    getLang,
  );
}

/**
 * Translate a key. Supports nested keys via dot notation.
 * Interpolation: replaces {name} placeholders with values from params.
 * Falls back to ru if key is missing in the current lang.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const lang = currentLang;
  const dict = DICTS[lang] ?? DICTS.ru;
  const fallback = DICTS.ru;
  let val: string | undefined = resolveKey(dict, key) ?? resolveKey(fallback, key);
  if (val === undefined) {
    console.warn('[i18n] missing key:', key);
    return key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      val = val!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return val!;
}

function resolveKey(dict: Dict, key: string): string | undefined {
  const parts = key.split('.');
  let cur: DictValue = dict;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Dict)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

type DictValue = string | Dict;
type Dict = { [key: string]: DictValue };

const ru: Dict = {
  // --- App / General ---
  app: {
    name: 'Territory',
    loading: 'Загрузка...',
    loadingHero: 'Загрузка героя...',
    loadingError: 'Не удалось загрузить прогресс. Проверь интернет и обнови страницу.',
    saveError: 'Ошибка сохранения',
    saved: 'Сохранено',
    progressAuto: 'Прогресс сохраняется автоматически',
    startGame: 'Начать игру',
    heroName: 'Имя героя',
    heroNamePlaceholder: 'Например, Рагнар',
    welcome: 'Сражайся с монстрами, побеждай на арене и стань легендой',
    noConnection: 'Нет связи с сервером',
    createError: 'Не удалось создать героя. Попробуй ещё раз.',
    defaultHero: 'Герой',
  },
  // --- Tabs ---
  tabs: {
    home: 'Дом',
    battle: 'Бой',
    arena: 'Арена',
    inventory: 'Сумка',
    shop: 'Лавка',
    forge: 'Кузница',
    quests: 'Квесты',
    leaderboard: 'Топ',
    profile: 'Профиль',
  },
  // --- Common ---
  common: {
    level: 'Уровень',
    xp: 'Опыт',
    gold: 'Золото',
    gems: 'Кристаллы',
    energy: 'Энергия',
    attack: 'Атака',
    defense: 'Защита',
    hp: 'Здоровье',
    crit: 'Крит',
    critChance: 'Шанс крита',
    critDamage: 'Сила крита',
    strength: 'Сила',
    fortitude: 'Стойкость',
    stones: 'Боевые камни',
    material: 'Материалы',
    coins: 'Монеты',
    blueGems: 'Синие кристаллы',
    redGems: 'Красные кристаллы',
    close: 'Закрыть',
    buy: 'Купить',
    equip: 'Надеть',
    unequip: 'Снять',
    putOnBelt: 'На пояс',
    takeOffBelt: 'Снять с пояса',
    empty: 'Пусто',
    refresh: 'Обновить',
    levelShort: 'ур.',
    lvl: 'Ур.',
    chapter: 'Глава',
    floor: 'Этаж',
    reward: 'Награда',
    rewards: 'Награды',
    xpReward: '{n} опыта',
    next: 'Следующий бой',
    claimed: 'Получено',
    claim: 'Забрать',
    locked: 'Заблокировано',
    toMap: 'К карте',
    toTrials: 'К испытаниям',
    surrender: 'Сдаться',
    you: '(ты)',
    active: 'Активен',
    expand: 'Нажми на ячейку, чтобы увидеть предмет',
    search: 'Идём...',
    cancel: 'Отмена',
  },
  // --- Home screen ---
  home: {
    stats: 'Характеристики',
    statistics: 'Статистика',
    wins: 'Побед',
    bosses: 'Боссов',
    chapterProgress: 'Победы: {won} / {needed}',
    chapterHint: 'Победи {needed} обычных врагов, чтобы открыть босса.',
    bossReady: ' Босс готов к бою!',
    follower: 'Уровень {lvl} · Атака +{atk}',
  },
  // --- Battle screen ---
  battle: {
    campaign: 'Поход',
    trial: 'Испытания',
    oneFightCost: 'Один бой стоит {n} камень',
    noStones: 'Нет боевых камней. Получи их за ежедневную награду, задания или купи в Лавке.',
    toShop: 'В Лавку',
    defeatAll: 'Победи всех врагов и босса, чтобы открыть главу {n}.',
    stage: 'Этап {n}',
    boss: 'Босс',
    fight: 'Бой',
    towerOfTrials: 'Башня испытаний',
    startTrial: 'Начать испытание',
    floorRewards: 'Награды этажей',
    bossOfChapter: 'Босс главы',
    trialLevel: 'Испытание {n}',
  },
  // --- PVE fight ---
  pve: {
    battleStart: 'Бой начался: {name}',
    defense: 'Защита',
    attack: 'Удар',
    autoBattle: 'Автобой',
    strike: 'УДАР',
    speed: 'Скорость боя',
    beltElixirs: 'Пояс с эликсирами',
    gear: 'Снаряжение',
    autoHint: 'Автобой: зоны выбираются сами',
    blockHint: 'Защита: выбери ещё {n}',
    attackHint: 'Выбери зону удара',
    readyHint: 'Жми УДАР',
    surrender: 'Сдаться',
    toMap: 'К карте',
    toTrials: 'К испытаниям',
    victory: 'ПОБЕДА',
    defeat: 'ПОРАЖЕНИЕ',
    defeatHint: 'Улучши снаряжение в Кузнице или возьми эликсиры в пояс и попробуй снова.',
    nextFight: 'Следующий бой',
    slotClosed: 'Этот слот пояса ещё закрыт',
    slotEmpty: 'Слот пуст — положи эликсир из инвентаря',
    potionArenaOnly: '{name} действует только на арене',
    potionNoUse: 'Этот предмет нельзя выпить в бою',
    hpFull: 'Здоровье уже полное',
    hpRestored: '+{n} HP',
    atkBoost: '+{n} к атаке до конца боя',
    defBoost: '+{n} к защите до конца боя',
    critBoost: '+{n}% к криту до конца боя',
    dodge: '{target} уклоняется от удара {attacker}',
    block: '{target} блокирует удар в {zone}',
    crit: '{attacker} — КРИТ в {zone}: −{amount}',
    hit: '{attacker} бьёт в {zone}: −{amount}',
  },
  // --- Inventory ---
  inventory: {
    items: 'Предметы',
    equipment: 'Экипировка',
    belt: 'Пояс',
    beltHint: 'нажми на слот, чтобы снять',
    consumables: 'Расходники',
    materials: 'Материалы',
    empty: 'Инвентарь пуст',
    equipped: 'Надето',
    inBag: 'В сумке',
    noEquipment: 'Нет экипировки в сумке',
    noEquipmentHint: 'Побеждай боссов, чтобы получать предметы!',
    effect: 'Эффект: +{val} {stat}',
    beltOnlyHint: 'В бою пьётся только с пояса: до {n} шт. в одном слоте.',
    arenaOnly: 'Действует только в бою на арене',
    beltFull: 'На поясе нет свободного слота',
    slotEmpty: 'Слот {n} пуст',
    slotClosed: 'Слот {n} закрыт',
  },
  // --- Shop ---
  shop: {
    potions: 'Зелья',
    gear: 'Снаряжение',
    resources: 'Ресурсы',
    title: 'Лавка',
    subtitle: 'Зелья, снаряжение и боевые камни',
    bought: 'Куплено',
    price: 'Цена',
    yourBalance: 'У тебя: {n}',
    noFunds: 'Не хватает средств',
    resultStones: '+{n} боевых камней',
    resultGems: '+{n} синих кристаллов',
    resultMaterial: '+1 материал для кузницы',
    resultEquipment: 'Предмет добавлен в инвентарь',
    resultDefault: 'Добавлено в инвентарь',
  },
  // --- Forge ---
  forge: {
    title: 'Кузница',
    subtitle: 'Улучшай экипировку за золото и материалы',
    notEnoughGold: 'Недостаточно золота',
    notEnoughMats: 'Недостаточно материалов кузницы',
    success: 'Улучшение успешно! Предмет стал сильнее!',
    failure: 'Неудача! Предмет не улучшился, но материалы потрачены.',
    equippedGear: 'Надетая экипировка',
    inBag: 'В сумке',
    noGear: 'Нет экипировки для улучшения',
    noGearHint: 'Побеждай боссов, чтобы получить предметы!',
    upgradeCost: 'Стоимость улучшения',
    successRate: 'Шанс успеха: {n}%',
    now: 'Сейчас',
    upgrade: 'Улучшить',
    working: 'Кузнец работает...',
    levelDesc: 'Уровень {n} · {rarity}',
    equippedDesc: 'Надето · Уровень {n}',
    equippedDescRarity: 'Надето · Уровень {n} · {rarity}',
  },
  // --- Quests ---
  quests: {
    title: 'Задания',
    readyHint: 'Готово к получению: {n}',
    defaultHint: 'Выполняй задания и получай боевые камни',
    daily: 'Ежедневные',
    dailyHint: 'Обновляются каждый день',
    weekly: 'Еженедельные',
    weeklyHint: 'Сложнее, но щедрее',
    story: 'Сюжетные',
    storyHint: 'Путь героя',
    claim: 'Забрать',
  },
  // --- Profile ---
  profile: {
    baseStats: 'Базовые характеристики',
    computedStats: 'С учётом экипировки',
    equipment: 'Экипировка',
    battleRecord: 'Боевой путь',
    wins: 'Побед',
    bosses: 'Боссов',
    chapter: 'Глава',
  },
  // --- Leaderboard ---
  leaderboard: {
    title: 'Топ игроков',
    byRating: 'По рейтингу',
    byWins: 'По победам',
    loadError: 'Не удалось загрузить рейтинг. Проверь связь.',
    loading: 'Загрузка...',
    empty: 'Пока нет игроков в рейтинге',
    emptyHint: 'Сыграй на арене, чтобы попасть в топ!',
    refresh: 'Обновить',
    rating: '{n} рейтинг',
    winsCount: '{n} побед',
    top100: 'TOP 100',
  },
  // --- Arena ---
  arena: {
    title: 'Арена',
    rules: 'Правила',
    rating: 'Рейтинг',
    wins: 'Победы',
    losses: 'Поражения',
    beltTitle: 'Пояс с зельями',
    beltHint: 'в бою доступно только то, что на поясе',
    beltActionHint: 'Нажми на зелье, чтобы вернуть его в сумку. Положить — в инвентаре.',
    noEnergy: 'Не хватает энергии. 1 единица восстанавливается каждые 5 минут.',
    duel: 'Дуэль',
    duelSize: '1 на 1',
    duelDesc: 'Классический поединок один на один',
    duelBonus: 'Награда x1',
    team: 'Отряд',
    teamSize: '3 на 3',
    teamDesc: 'Командный бой: прикрывай союзников и выбирай цели',
    teamBonus: 'Награда x1.2',
    chaos: 'Хаос',
    chaosSize: 'до 20 на 20',
    chaosDesc: 'Случайные команды и настоящая мясорубка',
    chaosBonus: 'Награда x1.5',
    energyCost: '{n} энергия',
    rulesTitle: 'Как проходит бой',
    modeDuel: 'Дуэль 1х1',
    modeTeam: 'Отряд 3х3',
    modeChaos: 'Хаос',
    gathering: 'Сбор бойцов',
    roundN: 'Раунд {n}',
    battleOver: 'Бой окончен',
    waiting: 'Ищем соперников...',
    startsIn: 'Бой начнётся через {n} сек.',
    onArena: 'На арене: {names}',
    cancelSearch: 'Отменить поиск',
    searchingOpponents: 'Ищем соперников...',
    victory: 'Победа!',
    draw: 'Ничья',
    defeat: 'Поражение',
    goldReward: '+{n} золота',
    xpReward: '+{n} опыта',
    ratingReward: '{sign}{n} рейтинга',
    kills: 'убийств: {n}',
    ratingLabel: 'Рейтинг: {sign}{n}',
    chatOpen: 'Чат открыт, пока ты в комнате',
    leaveRoom: 'Покинуть комнату',
    noConnectionArena: 'Нет связи с ареной, переподключаюсь...',
    enteringArena: 'Вход на арену...',
    enemies: 'Противники · {team}',
    allies: 'Твоя команда · {team}',
    leaveBattle: 'Покинуть бой',
    leaveBattleTitle: 'Покинуть бой?',
    leaveBattleAlive: 'Ты будешь считаться павшим, и бой может быть проигран.',
    leaveBattleDead: 'Ты больше не увидишь чат этого боя.',
    stay: 'Остаться',
    exit: 'Выйти',
    beltItemHint: 'Нажми на зелье, чтобы выпить (одно за раунд)',
    beltIdleHint: 'Пояс с зельями — собирается в сумке',
    elixirsItems: 'Эликсиры и предметы',
    allyCanRevive: 'Союзник может вернуть тебя адреналином. Следи за боем в чате.',
    noEnemies: 'Противников нет',
    youDied: 'Ты пал',
    autoBattle: 'Автобой',
    waitingPlayers: 'Ждём {moved}/{alive}',
    chooseTarget: 'Выбери цель',
    chooseAttackZone: 'Выбери зону удара',
    attackTarget: 'Удар по {name}',
    defenseCount: 'Защита {n}/2',
    autoVipLock: 'Автобой доступен с VIP {n}',
    autoHint: 'Сервер будет бить за тебя',
    repeatTitle: 'Повторить прошлый выбор зон',
    beltNoUse: 'Этот предмет нельзя использовать в бою',
    beltActiveOnly: 'Пояс работает только во время боя, пока ты в строю',
    adrenalineTeamOnly: 'Адреналин работает только в командных боях',
    revive: 'Оживить',
    moveDone: 'Ход сделан',
    timeoutLabel: 'Тайм на ход: {n} сек.',
    seconds: '{n}с',
    teamWolves: 'Волки',
    teamRavens: 'Вороны',
  },
  // --- Arena chat ---
  chat: {
    title: 'Лог боя и чат',
    all: 'Всё',
    chatOnly: 'Только чат',
    empty: 'Пока тихо...',
    placeholder: 'Написать в чат...',
    send: 'Отправить',
  },
  // --- Arena rules ---
  rules: {
    r1: 'Каждый раунд выбери цель, 2 из 4 зон защиты слева и 1 зону удара справа, затем жми «УДАР».',
    r2: 'Удар в заблокированную зону не проходит. Критический удар пробивает блок, но слабее.',
    r3: 'Удар в голову сильнее (×1.25), по ногам слабее (×0.85).',
    r4: 'На ход даётся тайм — 60 сек. Не успел сходить — выбываешь из боя по тайму.',
    r5: 'Зелье времени сокращает тайм на 10 сек., но не меньше 30 сек.',
    r6: 'В бою работает только то, что лежит на поясе: до 5 шт. в слоте, одно зелье за раунд, каждый эликсир — один раз за бой.',
    r7: 'Иногда боец успевает увернуться от удара — даже если зона не закрыта.',
    r8: 'Павший остаётся в комнате до конца боя. Союзник может вернуть его адреналином.',
    r9: 'Автобой: сервер бьёт за тебя, даже если ты свернул игру.',
    r10: 'После боя чат остаётся, пока ты не покинешь комнату.',
  },
  // --- Arena API errors ---
  errors: {
    not_active: 'Бой уже не идёт',
    not_member: 'Ты не участвуешь в этом бою',
    dead: 'Павшие не могут действовать',
    invalid_zones: 'Выбери 1 зону удара и 2 разные зоны защиты',
    invalid_target: 'Эта цель недоступна',
    already_moved: 'Ход в этом раунде уже сделан',
    too_fast: 'Не так быстро',
    min_timeout: 'Тайм уже минимальный — 30 сек.',
    revive_limit: 'Адреналин можно использовать не больше 3 раз за бой',
    no_player: 'Профиль героя не найден',
    vip_required: 'Автобой доступен с VIP 3 уровня',
    item_round: 'Только одно зелье за раунд',
    full_hp: 'Здоровье и так полное',
    buff_active: 'Этот эликсир уже действует в этом бою',
    connection: 'Связь с ареной прервалась. Попробуй ещё раз.',
  },
  // --- Belt rules ---
  belt: {
    slot1: 'Открыт сразу',
    slot2: 'Уровень 5',
    slot3: 'Уровень 12 и 5 дней в игре',
    slot4: 'Уровень 20 и 14 дней в игре',
    slot5: '150 побед на арене',
    slot6: 'Клановый квест «Сага рода»',
    slot7: 'Легенда Вальхаллы: уровень 40 и 500 побед на арене',
    levelProgress: 'уровень {val}',
    levelDaysProgress: 'уровень {lvl} · дни {days}',
    winsProgress: 'победы {val}',
    clanHint: 'откроется вместе с кланами',
    levelWinsProgress: 'уровень {lvl} · победы {wins}',
    slotFree: 'Слот {n} свободен — положи сюда зелье из сумки (до {max} шт.)',
    slotRule: 'Слот {n}: {title}',
    empty: 'пусто',
  },
  // --- Fighter figure ---
  fighter: {
    dodge: 'Уклон!',
    block: 'Блок',
    crit: 'КРИТ',
  },
  // --- Gear strip ---
  gear: {
    attackShort: 'атк',
    defenseShort: 'защ',
    critShort: 'крит',
    level: 'ур. {n}',
    empty: '{slot}: пусто — загляни в магазин или кузницу',
  },
  // --- Hero parts ---
  heroParts: {
    strength: 'Сила',
    fortitude: 'Стойкость',
    health: 'Здоровье',
    critChance: 'Шанс крита',
    critDamage: 'Сила крита',
    level: 'ур. {n}',
    empty: '{slot}: пусто',
    gearHint: 'Нажми на ячейку, чтобы увидеть предмет',
  },
  // --- Currency labels ---
  currency: {
    gold: 'Монеты',
    gems: 'Синие кристаллы',
    redGems: 'Красные кристаллы',
    stones: 'Боевые камни',
    material: 'Материалы',
  },
  // --- Equipment slots ---
  slots: {
    helmet: 'Шлем',
    amulet: 'Амулет',
    armor: 'Броня',
    weapon: 'Оружие',
    shield: 'Щит',
    ring: 'Кольцо',
    boots: 'Сапоги',
  },
  // --- Zones ---
  zones: {
    head: 'Голова',
    chest: 'Грудь',
    belly: 'Живот',
    legs: 'Ноги',
  },
  // --- Rarity ---
  rarity: {
    common: 'Обычный',
    rare: 'Редкий',
    epic: 'Эпический',
    legendary: 'Легендарный',
  },
  // --- Game data: enemies ---
  enemies: {
    goblin: 'Гоблин-разведчик',
    boar: 'Дикий кабан',
    bandit: 'Лесной разбойник',
    wolf: 'Тёмный волк',
    troll: 'Пещерный тролль',
    boss1: 'Вождь разбойников',
    boss2: 'Ярл Севера',
    boss3: 'Тёмный жрец',
    boss4: 'Король нежити',
    boss5: 'Страж кургана',
    boss6: 'Демон бездны',
    boss7: 'Король великанов',
    boss8: 'Повелитель бурь',
    boss9: 'Огненный лорд',
    boss10: 'Тень хаоса',
    trialGuard: 'Страж испытаний',
  },
  // --- Game data: chapter titles ---
  chapters: {
    ch1: 'Тёмный лес',
    ch2: 'Северные земли',
    ch3: 'Ледяные фьорды',
    ch4: 'Пещеры троллей',
    ch5: 'Курганы предков',
    ch6: 'Огненные пустоши',
    ch7: 'Земли великанов',
    ch8: 'Мост Биврёст',
    ch9: 'Чертоги Хель',
    ch10: 'Врата Асгарда',
  },
  // --- Game data: items ---
  items: {
    potionHp: 'Зелье здоровья',
    potionHpLarge: 'Большое зелье здоровья',
    elixirAtk: 'Эликсир силы',
    elixirDef: 'Эликсир защиты',
    elixirCrit: 'Эликсир крита',
    arenaTime: 'Зелье времени',
    arenaAdrenaline: 'Адреналин',
    stone: 'Боевой камень',
    stoneBundle: 'Связка боевых камней',
    gemPackSmall: 'Малый набор кристаллов',
    gemPackLarge: 'Большой набор кристаллов',
    forgeMaterial: 'Материалы кузницы',
    potionHpDesc: 'Восстанавливает 50 HP',
    potionHpLargeDesc: 'Восстанавливает 150 HP мгновенно',
    potionHpShopDesc: 'Восстанавливает 50 HP мгновенно',
    elixirAtkDesc: '+10 к атаке на один бой',
    elixirDefDesc: '+10 к защите на один бой',
    elixirCritDesc: '+15% к шансу крита на один бой',
    arenaTimeDesc: 'Арена: сокращает тайм боя на 10 сек. (не меньше 30 сек.)',
    arenaAdrenalineDesc: 'Арена: возвращает павшего союзника в бой с 50% здоровья',
    stoneDesc: 'Тратится на один бой в походе или Испытаниях',
    stoneBundleDesc: '5 боевых камней со скидкой',
    gemPackSmallDesc: 'Получи 5 кристаллов',
    gemPackLargeDesc: 'Получи 15 кристаллов',
    forgeMaterialDesc: '1 материал для улучшения экипировки',
    // Equipment
    warriorSword: 'Меч воина',
    knightBlade: 'Клинок рыцаря',
    heroSword: 'Героический меч',
    leatherArmor: 'Кожаная броня',
    plateArmor: 'Латные доспехи',
    ironHelmet: 'Железный шлем',
    swiftBoots: 'Сапоги скорости',
    powerRing: 'Кольцо силы',
    oakShield: 'Дубовый щит',
    ravenAmulet: 'Амулет ворона',
    // Equipment descriptions
    warriorSwordDesc: 'Надёжный стальной меч. +8 к атаке.',
    knightBladeDesc: 'Острый клинок. +18 к атаке, +3% крит.',
    heroSwordDesc: 'Легендарное оружие. +35 к атаке, +8% крит.',
    leatherArmorDesc: 'Базовая защита. +5 к защите, +30 HP.',
    plateArmorDesc: 'Тяжёлая броня. +12 к защите, +80 HP.',
    ironHelmetDesc: 'Защита головы. +3 к защите, +20 HP.',
    swiftBootsDesc: 'Лёгкие сапоги. +4 к защите, +40 HP, +2% крит.',
    powerRingDesc: 'Магическое кольцо. +15 к атаке, +5% крит.',
    oakShieldDesc: 'Окованный железом щит. +5 к защите, +25 HP.',
    ravenAmuletDesc: 'Оберег из кости ворона. +6 к атаке, +3% крит.',
    // Loot
    winnerBlade: 'Клинок победителя',
    warriorArmor: 'Доспех воина',
    levelRarity: 'Уровень {n} · {rarity}',
  },
  // --- Quests data ---
  questsData: {
    qDaily1Title: 'Победить 3 врагов',
    qDaily1Desc: 'Победи 3 врагов в PvE-боях',
    qDaily2Title: 'Потратить 50 золота',
    qDaily2Desc: 'Купи что-нибудь в лавке',
    qDaily3Title: 'Гладиатор',
    qDaily3Desc: 'Победи 3 раза на арене',
    qWeekly1Title: 'Победить босса',
    qWeekly1Desc: 'Победи босса в любой главе',
    qStory1Title: 'Пройти 5 глав',
    qStory1Desc: 'Дойди до 6-й главы',
  },
  // --- Achievements ---
  achievements: {
    ach1Title: 'Первый воин',
    ach1Desc: 'Победи 1 врага',
    ach2Title: 'Опытный боец',
    ach2Desc: 'Победи 10 врагов',
    ach3Title: 'Покоритель глав',
    ach3Desc: 'Пройди 10 глав',
    ach4Title: 'Убийца боссов',
    ach4Desc: 'Победи 5 боссов',
    ach5Title: 'Богатей',
    ach5Desc: 'Накопи 1000 золота',
  },
  // --- Follower ---
  follower: {
    name: 'Верный щит',
    desc: 'Спутник, который помогает в бою. Открывается на 3 уровне.',
  },
  // --- Mail ---
  mail: {
    welcomeFrom: 'Совет ярлов',
    welcomeTitle: 'Добро пожаловать в Territory',
    welcomeBody: 'Земли ждут нового героя. Проходи главы похода, сражайся на арене и собирай снаряжение. Прими подарок на первые шаги.',
    stonesFrom: 'Хранитель камней',
    stonesTitle: 'Боевые камни',
    stonesBody: 'Каждый бой в походе и в Испытаниях стоит 1 боевой камень. Камни не восстанавливаются сами: получай их за ежедневную награду, задания и в Лавке.',
  },
};

const en: Dict = {
  // --- App / General ---
  app: {
    name: 'Territory',
    loading: 'Loading...',
    loadingHero: 'Loading hero...',
    loadingError: 'Failed to load progress. Check your internet and refresh the page.',
    saveError: 'Save error',
    saved: 'Saved',
    progressAuto: 'Progress saves automatically',
    startGame: 'Start Game',
    heroName: 'Hero name',
    heroNamePlaceholder: 'e.g. Ragnar',
    welcome: 'Fight monsters, win in the arena and become a legend',
    noConnection: 'No server connection',
    createError: 'Failed to create hero. Try again.',
    defaultHero: 'Hero',
  },
  // --- Tabs ---
  tabs: {
    home: 'Home',
    battle: 'Battle',
    arena: 'Arena',
    inventory: 'Bag',
    shop: 'Shop',
    forge: 'Forge',
    quests: 'Quests',
    leaderboard: 'Top',
    profile: 'Profile',
  },
  // --- Common ---
  common: {
    level: 'Level',
    xp: 'XP',
    gold: 'Gold',
    gems: 'Gems',
    energy: 'Energy',
    attack: 'Attack',
    defense: 'Defense',
    hp: 'Health',
    crit: 'Crit',
    critChance: 'Crit Chance',
    critDamage: 'Crit Damage',
    strength: 'Strength',
    fortitude: 'Fortitude',
    stones: 'Battle Stones',
    material: 'Materials',
    coins: 'Coins',
    blueGems: 'Blue Gems',
    redGems: 'Red Gems',
    close: 'Close',
    buy: 'Buy',
    equip: 'Equip',
    unequip: 'Unequip',
    putOnBelt: 'To Belt',
    takeOffBelt: 'Remove',
    empty: 'Empty',
    refresh: 'Refresh',
    levelShort: 'lvl',
    lvl: 'Lvl',
    chapter: 'Chapter',
    floor: 'Floor',
    reward: 'Reward',
    rewards: 'Rewards',
    xpReward: '{n} XP',
    next: 'Next Fight',
    claimed: 'Claimed',
    claim: 'Claim',
    locked: 'Locked',
    toMap: 'To Map',
    toTrials: 'To Trials',
    surrender: 'Surrender',
    you: '(you)',
    active: 'Active',
    expand: 'Tap a slot to see the item',
    search: 'Searching...',
    cancel: 'Cancel',
  },
  // --- Home screen ---
  home: {
    stats: 'Stats',
    statistics: 'Statistics',
    wins: 'Wins',
    bosses: 'Bosses',
    chapterProgress: 'Wins: {won} / {needed}',
    chapterHint: 'Defeat {needed} regular enemies to unlock the boss.',
    bossReady: ' Boss is ready to fight!',
    follower: 'Level {lvl} · Attack +{atk}',
  },
  // --- Battle screen ---
  battle: {
    campaign: 'Campaign',
    trial: 'Trials',
    oneFightCost: 'One fight costs {n} stone',
    noStones: 'No battle stones. Get them from daily rewards, quests or buy in the Shop.',
    toShop: 'To Shop',
    defeatAll: 'Defeat all enemies and the boss to unlock chapter {n}.',
    stage: 'Stage {n}',
    boss: 'Boss',
    fight: 'Fight',
    towerOfTrials: 'Tower of Trials',
    startTrial: 'Start Trial',
    floorRewards: 'Floor Rewards',
    bossOfChapter: 'Chapter Boss',
    trialLevel: 'Trial {n}',
  },
  // --- PVE fight ---
  pve: {
    battleStart: 'Battle started: {name}',
    defense: 'Block',
    attack: 'Strike',
    autoBattle: 'Auto',
    strike: 'STRIKE',
    speed: 'Battle speed',
    beltElixirs: 'Elixir Belt',
    gear: 'Gear',
    autoHint: 'Auto-battle: zones are chosen automatically',
    blockHint: 'Block: choose {n} more',
    attackHint: 'Choose a strike zone',
    readyHint: 'Hit STRIKE',
    surrender: 'Surrender',
    toMap: 'To Map',
    toTrials: 'To Trials',
    victory: 'VICTORY',
    defeat: 'DEFEAT',
    defeatHint: 'Upgrade your gear in the Forge or load elixirs into your belt and try again.',
    nextFight: 'Next Fight',
    slotClosed: 'This belt slot is still locked',
    slotEmpty: 'Slot is empty — put an elixir from your inventory',
    potionArenaOnly: '{name} only works in the arena',
    potionNoUse: 'This item cannot be used in battle',
    hpFull: 'Health is already full',
    hpRestored: '+{n} HP',
    atkBoost: '+{n} attack for the rest of the battle',
    defBoost: '+{n} defense for the rest of the battle',
    critBoost: '+{n}% crit chance for the rest of the battle',
    dodge: '{target} dodges {attacker}\'s strike',
    block: '{target} blocks the strike to {zone}',
    crit: '{attacker} — CRIT to {zone}: −{amount}',
    hit: '{attacker} strikes {zone}: −{amount}',
  },
  // --- Inventory ---
  inventory: {
    items: 'Items',
    equipment: 'Equipment',
    belt: 'Belt',
    beltHint: 'tap a slot to remove',
    consumables: 'Consumables',
    materials: 'Materials',
    empty: 'Inventory is empty',
    equipped: 'Equipped',
    inBag: 'In Bag',
    noEquipment: 'No equipment in bag',
    noEquipmentHint: 'Defeat bosses to get items!',
    effect: 'Effect: +{val} {stat}',
    beltOnlyHint: 'In battle you can only drink from the belt: up to {n} per slot.',
    arenaOnly: 'Only works in arena battles',
    beltFull: 'No free belt slot',
    slotEmpty: 'Slot {n} is empty',
    slotClosed: 'Slot {n} is locked',
  },
  // --- Shop ---
  shop: {
    potions: 'Potions',
    gear: 'Gear',
    resources: 'Resources',
    title: 'Shop',
    subtitle: 'Potions, gear and battle stones',
    bought: 'Purchased',
    price: 'Price',
    yourBalance: 'You have: {n}',
    noFunds: 'Not enough funds',
    resultStones: '+{n} battle stones',
    resultGems: '+{n} blue gems',
    resultMaterial: '+1 forge material',
    resultEquipment: 'Item added to inventory',
    resultDefault: 'Added to inventory',
  },
  // --- Forge ---
  forge: {
    title: 'Forge',
    subtitle: 'Upgrade gear with gold and materials',
    notEnoughGold: 'Not enough gold',
    notEnoughMats: 'Not enough forge materials',
    success: 'Upgrade successful! The item got stronger!',
    failure: 'Failed! The item was not upgraded, but materials were spent.',
    equippedGear: 'Equipped Gear',
    inBag: 'In Bag',
    noGear: 'No equipment to upgrade',
    noGearHint: 'Defeat bosses to get items!',
    upgradeCost: 'Upgrade Cost',
    successRate: 'Success rate: {n}%',
    now: 'Current',
    upgrade: 'Upgrade',
    working: 'Blacksmith is working...',
    levelDesc: 'Level {n} · {rarity}',
    equippedDesc: 'Equipped · Level {n}',
    equippedDescRarity: 'Equipped · Level {n} · {rarity}',
  },
  // --- Quests ---
  quests: {
    title: 'Quests',
    readyHint: 'Ready to claim: {n}',
    defaultHint: 'Complete quests to earn battle stones',
    daily: 'Daily',
    dailyHint: 'Reset every day',
    weekly: 'Weekly',
    weeklyHint: 'Harder but more rewarding',
    story: 'Story',
    storyHint: 'Hero\'s journey',
    claim: 'Claim',
  },
  // --- Profile ---
  profile: {
    baseStats: 'Base Stats',
    computedStats: 'With Equipment',
    equipment: 'Equipment',
    battleRecord: 'Battle Record',
    wins: 'Wins',
    bosses: 'Bosses',
    chapter: 'Chapter',
  },
  // --- Leaderboard ---
  leaderboard: {
    title: 'Top Players',
    byRating: 'By Rating',
    byWins: 'By Wins',
    loadError: 'Failed to load leaderboard. Check your connection.',
    loading: 'Loading...',
    empty: 'No players in the ranking yet',
    emptyHint: 'Play in the arena to make the leaderboard!',
    refresh: 'Refresh',
    rating: '{n} rating',
    winsCount: '{n} wins',
    top100: 'TOP 100',
  },
  // --- Arena ---
  arena: {
    title: 'Arena',
    rules: 'Rules',
    rating: 'Rating',
    wins: 'Wins',
    losses: 'Losses',
    beltTitle: 'Potion Belt',
    beltHint: 'in battle only what\'s on the belt is available',
    beltActionHint: 'Tap a potion to return it to your bag. To add — go to inventory.',
    noEnergy: 'Not enough energy. 1 unit regenerates every 5 minutes.',
    duel: 'Duel',
    duelSize: '1 vs 1',
    duelDesc: 'Classic one-on-one duel',
    duelBonus: 'Reward x1',
    team: 'Team',
    teamSize: '3 vs 3',
    teamDesc: 'Team battle: cover allies and pick targets',
    teamBonus: 'Reward x1.2',
    chaos: 'Chaos',
    chaosSize: 'up to 20 vs 20',
    chaosDesc: 'Random teams and a real bloodbath',
    chaosBonus: 'Reward x1.5',
    energyCost: '{n} energy',
    rulesTitle: 'How battles work',
    modeDuel: 'Duel 1v1',
    modeTeam: 'Team 3v3',
    modeChaos: 'Chaos',
    gathering: 'Gathering fighters',
    roundN: 'Round {n}',
    battleOver: 'Battle over',
    waiting: 'Searching for opponents...',
    startsIn: 'Battle starts in {n} sec.',
    onArena: 'In the arena: {names}',
    cancelSearch: 'Cancel search',
    searchingOpponents: 'Searching for opponents...',
    victory: 'Victory!',
    draw: 'Draw',
    defeat: 'Defeat',
    goldReward: '+{n} gold',
    xpReward: '+{n} XP',
    ratingReward: '{sign}{n} rating',
    kills: 'kills: {n}',
    ratingLabel: 'Rating: {sign}{n}',
    chatOpen: 'Chat stays open while you\'re in the room',
    leaveRoom: 'Leave Room',
    noConnectionArena: 'No arena connection, reconnecting...',
    enteringArena: 'Entering arena...',
    enemies: 'Enemies · {team}',
    allies: 'Your Team · {team}',
    leaveBattle: 'Leave Battle',
    leaveBattleTitle: 'Leave Battle?',
    leaveBattleAlive: 'You\'ll be counted as fallen, and the battle may be lost.',
    leaveBattleDead: 'You won\'t see this battle\'s chat anymore.',
    stay: 'Stay',
    exit: 'Leave',
    beltItemHint: 'Tap a potion to drink (one per round)',
    beltIdleHint: 'Potion belt — assembled in your inventory',
    elixirsItems: 'Elixirs & Items',
    allyCanRevive: 'An ally can revive you with adrenaline. Follow the battle in chat.',
    noEnemies: 'No enemies',
    youDied: 'You fell',
    autoBattle: 'Auto',
    waitingPlayers: 'Waiting {moved}/{alive}',
    chooseTarget: 'Choose target',
    chooseAttackZone: 'Choose a strike zone',
    attackTarget: 'Strike at {name}',
    defenseCount: 'Block {n}/2',
    autoVipLock: 'Auto-battle requires VIP {n}',
    autoHint: 'The server will fight for you',
    repeatTitle: 'Repeat last zone selection',
    beltNoUse: 'This item cannot be used in battle',
    beltActiveOnly: 'Belt only works during battle while you\'re alive',
    adrenalineTeamOnly: 'Adrenaline only works in team battles',
    revive: 'Revive',
    moveDone: 'Move made',
    timeoutLabel: 'Turn timer: {n} sec.',
    seconds: '{n}s',
    teamWolves: 'Wolves',
    teamRavens: 'Ravens',
  },
  // --- Arena chat ---
  chat: {
    title: 'Battle Log & Chat',
    all: 'All',
    chatOnly: 'Chat only',
    empty: 'Quiet so far...',
    placeholder: 'Write in chat...',
    send: 'Send',
  },
  // --- Arena rules ---
  rules: {
    r1: 'Each round choose a target, 2 of 4 block zones on the left and 1 strike zone on the right, then hit STRIKE.',
    r2: 'A strike to a blocked zone doesn\'t land. A critical hit breaks through the block but is weaker.',
    r3: 'A strike to the head is stronger (×1.25), to the legs weaker (×0.85).',
    r4: 'Each turn has a timer — 60 sec. If you don\'t act in time, you\'re eliminated by timeout.',
    r5: 'Time potion reduces the timer by 10 sec., but no less than 30 sec.',
    r6: 'In battle only what\'s on the belt works: up to 5 per slot, one potion per round, each elixir once per battle.',
    r7: 'Sometimes a fighter dodges a strike — even if the zone wasn\'t blocked.',
    r8: 'A fallen fighter stays in the room until the battle ends. An ally can revive them with adrenaline.',
    r9: 'Auto-battle: the server fights for you even if you minimized the game.',
    r10: 'After the battle, chat remains until you leave the room.',
  },
  // --- Arena API errors ---
  errors: {
    not_active: 'The battle is no longer active',
    not_member: 'You are not in this battle',
    dead: 'The fallen cannot act',
    invalid_zones: 'Choose 1 strike zone and 2 different block zones',
    invalid_target: 'This target is unavailable',
    already_moved: 'You already moved this round',
    too_fast: 'Not so fast',
    min_timeout: 'Timer is already at minimum — 30 sec.',
    revive_limit: 'Adrenaline can be used at most 3 times per battle',
    no_player: 'Hero profile not found',
    vip_required: 'Auto-battle requires VIP level 3',
    item_round: 'Only one potion per round',
    full_hp: 'Health is already full',
    buff_active: 'This elixir is already active in this battle',
    connection: 'Arena connection lost. Try again.',
  },
  // --- Belt rules ---
  belt: {
    slot1: 'Open from the start',
    slot2: 'Level 5',
    slot3: 'Level 12 and 5 days in game',
    slot4: 'Level 20 and 14 days in game',
    slot5: '150 arena wins',
    slot6: 'Clan quest "Saga of the Clan"',
    slot7: 'Valhalla Legend: Level 40 and 500 arena wins',
    levelProgress: 'level {val}',
    levelDaysProgress: 'level {lvl} · days {days}',
    winsProgress: 'wins {val}',
    clanHint: 'unlocks together with clans',
    levelWinsProgress: 'level {lvl} · wins {wins}',
    slotFree: 'Slot {n} is free — put a potion from your bag here (up to {max})',
    slotRule: 'Slot {n}: {title}',
    empty: 'empty',
  },
  // --- Fighter figure ---
  fighter: {
    dodge: 'Dodge!',
    block: 'Block',
    crit: 'CRIT',
  },
  // --- Gear strip ---
  gear: {
    attackShort: 'atk',
    defenseShort: 'def',
    critShort: 'crit',
    level: 'lvl {n}',
    empty: '{slot}: empty — check the shop or forge',
  },
  // --- Hero parts ---
  heroParts: {
    strength: 'Strength',
    fortitude: 'Fortitude',
    health: 'Health',
    critChance: 'Crit Chance',
    critDamage: 'Crit Damage',
    level: 'lvl {n}',
    empty: '{slot}: empty',
    gearHint: 'Tap a slot to see the item',
  },
  // --- Currency labels ---
  currency: {
    gold: 'Coins',
    gems: 'Blue Gems',
    redGems: 'Red Gems',
    stones: 'Battle Stones',
    material: 'Materials',
  },
  // --- Equipment slots ---
  slots: {
    helmet: 'Helmet',
    amulet: 'Amulet',
    armor: 'Armor',
    weapon: 'Weapon',
    shield: 'Shield',
    ring: 'Ring',
    boots: 'Boots',
  },
  // --- Zones ---
  zones: {
    head: 'Head',
    chest: 'Chest',
    belly: 'Belly',
    legs: 'Legs',
  },
  // --- Rarity ---
  rarity: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  },
  // --- Game data: enemies ---
  enemies: {
    goblin: 'Goblin Scout',
    boar: 'Wild Boar',
    bandit: 'Forest Bandit',
    wolf: 'Dark Wolf',
    troll: 'Cave Troll',
    boss1: 'Bandit Chief',
    boss2: 'Jarl of the North',
    boss3: 'Dark Priest',
    boss4: 'King of the Undead',
    boss5: 'Mound Guardian',
    boss6: 'Abyss Demon',
    boss7: 'Giant King',
    boss8: 'Storm Lord',
    boss9: 'Fire Lord',
    boss10: 'Shadow of Chaos',
    trialGuard: 'Trial Guardian',
  },
  // --- Game data: chapter titles ---
  chapters: {
    ch1: 'Dark Forest',
    ch2: 'Northern Lands',
    ch3: 'Ice Fjords',
    ch4: 'Troll Caves',
    ch5: 'Ancestral Mounds',
    ch6: 'Fire Wastes',
    ch7: 'Giant Lands',
    ch8: 'Bifröst Bridge',
    ch9: 'Halls of Hel',
    ch10: 'Gates of Asgard',
  },
  // --- Game data: items ---
  items: {
    potionHp: 'Health Potion',
    potionHpLarge: 'Large Health Potion',
    elixirAtk: 'Strength Elixir',
    elixirDef: 'Defense Elixir',
    elixirCrit: 'Crit Elixir',
    arenaTime: 'Time Potion',
    arenaAdrenaline: 'Adrenaline',
    stone: 'Battle Stone',
    stoneBundle: 'Bundle of Battle Stones',
    gemPackSmall: 'Small Gem Pack',
    gemPackLarge: 'Large Gem Pack',
    forgeMaterial: 'Forge Materials',
    potionHpDesc: 'Restores 50 HP',
    potionHpLargeDesc: 'Restores 150 HP instantly',
    potionHpShopDesc: 'Restores 50 HP instantly',
    elixirAtkDesc: '+10 attack for one battle',
    elixirDefDesc: '+10 defense for one battle',
    elixirCritDesc: '+15% crit chance for one battle',
    arenaTimeDesc: 'Arena: reduces battle timer by 10 sec. (min 30 sec.)',
    arenaAdrenalineDesc: 'Arena: revives a fallen ally with 50% health',
    stoneDesc: 'Spent on one battle in Campaign or Trials',
    stoneBundleDesc: '5 battle stones at a discount',
    gemPackSmallDesc: 'Get 5 gems',
    gemPackLargeDesc: 'Get 15 gems',
    forgeMaterialDesc: '1 material for upgrading equipment',
    // Equipment
    warriorSword: 'Warrior Sword',
    knightBlade: 'Knight Blade',
    heroSword: 'Heroic Sword',
    leatherArmor: 'Leather Armor',
    plateArmor: 'Plate Armor',
    ironHelmet: 'Iron Helmet',
    swiftBoots: 'Swift Boots',
    powerRing: 'Ring of Power',
    oakShield: 'Oak Shield',
    ravenAmulet: 'Raven Amulet',
    // Equipment descriptions
    warriorSwordDesc: 'Reliable steel sword. +8 attack.',
    knightBladeDesc: 'Sharp blade. +18 attack, +3% crit.',
    heroSwordDesc: 'Legendary weapon. +35 attack, +8% crit.',
    leatherArmorDesc: 'Basic protection. +5 defense, +30 HP.',
    plateArmorDesc: 'Heavy armor. +12 defense, +80 HP.',
    ironHelmetDesc: 'Head protection. +3 defense, +20 HP.',
    swiftBootsDesc: 'Light boots. +4 defense, +40 HP, +2% crit.',
    powerRingDesc: 'Magic ring. +15 attack, +5% crit.',
    oakShieldDesc: 'Iron-bound shield. +5 defense, +25 HP.',
    ravenAmuletDesc: 'Raven bone charm. +6 attack, +3% crit.',
    // Loot
    winnerBlade: 'Winner\'s Blade',
    warriorArmor: 'Warrior Armor',
    levelRarity: 'Level {n} · {rarity}',
  },
  // --- Quests data ---
  questsData: {
    qDaily1Title: 'Defeat 3 enemies',
    qDaily1Desc: 'Defeat 3 enemies in PvE battles',
    qDaily2Title: 'Spend 50 gold',
    qDaily2Desc: 'Buy something in the shop',
    qDaily3Title: 'Gladiator',
    qDaily3Desc: 'Win 3 times in the arena',
    qWeekly1Title: 'Defeat a boss',
    qWeekly1Desc: 'Defeat a boss in any chapter',
    qStory1Title: 'Complete 5 chapters',
    qStory1Desc: 'Reach chapter 6',
  },
  // --- Achievements ---
  achievements: {
    ach1Title: 'First Warrior',
    ach1Desc: 'Defeat 1 enemy',
    ach2Title: 'Veteran Fighter',
    ach2Desc: 'Defeat 10 enemies',
    ach3Title: 'Chapter Conqueror',
    ach3Desc: 'Complete 10 chapters',
    ach4Title: 'Boss Slayer',
    ach4Desc: 'Defeat 5 bosses',
    ach5Title: 'Tycoon',
    ach5Desc: 'Accumulate 1000 gold',
  },
  // --- Follower ---
  follower: {
    name: 'Faithful Shield',
    desc: 'A companion who helps in battle. Unlocks at level 3.',
  },
  // --- Mail ---
  mail: {
    welcomeFrom: 'Council of Jarls',
    welcomeTitle: 'Welcome to Territory',
    welcomeBody: 'The lands await a new hero. Progress through campaign chapters, fight in the arena and collect gear. Accept this gift for your first steps.',
    stonesFrom: 'Stone Keeper',
    stonesTitle: 'Battle Stones',
    stonesBody: 'Each battle in Campaign and Trials costs 1 battle stone. Stones don\'t regenerate on their own: get them from daily rewards, quests and the Shop.',
  },
};

const DICTS: Record<Lang, Dict> = { ru, en };

// --- Helper functions for game data that uses non-reactive t() ---

export function tEnemyName(id: string): string {
  const keyMap: Record<string, string> = {
    'ch*_enemy_*': '',
  };
  // enemy names come from ENEMY_NAMES in engine.ts, mapped by index
  const enemyKeys = ['goblin', 'boar', 'bandit', 'wolf', 'troll'];
  const bossKeys = ['boss1', 'boss2', 'boss3', 'boss4', 'boss5', 'boss6', 'boss7', 'boss8', 'boss9', 'boss10'];
  return '';
}

export function tChapterTitle(num: number): string {
  const idx = ((num - 1) % 10) + 1;
  return t(`chapters.ch${idx}`);
}

export function tZoneLabel(id: string): string {
  return t(`zones.${id}`);
}

export function tSlotName(slot: string): string {
  return t(`slots.${slot}`);
}

export function tRarity(rarity: string): string {
  return t(`rarity.${rarity}`);
}

export function tItemDescription(itemType: string, itemId: string): string {
  return t(`items.${itemId}Desc`);
}

export function tItemName(key: string): string {
  return t(key);
}

export function tItemDesc(key: string, params?: Record<string, string | number>): string {
  return t(key, params);
}

export function tEnemy(key: string): string {
  return t(key);
}

export function tQuest(key: string): string {
  return t(key);
}

export function tSlotLabel(slot: string): string {
  return t(`slots.${slot}`);
}
