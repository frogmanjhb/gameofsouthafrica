/* eslint-disable */
// Game state management
let currentCharacter = '';
let currentScene = 0;
let gameHistory = [];

// Collector system for tracking endings
let collectedEndings = JSON.parse(localStorage.getItem('collectedEndings')) || {
    khoisan: [],
    dutch: [],
    britishColonist: []
};

// Mini-game unlock system
let unlockedMiniGames = JSON.parse(localStorage.getItem('unlockedMiniGames')) || {
    tradingChallenge: false,
    cattleChase: false
};

// Trading challenge mini-game data
const tradingChallenge = {
    items: [
        { name: 'Cattle', khoisanValue: 10, dutchValue: 8, icon: '🐄' },
        { name: 'Beads', khoisanValue: 8, dutchValue: 5, icon: '📿' },
        { name: 'Iron Tools', khoisanValue: 9, dutchValue: 6, icon: '🔨' },
        { name: 'Tobacco', khoisanValue: 6, dutchValue: 9, icon: '🚬' },
        { name: 'Sheep', khoisanValue: 7, dutchValue: 7, icon: '🐑' },
        { name: 'Copper', khoisanValue: 5, dutchValue: 8, icon: '🔶' },
        { name: 'Ivory', khoisanValue: 4, dutchValue: 10, icon: '🦷' },
        { name: 'Brandy', khoisanValue: 3, dutchValue: 6, icon: '🍺' }
    ],
    gameState: {
        active: false,
        score: 0,
        timeLeft: 60,
        currentItem: null,
        perspective: 'khoisan', // 'khoisan' or 'dutch'
        correctMatches: 0,
        totalMatches: 0
    }
};

// Cattle Chase mini-game data
const cattleChase = {
    gameState: {
        active: false,
        score: 0,
        lives: 3,
        level: 1,
        cattleInKraal: 0,
        cattleNeeded: 5,
        gameSpeed: 1,
        spawnSide: 0 // 0 = bottom, 1 = top, 2 = left
    },
    player: {
        x: 400,
        y: 550,
        size: 30,
        speed: 5
    },
    cattle: [],
    obstacles: [],
    kraal: {
        x: 350,
        y: 50,
        width: 100,
        height: 80
    },
    canvas: null,
    ctx: null
};

// Harbor Hustle mini-game data
const harborHustle = {
    gameState: {
        active: false,
        score: 0,
        level: 1,
        timeLeft: 30,
        suppliesLoaded: 0,
        suppliesNeeded: 10,
        gameSpeed: 1,
        timerStarted: false
    },
    supplies: [],
    ships: [],
    draggedItem: null,
    gameTimer: null,
    shipGrid: [], // 8x6 grid for ship cargo
    gridWidth: 8,
    gridHeight: 6,
    supplyTypes: [
        { 
            name: 'Food', 
            emoji: '🍞', 
            points: 10, 
            color: '#e74c3c',
            shape: [[1, 1], [1, 1]], // 2x2 square
            width: 2,
            height: 2
        },
        { 
            name: 'Water', 
            emoji: '💧', 
            points: 15, 
            color: '#3498db',
            shape: [[1, 1, 1]], // 1x3 line
            width: 3,
            height: 1
        },
        { 
            name: 'Livestock', 
            emoji: '🐄', 
            points: 25, 
            color: '#8e44ad',
            shape: [[1], [1], [1]], // 3x1 line
            width: 1,
            height: 3
        },
        { 
            name: 'Tools', 
            emoji: '🔧', 
            points: 20, 
            color: '#f39c12',
            shape: [[1, 1], [1, 0]], // L-shape
            width: 2,
            height: 2
        }
    ]
};

// Background images for different scenes
const backgrounds = {
    khoisan: {
        intro: 'Images/Khoisan/download.png',
        conflict: 'Images/Khoisan/download (1).png', 
        disease: 'Images/Khoisan/download (2).png',
        labor: 'Images/Khoisan/download (3).png',
        migration: 'Images/Khoisan/download (4).png'
    },
    dutch: {
        intro: 'Images/Dutch/1.png',
        farm: 'Images/Dutch/2.png',
        labor: 'Images/Dutch/3.png',
        company: 'Images/Dutch/3.png',
        trek: 'Images/Dutch/4.png'
    },
    britishColonist: {
        intro: 'Images/British/1.png',
        court: 'Images/British/2.png',
        parliament: 'Images/British/3.png',
        plantation: 'Images/British/4.png',
        frontier: 'Images/British/5.png'
    }
};

// Game story data - Clean structure
const gameStories = {};

// Khoi-San character data
gameStories.khoisan = {
    scenes: [
        {
            background: 'intro',
            text: "You are Khoi-San, living as herders and hunter-gatherers. The land and cattle are your life. One day in 1652, strange ships appear at the Cape.",
            choices: [
                {
                    text: "Trade cattle with settlers (gain beads and tools)",
                    nextScene: 1,
                    consequence: "trade",
                    historyNote: "The Khoi-San traded with the Dutch at first but later felt cheated as land pressure grew."
                },
                {
                    text: "Refuse trade (protect traditions)",
                    nextScene: 1,
                    consequence: "refuse",
                    historyNote: "The Khoi-San traded with the Dutch at first but later felt cheated as land pressure grew."
                }
            ]
        },
            {
                background: 'conflict',
                text: "Early conflicts begin as settlers push into your grazing lands. You must decide how to respond to their expansion.",
                choices: [
                    {
                        text: "Share grazing land (risk losing access)",
                        nextScene: 2,
                        consequence: "share",
                        historyNote: "Early wars broke out as settlers pushed into grazing lands."
                    },
                    {
                        text: "Defend grazing land (spark fights)",
                        nextScene: 2,
                        consequence: "defend",
                        historyNote: "Early wars broke out as settlers pushed into grazing lands."
                    }
                ]
            },
            {
                background: 'disease',
                text: "A terrible smallpox epidemic sweeps through your community in the late 1600s. Many are dying. The settlers have medicine, but they want something in return.",
                choices: [
                    {
                        text: "Ask settlers for help (medicine, but dependence)",
                        nextScene: 3,
                        consequence: "ask_help",
                        historyNote: "Smallpox devastated Khoi-San communities."
                    },
                    {
                        text: "Stay apart (independence, but many deaths)",
                        nextScene: 3,
                        consequence: "stay_apart",
                        historyNote: "Smallpox devastated Khoi-San communities."
                    }
                ]
            },
            {
                background: 'labor',
                text: "The Dutch farms are growing and they need workers. They offer goods in exchange for labor, but this means working for them regularly.",
                choices: [
                    {
                        text: "Work for settlers (gain goods, lose freedom)",
                        nextScene: 4,
                        consequence: "work",
                        historyNote: "Many Khoi-San became labourers, losing independence."
                    },
                    {
                        text: "Refuse work (face hardship)",
                        nextScene: 4,
                        consequence: "refuse_work",
                        historyNote: "Many Khoi-San became labourers, losing independence."
                    }
                ]
            },
            {
                background: 'migration',
                text: "By the 1700s, the frontier is expanding rapidly. Your traditional lands are being taken over. You must decide where to go.",
                choices: [
                    {
                        text: "Migrate further inland (keep culture, less land)",
                        nextScene: 'ending',
                        consequence: "migrate",
                        historyNote: "Many Khoi-San were displaced or absorbed into settler society."
                    },
                    {
                        text: "Stay near settlers (risk assimilation)",
                        nextScene: 'ending',
                        consequence: "stay_near",
                        historyNote: "Many Khoi-San were displaced or absorbed into settler society."
                    }
                ]
            }
        ],
        endings: {
            trade_share_ask_help_work_migrate: {
                title: "The Path of Adaptation",
                text: "Through trade, cooperation, and adaptation, you survived the challenges of colonial expansion. Your people maintained some independence by moving inland, preserving your culture while facing new hardships."
            },
            trade_share_ask_help_work_stay_near: {
                title: "The Price of Survival",
                text: "Your cooperation with settlers helped you survive, but at the cost of your traditional way of life. Your people became increasingly dependent on settler society, losing much of their cultural independence."
            },
            trade_share_ask_help_refuse_work_migrate: {
                title: "The Struggle for Independence",
                text: "You tried to maintain independence by refusing to work for settlers, but this made life harder. Moving inland preserved some freedom, though with great difficulty."
            },
            trade_share_ask_help_refuse_work_stay_near: {
                title: "The Difficult Balance",
                text: "You sought help during the epidemic but refused to become dependent workers. Staying near settlers while maintaining independence proved extremely challenging."
            },
            trade_share_stay_apart_work_migrate: {
                title: "The Independent Path",
                text: "You maintained independence during the epidemic but later worked for settlers when necessary. Moving inland allowed you to preserve more of your traditional way of life."
            },
            trade_share_stay_apart_work_stay_near: {
                title: "The Compromise",
                text: "You stayed independent during the epidemic but later worked for settlers. This compromise helped you survive while gradually losing some cultural independence."
            },
            trade_share_stay_apart_refuse_work_migrate: {
                title: "The Pure Resistance",
                text: "You maintained complete independence, refusing both help and work. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            trade_share_stay_apart_refuse_work_stay_near: {
                title: "The Hardest Path",
                text: "You maintained complete independence, refusing all settler offers. Staying near them while rejecting their help and work made life extremely difficult."
            },
            trade_defend_ask_help_work_migrate: {
                title: "The Warrior's Adaptation",
                text: "You fought to defend your land but later sought help during the epidemic. Working for settlers and then moving inland showed your ability to adapt while preserving some independence."
            },
            trade_defend_ask_help_work_stay_near: {
                title: "The Warrior's Compromise",
                text: "You fought to defend your land but later cooperated with settlers. This mix of resistance and cooperation helped you survive while gradually losing some independence."
            },
            trade_defend_ask_help_refuse_work_migrate: {
                title: "The Selective Cooperation",
                text: "You fought for your land and sought help during the epidemic but refused to become a regular worker. Moving inland preserved more of your traditional independence."
            },
            trade_defend_ask_help_refuse_work_stay_near: {
                title: "The Selective Resistance",
                text: "You fought for your land and sought help when needed but refused to work for settlers. This selective approach was challenging but maintained more independence."
            },
            trade_defend_stay_apart_work_migrate: {
                title: "The Independent Warrior",
                text: "You fought for your land and stayed independent during the epidemic but later worked for settlers when necessary. Moving inland helped preserve your traditional way of life."
            },
            trade_defend_stay_apart_work_stay_near: {
                title: "The Pragmatic Warrior",
                text: "You fought for your land and stayed independent during the epidemic but later worked for settlers. This pragmatic approach helped you survive while gradually losing some independence."
            },
            trade_defend_stay_apart_refuse_work_migrate: {
                title: "The Pure Warrior",
                text: "You fought for your land and maintained complete independence throughout. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            trade_defend_stay_apart_refuse_work_stay_near: {
                title: "The Ultimate Resistance",
                text: "You fought for your land and maintained complete independence, refusing all settler offers. Staying near them while rejecting everything made life extremely difficult but preserved your dignity."
            },
            refuse_share_ask_help_work_migrate: {
                title: "The Reluctant Adaptation",
                text: "You initially refused trade but later cooperated when necessary. This reluctant adaptation helped you survive while preserving some independence through migration."
            },
            refuse_share_ask_help_work_stay_near: {
                title: "The Reluctant Compromise",
                text: "You initially refused trade but later cooperated when necessary. This reluctant compromise helped you survive while gradually losing some independence."
            },
            refuse_share_ask_help_refuse_work_migrate: {
                title: "The Selective Cooperation",
                text: "You initially refused trade but sought help during the epidemic while refusing to work for settlers. Moving inland preserved more of your traditional independence."
            },
            refuse_share_ask_help_refuse_work_stay_near: {
                title: "The Selective Resistance",
                text: "You initially refused trade but sought help when needed while refusing to work for settlers. This selective approach was challenging but maintained more independence."
            },
            refuse_share_stay_apart_work_migrate: {
                title: "The Independent Survivor",
                text: "You refused trade and stayed independent during the epidemic but later worked for settlers when necessary. Moving inland helped preserve your traditional way of life."
            },
            refuse_share_stay_apart_work_stay_near: {
                title: "The Pragmatic Survivor",
                text: "You refused trade and stayed independent during the epidemic but later worked for settlers. This pragmatic approach helped you survive while gradually losing some independence."
            },
            refuse_share_stay_apart_refuse_work_migrate: {
                title: "The Pure Independence",
                text: "You refused trade and maintained complete independence throughout. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            refuse_share_stay_apart_refuse_work_stay_near: {
                title: "The Ultimate Independence",
                text: "You refused trade and maintained complete independence, refusing all settler offers. Staying near them while rejecting everything made life extremely difficult but preserved your dignity."
            },
            refuse_defend_ask_help_work_migrate: {
                title: "The Warrior's Reluctant Adaptation",
                text: "You refused trade and fought to defend your land but later cooperated when necessary. This reluctant adaptation helped you survive while preserving some independence through migration."
            },
            refuse_defend_ask_help_work_stay_near: {
                title: "The Warrior's Reluctant Compromise",
                text: "You refused trade and fought to defend your land but later cooperated when necessary. This reluctant compromise helped you survive while gradually losing some independence."
            },
            refuse_defend_ask_help_refuse_work_migrate: {
                title: "The Warrior's Selective Cooperation",
                text: "You refused trade and fought for your land but sought help during the epidemic while refusing to work for settlers. Moving inland preserved more of your traditional independence."
            },
            refuse_defend_ask_help_refuse_work_stay_near: {
                title: "The Warrior's Selective Resistance",
                text: "You refused trade and fought for your land but sought help when needed while refusing to work for settlers. This selective approach was challenging but maintained more independence."
            },
            refuse_defend_stay_apart_work_migrate: {
                title: "The Independent Warrior Survivor",
                text: "You refused trade and fought for your land while staying independent during the epidemic but later worked for settlers when necessary. Moving inland helped preserve your traditional way of life."
            },
            refuse_defend_stay_apart_work_stay_near: {
                title: "The Pragmatic Warrior Survivor",
                text: "You refused trade and fought for your land while staying independent during the epidemic but later worked for settlers. This pragmatic approach helped you survive while gradually losing some independence."
            },
            refuse_defend_stay_apart_refuse_work_migrate: {
                title: "The Pure Warrior Independence",
                text: "You refused trade and fought for your land while maintaining complete independence throughout. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            refuse_defend_stay_apart_refuse_work_stay_near: {
                title: "The Ultimate Warrior Independence",
                text: "You refused trade and fought for your land while maintaining complete independence, refusing all settler offers. Staying near them while rejecting everything made life extremely difficult but preserved your dignity."
            }
        }
};

// Dutch character data
gameStories.dutch = {
        scenes: [
            {
                background: 'intro',
                text: "You arrive with Jan van Riebeeck in 1652. The Dutch East India Company needs farms to supply passing ships. You need food and supplies from the local people.",
                choices: [
                    {
                        text: "Trade cattle fairly with Khoi-San (slow growth, good relations)",
                        nextScene: 1,
                        consequence: "fair_trade",
                        historyNote: "Trade gave way to land seizures and conflict."
                    },
                    {
                        text: "Take land and cattle (start conflict)",
                        nextScene: 1,
                        consequence: "take_land",
                        historyNote: "Trade gave way to land seizures and conflict."
                    }
                ]
            },
            {
                background: 'farm',
                text: "Your farm is growing and you need to decide how to expand. The Khoi-San are using the surrounding lands for grazing.",
                choices: [
                    {
                        text: "Keep farms small (peaceful growth)",
                        nextScene: 2,
                        consequence: "small_farms",
                        historyNote: "Frontier wars spread as settlers expanded inland."
                    },
                    {
                        text: "Expand into Khoi-San lands (spark frontier wars)",
                        nextScene: 2,
                        consequence: "expand",
                        historyNote: "Frontier wars spread as settlers expanded inland."
                    }
                ]
            },
            {
                background: 'labor',
                text: "Your farm is growing, but you need more workers. The Khoi-San are reluctant to work for you regularly.",
                choices: [
                    {
                        text: "Employ Khoi-San workers (strained relations)",
                        nextScene: 3,
                        consequence: "employ_khoisan",
                        historyNote: "Enslaved people from Asia and Africa became central to the Cape economy."
                    },
                    {
                        text: "Import enslaved workers (profits rise, injustice grows)",
                        nextScene: 3,
                        consequence: "import_slaves",
                        historyNote: "Enslaved people from Asia and Africa became central to the Cape economy."
                    }
                ]
            },
            {
                background: 'company',
                text: "The Dutch East India Company wants to control everything, but you want more freedom as a farmer. Other settlers feel the same way.",
                choices: [
                    {
                        text: "Obey Company rules (limited freedom)",
                        nextScene: 4,
                        consequence: "obey_company",
                        historyNote: "Free burghers broke away, creating frontier farmers (Boers)."
                    },
                    {
                        text: "Push for independence (clash with Company)",
                        nextScene: 4,
                        consequence: "push_independence",
                        historyNote: "Free burghers broke away, creating frontier farmers (Boers)."
                    }
                ]
            },
            {
                background: 'trek',
                text: "By the late 1600s and 1700s, the frontier is expanding rapidly. You must decide where to focus your efforts.",
                choices: [
                    {
                        text: "Stay near Cape (safety, less land)",
                        nextScene: 'ending',
                        consequence: "stay_cape",
                        historyNote: "This led to Boer identity and constant frontier conflict."
                    },
                    {
                        text: "Trek inland as frontier farmer (land, but more conflict)",
                        nextScene: 'ending',
                        consequence: "trek_inland",
                        historyNote: "This led to Boer identity and constant frontier conflict."
                    }
                ]
            }
        ],
                    endings: {
                fair_trade_small_farms_employ_khoisan_obey_company_stay_cape: {
                    title: "The Company Man",
                    text: "You chose cooperation over conflict at every turn. Your farm remained small but stable, and you maintained good relations with the Khoi-San. However, you never gained the independence that other settlers sought."
                },
                fair_trade_small_farms_employ_khoisan_obey_company_trek_inland: {
                    title: "The Reluctant Pioneer",
                    text: "Despite your peaceful approach, you eventually joined the trek inland. Your fair treatment of the Khoi-San earned you respect, but you still faced the challenges of frontier life."
                },
                fair_trade_small_farms_employ_khoisan_push_independence_stay_cape: {
                    title: "The Free Burgher",
                    text: "You balanced fair trade with the Khoi-San and pushing for independence from the Company. Your farm grew slowly but steadily, and you became a respected member of the free burgher community."
                },
                fair_trade_small_farms_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Farmer",
                    text: "Your fair treatment of the Khoi-San and push for independence led you to trek inland. You became a successful frontier farmer, known for your fair dealings and independence."
                },
                fair_trade_small_farms_import_slaves_obey_company_stay_cape: {
                    title: "The Company Farmer",
                    text: "You chose to import enslaved workers to grow your farm, while staying loyal to the Company. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                fair_trade_small_farms_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Despite importing enslaved workers, you remained loyal to the Company and trekked inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                fair_trade_small_farms_import_slaves_push_independence_stay_cape: {
                    title: "The Free Farmer",
                    text: "You imported enslaved workers to grow your farm while pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                fair_trade_small_farms_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your use of enslaved workers and push for independence led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                fair_trade_expand_employ_khoisan_obey_company_stay_cape: {
                    title: "The Expanding Farmer",
                    text: "You expanded into Khoi-San lands while employing them as workers and staying loyal to the Company. Your farm grew large, but you faced constant tension with the Khoi-San."
                },
                fair_trade_expand_employ_khoisan_obey_company_trek_inland: {
                    title: "The Expanding Pioneer",
                    text: "Your expansion into Khoi-San lands and employment of them as workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting conflict."
                },
                fair_trade_expand_employ_khoisan_push_independence_stay_cape: {
                    title: "The Independent Expander",
                    text: "You expanded into Khoi-San lands while employing them as workers and pushing for independence from the Company. Your farm grew large, but you faced criticism from all sides."
                },
                fair_trade_expand_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your expansion into Khoi-San lands and push for independence led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                fair_trade_expand_import_slaves_obey_company_stay_cape: {
                    title: "The Company Expander",
                    text: "You expanded into Khoi-San lands and imported enslaved workers while staying loyal to the Company. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                fair_trade_expand_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Your expansion into Khoi-San lands and use of enslaved workers led you to trek inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                fair_trade_expand_import_slaves_push_independence_stay_cape: {
                    title: "The Free Expander",
                    text: "You expanded into Khoi-San lands and imported enslaved workers while pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                fair_trade_expand_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your expansion into Khoi-San lands and use of enslaved workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_small_farms_employ_khoisan_obey_company_stay_cape: {
                    title: "The Land Taker",
                    text: "You took land from the Khoi-San but then chose to keep your farms small and employ them as workers. Your farm remained stable, but you faced constant tension with the Khoi-San."
                },
                take_land_small_farms_employ_khoisan_obey_company_trek_inland: {
                    title: "The Land Taker Pioneer",
                    text: "Your taking of Khoi-San land and employment of them as workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting conflict."
                },
                take_land_small_farms_employ_khoisan_push_independence_stay_cape: {
                    title: "The Independent Land Taker",
                    text: "You took land from the Khoi-San and employed them as workers while pushing for independence from the Company. Your farm grew, but you faced criticism from all sides."
                },
                take_land_small_farms_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and push for independence led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_small_farms_import_slaves_obey_company_stay_cape: {
                    title: "The Company Land Taker",
                    text: "You took land from the Khoi-San and imported enslaved workers while staying loyal to the Company. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                take_land_small_farms_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Your taking of Khoi-San land and use of enslaved workers led you to trek inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                take_land_small_farms_import_slaves_push_independence_stay_cape: {
                    title: "The Free Land Taker",
                    text: "You took land from the Khoi-San and imported enslaved workers while pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                take_land_small_farms_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and use of enslaved workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_expand_employ_khoisan_obey_company_stay_cape: {
                    title: "The Expanding Land Taker",
                    text: "You took land from the Khoi-San and expanded into their lands while employing them as workers. Your farm grew large, but you faced constant tension with the Khoi-San."
                },
                take_land_expand_employ_khoisan_obey_company_trek_inland: {
                    title: "The Expanding Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. You became a successful frontier farmer, but your methods created lasting conflict."
                },
                take_land_expand_employ_khoisan_push_independence_stay_cape: {
                    title: "The Independent Expander",
                    text: "You took land from the Khoi-San and expanded into their lands while pushing for independence from the Company. Your farm grew large, but you faced criticism from all sides."
                },
                take_land_expand_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_expand_import_slaves_obey_company_stay_cape: {
                    title: "The Company Expander",
                    text: "You took land from the Khoi-San and expanded into their lands while importing enslaved workers. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                take_land_expand_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                take_land_expand_import_slaves_push_independence_stay_cape: {
                    title: "The Free Expander",
                    text: "You took land from the Khoi-San and expanded into their lands while importing enslaved workers and pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                take_land_expand_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                }
            }
        };

// British character data  
gameStories["britishColonist"] = {
        scenes: [
            {
                background: 'intro',
                text: "It is the late 1700s. The British have taken the Cape from the Dutch. You are sent to help expand British control and bring British law to the colony. The Dutch settlers (Boers) are unhappy about the change.",
                choices: [
                    {
                        text: "Allow Boers autonomy (weaker control)",
                        nextScene: 1,
                        consequence: "allow_autonomy",
                        historyNote: "British rule clashed with Boer traditions."
                    },
                    {
                        text: "Impose British laws (spark Boer anger)",
                        nextScene: 1,
                        consequence: "impose_laws",
                        historyNote: "British rule clashed with Boer traditions."
                    }
                ]
            },
            {
                background: 'court',
                text: "The Khoi-San people are seeking fairness under British rule. They hope the British will treat them better than the Dutch did. You must decide how to handle their requests for equal treatment.",
                choices: [
                    {
                        text: "Protect Khoi-San rights (anger settlers)",
                        nextScene: 2,
                        consequence: "protect_khoisan",
                        historyNote: "The Hottentot Proclamation restricted Khoi-San freedom."
                    },
                    {
                        text: "Enforce pass laws (please settlers, harm Khoi-San)",
                        nextScene: 2,
                        consequence: "enforce_pass_laws",
                        historyNote: "The Hottentot Proclamation restricted Khoi-San freedom."
                    }
                ]
            },
            {
                background: 'parliament',
                text: "The slavery debate is heating up. Britain is considering abolition, but settlers depend on enslaved labor.",
                choices: [
                    {
                        text: "Support abolition (align with Britain, anger settlers)",
                        nextScene: 3,
                        consequence: "support_abolition",
                        historyNote: "Britain abolished slavery in 1834, causing settler backlash."
                    },
                    {
                        text: "Defend slavery (settlers profit, injustice grows)",
                        nextScene: 3,
                        consequence: "defend_slavery",
                        historyNote: "Britain abolished slavery in 1834, causing settler backlash."
                    }
                ]
            },
            {
                background: 'plantation',
                text: "The Great Trek is beginning. Thousands of Boers are leaving the Cape to escape British rule.",
                choices: [
                    {
                        text: "Support Boer migration inland (weaker Cape colony)",
                        nextScene: 4,
                        consequence: "support_migration",
                        historyNote: "Thousands of Boers left on the Great Trek."
                    },
                    {
                        text: "Try to stop migration (fuel Boer resentment)",
                        nextScene: 4,
                        consequence: "stop_migration",
                        historyNote: "Thousands of Boers left on the Great Trek."
                    }
                ]
            },
            {
                background: 'frontier',
                text: "The frontier wars with the Xhosa are intensifying. You must decide how to handle the conflict.",
                choices: [
                    {
                        text: "Negotiate peace (fragile stability)",
                        nextScene: 'ending',
                        consequence: "negotiate_peace",
                        historyNote: "The British fought nine frontier wars with the Xhosa."
                    },
                    {
                        text: "Push military expansion (temporary victory, long resistance)",
                        nextScene: 'ending',
                        consequence: "military_expansion",
                        historyNote: "The British fought nine frontier wars with the Xhosa."
                    }
                ]
            }
        ],
        endings: {
            // Allow Autonomy + Protect Khoisan + Support Abolition paths
            allow_autonomy_protect_khoisan_support_abolition_support_migration_negotiate_peace: {
                title: "The Peacemaker",
                text: "You chose diplomacy and fairness at every turn. You maintained peace but had limited control over the colony, leading to future instability."
            },
            allow_autonomy_protect_khoisan_support_abolition_support_migration_military_expansion: {
                title: "The Diplomatic Warrior",
                text: "You balanced diplomacy with military action. You maintained some peace but also created lasting conflict through military expansion."
            },
            allow_autonomy_protect_khoisan_support_abolition_stop_migration_negotiate_peace: {
                title: "The Controlled Peacemaker",
                text: "You chose peace and fairness but tried to control Boer migration. This created tension with the Boers while maintaining some stability."
            },
            allow_autonomy_protect_khoisan_support_abolition_stop_migration_military_expansion: {
                title: "The Controlled Warrior",
                text: "You balanced fairness with control and military action. This created lasting conflict with both Boers and Xhosa."
            },
            
            // Allow Autonomy + Protect Khoisan + Defend Slavery paths
            allow_autonomy_protect_khoisan_defend_slavery_support_migration_negotiate_peace: {
                title: "The Contradictory Peacemaker",
                text: "You protected Khoi-San rights but defended slavery, creating moral contradictions. Your peaceful approach maintained some stability despite these inconsistencies."
            },
            allow_autonomy_protect_khoisan_defend_slavery_support_migration_military_expansion: {
                title: "The Contradictory Warrior",
                text: "You protected indigenous rights while defending slavery and using military force. These contradictions created complex relationships with all groups."
            },
            allow_autonomy_protect_khoisan_defend_slavery_stop_migration_negotiate_peace: {
                title: "The Selective Protector",
                text: "You protected Khoi-San rights but defended slavery and controlled Boer migration. This selective approach created lasting tensions."
            },
            allow_autonomy_protect_khoisan_defend_slavery_stop_migration_military_expansion: {
                title: "The Contradictory Controller",
                text: "Your contradictory policies of protection and oppression, combined with military expansion, created a complex and unstable colonial system."
            },
            
            // Allow Autonomy + Enforce Pass Laws + Support Abolition paths
            allow_autonomy_enforce_pass_laws_support_abolition_support_migration_negotiate_peace: {
                title: "The Inconsistent Reformer",
                text: "You enforced pass laws against the Khoi-San but supported abolition. This inconsistent approach to freedom created confusion and resentment."
            },
            allow_autonomy_enforce_pass_laws_support_abolition_support_migration_military_expansion: {
                title: "The Selective Liberator",
                text: "You freed enslaved people but restricted Khoi-San movement. Your military expansion contradicted your reformist ideals."
            },
            allow_autonomy_enforce_pass_laws_support_abolition_stop_migration_negotiate_peace: {
                title: "The Controlling Reformer",
                text: "You supported abolition but restricted both Khoi-San and Boer movement. This created resentment among multiple groups despite good intentions."
            },
            allow_autonomy_enforce_pass_laws_support_abolition_stop_migration_military_expansion: {
                title: "The Authoritarian Reformer",
                text: "Your combination of selective freedom, movement restrictions, and military force created a complex authoritarian system with reformist elements."
            },
            
            // Allow Autonomy + Enforce Pass Laws + Defend Slavery paths
            allow_autonomy_enforce_pass_laws_defend_slavery_support_migration_negotiate_peace: {
                title: "The Settler-Friendly Governor",
                text: "You allowed Boer autonomy while supporting their labor systems. This created a stable but unjust colonial system that favored settlers."
            },
            allow_autonomy_enforce_pass_laws_defend_slavery_support_migration_military_expansion: {
                title: "The Expansionist Settler Ally",
                text: "You supported settler interests through autonomy, labor restrictions, and military expansion. This created a powerful but oppressive colonial system."
            },
            allow_autonomy_enforce_pass_laws_defend_slavery_stop_migration_negotiate_peace: {
                title: "The Controlling Settler Ally",
                text: "You supported settler labor systems but controlled their movement. This created tension between supporting settlers and maintaining British control."
            },
            allow_autonomy_enforce_pass_laws_defend_slavery_stop_migration_military_expansion: {
                title: "The Authoritarian Settler System",
                text: "Your support for settler labor systems combined with strict control and military expansion created a harsh but stable colonial regime."
            },
            
            // Impose Laws + Protect Khoisan + Support Abolition paths
            impose_laws_protect_khoisan_support_abolition_support_migration_negotiate_peace: {
                title: "The Principled Administrator",
                text: "You imposed British law while protecting indigenous rights and supporting abolition. This principled approach faced resistance but advanced justice."
            },
            impose_laws_protect_khoisan_support_abolition_support_migration_military_expansion: {
                title: "The Reformist Enforcer",
                text: "You enforced British law and protected rights through military strength. This approach advanced justice but created lasting conflicts."
            },
            impose_laws_protect_khoisan_support_abolition_stop_migration_negotiate_peace: {
                title: "The Controlled Reformer",
                text: "You imposed British law and justice while controlling colonial movement. This created a more just but tightly controlled society."
            },
            impose_laws_protect_khoisan_support_abolition_stop_migration_military_expansion: {
                title: "The Authoritarian Reformer",
                text: "Your combination of strict law enforcement, rights protection, and military expansion created a complex system of authoritarian justice."
            },
            
            // Impose Laws + Protect Khoisan + Defend Slavery paths
            impose_laws_protect_khoisan_defend_slavery_support_migration_negotiate_peace: {
                title: "The Selective Law Enforcer",
                text: "You imposed British law while selectively protecting some groups but not others. This created an inconsistent system of justice."
            },
            impose_laws_protect_khoisan_defend_slavery_support_migration_military_expansion: {
                title: "The Contradictory Enforcer",
                text: "You enforced British law while maintaining contradictory policies on human rights. Military expansion complicated these contradictions further."
            },
            impose_laws_protect_khoisan_defend_slavery_stop_migration_negotiate_peace: {
                title: "The Controlled Contradiction",
                text: "You imposed law and order while maintaining contradictory human rights policies. This created a controlled but morally inconsistent system."
            },
            impose_laws_protect_khoisan_defend_slavery_stop_migration_military_expansion: {
                title: "The Authoritarian Contradiction",
                text: "Your strict law enforcement combined with contradictory rights policies and military expansion created a harsh and inconsistent regime."
            },
            
            // Impose Laws + Enforce Pass Laws + Support Abolition paths
            impose_laws_enforce_pass_laws_support_abolition_support_migration_negotiate_peace: {
                title: "The Inconsistent Administrator",
                text: "You imposed British law and freed enslaved people but restricted indigenous movement. This inconsistent approach to freedom created confusion."
            },
            impose_laws_enforce_pass_laws_support_abolition_support_migration_military_expansion: {
                title: "The Selective Liberator",
                text: "You enforced British law with selective freedom policies. Military expansion undermined your reformist credentials."
            },
            impose_laws_enforce_pass_laws_support_abolition_stop_migration_negotiate_peace: {
                title: "The Controlling Administrator",
                text: "You imposed strict British control while selectively advancing freedom. This created a tightly controlled system with limited liberty."
            },
            impose_laws_enforce_pass_laws_support_abolition_stop_migration_military_expansion: {
                title: "The Authoritarian Selective Reformer",
                text: "Your combination of strict law, selective freedom, movement control, and military force created a complex authoritarian system."
            },
            
            // Impose Laws + Enforce Pass Laws + Defend Slavery paths
            impose_laws_enforce_pass_laws_defend_slavery_support_migration_negotiate_peace: {
                title: "The British Traditionalist",
                text: "You imposed British law while maintaining colonial labor systems. This created a stable but oppressive system that favored British and settler interests."
            },
            impose_laws_enforce_pass_laws_defend_slavery_support_migration_military_expansion: {
                title: "The Colonial Enforcer",
                text: "You imposed strict British control while supporting settler labor systems through military strength. This created a powerful colonial regime."
            },
            impose_laws_enforce_pass_laws_defend_slavery_stop_migration_negotiate_peace: {
                title: "The Controlled Colonial System",
                text: "You imposed British law and maintained labor restrictions while controlling all movement. This created a tightly controlled colonial hierarchy."
            },
            impose_laws_enforce_pass_laws_defend_slavery_stop_migration_military_expansion: {
                title: "The Authoritarian Colonial Regime",
                text: "Your strict enforcement of British law, labor restrictions, movement control, and military expansion created a harsh authoritarian colonial system."
            }
        }
};

// Game functions
function startGame(character) {
    currentCharacter = character;
    currentScene = 0;
    gameHistory = [];
    
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('endingScreen').style.display = 'none';
    
    showScene();
}

function showScene() {
    const story = gameStories[currentCharacter];
    const scene = story.scenes[currentScene];
    
    // Set background
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.style.backgroundImage = `url('${backgrounds[currentCharacter][scene.background]}')`;    
    
    // Set story text
    document.getElementById('storyText').textContent = scene.text;
    
    // Clear and populate choices
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    scene.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.onclick = () => makeChoice(choice);
        choicesContainer.appendChild(button);
    });
}

function makeChoice(choice) {
    gameHistory.push(choice.consequence);
    
    // Show historical context if available
    if (choice.historyNote) {
        showHistoricalContext(choice.historyNote, () => {
            if (choice.nextScene === 'ending') {
                showEnding();
            } else {
                currentScene = choice.nextScene;
                showScene();
            }
        });
    } else {
        if (choice.nextScene === 'ending') {
            showEnding();
        } else {
            currentScene = choice.nextScene;
            showScene();
        }
    }
}

function showHistoricalContext(historyNote, callback) {
    // Create a modal overlay for historical context
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(44, 62, 80, 0.95);
        border: 3px solid #f39c12;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "📚 Historical Context";
    title.style.cssText = `
        color: #f39c12;
        font-size: 1.5em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = historyNote;
    text.style.cssText = `
        color: #ecf0f1;
        font-size: 1.1em;
        line-height: 1.6;
        margin-bottom: 30px;
        font-family: 'Courier New', monospace;
    `;
    
    const button = document.createElement('button');
    button.textContent = "Continue";
    button.style.cssText = `
        background: rgba(46, 204, 113, 0.8);
        border: 2px solid #2ecc71;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    button.onmouseover = () => {
        button.style.background = 'rgba(46, 204, 113, 1)';
    };
    
    button.onmouseout = () => {
        button.style.background = 'rgba(46, 204, 113, 0.8)';
    };
    
    button.onclick = () => {
        document.body.removeChild(overlay);
        callback();
    };
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function showEnding() {
    const story = gameStories[currentCharacter];
    const endingKey = gameHistory.join('_');
    const ending = story.endings[endingKey];
    
    // Save the ending to collected endings
    saveCollectedEnding(currentCharacter, endingKey, ending);
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'block';
    
    document.getElementById('endingTitle').textContent = ending.title;
    
    // Add the main ending text plus encouragement to replay
    const endingText = ending.text + "\n\n" + 
        "Try another character to see history from a different perspective!";
    
    document.getElementById('endingText').textContent = endingText;
    
    // Check for trading challenge opportunity
    checkForTradingChallenge(currentCharacter, endingKey);
}

function goBack() {
    document.getElementById('titleScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    
    currentCharacter = '';
    currentScene = 0;
    gameHistory = [];
}

function restartGame() {
    goBack();
}

function showInfo() {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    document.getElementById('infoScreen').style.display = 'block';
}

function hideInfo() {
    document.getElementById('infoScreen').style.display = 'none';
    document.getElementById('titleScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
}

// Collector system functions
function saveCollectedEnding(character, endingKey, ending) {
    if (!collectedEndings[character].includes(endingKey)) {
        collectedEndings[character].push(endingKey);
        localStorage.setItem('collectedEndings', JSON.stringify(collectedEndings));
        updateCollectorCounter();
        
        // Check if all Khoi-San endings are collected for Cattle Chase unlock
        if (character === 'khoisan') {
            checkAllKhoisanEndingsCollected();
        }
        
        // Check if 8 Dutch endings are collected for Harbor Hustle unlock
        if (character === 'dutch') {
            checkDutchEndingsForHarborHustle();
        }
    }
}

function updateCollectorCounter() {
    const totalCollected = collectedEndings.khoisan.length + 
                          collectedEndings.dutch.length + 
                          collectedEndings.britishColonist.length;
    const totalPossible = Object.keys(gameStories.khoisan.endings).length + 
                         Object.keys(gameStories.dutch.endings).length + 
                         Object.keys(gameStories.britishColonist.endings).length;
    
    document.getElementById('collectorCount').textContent = `${totalCollected}/${totalPossible}`;
    
    // Update progress text if collector screen is visible
    const progressElement = document.getElementById('collectorProgress');
    if (progressElement) {
        progressElement.textContent = `${totalCollected} of ${totalPossible} endings discovered`;
    }
    
    // Update individual character counts
    updateCharacterCounts();
}

function updateCharacterCounts() {
    const khoisanTotal = Object.keys(gameStories.khoisan.endings).length;
    const dutchTotal = Object.keys(gameStories.dutch.endings).length;
    const britishTotal = Object.keys(gameStories.britishColonist.endings).length;
    
    document.getElementById('khoisanCount').textContent = `(${collectedEndings.khoisan.length}/${khoisanTotal})`;
    document.getElementById('dutchCount').textContent = `(${collectedEndings.dutch.length}/${dutchTotal})`;
    document.getElementById('britishCount').textContent = `(${collectedEndings.britishColonist.length}/${britishTotal})`;
}

function showCollector() {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    document.getElementById('infoScreen').style.display = 'none';
    document.getElementById('collectorScreen').style.display = 'block';
    
    // Initialize the collector display
    populateAllEndings();
    updateCollectorCounter();
}

function hideCollector() {
    document.getElementById('collectorScreen').style.display = 'none';
    document.getElementById('titleScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    document.getElementById('infoScreen').style.display = 'none';
}

function showCharacterEndings(character) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update character endings display
    document.querySelectorAll('.character-endings').forEach(div => div.classList.remove('active'));
    document.getElementById(character + 'Endings').classList.add('active');
}

function populateAllEndings() {
    populateCharacterEndings('khoisan');
    populateCharacterEndings('dutch');
    populateCharacterEndings('britishColonist');
}

function populateCharacterEndings(character) {
    const container = document.getElementById(character + 'Endings');
    const story = gameStories[character];
    const collected = collectedEndings[character];
    
    container.innerHTML = '';
    
    Object.keys(story.endings).forEach(endingKey => {
        const ending = story.endings[endingKey];
        const isCollected = collected.includes(endingKey);
        
        const endingDiv = document.createElement('div');
        endingDiv.className = `ending-item ${isCollected ? 'collected' : 'locked'}`;
        
        const title = document.createElement('div');
        title.className = 'ending-title';
        title.textContent = isCollected ? ending.title : '??? Hidden Ending ???';
        
        const description = document.createElement('div');
        description.className = 'ending-description';
        description.textContent = isCollected ? ending.text : 'Complete this path to unlock this ending...';
        
        const status = document.createElement('div');
        status.className = 'ending-status';
        status.textContent = isCollected ? '✓ Discovered' : '🔒 Locked';
        
        endingDiv.appendChild(title);
        endingDiv.appendChild(description);
        endingDiv.appendChild(status);
        
        container.appendChild(endingDiv);
    });
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    // Update collector counter on load
    updateCollectorCounter();
    
    // Initialize mini-game display
    updateMiniGameDisplay();
    
    // Game is ready to play!
    console.log('Voices of the Past: South Africa - Game Ready!');
    console.log('Trading Challenge mini-game loaded with', tradingChallenge.items.length, 'trade items');
});

// Trading Challenge Functions
function startTradingChallenge(character) {
    // Determine perspective based on character
    tradingChallenge.gameState.perspective = character === 'dutch' ? 'dutch' : 'khoisan';
    
    // Reset game state
    tradingChallenge.gameState.active = true;
    tradingChallenge.gameState.score = 0;
    tradingChallenge.gameState.timeLeft = 60;
    tradingChallenge.gameState.correctMatches = 0;
    tradingChallenge.gameState.totalMatches = 0;
    
    // Hide other screens and show trading challenge
    hideAllScreens();
    document.getElementById('tradingChallengeScreen').style.display = 'block';
    
    // Update perspective display
    const perspectiveText = tradingChallenge.gameState.perspective === 'khoisan' ? 'Khoi-San' : 'Dutch';
    document.getElementById('tradePerspective').textContent = perspectiveText;
    
    // Start the game
    nextTradeItem();
    startTimer();
}

function hideAllScreens() {
    const screens = ['titleScreen', 'gameScreen', 'endingScreen', 'infoScreen', 'collectorScreen', 'tradingChallengeScreen', 'miniGameScreen', 'cattleChaseScreen', 'harborHustleScreen'];
    screens.forEach(screenId => {
        document.getElementById(screenId).style.display = 'none';
    });
}

function nextTradeItem() {
    if (tradingChallenge.gameState.timeLeft <= 0) {
        endTradingChallenge();
        return;
    }
    
    // Select random item
    const randomIndex = Math.floor(Math.random() * tradingChallenge.items.length);
    tradingChallenge.gameState.currentItem = tradingChallenge.items[randomIndex];
    
    // Update display
    document.getElementById('itemIcon').textContent = tradingChallenge.gameState.currentItem.icon;
    document.getElementById('itemName').textContent = tradingChallenge.gameState.currentItem.name;
    
    // Generate value options (correct value + 3 wrong values)
    generateValueOptions();
    
    // Reset option styles
    resetOptionStyles();
}

function generateValueOptions() {
    const item = tradingChallenge.gameState.currentItem;
    const perspective = tradingChallenge.gameState.perspective;
    const correctValue = perspective === 'khoisan' ? item.khoisanValue : item.dutchValue;
    
    // Generate 3 incorrect values
    const wrongValues = [];
    while (wrongValues.length < 3) {
        const randomValue = Math.floor(Math.random() * 10) + 1;
        if (randomValue !== correctValue && !wrongValues.includes(randomValue)) {
            wrongValues.push(randomValue);
        }
    }
    
    // Combine all values and shuffle
    const allValues = [correctValue, ...wrongValues];
    shuffleArray(allValues);
    
    // Assign to buttons
    for (let i = 0; i < 4; i++) {
        const button = document.getElementById(`valueOption${i + 1}`);
        button.querySelector('.value-number').textContent = allValues[i];
        button.dataset.value = allValues[i];
        button.dataset.correct = allValues[i] === correctValue ? 'true' : 'false';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectValue(optionNumber) {
    if (!tradingChallenge.gameState.active) return;
    
    const button = document.getElementById(`valueOption${optionNumber}`);
    const isCorrect = button.dataset.correct === 'true';
    
    tradingChallenge.gameState.totalMatches++;
    
    if (isCorrect) {
        tradingChallenge.gameState.correctMatches++;
        tradingChallenge.gameState.score += 10;
        button.classList.add('correct');
        
        // Update score display
        document.getElementById('challengeScore').textContent = tradingChallenge.gameState.score;
        
        // Wait a moment then show next item
        setTimeout(() => {
            nextTradeItem();
        }, 1000);
    } else {
        button.classList.add('incorrect');
        
        // Show correct answer
        for (let i = 1; i <= 4; i++) {
            const option = document.getElementById(`valueOption${i}`);
            if (option.dataset.correct === 'true') {
                option.classList.add('correct');
                break;
            }
        }
        
        // Wait a moment then show next item
        setTimeout(() => {
            nextTradeItem();
        }, 1500);
    }
}

function resetOptionStyles() {
    for (let i = 1; i <= 4; i++) {
        const button = document.getElementById(`valueOption${i}`);
        button.classList.remove('correct', 'incorrect');
    }
}

function startTimer() {
    const timer = setInterval(() => {
        tradingChallenge.gameState.timeLeft--;
        document.getElementById('timeLeft').textContent = tradingChallenge.gameState.timeLeft;
        
        if (tradingChallenge.gameState.timeLeft <= 0) {
            clearInterval(timer);
            endTradingChallenge();
        }
    }, 1000);
    
    // Store timer reference for cleanup
    tradingChallenge.gameState.timer = timer;
}

function endTradingChallenge() {
    tradingChallenge.gameState.active = false;
    
    // Clear timer
    if (tradingChallenge.gameState.timer) {
        clearInterval(tradingChallenge.gameState.timer);
    }
    
    // Hide game area and show results
    document.getElementById('tradingGameArea').querySelector('.current-item').style.display = 'none';
    document.getElementById('tradingGameArea').querySelector('.value-options').style.display = 'none';
    
    const resultDiv = document.getElementById('challengeResult');
    resultDiv.style.display = 'block';
    
    // Calculate percentage
    const percentage = tradingChallenge.gameState.totalMatches > 0 ? 
        Math.round((tradingChallenge.gameState.correctMatches / tradingChallenge.gameState.totalMatches) * 100) : 0;
    
    // Update result display
    document.getElementById('resultText').textContent = 
        `You scored ${tradingChallenge.gameState.score} points! (${tradingChallenge.gameState.correctMatches}/${tradingChallenge.gameState.totalMatches} correct - ${percentage}%)`;
    
    // Set historical context based on performance
    let historicalText;
    if (percentage >= 80) {
        historicalText = "Excellent understanding! In reality, successful traders who understood both cultures' value systems could build lasting relationships. However, many conflicts arose when traders from different backgrounds couldn't agree on fair values for goods.";
    } else if (percentage >= 60) {
        historicalText = "Good effort! Trade misunderstandings were common between the Khoi-San and Dutch. Different cultures valued items differently - cattle were extremely important to Khoi-San identity, while Europeans often saw them simply as commodities.";
    } else if (percentage >= 40) {
        historicalText = "Trade negotiations were challenging! The Khoi-San and Dutch had very different economic systems. What seemed valuable to one group might be worthless to another, leading to feelings of being cheated on both sides.";
    } else {
        historicalText = "Trade was complex! These value misunderstandings actually happened in history. The Khoi-San felt the Dutch didn't offer fair trades for their cattle, while the Dutch thought they were being generous. These disagreements contributed to growing tensions and eventual conflicts.";
    }
    
    document.getElementById('historicalText').textContent = historicalText;
}

function restartTradingChallenge() {
    // Hide results and show game area
    document.getElementById('challengeResult').style.display = 'none';
    document.getElementById('tradingGameArea').querySelector('.current-item').style.display = 'block';
    document.getElementById('tradingGameArea').querySelector('.value-options').style.display = 'grid';
    
    // Restart the challenge
    startTradingChallenge(tradingChallenge.gameState.perspective);
}

function exitTradingChallenge() {
    tradingChallenge.gameState.active = false;
    
    // Clear timer
    if (tradingChallenge.gameState.timer) {
        clearInterval(tradingChallenge.gameState.timer);
    }
    
    // Return to title screen
    hideAllScreens();
    document.getElementById('titleScreen').style.display = 'block';
}

// Mini-Game Collection Functions
function showMiniGameCollection() {
    hideAllScreens();
    document.getElementById('miniGameScreen').style.display = 'block';
    updateMiniGameDisplay();
}

function hideMiniGameCollection() {
    hideAllScreens();
    document.getElementById('titleScreen').style.display = 'block';
}

function updateMiniGameDisplay() {
    // Update progress counter
    const totalMiniGames = 3; // Trading challenge, cattle chase, and harbor hustle
    const unlockedCount = Object.values(unlockedMiniGames).filter(unlocked => unlocked).length;
    
    document.getElementById('miniGameProgress').textContent = `${unlockedCount} of ${totalMiniGames} mini-games unlocked`;
    document.getElementById('miniGameCount').textContent = `${unlockedCount}/${totalMiniGames}`;
    
    // Update trading challenge display
    const tradingItem = document.getElementById('tradingChallengeMiniGame');
    const tradingPlayButton = tradingItem.querySelector('.play-mini-game-btn');
    const tradingStatusIcon = tradingItem.querySelector('.status-icon');
    const tradingStatusText = tradingItem.querySelector('.status-text');
    
    if (unlockedMiniGames.tradingChallenge) {
        tradingItem.classList.remove('locked');
        tradingItem.classList.add('unlocked');
        tradingPlayButton.disabled = false;
        tradingStatusIcon.textContent = '✅';
        tradingStatusText.textContent = 'Unlocked';
    } else {
        tradingItem.classList.remove('unlocked');
        tradingItem.classList.add('locked');
        tradingPlayButton.disabled = true;
        tradingStatusIcon.textContent = '🔒';
        tradingStatusText.textContent = 'Locked';
    }
    
    // Update cattle chase display
    const cattleItem = document.getElementById('cattleChaseMiniGame');
    const cattlePlayButton = cattleItem.querySelector('.play-mini-game-btn');
    const cattleStatusIcon = cattleItem.querySelector('.status-icon');
    const cattleStatusText = cattleItem.querySelector('.status-text');
    
    if (unlockedMiniGames.cattleChase) {
        cattleItem.classList.remove('locked');
        cattleItem.classList.add('unlocked');
        cattlePlayButton.disabled = false;
        cattleStatusIcon.textContent = '✅';
        cattleStatusText.textContent = 'Unlocked';
    } else {
        cattleItem.classList.remove('unlocked');
        cattleItem.classList.add('locked');
        cattlePlayButton.disabled = true;
        cattleStatusIcon.textContent = '🔒';
        cattleStatusText.textContent = 'Locked';
    }
    
    // Update harbor hustle display
    const harborItem = document.getElementById('harborHustleMiniGame');
    const harborPlayButton = harborItem.querySelector('.play-mini-game-btn');
    const harborStatusIcon = harborItem.querySelector('.status-icon');
    const harborStatusText = harborItem.querySelector('.status-text');
    
    if (unlockedMiniGames.harborHustle) {
        harborItem.classList.remove('locked');
        harborItem.classList.add('unlocked');
        harborPlayButton.disabled = false;
        harborStatusIcon.textContent = '✅';
        harborStatusText.textContent = 'Unlocked';
    } else {
        harborItem.classList.remove('unlocked');
        harborItem.classList.add('locked');
        harborPlayButton.disabled = true;
        harborStatusIcon.textContent = '🔒';
        harborStatusText.textContent = 'Complete 8 Dutch endings';
    }
}

function playTradingChallenge() {
    if (!unlockedMiniGames.tradingChallenge) {
        return; // Shouldn't happen but safety check
    }
    
    // Create perspective selection modal
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(44, 62, 80, 0.95);
        border: 3px solid #8e44ad;
        border-radius: 10px;
        padding: 30px;
        max-width: 500px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(142, 68, 173, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "🤝 Trading Challenge";
    title.style.cssText = `
        color: #8e44ad;
        font-size: 1.8em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = "Choose which cultural perspective to experience:";
    text.style.cssText = `
        color: #ecf0f1;
        font-size: 1.1em;
        line-height: 1.6;
        margin-bottom: 30px;
        font-family: 'Courier New', monospace;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const khoisanButton = document.createElement('button');
    khoisanButton.textContent = "🏹 Khoi-San View";
    khoisanButton.style.cssText = `
        background: rgba(52, 152, 219, 0.8);
        border: 2px solid #3498db;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const dutchButton = document.createElement('button');
    dutchButton.textContent = "⚓ Dutch View";
    dutchButton.style.cssText = `
        background: rgba(46, 204, 113, 0.8);
        border: 2px solid #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = `
        background: rgba(52, 73, 94, 0.8);
        border: 2px solid #34495e;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    // Hover effects
    khoisanButton.onmouseover = () => {
        khoisanButton.style.background = 'rgba(52, 152, 219, 1)';
    };
    khoisanButton.onmouseout = () => {
        khoisanButton.style.background = 'rgba(52, 152, 219, 0.8)';
    };
    
    dutchButton.onmouseover = () => {
        dutchButton.style.background = 'rgba(46, 204, 113, 1)';
    };
    dutchButton.onmouseout = () => {
        dutchButton.style.background = 'rgba(46, 204, 113, 0.8)';
    };
    
    cancelButton.onmouseover = () => {
        cancelButton.style.background = 'rgba(52, 73, 94, 1)';
    };
    cancelButton.onmouseout = () => {
        cancelButton.style.background = 'rgba(52, 73, 94, 0.8)';
    };
    
    // Click handlers
    khoisanButton.onclick = () => {
        document.body.removeChild(overlay);
        startTradingChallenge('khoisan');
    };
    
    dutchButton.onclick = () => {
        document.body.removeChild(overlay);
        startTradingChallenge('dutch');
    };
    
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    buttonContainer.appendChild(khoisanButton);
    buttonContainer.appendChild(dutchButton);
    buttonContainer.appendChild(cancelButton);
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function unlockMiniGame(gameId) {
    if (!unlockedMiniGames[gameId]) {
        unlockedMiniGames[gameId] = true;
        localStorage.setItem('unlockedMiniGames', JSON.stringify(unlockedMiniGames));
        updateMiniGameDisplay();
        return true; // Newly unlocked
    }
    return false; // Already unlocked
}

function checkForTradingChallenge(character, endingKey) {
    // Check if this is a trade-related ending
    const isTradeEnding = (character === 'khoisan' && endingKey.startsWith('trade_')) ||
                         (character === 'dutch' && endingKey.startsWith('fair_trade_'));
    
    if (isTradeEnding) {
        // Count total trade-related endings collected
        const tradeEndingsCount = countTradeEndings();
        
        // Only unlock if student has completed at least 8 trade-related endings
        if (tradeEndingsCount >= 8) {
            const wasNewlyUnlocked = unlockMiniGame('tradingChallenge');
            
            // Show appropriate message after a short delay
            setTimeout(() => {
                if (wasNewlyUnlocked) {
                    showMiniGameUnlockedMessage(character);
                } else {
                    showTradingChallengeOffer(character);
                }
            }, 2000);
        } else {
            // Show progress message
            setTimeout(() => {
                showTradingChallengeProgress(tradeEndingsCount);
            }, 2000);
        }
    }
}

function countTradeEndings() {
    let count = 0;
    
    // Count Khoi-San trade endings
    collectedEndings.khoisan.forEach(endingKey => {
        if (endingKey.startsWith('trade_')) {
            count++;
        }
    });
    
    // Count Dutch trade endings
    collectedEndings.dutch.forEach(endingKey => {
        if (endingKey.startsWith('fair_trade_')) {
            count++;
        }
    });
    
    return count;
}

function showTradingChallengeProgress(currentCount) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 3px solid #f39c12;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 500px;
        color: white;
        font-family: 'Courier New', monospace;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Trading Challenge Progress';
    title.style.cssText = `
        color: #f39c12;
        margin-bottom: 20px;
        font-size: 1.5em;
    `;
    
    const text = document.createElement('p');
    text.innerHTML = `
        You've completed <strong>${currentCount} of 8</strong> trade-related endings!<br><br>
        Complete <strong>${8 - currentCount} more</strong> trade endings to unlock the Trading Challenge mini-game.<br><br>
        <em>Keep exploring different trade scenarios to understand the complexities of historical commerce!</em>
    `;
    text.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
        font-size: 1.1em;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue Learning';
    closeButton.style.cssText = `
        background: #e74c3c;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    closeButton.onmouseover = () => {
        closeButton.style.background = '#c0392b';
        closeButton.style.transform = 'translateY(-2px)';
    };
    
    closeButton.onmouseout = () => {
        closeButton.style.background = '#e74c3c';
        closeButton.style.transform = 'translateY(0)';
    };
    
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(closeButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function showMiniGameUnlockedMessage(character) {
    // Create modal overlay for mini-game unlock announcement
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(44, 62, 80, 0.95);
        border: 3px solid #8e44ad;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(142, 68, 173, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "🎮 Mini-Game Unlocked!";
    title.style.cssText = `
        color: #8e44ad;
        font-size: 1.8em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = "Congratulations! You've unlocked the Trading Challenge mini-game! Visit the Mini-Game Collection to play anytime, or try it now.";
    text.style.cssText = `
        color: #ecf0f1;
        font-size: 1.1em;
        line-height: 1.6;
        margin-bottom: 30px;
        font-family: 'Courier New', monospace;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const playNowButton = document.createElement('button');
    playNowButton.textContent = "🤝 Play Now";
    playNowButton.style.cssText = `
        background: rgba(142, 68, 173, 0.8);
        border: 2px solid #8e44ad;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const collectionButton = document.createElement('button');
    collectionButton.textContent = "🎮 View Collection";
    collectionButton.style.cssText = `
        background: rgba(52, 152, 219, 0.8);
        border: 2px solid #3498db;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const laterButton = document.createElement('button');
    laterButton.textContent = "Maybe Later";
    laterButton.style.cssText = `
        background: rgba(52, 73, 94, 0.8);
        border: 2px solid #34495e;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    // Hover effects
    playNowButton.onmouseover = () => {
        playNowButton.style.background = 'rgba(142, 68, 173, 1)';
    };
    playNowButton.onmouseout = () => {
        playNowButton.style.background = 'rgba(142, 68, 173, 0.8)';
    };
    
    collectionButton.onmouseover = () => {
        collectionButton.style.background = 'rgba(52, 152, 219, 1)';
    };
    collectionButton.onmouseout = () => {
        collectionButton.style.background = 'rgba(52, 152, 219, 0.8)';
    };
    
    laterButton.onmouseover = () => {
        laterButton.style.background = 'rgba(52, 73, 94, 1)';
    };
    laterButton.onmouseout = () => {
        laterButton.style.background = 'rgba(52, 73, 94, 0.8)';
    };
    
    // Click handlers
    playNowButton.onclick = () => {
        document.body.removeChild(overlay);
        playTradingChallenge();
    };
    
    collectionButton.onclick = () => {
        document.body.removeChild(overlay);
        showMiniGameCollection();
    };
    
    laterButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    buttonContainer.appendChild(playNowButton);
    buttonContainer.appendChild(collectionButton);
    buttonContainer.appendChild(laterButton);
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function showTradingChallengeOffer(character) {
    // Create modal overlay for trading challenge offer
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(44, 62, 80, 0.95);
        border: 3px solid #f39c12;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "🤝 Trading Challenge Unlocked!";
    title.style.cssText = `
        color: #f39c12;
        font-size: 1.8em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = "You've completed a trade-related ending! Try the Trading Challenge mini-game to understand how trade value misunderstandings led to historical conflicts.";
    text.style.cssText = `
        color: #ecf0f1;
        font-size: 1.1em;
        line-height: 1.6;
        margin-bottom: 30px;
        font-family: 'Courier New', monospace;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const playButton = document.createElement('button');
    playButton.textContent = "Play Challenge";
    playButton.style.cssText = `
        background: rgba(46, 204, 113, 0.8);
        border: 2px solid #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const skipButton = document.createElement('button');
    skipButton.textContent = "Maybe Later";
    skipButton.style.cssText = `
        background: rgba(52, 73, 94, 0.8);
        border: 2px solid #34495e;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    playButton.onmouseover = () => {
        playButton.style.background = 'rgba(46, 204, 113, 1)';
    };
    
    playButton.onmouseout = () => {
        playButton.style.background = 'rgba(46, 204, 113, 0.8)';
    };
    
    skipButton.onmouseover = () => {
        skipButton.style.background = 'rgba(52, 73, 94, 1)';
    };
    
    skipButton.onmouseout = () => {
        skipButton.style.background = 'rgba(52, 73, 94, 0.8)';
    };
    
    playButton.onclick = () => {
        document.body.removeChild(overlay);
        startTradingChallenge(character);
    };
    
    skipButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    buttonContainer.appendChild(playButton);
    buttonContainer.appendChild(skipButton);
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Cattle Chase Game Functions
function playCattleChase() {
    if (!unlockedMiniGames.cattleChase) {
        return; // Shouldn't happen but safety check
    }
    
    hideAllScreens();
    document.getElementById('cattleChaseScreen').style.display = 'block';
    initializeCattleChase();
}

function initializeCattleChase() {
    // Reset game state
    cattleChase.gameState = {
        active: false,
        score: 0,
        lives: 3,
        level: 1,
        cattleInKraal: 0,
        cattleNeeded: 5,
        gameSpeed: 1,
        spawnSide: 0 // Start with bottom spawn
    };
    
    cattleChase.player = {
        x: 400,
        y: 550,
        size: 30,
        speed: 5
    };
    
    cattleChase.cattle = [];
    cattleChase.obstacles = [];
    
    // Update display
    updateCattleGameStats();
    
    // Show instructions
    document.getElementById('cattleInstructions').style.display = 'block';
    document.getElementById('cattleGameOver').style.display = 'none';
    
    // Get canvas context
    cattleChase.canvas = document.getElementById('cattleCanvas');
    cattleChase.ctx = cattleChase.canvas.getContext('2d');
    
    // Set canvas size for mobile
    if (window.innerWidth <= 600) {
        cattleChase.canvas.width = 350;
        cattleChase.canvas.height = 400;
    } else {
        cattleChase.canvas.width = 800;
        cattleChase.canvas.height = 600;
    }
    
    drawCattleGameBoard();
}

function startCattleChase() {
    cattleChase.gameState.active = true;
    
    // Hide instructions
    document.getElementById('cattleInstructions').style.display = 'none';
    
    // Initialize game objects
    spawnCattle();
    spawnObstacles();
    
    // Set up keyboard controls
    setupCattleControls();
    
    // Start game loop
    cattleGameLoop();
}

function updateCattleGameStats() {
    document.getElementById('cattleLives').textContent = cattleChase.gameState.lives;
    document.getElementById('cattleScore').textContent = cattleChase.gameState.score;
    document.getElementById('cattleInKraal').textContent = `${cattleChase.gameState.cattleInKraal}/${cattleChase.gameState.cattleNeeded}`;
    document.getElementById('cattleLevel').textContent = cattleChase.gameState.level;
}

function spawnCattle() {
    cattleChase.cattle = [];
    const positions = getCattleSpawnPositions();
    
    for (let i = 0; i < 3; i++) {
        cattleChase.cattle.push({
            x: positions[i].x,
            y: positions[i].y,
            size: 25,
            speed: 2,
            following: false,
            inKraal: false,
            lost: false
        });
    }
}

function spawnNewCattleBatch() {
    // Cycle to next spawn side
    cattleChase.gameState.spawnSide = (cattleChase.gameState.spawnSide + 1) % 3;
    
    // Add 3 new cattle to the existing array (keeping the ones already in kraal)
    const positions = getCattleSpawnPositions();
    
    for (let i = 0; i < 3; i++) {
        cattleChase.cattle.push({
            x: positions[i].x,
            y: positions[i].y,
            size: 25,
            speed: 2,
            following: false,
            inKraal: false,
            lost: false
        });
    }
}

function getCattleSpawnPositions() {
    const canvasWidth = cattleChase.canvas.width;
    const canvasHeight = cattleChase.canvas.height;
    const spacing = 80;
    const positions = [];
    
    switch (cattleChase.gameState.spawnSide) {
        case 0: // Bottom
            for (let i = 0; i < 3; i++) {
                positions.push({
                    x: 100 + (i * spacing),
                    y: canvasHeight - 50
                });
            }
            break;
            
        case 1: // Top (but not in kraal area)
            for (let i = 0; i < 3; i++) {
                positions.push({
                    x: 100 + (i * spacing),
                    y: 150 // Below the kraal area
                });
            }
            break;
            
        case 2: // Left side
            for (let i = 0; i < 3; i++) {
                positions.push({
                    x: 50,
                    y: 200 + (i * spacing)
                });
            }
            break;
    }
    
    return positions;
}

function spawnObstacles() {
    cattleChase.obstacles = [];
    const numObstacles = 3 + cattleChase.gameState.level;
    
    for (let i = 0; i < numObstacles; i++) {
        cattleChase.obstacles.push({
            x: Math.random() * (cattleChase.canvas.width - 40),
            y: 150 + Math.random() * 300,
            size: 30,
            speed: 1 + (cattleChase.gameState.level * 0.5),
            direction: Math.random() * Math.PI * 2,
            type: Math.random() > 0.5 ? 'wolf' : 'settler'
        });
    }
}

let cattleKeys = {};

function setupCattleControls() {
    document.addEventListener('keydown', (e) => {
        cattleKeys[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        cattleKeys[e.key.toLowerCase()] = false;
    });
}

function cattleGameLoop() {
    if (!cattleChase.gameState.active) return;
    
    updateCattleGame();
    drawCattleGameBoard();
    
    requestAnimationFrame(cattleGameLoop);
}

function updateCattleGame() {
    // Move player
    if (cattleKeys['arrowup'] || cattleKeys['w']) {
        cattleChase.player.y -= cattleChase.player.speed;
    }
    if (cattleKeys['arrowdown'] || cattleKeys['s']) {
        cattleChase.player.y += cattleChase.player.speed;
    }
    if (cattleKeys['arrowleft'] || cattleKeys['a']) {
        cattleChase.player.x -= cattleChase.player.speed;
    }
    if (cattleKeys['arrowright'] || cattleKeys['d']) {
        cattleChase.player.x += cattleChase.player.speed;
    }
    
    // Keep player in bounds
    cattleChase.player.x = Math.max(15, Math.min(cattleChase.canvas.width - 15, cattleChase.player.x));
    cattleChase.player.y = Math.max(15, Math.min(cattleChase.canvas.height - 15, cattleChase.player.y));
    
    // Update cattle
    cattleChase.cattle.forEach((cow, index) => {
        if (!cow.inKraal && !cow.lost) {
            // Cattle follow player if close
            const distToPlayer = Math.sqrt(
                Math.pow(cow.x - cattleChase.player.x, 2) + 
                Math.pow(cow.y - cattleChase.player.y, 2)
            );
            
            if (distToPlayer < 50) {
                cow.following = true;
            }
            
            if (cow.following) {
                // Move towards player
                const angle = Math.atan2(cattleChase.player.y - cow.y, cattleChase.player.x - cow.x);
                cow.x += Math.cos(angle) * cow.speed;
                cow.y += Math.sin(angle) * cow.speed;
            }
            
            // Check if cattle reached kraal
            if (cow.x > cattleChase.kraal.x && 
                cow.x < cattleChase.kraal.x + cattleChase.kraal.width &&
                cow.y > cattleChase.kraal.y && 
                cow.y < cattleChase.kraal.y + cattleChase.kraal.height) {
                cow.inKraal = true;
                cattleChase.gameState.cattleInKraal++;
                cattleChase.gameState.score += 50;
                updateCattleGameStats();
                
                // Spawn new cattle when current batch is cleared (either in kraal or lost)
                const activeCattle = cattleChase.cattle.filter(c => !c.inKraal && !c.lost).length;
                if (activeCattle === 0 && cattleChase.gameState.cattleInKraal < cattleChase.gameState.cattleNeeded) {
                    spawnNewCattleBatch();
                }
            }
        }
    });
    
    // Update obstacles
    cattleChase.obstacles.forEach(obstacle => {
        obstacle.x += Math.cos(obstacle.direction) * obstacle.speed;
        obstacle.y += Math.sin(obstacle.direction) * obstacle.speed;
        
        // Bounce off walls
        if (obstacle.x <= 0 || obstacle.x >= cattleChase.canvas.width - obstacle.size) {
            obstacle.direction = Math.PI - obstacle.direction;
        }
        if (obstacle.y <= 0 || obstacle.y >= cattleChase.canvas.height - obstacle.size) {
            obstacle.direction = -obstacle.direction;
        }
        
        // Check collision with player or cattle
        const playerDist = Math.sqrt(
            Math.pow(obstacle.x - cattleChase.player.x, 2) + 
            Math.pow(obstacle.y - cattleChase.player.y, 2)
        );
        
        if (playerDist < obstacle.size) {
            loseLife();
            return;
        }
        
        // Check collision with cattle
        cattleChase.cattle.forEach(cow => {
            if (!cow.inKraal && !cow.lost) {
                const cowDist = Math.sqrt(
                    Math.pow(obstacle.x - cow.x, 2) + 
                    Math.pow(obstacle.y - cow.y, 2)
                );
                
                if (cowDist < obstacle.size) {
                    // Mark this cattle as lost and player loses a life
                    cow.lost = true;
                    cow.following = false;
                    cattleChase.gameState.score = Math.max(0, cattleChase.gameState.score - 25); // Penalty for losing cattle
                    updateCattleGameStats();
                    
                    // Player loses a life when cattle are touched
                    loseLife();
                    
                    // Check if we need to spawn new cattle (when all active cattle are gone)
                    const activeCattle = cattleChase.cattle.filter(c => !c.inKraal && !c.lost).length;
                    if (activeCattle === 0 && cattleChase.gameState.cattleInKraal < cattleChase.gameState.cattleNeeded) {
                        setTimeout(() => {
                            spawnNewCattleBatch();
                        }, 1000); // Small delay before spawning new batch
                    }
                }
            }
        });
    });
    
    // Check win condition
    if (cattleChase.gameState.cattleInKraal >= cattleChase.gameState.cattleNeeded) {
        nextCattleLevel();
    }
}

function drawCattleGameBoard() {
    const ctx = cattleChase.ctx;
    ctx.clearRect(0, 0, cattleChase.canvas.width, cattleChase.canvas.height);
    
    // Draw background (grassland)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 0, cattleChase.canvas.width, cattleChase.canvas.height);
    
    // Draw kraal
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(cattleChase.kraal.x, cattleChase.kraal.y, cattleChase.kraal.width, cattleChase.kraal.height);
    ctx.fillStyle = '#654321';
    ctx.strokeRect(cattleChase.kraal.x, cattleChase.kraal.y, cattleChase.kraal.width, cattleChase.kraal.height);
    
    // Draw kraal label
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KRAAL', cattleChase.kraal.x + cattleChase.kraal.width/2, cattleChase.kraal.y + cattleChase.kraal.height/2);
    
    // Draw player (herder)
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(cattleChase.player.x, cattleChase.player.y, cattleChase.player.size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player emoji
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏹', cattleChase.player.x, cattleChase.player.y + 5);
    
    // Draw cattle
    cattleChase.cattle.forEach(cow => {
        if (!cow.inKraal) {
            if (cow.lost) {
                // Draw lost cattle as gray/faded
                ctx.fillStyle = '#7f8c8d';
                ctx.beginPath();
                ctx.arc(cow.x, cow.y, cow.size/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.font = '16px Arial';
                ctx.fillText('💀', cow.x, cow.y + 5); // Skull to show it's lost
            } else {
                ctx.fillStyle = cow.following ? '#e74c3c' : '#f39c12';
                ctx.beginPath();
                ctx.arc(cow.x, cow.y, cow.size/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.font = '16px Arial';
                ctx.fillText('🐄', cow.x, cow.y + 5);
            }
        }
    });
    
    // Draw obstacles
    cattleChase.obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.type === 'wolf' ? '#8e44ad' : '#e67e22';
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '16px Arial';
        ctx.fillText(obstacle.type === 'wolf' ? '🐺' : '👤', obstacle.x, obstacle.y + 5);
    });
}

function loseLife() {
    cattleChase.gameState.lives--;
    updateCattleGameStats();
    
    if (cattleChase.gameState.lives <= 0) {
        endCattleChase();
    } else {
        // Reset player position
        cattleChase.player.x = 400;
        cattleChase.player.y = 550;
        
        // Only respawn cattle that aren't already in the kraal
        const cattleInKraal = cattleChase.cattle.filter(c => c.inKraal);
        cattleChase.cattle = [...cattleInKraal]; // Keep cattle already in kraal
        
        // Spawn new cattle if we don't have enough active ones
        const activeCattle = cattleChase.cattle.filter(c => !c.inKraal && !c.lost).length;
        if (activeCattle === 0) {
            spawnNewCattleBatch();
        }
    }
}

function nextCattleLevel() {
    cattleChase.gameState.level++;
    cattleChase.gameState.cattleInKraal = 0;
    cattleChase.gameState.score += 100; // Bonus for completing level
    updateCattleGameStats();
    
    // Reset and increase difficulty
    cattleChase.player.x = 400;
    cattleChase.player.y = 550;
    spawnCattle();
    spawnObstacles();
}

function endCattleChase() {
    cattleChase.gameState.active = false;
    
    // Show game over screen
    document.getElementById('cattleGameOver').style.display = 'block';
    
    // Set results based on performance
    let title, text, historicalText;
    
    if (cattleChase.gameState.level >= 5) {
        title = "Master Herder!";
        text = `Outstanding! You reached level ${cattleChase.gameState.level} and scored ${cattleChase.gameState.score} points!`;
        historicalText = "Exceptional herding skills! In Khoi-San society, master herders were highly respected for their ability to protect and manage cattle. Your success shows the skill and dedication required to maintain these valuable animals that were central to wealth, status, and survival.";
    } else if (cattleChase.gameState.level >= 3) {
        title = "Skilled Herder";
        text = `Good work! You reached level ${cattleChase.gameState.level} and scored ${cattleChase.gameState.score} points!`;
        historicalText = "Well done! Protecting cattle required constant vigilance against wild animals and later, settlers who saw the cattle as free for the taking. Your performance shows you understand the challenges Khoi-San herders faced daily.";
    } else {
        title = "Learning Herder";
        text = `You reached level ${cattleChase.gameState.level} and scored ${cattleChase.gameState.score} points. Keep practicing!`;
        historicalText = "Herding was a challenging skill that took years to master. The Khoi-San had to protect their cattle from lions, leopards, and later from Dutch settlers who often simply took cattle without permission, leading to many conflicts over these precious animals.";
    }
    
    document.getElementById('cattleResultTitle').textContent = title;
    document.getElementById('cattleResultText').textContent = text;
    document.getElementById('cattleHistoricalText').textContent = historicalText;
}

function restartCattleChase() {
    document.getElementById('cattleGameOver').style.display = 'none';
    initializeCattleChase();
}

function exitCattleChase() {
    cattleChase.gameState.active = false;
    hideAllScreens();
    document.getElementById('titleScreen').style.display = 'block';
}

// Harbor Hustle Functions
function playHarborHustle() {
    hideAllScreens();
    document.getElementById('harborHustleScreen').style.display = 'block';
    initializeHarborHustle();
}

function initializeHarborHustle() {
    // Reset game state
    harborHustle.gameState = {
        active: false,
        score: 0,
        level: 1,
        timeLeft: 30,
        suppliesLoaded: 0,
        suppliesNeeded: 10,
        gameSpeed: 1,
        timerStarted: false
    };
    
    harborHustle.supplies = [];
    harborHustle.ships = [];
    harborHustle.draggedItem = null;
    
    // Initialize ship grid (8x6)
    harborHustle.shipGrid = [];
    for (let y = 0; y < harborHustle.gridHeight; y++) {
        harborHustle.shipGrid[y] = [];
        for (let x = 0; x < harborHustle.gridWidth; x++) {
            harborHustle.shipGrid[y][x] = 0; // 0 = empty, 1 = occupied
        }
    }
    
    // Clear any existing timer
    if (harborHustle.gameTimer) {
        clearInterval(harborHustle.gameTimer);
    }
    
    updateHarborGameStats();
    generateSupplies();
    setupHarborDragAndDrop();
    drawShipGrid();
    
    // Show start button
    document.getElementById('startHarborBtn').style.display = 'inline-block';
    document.getElementById('restartHarborBtn').style.display = 'none';
    document.getElementById('harborGameOver').style.display = 'none';
}

function startHarborHustle() {
    harborHustle.gameState.active = true;
    document.getElementById('startHarborBtn').style.display = 'none';
    
    // Timer will start when first supply is dropped
    // No timer initialization here
}

function updateHarborGameStats() {
    document.getElementById('harborTime').textContent = harborHustle.gameState.timeLeft;
    document.getElementById('harborScore').textContent = harborHustle.gameState.score;
    document.getElementById('harborLoaded').textContent = `${harborHustle.gameState.suppliesLoaded}/${harborHustle.gameState.suppliesNeeded}`;
    document.getElementById('harborLevel').textContent = harborHustle.gameState.level;
}

function generateSupplies() {
    const container = document.getElementById('suppliesContainer');
    container.innerHTML = '';
    
    // Generate 15 supplies (more than needed to create choice)
    for (let i = 0; i < 15; i++) {
        const supplyType = harborHustle.supplyTypes[Math.floor(Math.random() * harborHustle.supplyTypes.length)];
        const supply = {
            id: `supply_${i}`,
            type: supplyType.name,
            emoji: supplyType.emoji,
            points: supplyType.points,
            color: supplyType.color,
            loaded: false,
            shape: supplyType.shape,
            width: supplyType.width,
            height: supplyType.height
        };
        
        harborHustle.supplies.push(supply);
        
        const supplyElement = document.createElement('div');
        supplyElement.className = 'supply-item';
        supplyElement.id = supply.id;
        supplyElement.style.backgroundColor = supply.color;
        supplyElement.innerHTML = `
            <div class="supply-emoji">${supply.emoji}</div>
            <div class="supply-name">${supply.type}</div>
        `;
        
        container.appendChild(supplyElement);
    }
}

function drawShipGrid() {
    const loadingZone = document.getElementById('loadingZone');
    loadingZone.innerHTML = '';
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${harborHustle.gridWidth}, 30px);
        grid-template-rows: repeat(${harborHustle.gridHeight}, 30px);
        gap: 2px;
        margin: 10px auto;
        width: fit-content;
    `;
    
    // Create grid cells
    for (let y = 0; y < harborHustle.gridHeight; y++) {
        for (let x = 0; x < harborHustle.gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `grid_${x}_${y}`;
            cell.style.cssText = `
                width: 30px;
                height: 30px;
                border: 1px solid #555;
                background: ${harborHustle.shipGrid[y][x] ? '#666' : '#222'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            `;
            gridContainer.appendChild(cell);
        }
    }
    
    loadingZone.appendChild(gridContainer);
}

function startTimer() {
    if (!harborHustle.gameState.timerStarted) {
        harborHustle.gameState.timerStarted = true;
        
        harborHustle.gameTimer = setInterval(() => {
            harborHustle.gameState.timeLeft--;
            updateHarborGameStats();
            
            if (harborHustle.gameState.timeLeft <= 0) {
                endHarborHustle();
            }
        }, 1000);
    }
}

function canPlaceSupply(supply, gridX, gridY) {
    // Check if supply can be placed at the given grid position
    for (let y = 0; y < supply.height; y++) {
        for (let x = 0; x < supply.width; x++) {
            if (supply.shape[y] && supply.shape[y][x]) {
                const checkX = gridX + x;
                const checkY = gridY + y;
                
                // Check bounds
                if (checkX >= harborHustle.gridWidth || checkY >= harborHustle.gridHeight) {
                    return false;
                }
                
                // Check if cell is already occupied
                if (harborHustle.shipGrid[checkY][checkX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeSupply(supply, gridX, gridY) {
    // Place the supply on the grid
    for (let y = 0; y < supply.height; y++) {
        for (let x = 0; x < supply.width; x++) {
            if (supply.shape[y] && supply.shape[y][x]) {
                const placeX = gridX + x;
                const placeY = gridY + y;
                harborHustle.shipGrid[placeY][placeX] = supply.id;
            }
        }
    }
    
    // Update visual grid
    drawShipGrid();
}

function showPreview(e) {
    if (!harborHustle.draggedItem) return;
    
    const supply = harborHustle.supplies.find(s => s.id === harborHustle.draggedItem);
    if (!supply || supply.loaded) return;
    
    // Get the grid container for accurate positioning
    const loadingZone = document.getElementById('loadingZone');
    const gridContainer = loadingZone.querySelector('div[style*="grid-template-columns"]');
    if (!gridContainer) return;
    
    // Calculate grid position from mouse coordinates relative to grid container
    const gridRect = gridContainer.getBoundingClientRect();
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;
    
    // Convert to grid coordinates (30px cell + 2px gap = 32px total)
    const gridX = Math.floor(x / 32);
    const gridY = Math.floor(y / 32);
    
    // Clear previous preview
    clearPreview();
    
    // Check if placement is valid
    const isValid = canPlaceSupply(supply, gridX, gridY);
    
    // Show preview
    showGridPreview(supply, gridX, gridY, isValid);
}

function showGridPreview(supply, gridX, gridY, isValid) {
    // Create preview overlay
    const previewOverlay = document.createElement('div');
    previewOverlay.id = 'preview-overlay';
    previewOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
    `;
    
    const loadingZone = document.getElementById('loadingZone');
    loadingZone.style.position = 'relative';
    loadingZone.appendChild(previewOverlay);
    
    // Get the grid container to align with it
    const gridContainer = loadingZone.querySelector('div[style*="grid-template-columns"]');
    if (!gridContainer) return;
    
    const gridRect = gridContainer.getBoundingClientRect();
    const loadingRect = loadingZone.getBoundingClientRect();
    
    // Calculate offset from loading zone to grid container
    const offsetX = gridRect.left - loadingRect.left;
    const offsetY = gridRect.top - loadingRect.top;
    
    // Draw preview cells
    for (let y = 0; y < supply.height; y++) {
        for (let x = 0; x < supply.width; x++) {
            if (supply.shape[y] && supply.shape[y][x]) {
                const previewX = gridX + x;
                const previewY = gridY + y;
                
                // Check bounds
                if (previewX >= 0 && previewX < harborHustle.gridWidth && 
                    previewY >= 0 && previewY < harborHustle.gridHeight) {
                    
                    const previewCell = document.createElement('div');
                    previewCell.style.cssText = `
                        position: absolute;
                        left: ${offsetX + previewX * 32}px;
                        top: ${offsetY + previewY * 32}px;
                        width: 30px;
                        height: 30px;
                        border: 2px solid ${isValid ? '#00ff00' : '#ff0000'};
                        background: ${isValid ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        z-index: 11;
                        box-sizing: border-box;
                    `;
                    
                    // Show supply emoji in preview
                    previewCell.textContent = supply.emoji;
                    previewOverlay.appendChild(previewCell);
                }
            }
        }
    }
}

function clearPreview() {
    const previewOverlay = document.getElementById('preview-overlay');
    if (previewOverlay) {
        previewOverlay.remove();
    }
}

function setupHarborDragAndDrop() {
    const supplies = document.querySelectorAll('.supply-item');
    const loadingZone = document.getElementById('loadingZone');
    
    supplies.forEach(supply => {
        supply.draggable = true;
        
        supply.addEventListener('dragstart', (e) => {
            harborHustle.draggedItem = supply.id;
            supply.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        supply.addEventListener('dragend', (e) => {
            supply.classList.remove('dragging');
            harborHustle.draggedItem = null;
            clearPreview();
        });
    });
    
    loadingZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        loadingZone.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
        
        // Show preview when dragging over grid
        if (harborHustle.draggedItem) {
            showPreview(e);
        }
    });
    
    loadingZone.addEventListener('dragleave', (e) => {
        loadingZone.classList.remove('drag-over');
        clearPreview();
    });
    
    loadingZone.addEventListener('drop', (e) => {
        e.preventDefault();
        loadingZone.classList.remove('drag-over');
        clearPreview();
        
        if (harborHustle.draggedItem) {
            const supplyId = harborHustle.draggedItem;
            const supply = harborHustle.supplies.find(s => s.id === supplyId);
            
            if (supply && !supply.loaded) {
                // Start timer on first drop
                startTimer();
                
                // Get the grid container for accurate positioning
                const gridContainer = loadingZone.querySelector('div[style*="grid-template-columns"]');
                if (!gridContainer) return;
                
                // Calculate grid position from drop coordinates relative to grid container
                const gridRect = gridContainer.getBoundingClientRect();
                const x = e.clientX - gridRect.left;
                const y = e.clientY - gridRect.top;
                
                // Convert to grid coordinates (30px cell + 2px gap = 32px total)
                const gridX = Math.floor(x / 32);
                const gridY = Math.floor(y / 32);
                
                // Check if supply can be placed
                if (canPlaceSupply(supply, gridX, gridY)) {
                    // Place the supply
                    placeSupply(supply, gridX, gridY);
                    
                    // Mark as loaded
                    supply.loaded = true;
                    harborHustle.gameState.suppliesLoaded++;
                    harborHustle.gameState.score += supply.points;
                    
                    // Remove from dock
                    const supplyElement = document.getElementById(supplyId);
                    supplyElement.style.display = 'none';
                    
                    updateHarborGameStats();
                    
                    // Check win condition
                    if (harborHustle.gameState.suppliesLoaded >= harborHustle.gameState.suppliesNeeded) {
                        nextHarborLevel();
                    }
                } else {
                    // Invalid placement - show feedback
                    const supplyElement = document.getElementById(supplyId);
                    supplyElement.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        supplyElement.style.animation = '';
                    }, 500);
                }
            }
        }
    });
}

function nextHarborLevel() {
    harborHustle.gameState.level++;
    harborHustle.gameState.suppliesNeeded += 5;
    harborHustle.gameState.timeLeft += 30; // Bonus time
    harborHustle.gameState.suppliesLoaded = 0;
    harborHustle.gameState.timerStarted = false;
    
    // Clear timer
    if (harborHustle.gameTimer) {
        clearInterval(harborHustle.gameTimer);
    }
    
    // Reset ship grid
    for (let y = 0; y < harborHustle.gridHeight; y++) {
        for (let x = 0; x < harborHustle.gridWidth; x++) {
            harborHustle.shipGrid[y][x] = 0;
        }
    }
    
    // Generate new supplies
    harborHustle.supplies = [];
    generateSupplies();
    setupHarborDragAndDrop();
    drawShipGrid();
    
    updateHarborGameStats();
}

function endHarborHustle() {
    harborHustle.gameState.active = false;
    clearInterval(harborHustle.gameTimer);
    
    const won = harborHustle.gameState.suppliesLoaded >= harborHustle.gameState.suppliesNeeded;
    
    document.getElementById('harborGameOverTitle').textContent = won ? 'Level Complete!' : 'Time\'s Up!';
    document.getElementById('harborGameOverText').textContent = won ? 
        `Great job! You loaded all supplies in time!` : 
        `You loaded ${harborHustle.gameState.suppliesLoaded} of ${harborHustle.gameState.suppliesNeeded} supplies.`;
    
    document.getElementById('harborFinalScore').textContent = harborHustle.gameState.score;
    document.getElementById('harborFinalLoaded').textContent = harborHustle.gameState.suppliesLoaded;
    document.getElementById('harborFinalNeeded').textContent = harborHustle.gameState.suppliesNeeded;
    document.getElementById('harborFinalLevel').textContent = harborHustle.gameState.level;
    
    document.getElementById('harborGameOver').style.display = 'block';
    document.getElementById('restartHarborBtn').style.display = 'inline-block';
}

function restartHarborHustle() {
    initializeHarborHustle();
}

function exitHarborHustle() {
    hideAllScreens();
    document.getElementById('titleScreen').style.display = 'block';
}

// Test Mini-Games Functions
function showTestMiniGames() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border: 3px solid #e67e22;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 600px;
        color: white;
        font-family: 'Courier New', monospace;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const title = document.createElement('h2');
    title.textContent = '🧪 Test All Mini-Games';
    title.style.cssText = `
        color: #e67e22;
        margin-bottom: 20px;
        font-size: 1.8em;
    `;
    
    const text = document.createElement('p');
    text.innerHTML = `
        Choose a mini-game to test directly. These are unlocked for testing purposes only.<br><br>
        <em>Note: This bypasses normal unlock requirements for testing.</em>
    `;
    text.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
        font-size: 1.1em;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 20px;
    `;
    
    // Trading Challenge Button
    const tradingButton = document.createElement('button');
    tradingButton.innerHTML = '🎯 Trading Challenge<br><small>Item matching game</small>';
    tradingButton.style.cssText = `
        background: #e74c3c;
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
        line-height: 1.4;
    `;
    
    // Cattle Chase Button
    const cattleButton = document.createElement('button');
    cattleButton.innerHTML = '🐄 Cattle Chase<br><small>Herding game</small>';
    cattleButton.style.cssText = `
        background: #8e44ad;
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
        line-height: 1.4;
    `;
    
    // Harbor Hustle Button
    const harborButton = document.createElement('button');
    harborButton.innerHTML = '⚓ Harbor Hustle<br><small>Loading game</small>';
    harborButton.style.cssText = `
        background: #3498db;
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
        line-height: 1.4;
    `;
    
    // Close Button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        background: #95a5a6;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    // Hover effects
    tradingButton.onmouseover = () => {
        tradingButton.style.background = '#c0392b';
        tradingButton.style.transform = 'translateY(-2px)';
    };
    tradingButton.onmouseout = () => {
        tradingButton.style.background = '#e74c3c';
        tradingButton.style.transform = 'translateY(0)';
    };
    
    cattleButton.onmouseover = () => {
        cattleButton.style.background = '#7d3c98';
        cattleButton.style.transform = 'translateY(-2px)';
    };
    cattleButton.onmouseout = () => {
        cattleButton.style.background = '#8e44ad';
        cattleButton.style.transform = 'translateY(0)';
    };
    
    harborButton.onmouseover = () => {
        harborButton.style.background = '#2980b9';
        harborButton.style.transform = 'translateY(-2px)';
    };
    harborButton.onmouseout = () => {
        harborButton.style.background = '#3498db';
        harborButton.style.transform = 'translateY(0)';
    };
    
    closeButton.onmouseover = () => {
        closeButton.style.background = '#7f8c8d';
        closeButton.style.transform = 'translateY(-2px)';
    };
    closeButton.onmouseout = () => {
        closeButton.style.background = '#95a5a6';
        closeButton.style.transform = 'translateY(0)';
    };
    
    // Click handlers
    tradingButton.onclick = () => {
        document.body.removeChild(overlay);
        testTradingChallenge();
    };
    
    cattleButton.onclick = () => {
        document.body.removeChild(overlay);
        testCattleChase();
    };
    
    harborButton.onclick = () => {
        document.body.removeChild(overlay);
        testHarborHustle();
    };
    
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    buttonContainer.appendChild(tradingButton);
    buttonContainer.appendChild(cattleButton);
    buttonContainer.appendChild(harborButton);
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(buttonContainer);
    modal.appendChild(closeButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function testTradingChallenge() {
    // Temporarily unlock trading challenge for testing
    unlockedMiniGames.tradingChallenge = true;
    localStorage.setItem('unlockedMiniGames', JSON.stringify(unlockedMiniGames));
    
    hideAllScreens();
    document.getElementById('tradingChallengeScreen').style.display = 'block';
    
    // Update perspective display
    document.getElementById('tradePerspective').textContent = 'Khoi-San';
    
    // Start the game
    nextTradeItem();
    startTimer();
}

function testCattleChase() {
    // Temporarily unlock cattle chase for testing
    unlockedMiniGames.cattleChase = true;
    localStorage.setItem('unlockedMiniGames', JSON.stringify(unlockedMiniGames));
    
    hideAllScreens();
    document.getElementById('cattleChaseScreen').style.display = 'block';
    initializeCattleChase();
}

function testHarborHustle() {
    // Temporarily unlock harbor hustle for testing
    unlockedMiniGames.harborHustle = true;
    localStorage.setItem('unlockedMiniGames', JSON.stringify(unlockedMiniGames));
    
    hideAllScreens();
    document.getElementById('harborHustleScreen').style.display = 'block';
    initializeHarborHustle();
}

function checkAllKhoisanEndingsCollected() {
    const totalKhoisanEndings = Object.keys(gameStories.khoisan.endings).length;
    const collectedKhoisanEndings = collectedEndings.khoisan.length;
    
    if (collectedKhoisanEndings >= totalKhoisanEndings) {
        const wasNewlyUnlocked = unlockMiniGame('cattleChase');
        if (wasNewlyUnlocked) {
            setTimeout(() => {
                showCattleChaseUnlockedMessage();
            }, 2000);
        }
    }
}

function checkDutchEndingsForHarborHustle() {
    const collectedDutchEndings = collectedEndings.dutch.length;
    
    if (collectedDutchEndings >= 8) {
        const wasNewlyUnlocked = unlockMiniGame('harborHustle');
        if (wasNewlyUnlocked) {
            setTimeout(() => {
                showHarborHustleUnlockedMessage();
            }, 2000);
        }
    }
}

function showHarborHustleUnlockedMessage() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        border: 3px solid #f39c12;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 500px;
        color: white;
        font-family: 'Courier New', monospace;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const title = document.createElement('h2');
    title.textContent = '⚓ New Mini-Game Unlocked!';
    title.style.cssText = `
        color: #f39c12;
        margin-bottom: 20px;
        font-size: 1.8em;
    `;
    
    const text = document.createElement('p');
    text.innerHTML = `
        <strong>Harbor Hustle</strong> is now available!<br><br>
        Load supplies onto ships before they sail in this fast-paced sorting game. 
        Cape Town was a vital resupply station for ships traveling to the East Indies!<br><br>
        <em>Access it from the Mini-Game Collection.</em>
    `;
    text.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
        font-size: 1.1em;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Awesome!';
    closeButton.style.cssText = `
        background: #e74c3c;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    closeButton.onmouseover = () => {
        closeButton.style.background = '#c0392b';
        closeButton.style.transform = 'translateY(-2px)';
    };
    
    closeButton.onmouseout = () => {
        closeButton.style.background = '#e74c3c';
        closeButton.style.transform = 'translateY(0)';
    };
    
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(closeButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function showCattleChaseUnlockedMessage() {
    // Create modal overlay for cattle chase unlock announcement
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(44, 62, 80, 0.95);
        border: 3px solid #e67e22;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(230, 126, 34, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "🐄 Cattle Chase Unlocked!";
    title.style.cssText = `
        color: #e67e22;
        font-size: 1.8em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = "Amazing! You've collected all Khoi-San endings and unlocked the Cattle Chase mini-game! Experience the challenges of protecting your precious cattle - the foundation of Khoi-San wealth and survival.";
    text.style.cssText = `
        color: #ecf0f1;
        font-size: 1.1em;
        line-height: 1.6;
        margin-bottom: 30px;
        font-family: 'Courier New', monospace;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const playNowButton = document.createElement('button');
    playNowButton.textContent = "🐄 Play Now";
    playNowButton.style.cssText = `
        background: rgba(230, 126, 34, 0.8);
        border: 2px solid #e67e22;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const collectionButton = document.createElement('button');
    collectionButton.textContent = "🎮 View Collection";
    collectionButton.style.cssText = `
        background: rgba(142, 68, 173, 0.8);
        border: 2px solid #8e44ad;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const laterButton = document.createElement('button');
    laterButton.textContent = "Maybe Later";
    laterButton.style.cssText = `
        background: rgba(52, 73, 94, 0.8);
        border: 2px solid #34495e;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    // Hover effects
    playNowButton.onmouseover = () => {
        playNowButton.style.background = 'rgba(230, 126, 34, 1)';
    };
    playNowButton.onmouseout = () => {
        playNowButton.style.background = 'rgba(230, 126, 34, 0.8)';
    };
    
    collectionButton.onmouseover = () => {
        collectionButton.style.background = 'rgba(142, 68, 173, 1)';
    };
    collectionButton.onmouseout = () => {
        collectionButton.style.background = 'rgba(142, 68, 173, 0.8)';
    };
    
    laterButton.onmouseover = () => {
        laterButton.style.background = 'rgba(52, 73, 94, 1)';
    };
    laterButton.onmouseout = () => {
        laterButton.style.background = 'rgba(52, 73, 94, 0.8)';
    };
    
    // Click handlers
    playNowButton.onclick = () => {
        document.body.removeChild(overlay);
        playCattleChase();
    };
    
    collectionButton.onclick = () => {
        document.body.removeChild(overlay);
        showMiniGameCollection();
    };
    
    laterButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    buttonContainer.appendChild(playNowButton);
    buttonContainer.appendChild(collectionButton);
    buttonContainer.appendChild(laterButton);
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Test function for Cattle Chase
function testCattleChase() {
    // Temporarily unlock cattle chase for testing
    const originalValue = unlockedMiniGames.cattleChase;
    unlockedMiniGames.cattleChase = true;
    
    // Start the game
    playCattleChase();
    
    // Create a note about this being a test
    setTimeout(() => {
        const testNote = document.createElement('div');
        testNote.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(211, 84, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            z-index: 1001;
            border: 2px solid #d35400;
        `;
        testNote.textContent = '🧪 TEST MODE - Cattle Chase temporarily unlocked';
        document.body.appendChild(testNote);
        
        // Remove the note after 5 seconds
        setTimeout(() => {
            if (document.body.contains(testNote)) {
                document.body.removeChild(testNote);
            }
            // Restore original unlock state
            unlockedMiniGames.cattleChase = originalValue;
        }, 5000);
    }, 1000);
}

// End of file
