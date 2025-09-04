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
    tradingChallenge: false
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
    const screens = ['titleScreen', 'gameScreen', 'endingScreen', 'infoScreen', 'collectorScreen', 'tradingChallengeScreen', 'miniGameScreen'];
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
    const totalMiniGames = 1; // Currently only trading challenge
    const unlockedCount = Object.values(unlockedMiniGames).filter(unlocked => unlocked).length;
    
    document.getElementById('miniGameProgress').textContent = `${unlockedCount} of ${totalMiniGames} mini-games unlocked`;
    document.getElementById('miniGameCount').textContent = `${unlockedCount}/${totalMiniGames}`;
    
    // Update trading challenge display
    const tradingItem = document.getElementById('tradingChallengeMiniGame');
    const playButton = tradingItem.querySelector('.play-mini-game-btn');
    const statusIcon = tradingItem.querySelector('.status-icon');
    const statusText = tradingItem.querySelector('.status-text');
    
    if (unlockedMiniGames.tradingChallenge) {
        tradingItem.classList.remove('locked');
        tradingItem.classList.add('unlocked');
        playButton.disabled = false;
        statusIcon.textContent = '✅';
        statusText.textContent = 'Unlocked';
    } else {
        tradingItem.classList.remove('unlocked');
        tradingItem.classList.add('locked');
        playButton.disabled = true;
        statusIcon.textContent = '🔒';
        statusText.textContent = 'Locked';
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
        // Unlock the trading challenge mini-game
        const wasNewlyUnlocked = unlockMiniGame('tradingChallenge');
        
        // Show appropriate message after a short delay
        setTimeout(() => {
            if (wasNewlyUnlocked) {
                showMiniGameUnlockedMessage(character);
            } else {
                showTradingChallengeOffer(character);
            }
        }, 2000);
    }
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

// End of file
