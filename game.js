/* eslint-disable */
// Game state management
let currentCharacter = '';
let currentScene = 0;
let gameHistory = [];

// Reading timer system to prevent rapid clicking
let choiceStartTime = 0;
let storyStartTime = 0;
const MIN_CHOICE_TIME = 3000; // 3 seconds minimum between choices
const MIN_STORY_TIME = 2000; // 2 seconds minimum to read story

// Timer functions to prevent rapid clicking
function startChoice() {
    choiceStartTime = Date.now();
}

function startStory() {
    storyStartTime = Date.now();
}

function canMakeChoice() {
    return (Date.now() - choiceStartTime) >= MIN_CHOICE_TIME;
}

function canProceedFromStory() {
    return (Date.now() - storyStartTime) >= MIN_STORY_TIME;
}

function getRemainingTime() {
    const choiceTime = Math.max(0, MIN_CHOICE_TIME - (Date.now() - choiceStartTime));
    const storyTime = Math.max(0, MIN_STORY_TIME - (Date.now() - storyStartTime));
    return Math.max(choiceTime, storyTime);
}

function updateChoiceCountdown() {
    const countdownElements = document.querySelectorAll('.choice-countdown');
    const choiceButtons = document.querySelectorAll('.choice-button');
    const remainingTime = getRemainingTime();
    
    if (remainingTime > 0) {
        const seconds = Math.ceil(remainingTime / 1000);
        countdownElements.forEach(element => {
            element.textContent = `(Wait ${seconds}s)`;
        });
        
        // Keep buttons disabled
        choiceButtons.forEach(button => {
            button.disabled = true;
        });
        
        // Update every second
        setTimeout(updateChoiceCountdown, 1000);
    } else {
        countdownElements.forEach(element => {
            element.textContent = '(Ready!)';
            element.style.color = '#2ecc71';
        });
        
        // Enable buttons
        choiceButtons.forEach(button => {
            button.disabled = false;
        });
    }
}

function updateRestartCountdown() {
    const countdownElement = document.querySelector('.restart-countdown');
    const restartButton = document.querySelector('.restart-button');
    if (!countdownElement || !restartButton) return;
    
    const remainingTime = getRemainingTime();
    
    if (remainingTime > 0) {
        const seconds = Math.ceil(remainingTime / 1000);
        countdownElement.textContent = `(Wait ${seconds}s)`;
        
        // Keep button disabled
        restartButton.disabled = true;
        
        // Update every second
        setTimeout(updateRestartCountdown, 1000);
    } else {
        countdownElement.textContent = '(Ready!)';
        countdownElement.style.color = '#2ecc71';
        
        // Enable button
        restartButton.disabled = false;
    }
}

// Collector system for tracking endings
let collectedEndings = JSON.parse(localStorage.getItem('collectedEndings')) || {
    khoisan: [],
    dutch: [],
    britishColonist: [],
    bantu: []
};

// Mini-game unlock system
let unlockedMiniGames = JSON.parse(localStorage.getItem('unlockedMiniGames')) || {
    tradingChallenge: false,
    cattleChase: false,
    harborHustle: false,
    frontierWars: false,
    landGrabMaze: false
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

// Frontier Wars mini-game data (Space Invaders style)
const frontierWars = {
    gameState: {
        active: false,
        score: 0,
        lives: 3,
        wave: 1,
        playerX: 400, // Player ship position
        playerWidth: 60,
        playerHeight: 40,
        enemies: [], // Array of enemy objects
        playerBullets: [], // Player's bullets
        enemyBullets: [], // Enemy bullets
        lastEnemySpawn: 0,
        lastEnemyShot: 0,
        enemyDirection: 1, // 1 for right, -1 for left
        enemySpeed: 1,
        enemyDropDistance: 20,
        waveComplete: false,
        gameOver: false,
        keys: {
            left: false,
            right: false,
            space: false
        }
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
    },
    bantu: {
        intro: 'Images/Khoisan/download.png', // Using existing images for now
        farm: 'Images/Dutch/2.png',
        conflict: 'Images/Khoisan/download (1).png',
        war: 'Images/British/5.png',
        migration: 'Images/Khoisan/download (4).png'
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

// Bantu character data
gameStories.bantu = {
    scenes: [
        {
            background: 'intro',
            text: "You are from a Bantu-speaking community that has migrated southward over centuries. Your people are farmers and herders, and cattle are central to your wealth and status. As you establish new settlements, you encounter other groups already living in these lands.",
            choices: [
                {
                    text: "Migrate peacefully and trade with existing groups (build alliances)",
                    nextScene: 1,
                    consequence: "peaceful_migration",
                    historyNote: "Bantu groups migrated southward over centuries, often establishing trade relationships with existing communities."
                },
                {
                    text: "Defend land forcefully against rivals (secure territory)",
                    nextScene: 1,
                    consequence: "forceful_migration",
                    historyNote: "Bantu groups migrated southward over centuries, often establishing trade relationships with existing communities."
                }
            ]
        },
        {
            background: 'farm',
            text: "Your community is establishing farms and expanding cattle herds. The surrounding lands are rich and fertile, but other groups also need these resources for their own survival.",
            choices: [
                {
                    text: "Share grazing and crops with neighbors (build alliances)",
                    nextScene: 2,
                    consequence: "share_resources",
                    historyNote: "Agricultural communities often had to balance cooperation with competition for land and resources."
                },
                {
                    text: "Keep land exclusive (cause tension but maintain resources)",
                    nextScene: 2,
                    consequence: "exclusive_land",
                    historyNote: "Agricultural communities often had to balance cooperation with competition for land and resources."
                }
            ]
        },
        {
            background: 'conflict',
            text: "Strange ships have appeared at the coast, and new people with different customs are establishing settlements. They seem interested in trading, but their ways are unfamiliar and their intentions unclear.",
            choices: [
                {
                    text: "Trade cattle and crops with settlers (gain goods, risk dependence)",
                    nextScene: 3,
                    consequence: "trade_settlers",
                    historyNote: "Early contact between Bantu groups and European settlers involved complex trade relationships."
                },
                {
                    text: "Reject trade and guard land (preserve independence, risk conflict)",
                    nextScene: 3,
                    consequence: "reject_trade",
                    historyNote: "Early contact between Bantu groups and European settlers involved complex trade relationships."
                }
            ]
        },
        {
            background: 'war',
            text: "Conflict is spreading across the frontier as settlers push deeper into traditional lands. Your community must decide how to respond to these growing pressures and threats.",
            choices: [
                {
                    text: "Join neighboring groups in resistance wars (united front)",
                    nextScene: 4,
                    consequence: "join_resistance",
                    historyNote: "The frontier wars involved complex alliances and conflicts between different groups."
                },
                {
                    text: "Negotiate peace to reduce losses (diplomatic approach)",
                    nextScene: 4,
                    consequence: "negotiate_peace",
                    historyNote: "The frontier wars involved complex alliances and conflicts between different groups."
                }
            ]
        },
        {
            background: 'migration',
            text: "The pressure from settlers continues to grow, and your traditional way of life is under threat. You must decide how to preserve your culture and community in these changing times.",
            choices: [
                {
                    text: "Preserve language, traditions, and cattle economy despite pressure (cultural resistance)",
                    nextScene: 'ending',
                    consequence: "preserve_culture",
                    historyNote: "Many Bantu communities worked to maintain their cultural identity despite colonial pressures."
                },
                {
                    text: "Adopt some European practices for survival (cultural adaptation)",
                    nextScene: 'ending',
                    consequence: "adapt_culture",
                    historyNote: "Many Bantu communities worked to maintain their cultural identity despite colonial pressures."
                }
            ]
        }
    ],
    endings: {
        // Peaceful Migration + Share Resources + Trade Settlers + Join Resistance + Preserve Culture
        peaceful_migration_share_resources_trade_settlers_join_resistance_preserve_culture: {
            title: "The Guardian of Traditions",
            text: "Through peaceful migration and strategic alliances, you built strong relationships with neighboring groups. Your willingness to trade with settlers brought new goods while maintaining your cultural independence. Joining the resistance wars showed your commitment to protecting your people, and you successfully preserved your language, traditions, and cattle economy despite colonial pressures."
        },
        peaceful_migration_share_resources_trade_settlers_join_resistance_adapt_culture: {
            title: "The Pragmatic Guardian",
            text: "Your peaceful approach and resource sharing built strong alliances, while trading with settlers brought valuable goods. Joining the resistance wars demonstrated your commitment to your people, but you also recognized the need to adapt some European practices to ensure your community's survival while maintaining core cultural values."
        },
        peaceful_migration_share_resources_trade_settlers_negotiate_peace_preserve_culture: {
            title: "The Diplomatic Farmer",
            text: "Your peaceful migration and resource sharing created strong relationships, while trade with settlers brought prosperity. Your diplomatic approach to conflict helped reduce losses and maintain stability, allowing you to preserve your cultural traditions and cattle economy in a changing world."
        },
        peaceful_migration_share_resources_trade_settlers_negotiate_peace_adapt_culture: {
            title: "The Bridge Builder",
            text: "Through peaceful migration and resource sharing, you built strong alliances. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You successfully balanced cultural preservation with necessary adaptation, creating a bridge between traditional and new ways of life."
        },
        peaceful_migration_share_resources_reject_trade_join_resistance_preserve_culture: {
            title: "The Proud Farmer",
            text: "Your peaceful migration and resource sharing built strong alliances with neighboring groups. Rejecting trade with settlers maintained your independence, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        peaceful_migration_share_resources_reject_trade_join_resistance_adapt_culture: {
            title: "The Independent Warrior",
            text: "Your peaceful migration and resource sharing created strong relationships, while rejecting trade with settlers maintained your independence. Joining the resistance wars demonstrated your commitment to your people, and you balanced cultural preservation with necessary adaptation to ensure survival."
        },
        peaceful_migration_share_resources_reject_trade_negotiate_peace_preserve_culture: {
            title: "The Resilient Farmer",
            text: "Through peaceful migration and resource sharing, you built strong alliances. Rejecting trade with settlers maintained your independence, while your diplomatic approach to conflict helped reduce losses. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        peaceful_migration_share_resources_reject_trade_negotiate_peace_adapt_culture: {
            title: "The Selective Adapter",
            text: "Your peaceful migration and resource sharing created strong relationships, while rejecting trade with settlers maintained your independence. Your diplomatic approach to conflict helped maintain stability, and you balanced cultural preservation with necessary adaptation to ensure your community's survival."
        },
        peaceful_migration_exclusive_land_trade_settlers_join_resistance_preserve_culture: {
            title: "The Territorial Guardian",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Trade with settlers brought new goods, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        peaceful_migration_exclusive_land_trade_settlers_join_resistance_adapt_culture: {
            title: "The Strategic Adapter",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Trade with settlers brought prosperity, and joining the resistance wars demonstrated your commitment. You balanced cultural preservation with necessary adaptation to ensure survival."
        },
        peaceful_migration_exclusive_land_trade_settlers_negotiate_peace_preserve_culture: {
            title: "The Diplomatic Guardian",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You successfully preserved your cultural traditions and cattle economy."
        },
        peaceful_migration_exclusive_land_trade_settlers_negotiate_peace_adapt_culture: {
            title: "The Pragmatic Diplomat",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You balanced cultural preservation with necessary adaptation to ensure your community's survival."
        },
        peaceful_migration_exclusive_land_reject_trade_join_resistance_preserve_culture: {
            title: "The Pure Guardian",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        peaceful_migration_exclusive_land_reject_trade_join_resistance_adapt_culture: {
            title: "The Independent Adapter",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and joining the resistance wars demonstrated your commitment. You balanced cultural preservation with necessary adaptation to ensure survival."
        },
        peaceful_migration_exclusive_land_reject_trade_negotiate_peace_preserve_culture: {
            title: "The Isolated Guardian",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and your diplomatic approach to conflict helped reduce losses. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        peaceful_migration_exclusive_land_reject_trade_negotiate_peace_adapt_culture: {
            title: "The Isolated Adapter",
            text: "Your peaceful migration established your community, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and your diplomatic approach to conflict helped maintain stability. You balanced cultural preservation with necessary adaptation to ensure your community's survival."
        },
        // Forceful Migration paths
        forceful_migration_share_resources_trade_settlers_join_resistance_preserve_culture: {
            title: "The Warrior of the Frontier",
            text: "Your forceful migration secured territory for your community, while resource sharing built alliances with neighboring groups. Trade with settlers brought new goods, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        forceful_migration_share_resources_trade_settlers_join_resistance_adapt_culture: {
            title: "The Warrior Adapter",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Trade with settlers brought prosperity, and joining the resistance wars demonstrated your commitment. You balanced cultural preservation with necessary adaptation to ensure survival."
        },
        forceful_migration_share_resources_trade_settlers_negotiate_peace_preserve_culture: {
            title: "The Diplomatic Warrior",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You successfully preserved your cultural traditions and cattle economy."
        },
        forceful_migration_share_resources_trade_settlers_negotiate_peace_adapt_culture: {
            title: "The Strategic Warrior",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You balanced cultural preservation with necessary adaptation to ensure your community's survival."
        },
        forceful_migration_share_resources_reject_trade_join_resistance_preserve_culture: {
            title: "The Defender",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Rejecting trade with settlers maintained your independence, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        forceful_migration_share_resources_reject_trade_join_resistance_adapt_culture: {
            title: "The Independent Warrior",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Rejecting trade with settlers maintained your independence, and joining the resistance wars demonstrated your commitment. You balanced cultural preservation with necessary adaptation to ensure survival."
        },
        forceful_migration_share_resources_reject_trade_negotiate_peace_preserve_culture: {
            title: "The Resilient Defender",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Rejecting trade with settlers maintained your independence, and your diplomatic approach to conflict helped reduce losses. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        forceful_migration_share_resources_reject_trade_negotiate_peace_adapt_culture: {
            title: "The Pragmatic Defender",
            text: "Your forceful migration secured territory, while resource sharing built alliances. Rejecting trade with settlers maintained your independence, and your diplomatic approach to conflict helped maintain stability. You balanced cultural preservation with necessary adaptation to ensure your community's survival."
        },
        forceful_migration_exclusive_land_trade_settlers_join_resistance_preserve_culture: {
            title: "The Territorial Warrior",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Trade with settlers brought new goods, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures."
        },
        forceful_migration_exclusive_land_trade_settlers_join_resistance_adapt_culture: {
            title: "The Territorial Adapter",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Trade with settlers brought prosperity, and joining the resistance wars demonstrated your commitment. You balanced cultural preservation with necessary adaptation to ensure survival."
        },
        forceful_migration_exclusive_land_trade_settlers_negotiate_peace_preserve_culture: {
            title: "The Diplomatic Territorial",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You successfully preserved your cultural traditions and cattle economy."
        },
        forceful_migration_exclusive_land_trade_settlers_negotiate_peace_adapt_culture: {
            title: "The Strategic Territorial",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Trade with settlers brought prosperity, and your diplomatic approach to conflict helped maintain stability. You balanced cultural preservation with necessary adaptation to ensure your community's survival."
        },
        forceful_migration_exclusive_land_reject_trade_join_resistance_preserve_culture: {
            title: "The Last Stand",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and joining the resistance wars showed your commitment to protecting your people. You successfully preserved your cultural traditions and cattle economy despite colonial pressures, making a final stand for your way of life."
        },
        forceful_migration_exclusive_land_reject_trade_join_resistance_adapt_culture: {
            title: "The Resilient Warrior",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and joining the resistance wars demonstrated your commitment. You balanced cultural preservation with necessary adaptation to ensure survival despite the challenges."
        },
        forceful_migration_exclusive_land_reject_trade_negotiate_peace_preserve_culture: {
            title: "The Isolated Guardian",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and your diplomatic approach to conflict helped reduce losses. You successfully preserved your cultural traditions and cattle economy despite colonial pressures, maintaining your isolation."
        },
        forceful_migration_exclusive_land_reject_trade_negotiate_peace_adapt_culture: {
            title: "The Isolated Survivor",
            text: "Your forceful migration secured territory, while keeping land exclusive maintained your resources. Rejecting trade with settlers maintained your independence, and your diplomatic approach to conflict helped maintain stability. You balanced cultural preservation with necessary adaptation to ensure your community's survival despite isolation."
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
    
    // Start story timer to prevent rapid clicking
    startStory();
    
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
        
        // Initially disable button until timer expires
        button.disabled = true;
        
        // Add countdown display
        const countdownSpan = document.createElement('span');
        countdownSpan.className = 'choice-countdown';
        countdownSpan.style.cssText = 'color: #f39c12; font-size: 0.8em; margin-left: 10px;';
        button.appendChild(countdownSpan);
        
        choicesContainer.appendChild(button);
    });
    
    // Start countdown display
    updateChoiceCountdown();
}

function makeChoice(choice) {
    // Check if enough time has passed to prevent rapid clicking
    if (!canMakeChoice()) {
        const remainingTime = Math.ceil(getRemainingTime() / 1000);
        alert(`Please take time to read and think about this choice! Wait ${remainingTime} more second(s).`);
        return;
    }
    
    // Start choice timer for next choice
    startChoice();
    
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
    
    // Start choice timer to prevent rapid clicking on ending screen
    startChoice();
    
    // Save the ending to collected endings
    saveCollectedEnding(currentCharacter, endingKey, ending);
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'block';
    
    document.getElementById('endingTitle').textContent = ending.title;
    
    // Add the main ending text plus encouragement to replay
    const endingText = ending.text + "\n\n" + 
        "Try another character to see history from a different perspective!";
    
    document.getElementById('endingText').textContent = endingText;
    
    // Add countdown to restart button
    const restartButton = document.querySelector('.restart-button');
    if (restartButton) {
        // Initially disable restart button
        restartButton.disabled = true;
        
        const countdownSpan = document.createElement('span');
        countdownSpan.className = 'restart-countdown';
        countdownSpan.style.cssText = 'color: #f39c12; font-size: 0.8em; margin-left: 10px;';
        restartButton.appendChild(countdownSpan);
        updateRestartCountdown();
    }
    
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
    // Check if enough time has passed to prevent rapid clicking
    if (!canMakeChoice()) {
        const remainingTime = Math.ceil(getRemainingTime() / 1000);
        alert(`Please take time to read the ending! Wait ${remainingTime} more second(s).`);
        return;
    }
    
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
        
        // Check for Trading Challenge unlock (trade-related endings)
        checkForTradingChallenge(character, endingKey);
        
        // Check for Cattle Chase unlock (farmer/survival themed endings)
        checkForCattleChase(character, endingKey);
        
        // Check for Harbor Hustle unlock (diplomatic/cooperation themed endings)
        checkForHarborHustle(character, endingKey);
        
        // Check for Frontier Wars unlock (warrior/resistance themed endings)
        checkForFrontierWars(character, endingKey);
        
        // Legacy checks (keeping for backward compatibility)
        if (character === 'khoisan') {
            checkAllKhoisanEndingsCollected();
        }
        
        if (character === 'dutch') {
            checkDutchEndingsForHarborHustle();
        }
        
        if (character === 'bantu') {
            checkAllBantuEndingsCollected();
        }
    }
}

function updateCollectorCounter() {
    const totalCollected = collectedEndings.khoisan.length + 
                          collectedEndings.dutch.length + 
                          collectedEndings.britishColonist.length +
                          collectedEndings.bantu.length;
    const totalPossible = Object.keys(gameStories.khoisan.endings).length + 
                         Object.keys(gameStories.dutch.endings).length + 
                         Object.keys(gameStories.britishColonist.endings).length +
                         Object.keys(gameStories.bantu.endings).length;
    
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
    const bantuTotal = Object.keys(gameStories.bantu.endings).length;
    
    document.getElementById('khoisanCount').textContent = `(${collectedEndings.khoisan.length}/${khoisanTotal})`;
    document.getElementById('dutchCount').textContent = `(${collectedEndings.dutch.length}/${dutchTotal})`;
    document.getElementById('britishCount').textContent = `(${collectedEndings.britishColonist.length}/${britishTotal})`;
    document.getElementById('bantuCount').textContent = `(${collectedEndings.bantu.length}/${bantuTotal})`;
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
    populateCharacterEndings('bantu');
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
    
    // Debug: Log all collected endings and their themes
    console.log('=== DEBUG: Collected Endings Analysis ===');
    Object.keys(collectedEndings).forEach(character => {
        console.log(`\n${character.toUpperCase()} ENDINGS (${collectedEndings[character].length} total):`);
        collectedEndings[character].forEach(endingKey => {
            const ending = gameStories[character].endings[endingKey];
            if (ending) {
                const isFarmer = checkFarmerSurvivalTheme(character, endingKey);
                const isDiplomatic = checkDiplomaticTheme(character, endingKey);
                const isWarrior = checkWarriorResistanceTheme(character, endingKey);
                console.log(`  ${endingKey}: "${ending.title}"`);
                console.log(`    Farmer/Survival: ${isFarmer}, Diplomatic: ${isDiplomatic}, Warrior: ${isWarrior}`);
            }
        });
    });
    console.log('\n=== END DEBUG ===');
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
    const screens = ['titleScreen', 'gameScreen', 'endingScreen', 'infoScreen', 'collectorScreen', 'tradingChallengeScreen', 'miniGameScreen', 'cattleChaseScreen', 'harborHustleScreen', 'frontierWarsScreen'];
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
    checkAllUnlockConditions();
}

function hideMiniGameCollection() {
    hideAllScreens();
    document.getElementById('titleScreen').style.display = 'block';
}

function checkAllUnlockConditions() {
    console.log('Checking all unlock conditions...');
    
    // Check Cattle Chase unlock
    const farmerSurvivalCount = countFarmerSurvivalEndings();
    if (farmerSurvivalCount >= 8 && !unlockedMiniGames.cattleChase) {
        console.log('Cattle Chase: Auto-unlocking...');
        unlockMiniGame('cattleChase');
        setTimeout(() => {
            showCattleChaseUnlockedMessage();
        }, 1000);
    }
    
    // Check Harbor Hustle unlock
    const diplomaticCount = countDiplomaticEndings();
    if (diplomaticCount >= 5 && !unlockedMiniGames.harborHustle) {
        console.log('Harbor Hustle: Auto-unlocking...');
        unlockMiniGame('harborHustle');
        setTimeout(() => {
            showHarborHustleUnlockedMessage();
        }, 1000);
    }
    
    // Check Frontier Wars unlock
    const warriorResistanceCount = countWarriorResistanceEndings();
    if (warriorResistanceCount >= 8 && !unlockedMiniGames.frontierWars) {
        console.log('Frontier Wars: Auto-unlocking...');
        unlockMiniGame('frontierWars');
        setTimeout(() => {
            showFrontierWarsUnlockedMessage();
        }, 1000);
    }
    
    // Check Land Grab Maze unlock (requires ALL 128 endings)
    const totalEndings = countAllEndings();
    if (totalEndings >= 128 && !unlockedMiniGames.landGrabMaze) {
        console.log('Land Grab Maze: Auto-unlocking...');
        unlockMiniGame('landGrabMaze');
        setTimeout(() => {
            showLandGrabMazeUnlockedMessage();
        }, 1000);
    }
    
    // Update display after potential unlocks
    updateMiniGameDisplay();
}

function updateMiniGameDisplay() {
    // Update progress counter
    const totalMiniGames = 5; // Trading challenge, cattle chase, harbor hustle, frontier wars, and land grab maze
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
        tradingStatusText.textContent = 'Complete 8 trade endings';
        
        // Update progress bar
        const tradingProgressText = document.getElementById('tradingProgressText');
        const tradingProgressFill = document.getElementById('tradingProgressFill');
        const tradeCount = countTradeEndings();
        const progress = Math.round((tradeCount / 8) * 100);
        
        tradingProgressText.textContent = `${tradeCount}/8`;
        tradingProgressFill.style.width = `${progress}%`;
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
        cattleStatusText.textContent = 'Complete 8 Farmer/Survival endings';
        
        // Update progress bar
        const cattleProgressText = document.getElementById('cattleProgressText');
        const cattleProgressFill = document.getElementById('cattleProgressFill');
        const farmerSurvivalCount = countFarmerSurvivalEndings();
        const progress = Math.round((farmerSurvivalCount / 8) * 100);
        
        cattleProgressText.textContent = `${farmerSurvivalCount}/8`;
        cattleProgressFill.style.width = `${progress}%`;
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
        harborStatusText.textContent = 'Complete 5 Diplomatic/Cooperation endings';
        
        // Update progress bar
        const harborProgressText = document.getElementById('harborProgressText');
        const harborProgressFill = document.getElementById('harborProgressFill');
        const diplomaticCount = countDiplomaticEndings();
        const progress = Math.round((diplomaticCount / 5) * 100);
        
        harborProgressText.textContent = `${diplomaticCount}/5`;
        harborProgressFill.style.width = `${progress}%`;
    }
    
    // Update frontier wars display
    const frontierItem = document.getElementById('frontierWarsMiniGame');
    const frontierPlayButton = frontierItem.querySelector('.play-mini-game-btn');
    const frontierStatusIcon = frontierItem.querySelector('.status-icon');
    const frontierStatusText = frontierItem.querySelector('.status-text');
    
    if (unlockedMiniGames.frontierWars) {
        frontierItem.classList.remove('locked');
        frontierItem.classList.add('unlocked');
        frontierPlayButton.disabled = false;
        frontierStatusIcon.textContent = '✅';
        frontierStatusText.textContent = 'Unlocked';
    } else {
        frontierItem.classList.remove('unlocked');
        frontierItem.classList.add('locked');
        frontierPlayButton.disabled = true;
        frontierStatusIcon.textContent = '🔒';
        frontierStatusText.textContent = 'Complete 8 Warrior/Resistance endings';
        
        // Update progress bar
        const frontierProgressText = document.getElementById('frontierProgressText');
        const frontierProgressFill = document.getElementById('frontierProgressFill');
        const warriorResistanceCount = countWarriorResistanceEndings();
        const progress = Math.round((warriorResistanceCount / 8) * 100);
        
        frontierProgressText.textContent = `${warriorResistanceCount}/8`;
        frontierProgressFill.style.width = `${progress}%`;
    }
    
    // Update Land Grab Maze display
    const mazeItem = document.getElementById('landGrabMazeMiniGame');
    const mazePlayButton = mazeItem.querySelector('.play-mini-game-btn');
    const mazeStatusIcon = mazeItem.querySelector('.status-icon');
    const mazeStatusText = mazeItem.querySelector('.status-text');
    
    if (unlockedMiniGames.landGrabMaze) {
        mazeItem.classList.remove('locked');
        mazeItem.classList.add('unlocked');
        mazePlayButton.disabled = false;
        mazeStatusIcon.textContent = '✅';
        mazeStatusText.textContent = 'Unlocked';
    } else {
        mazeItem.classList.remove('unlocked');
        mazeItem.classList.add('locked');
        mazePlayButton.disabled = true;
        mazeStatusIcon.textContent = '🔒';
        mazeStatusText.textContent = 'Complete ALL 128 endings';
        
        // Update progress bar
        const mazeProgressText = document.getElementById('mazeProgressText');
        const mazeProgressFill = document.getElementById('mazeProgressFill');
        const totalEndings = countAllEndings();
        const progress = Math.round((totalEndings / 128) * 100);
        
        mazeProgressText.textContent = `${totalEndings}/128`;
        mazeProgressFill.style.width = `${progress}%`;
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

// Theme-based ending checking functions
function checkFarmerSurvivalTheme(character, endingKey) {
    const ending = gameStories[character].endings[endingKey];
    if (!ending) return false;
    
    const title = ending.title.toLowerCase();
    const text = ending.text.toLowerCase();
    
    // Check for farmer/survival themes
    const farmerSurvivalKeywords = [
        'farmer', 'survival', 'adaptation', 'pragmatic', 'independent', 
        'resilient', 'selective', 'guardian', 'diplomatic', 'bridge builder'
    ];
    
    const matches = farmerSurvivalKeywords.some(keyword => 
        title.includes(keyword) || text.includes(keyword)
    );
    
    // Debug logging
    if (matches) {
        console.log(`Farmer/Survival theme detected: ${character} - ${endingKey} - "${ending.title}"`);
    }
    
    return matches;
}

function checkDiplomaticTheme(character, endingKey) {
    const ending = gameStories[character].endings[endingKey];
    if (!ending) return false;
    
    const title = ending.title.toLowerCase();
    const text = ending.text.toLowerCase();
    
    // Check for diplomatic/cooperation themes
    const diplomaticKeywords = [
        'diplomatic', 'cooperation', 'bridge builder', 'pragmatic', 
        'reluctant adaptation', 'compromise', 'negotiate', 'peaceful'
    ];
    
    const matches = diplomaticKeywords.some(keyword => 
        title.includes(keyword) || text.includes(keyword)
    );
    
    // Debug logging
    if (matches) {
        console.log(`Diplomatic theme detected: ${character} - ${endingKey} - "${ending.title}"`);
    }
    
    return matches;
}

function checkWarriorResistanceTheme(character, endingKey) {
    const ending = gameStories[character].endings[endingKey];
    if (!ending) return false;
    
    const title = ending.title.toLowerCase();
    const text = ending.text.toLowerCase();
    
    // Check for warrior/resistance themes
    const warriorResistanceKeywords = [
        'warrior', 'resistance', 'independent', 'pure', 'ultimate', 
        'struggle', 'fight', 'defend', 'proud', 'selective resistance'
    ];
    
    const matches = warriorResistanceKeywords.some(keyword => 
        title.includes(keyword) || text.includes(keyword)
    );
    
    // Debug logging
    if (matches) {
        console.log(`Warrior/Resistance theme detected: ${character} - ${endingKey} - "${ending.title}"`);
    }
    
    return matches;
}

function countFarmerSurvivalEndings() {
    let count = 0;
    
    // Count across all characters
    Object.keys(collectedEndings).forEach(character => {
        collectedEndings[character].forEach(endingKey => {
            if (checkFarmerSurvivalTheme(character, endingKey)) {
                count++;
            }
        });
    });
    
    console.log(`Farmer/Survival endings count: ${count}`);
    return count;
}

function countDiplomaticEndings() {
    let count = 0;
    
    // Count across all characters
    Object.keys(collectedEndings).forEach(character => {
        collectedEndings[character].forEach(endingKey => {
            if (checkDiplomaticTheme(character, endingKey)) {
                count++;
            }
        });
    });
    
    console.log(`Diplomatic endings count: ${count}`);
    return count;
}

function countWarriorResistanceEndings() {
    let count = 0;
    
    // Count across all characters
    Object.keys(collectedEndings).forEach(character => {
        collectedEndings[character].forEach(endingKey => {
            if (checkWarriorResistanceTheme(character, endingKey)) {
                count++;
            }
        });
    });
    
    console.log(`Warrior/Resistance endings count: ${count}`);
    return count;
}

function countAllEndings() {
    let count = 0;
    Object.values(collectedEndings).forEach(characterEndings => {
        count += characterEndings.length;
    });
    console.log(`Total endings count: ${count}`);
    return count;
}

function checkForCattleChase(character, endingKey) {
    // Check if this is a farmer/survival themed ending
    const isFarmerSurvivalEnding = checkFarmerSurvivalTheme(character, endingKey);
    
    console.log(`Cattle Chase check: ${character} - ${endingKey} - isFarmerSurvival: ${isFarmerSurvivalEnding}`);
    
    if (isFarmerSurvivalEnding) {
        const farmerSurvivalCount = countFarmerSurvivalEndings();
        console.log(`Cattle Chase: ${farmerSurvivalCount}/8 farmer/survival endings`);
        
        if (farmerSurvivalCount >= 8) {
            console.log('Cattle Chase: Attempting to unlock...');
            const wasNewlyUnlocked = unlockMiniGame('cattleChase');
            if (wasNewlyUnlocked) {
                setTimeout(() => {
                    showCattleChaseUnlockedMessage();
                }, 2000);
            }
        } else {
            setTimeout(() => {
                showCattleChaseProgress(farmerSurvivalCount);
            }, 2000);
        }
    }
}

function checkForHarborHustle(character, endingKey) {
    // Check if this is a diplomatic/cooperation themed ending
    const isDiplomaticEnding = checkDiplomaticTheme(character, endingKey);
    
    console.log(`Harbor Hustle check: ${character} - ${endingKey} - isDiplomatic: ${isDiplomaticEnding}`);
    
    if (isDiplomaticEnding) {
        const diplomaticCount = countDiplomaticEndings();
        console.log(`Harbor Hustle: ${diplomaticCount}/5 diplomatic endings`);
        
        if (diplomaticCount >= 5) {
            console.log('Harbor Hustle: Attempting to unlock...');
            const wasNewlyUnlocked = unlockMiniGame('harborHustle');
            if (wasNewlyUnlocked) {
                setTimeout(() => {
                    showHarborHustleUnlockedMessage();
                }, 2000);
            }
        } else {
            setTimeout(() => {
                showHarborHustleProgress(diplomaticCount);
            }, 2000);
        }
    }
}

function checkForFrontierWars(character, endingKey) {
    // Check if this is a warrior/resistance themed ending
    const isWarriorResistanceEnding = checkWarriorResistanceTheme(character, endingKey);
    
    console.log(`Frontier Wars check: ${character} - ${endingKey} - isWarriorResistance: ${isWarriorResistanceEnding}`);
    
    if (isWarriorResistanceEnding) {
        const warriorResistanceCount = countWarriorResistanceEndings();
        console.log(`Frontier Wars: ${warriorResistanceCount}/8 warrior/resistance endings`);
        
        if (warriorResistanceCount >= 8) {
            console.log('Frontier Wars: Attempting to unlock...');
            const wasNewlyUnlocked = unlockMiniGame('frontierWars');
            if (wasNewlyUnlocked) {
                setTimeout(() => {
                    showFrontierWarsUnlockedMessage();
                }, 2000);
            }
        } else {
            setTimeout(() => {
                showFrontierWarsProgress(warriorResistanceCount);
            }, 2000);
        }
    }
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

function showCattleChaseProgress(currentCount) {
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
    title.textContent = '🐄 Cattle Chase Progress';
    title.style.cssText = `
        color: #f39c12;
        margin-bottom: 20px;
        font-size: 1.5em;
    `;
    
    const text = document.createElement('p');
    text.innerHTML = `
        You've completed <strong>${currentCount} of 8</strong> Farmer/Survival themed endings!<br><br>
        Complete <strong>${8 - currentCount} more</strong> endings with themes like "Farmer", "Survival", "Adaptation", or "Guardian" to unlock the Cattle Chase mini-game.<br><br>
        <em>Explore different characters to find these thematic endings!</em>
    `;
    text.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
        font-size: 1.1em;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue Exploring';
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

function showHarborHustleProgress(currentCount) {
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
    title.textContent = '⚓ Harbor Hustle Progress';
    title.style.cssText = `
        color: #f39c12;
        margin-bottom: 20px;
        font-size: 1.5em;
    `;
    
    const text = document.createElement('p');
    text.innerHTML = `
        You've completed <strong>${currentCount} of 5</strong> Diplomatic/Cooperation themed endings!<br><br>
        Complete <strong>${5 - currentCount} more</strong> endings with themes like "Diplomatic", "Cooperation", "Bridge Builder", or "Peaceful" to unlock the Harbor Hustle mini-game.<br><br>
        <em>Look for endings that show negotiation and peaceful solutions!</em>
    `;
    text.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
        font-size: 1.1em;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue Exploring';
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

function showFrontierWarsProgress(currentCount) {
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
    title.textContent = '⚔️ Frontier Wars Progress';
    title.style.cssText = `
        color: #f39c12;
        margin-bottom: 20px;
        font-size: 1.5em;
    `;
    
    const text = document.createElement('p');
    text.innerHTML = `
        You've completed <strong>${currentCount} of 8</strong> Warrior/Resistance themed endings!<br><br>
        Complete <strong>${8 - currentCount} more</strong> endings with themes like "Warrior", "Resistance", "Independent", or "Struggle" to unlock the Frontier Wars mini-game.<br><br>
        <em>Look for endings that show fighting spirit and determination!</em>
    `;
    text.style.cssText = `
        margin-bottom: 25px;
        line-height: 1.6;
        font-size: 1.1em;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue Exploring';
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

function playFrontierWars() {
    if (unlockedMiniGames.frontierWars) {
        hideAllScreens();
        document.getElementById('frontierWarsScreen').style.display = 'block';
        initializeFrontierWars();
    }
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

function startHarborTimer() {
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
                startHarborTimer();
                
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

// Frontier Wars Functions (Space Invaders style)
function initializeFrontierWars() {
    // Reset game state
    frontierWars.gameState = {
        active: false,
        score: 0,
        lives: 3,
        wave: 1,
        playerX: 400,
        playerY: 550, // Player ship Y position (near bottom of canvas)
        playerWidth: 60,
        playerHeight: 40,
        enemies: [],
        playerBullets: [],
        enemyBullets: [],
        lastEnemySpawn: 0,
        lastEnemyShot: 0,
        enemyDirection: 1,
        enemySpeed: 1,
        enemyDropDistance: 20,
        waveComplete: false,
        gameOver: false,
        keys: {
            left: false,
            right: false,
            space: false
        }
    };
    
    // Update UI
    updateFrontierWarsUI();
    
    // Show instructions
    document.getElementById('frontierInstructions').style.display = 'block';
    document.getElementById('frontierGameOver').style.display = 'none';
    
    // Setup controls
    setupFrontierWarsControls();
}

function setupFrontierWarsControls() {
    // Remove existing event listeners
    document.removeEventListener('keydown', handleFrontierKeyDown);
    document.removeEventListener('keyup', handleFrontierKeyUp);
    
    // Add new event listeners
    document.addEventListener('keydown', handleFrontierKeyDown);
    document.addEventListener('keyup', handleFrontierKeyUp);
}

function handleFrontierKeyDown(event) {
    if (!frontierWars.gameState.active) return;
    
    switch(event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            frontierWars.gameState.keys.left = true;
            event.preventDefault();
            break;
        case 'ArrowRight':
        case 'KeyD':
            frontierWars.gameState.keys.right = true;
            event.preventDefault();
            break;
        case 'Space':
            if (!frontierWars.gameState.keys.space) {
                frontierWars.gameState.keys.space = true;
                shootPlayerBullet();
            }
            event.preventDefault();
            break;
    }
}

function handleFrontierKeyUp(event) {
    if (!frontierWars.gameState.active) return;
    
    switch(event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            frontierWars.gameState.keys.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            frontierWars.gameState.keys.right = false;
            break;
        case 'Space':
            frontierWars.gameState.keys.space = false;
            break;
    }
}

function startFrontierWars() {
    frontierWars.gameState.active = true;
    frontierWars.gameState.gameOver = false;
    document.getElementById('frontierInstructions').style.display = 'none';
    
    // Create initial wave of enemies
    createEnemyWave();
    
    // Start the game loop
    frontierWarsGameLoop();
}

function createEnemyWave() {
    const canvas = document.getElementById('frontierCanvas');
    const enemyRows = 5;
    const enemyCols = 10;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const startX = 50;
    const startY = 50;
    const spacing = 60;
    
    frontierWars.gameState.enemies = [];
    
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            frontierWars.gameState.enemies.push({
                x: startX + col * spacing,
                y: startY + row * (enemyHeight + 10),
                width: enemyWidth,
                height: enemyHeight,
                speed: frontierWars.gameState.enemySpeed,
                points: (enemyRows - row) * 10 // Higher rows worth more points
            });
        }
    }
}

function frontierWarsGameLoop() {
    if (!frontierWars.gameState.active || frontierWars.gameState.gameOver) return;
    
    updateFrontierWarsGame();
    drawFrontierWarsGame();
    
    requestAnimationFrame(frontierWarsGameLoop);
}

function updateFrontierWarsGame() {
    const canvas = document.getElementById('frontierCanvas');
    const gameState = frontierWars.gameState;
    
    // Update player position
    if (gameState.keys.left && gameState.playerX > 0) {
        gameState.playerX -= 5;
    }
    if (gameState.keys.right && gameState.playerX < canvas.width - gameState.playerWidth) {
        gameState.playerX += 5;
    }
    
    // Update player bullets
    for (let i = gameState.playerBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.playerBullets[i];
        bullet.y -= 7;
        
        if (bullet.y < 0) {
            gameState.playerBullets.splice(i, 1);
        }
    }
    
    // Update enemy bullets
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        bullet.y += 4;
        
        if (bullet.y > canvas.height) {
            gameState.enemyBullets.splice(i, 1);
        }
    }
    
    // Update enemies
    let shouldDrop = false;
    for (let enemy of gameState.enemies) {
        enemy.x += gameState.enemyDirection * gameState.enemySpeed;
        
        // Check if any enemy hits the edge
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            shouldDrop = true;
        }
    }
    
    if (shouldDrop) {
        gameState.enemyDirection *= -1;
        for (let enemy of gameState.enemies) {
            enemy.y += gameState.enemyDropDistance;
        }
    }
    
    // Enemy shooting
    if (Date.now() - gameState.lastEnemyShot > 1000) {
        const shootingEnemies = gameState.enemies.filter(enemy => 
            Math.random() < 0.02 && enemy.y < canvas.height - 100
        );
        
        if (shootingEnemies.length > 0) {
            const shooter = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
            gameState.enemyBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height,
                width: 4,
                height: 10
            });
            gameState.lastEnemyShot = Date.now();
        }
    }
    
    // Check collisions
    checkFrontierWarsCollisions();
    
    // Check win/lose conditions
    if (gameState.enemies.length === 0) {
        nextWave();
    }
    
    if (gameState.lives <= 0) {
        gameOver();
    }
}

function checkFrontierWarsCollisions() {
    const gameState = frontierWars.gameState;
    
    // Player bullets vs enemies
    for (let i = gameState.playerBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.playerBullets[i];
        
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // Hit!
                gameState.score += enemy.points;
                gameState.enemies.splice(j, 1);
                gameState.playerBullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Enemy bullets vs player
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        
        if (bullet.x < gameState.playerX + gameState.playerWidth &&
            bullet.x + bullet.width > gameState.playerX &&
            bullet.y < gameState.playerY + gameState.playerHeight &&
            bullet.y + bullet.height > gameState.playerY) {
            
            // Hit player!
            gameState.lives--;
            gameState.enemyBullets.splice(i, 1);
            updateFrontierWarsUI();
        }
    }
    
    // Enemies vs player (collision)
    for (let enemy of gameState.enemies) {
        if (enemy.x < gameState.playerX + gameState.playerWidth &&
            enemy.x + enemy.width > gameState.playerX &&
            enemy.y < gameState.playerY + gameState.playerHeight &&
            enemy.y + enemy.height > gameState.playerY) {
            
            // Enemy reached player!
            gameState.lives = 0;
            gameOver();
            break;
        }
    }
}

function shootPlayerBullet() {
    const gameState = frontierWars.gameState;
    gameState.playerBullets.push({
        x: gameState.playerX + gameState.playerWidth / 2 - 2,
        y: gameState.playerY,
        width: 4,
        height: 10
    });
}

function nextWave() {
    const gameState = frontierWars.gameState;
    gameState.wave++;
    gameState.enemySpeed += 0.5;
    gameState.enemyDropDistance += 5;
    
    // Clear bullets
    gameState.playerBullets = [];
    gameState.enemyBullets = [];
    
    // Create new wave
    createEnemyWave();
    
    updateFrontierWarsUI();
}

function gameOver() {
    frontierWars.gameState.active = false;
    frontierWars.gameState.gameOver = true;
    
    document.getElementById('frontierResultTitle').textContent = 'Game Over!';
    document.getElementById('frontierResultText').textContent = `Final Score: ${frontierWars.gameState.score}`;
    document.getElementById('frontierGameOver').style.display = 'block';
    
    updateFrontierWarsUI();
}

function drawFrontierWarsGame() {
    const canvas = document.getElementById('frontierCanvas');
    const ctx = canvas.getContext('2d');
    const gameState = frontierWars.gameState;
    
    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 7) % canvas.width;
        const y = (i * 11) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
    
    // Draw player (Bantu warrior with bow and arrow)
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏹', gameState.playerX + gameState.playerWidth/2, gameState.playerY + gameState.playerHeight - 5);
    
    // Draw player bullets (arrows)
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffff00';
    for (let bullet of gameState.playerBullets) {
        ctx.fillText('→', bullet.x + bullet.width/2, bullet.y + bullet.height);
    }
    
    // Draw enemy bullets
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ff0000';
    for (let bullet of gameState.enemyBullets) {
        ctx.fillText('↓', bullet.x + bullet.width/2, bullet.y + bullet.height);
    }
    
    // Draw enemies (British soldiers)
    ctx.font = '30px Arial';
    ctx.fillStyle = '#ffffff';
    for (let enemy of gameState.enemies) {
        ctx.fillText('💂', enemy.x + enemy.width/2, enemy.y + enemy.height - 5);
    }
}

function updateFrontierWarsUI() {
    document.getElementById('frontierLives').textContent = frontierWars.gameState.lives;
    document.getElementById('frontierScore').textContent = frontierWars.gameState.score;
    document.getElementById('frontierWave').textContent = frontierWars.gameState.wave;
    document.getElementById('frontierDefenders').textContent = frontierWars.gameState.enemies.length;
}

function completeFrontierWars() {
    frontierWars.gameState.active = false;
    frontierWars.gameState.score += 1000;
    
    document.getElementById('frontierResultTitle').textContent = 'Defense Complete!';
    document.getElementById('frontierResultText').textContent = `You successfully defended your community! Final Score: ${frontierWars.gameState.score}`;
    document.getElementById('frontierGameOver').style.display = 'block';
    
    updateFrontierWarsUI();
}

function restartFrontierWars() {
    initializeFrontierWars();
}

function exitFrontierWars() {
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
    
    // Frontier Wars Button
    const frontierButton = document.createElement('button');
    frontierButton.innerHTML = '⚔️ Frontier Wars<br><small>Defense game</small>';
    frontierButton.style.cssText = `
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
    
    frontierButton.onmouseover = () => {
        frontierButton.style.background = '#c0392b';
        frontierButton.style.transform = 'translateY(-2px)';
    };
    frontierButton.onmouseout = () => {
        frontierButton.style.background = '#e74c3c';
        frontierButton.style.transform = 'translateY(0)';
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
    
    frontierButton.onclick = () => {
        document.body.removeChild(overlay);
        testFrontierWars();
    };
    
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    buttonContainer.appendChild(tradingButton);
    buttonContainer.appendChild(cattleButton);
    buttonContainer.appendChild(harborButton);
    buttonContainer.appendChild(frontierButton);
    
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

function testFrontierWars() {
    // Temporarily unlock frontier wars for testing
    unlockedMiniGames.frontierWars = true;
    localStorage.setItem('unlockedMiniGames', JSON.stringify(unlockedMiniGames));
    
    hideAllScreens();
    document.getElementById('frontierWarsScreen').style.display = 'block';
    initializeFrontierWars();
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

function checkAllBantuEndingsCollected() {
    const totalBantuEndings = Object.keys(gameStories.bantu.endings).length;
    const collectedBantuEndings = collectedEndings.bantu.length;
    
    if (collectedBantuEndings >= totalBantuEndings) {
        const wasNewlyUnlocked = unlockMiniGame('frontierWars');
        if (wasNewlyUnlocked) {
            setTimeout(() => {
                showFrontierWarsUnlockedMessage();
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

function showFrontierWarsUnlockedMessage() {
    // Create modal overlay for frontier wars unlock announcement
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
        border: 3px solid #e74c3c;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(231, 76, 60, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "⚔️ Frontier Wars Unlocked!";
    title.style.cssText = `
        color: #e74c3c;
        font-size: 1.8em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = "Incredible! You've collected all Bantu endings and unlocked the Frontier Wars mini-game! Experience the challenges of defending your community against colonial forces in this strategic defense game.";
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
    playNowButton.textContent = "Play Now!";
    playNowButton.style.cssText = `
        background: rgba(231, 76, 60, 0.8);
        border: 2px solid #e74c3c;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const collectionButton = document.createElement('button');
    collectionButton.textContent = "View Collection";
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
    
    // Button event handlers
    playNowButton.onclick = () => {
        overlay.remove();
        playFrontierWars();
    };
    
    collectionButton.onclick = () => {
        overlay.remove();
        showMiniGameCollection();
    };
    
    laterButton.onclick = () => {
        overlay.remove();
    };
    
    // Hover effects
    playNowButton.onmouseover = () => {
        playNowButton.style.background = 'rgba(231, 76, 60, 1)';
    };
    playNowButton.onmouseout = () => {
        playNowButton.style.background = 'rgba(231, 76, 60, 0.8)';
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
    
    buttonContainer.appendChild(playNowButton);
    buttonContainer.appendChild(collectionButton);
    buttonContainer.appendChild(laterButton);
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function showLandGrabMazeUnlockedMessage() {
    // Create modal overlay for land grab maze unlock announcement
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
        max-width: 700px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "🏰 Land Grab Maze Unlocked!";
    title.style.cssText = `
        color: #f39c12;
        font-size: 2em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = "AMAZING! You've collected ALL 128 endings across all characters! You've unlocked the ultimate challenge - the Land Grab Maze! Experience South African colonial history through a Pac-Man inspired adventure where you navigate the maze, collect resources, and avoid the ghosts of history. Choose your character and see how the land grab looked from different perspectives!";
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
    playNowButton.textContent = "Play Land Grab Maze";
    playNowButton.style.cssText = `
        background: rgba(243, 156, 18, 0.8);
        border: 2px solid #f39c12;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    const collectionButton = document.createElement('button');
    collectionButton.textContent = "View Collection";
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
    
    // Button event handlers
    playNowButton.onclick = () => {
        overlay.remove();
        playLandGrabMaze();
    };
    
    collectionButton.onclick = () => {
        overlay.remove();
        showMiniGameCollection();
    };
    
    laterButton.onclick = () => {
        overlay.remove();
    };
    
    // Hover effects
    playNowButton.onmouseover = () => {
        playNowButton.style.background = 'rgba(243, 156, 18, 1)';
    };
    playNowButton.onmouseout = () => {
        playNowButton.style.background = 'rgba(243, 156, 18, 0.8)';
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

// ============================================================================
// LAND GRAB MAZE GAME IMPLEMENTATION
// ============================================================================

// Land Grab Maze game data
const landGrabMaze = {
    gameState: {
        active: false,
        score: 0,
        lives: 3,
        level: 1,
        resourcesCollected: 0,
        totalResources: 50,
        selectedCharacter: 'khoisan',
        gameOver: false,
        gameWon: false,
        keys: {
            up: false,
            down: false,
            left: false,
            right: false
        }
    },
    player: {
        x: 400,
        y: 400,
        size: 20,
        speed: 3,
        color: '#f39c12'
    },
    maze: {
        width: 40,
        height: 40,
        cellSize: 20,
        walls: [],
        resources: [],
        powerUps: []
    },
    ghosts: [
        { x: 200, y: 200, type: 'disease', color: '#e74c3c', speed: 1.5, direction: 0, behavior: 'random' },
        { x: 600, y: 200, type: 'colonial', color: '#8e44ad', speed: 2, direction: 0, behavior: 'hunt' },
        { x: 200, y: 600, type: 'law', color: '#3498db', speed: 1, direction: 0, behavior: 'block' },
        { x: 600, y: 600, type: 'war', color: '#e67e22', speed: 2.5, direction: 0, behavior: 'charge' }
    ],
    powerUps: {
        peaceTreaty: { active: false, timer: 0, duration: 5000 },
        resistanceShield: { active: false, timer: 0, duration: 5000 },
        migrationPath: { active: false, timer: 0, duration: 10000 }
    },
    canvas: null,
    ctx: null,
    animationId: null
};

// Character configurations for the maze game
const mazeCharacters = {
    khoisan: { icon: '🏹', color: '#f39c12', name: 'Khoi-San' },
    dutch: { icon: '⚓', color: '#3498db', name: 'Dutch Settler' },
    british: { icon: '🏴', color: '#e74c3c', name: 'British Colonist' },
    bantu: { icon: '🌽', color: '#2ecc71', name: 'Bantu Farmer' }
};

// Historical reflections for each character
const historicalReflections = {
    khoisan: "Your people survived but lost much of their land. The traditional way of life was forever changed by colonial expansion, but your culture and resilience endured through the generations.",
    dutch: "Your farms expanded, but conflict grew. The Dutch settlers established a foothold in the Cape, but their expansion created tensions with indigenous peoples that would shape South African history for centuries.",
    british: "You established control, but unrest continued. British rule brought new laws and systems, but also resistance from both Boers and indigenous peoples, leading to decades of conflict and struggle.",
    bantu: "Your communities remained resilient despite pressure. Bantu-speaking peoples adapted to changing circumstances while maintaining their cultural identity, demonstrating remarkable strength and perseverance."
};

// Initialize the maze game
function initLandGrabMaze() {
    landGrabMaze.canvas = document.getElementById('mazeCanvas');
    landGrabMaze.ctx = landGrabMaze.canvas.getContext('2d');
    
    // Set up event listeners
    document.addEventListener('keydown', handleMazeKeyDown);
    document.addEventListener('keyup', handleMazeKeyUp);
    
    // Generate initial maze
    generateMaze();
    generateResources();
    generatePowerUps();
}

// Generate the maze structure
function generateMaze() {
    const { width, height, cellSize } = landGrabMaze.maze;
    landGrabMaze.maze.walls = [];
    
    // Create a simple maze pattern (can be enhanced with more complex algorithms)
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            // Create walls around the perimeter
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                landGrabMaze.maze.walls.push({ x: x * cellSize, y: y * cellSize, width: cellSize, height: cellSize });
            }
            // Create some internal walls (simplified pattern)
            else if ((x % 4 === 0 && y % 4 === 0) || (x % 6 === 0 && y % 6 === 0)) {
                if (Math.random() > 0.3) {
                    landGrabMaze.maze.walls.push({ x: x * cellSize, y: y * cellSize, width: cellSize, height: cellSize });
                }
            }
        }
    }
}

// Generate resources to collect
function generateResources() {
    const { width, height, cellSize } = landGrabMaze.maze;
    landGrabMaze.maze.resources = [];
    
    const resourceTypes = [
        { icon: '🐄', name: 'Cattle', points: 10 },
        { icon: '🌽', name: 'Corn', points: 5 },
        { icon: '💎', name: 'Beads', points: 15 },
        { icon: '🛠️', name: 'Tools', points: 8 }
    ];
    
    for (let i = 0; i < landGrabMaze.gameState.totalResources; i++) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * (width - 2)) + 1;
            y = Math.floor(Math.random() * (height - 2)) + 1;
            attempts++;
        } while (isWall(x * cellSize, y * cellSize) && attempts < 100);
        
        if (attempts < 100) {
            const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            landGrabMaze.maze.resources.push({
                x: x * cellSize + cellSize / 2,
                y: y * cellSize + cellSize / 2,
                type: resourceType.name,
                icon: resourceType.icon,
                points: resourceType.points,
                collected: false
            });
        }
    }
}

// Generate power-ups
function generatePowerUps() {
    const { width, height, cellSize } = landGrabMaze.maze;
    landGrabMaze.maze.powerUps = [];
    
    const powerUpTypes = [
        { icon: '🕊️', name: 'Peace Treaty', type: 'peaceTreaty' },
        { icon: '🛡️', name: 'Resistance Shield', type: 'resistanceShield' },
        { icon: '🚶', name: 'Migration Path', type: 'migrationPath' }
    ];
    
    for (let i = 0; i < 3; i++) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * (width - 2)) + 1;
            y = Math.floor(Math.random() * (height - 2)) + 1;
            attempts++;
        } while (isWall(x * cellSize, y * cellSize) && attempts < 100);
        
        if (attempts < 100) {
            const powerUpType = powerUpTypes[i];
            landGrabMaze.maze.powerUps.push({
                x: x * cellSize + cellSize / 2,
                y: y * cellSize + cellSize / 2,
                type: powerUpType.type,
                icon: powerUpType.icon,
                name: powerUpType.name,
                collected: false
            });
        }
    }
}

// Check if a position is a wall
function isWall(x, y) {
    const { cellSize } = landGrabMaze.maze;
    return landGrabMaze.maze.walls.some(wall => 
        x >= wall.x && x < wall.x + wall.width &&
        y >= wall.y && y < wall.y + wall.height
    );
}

// Handle key press events
function handleMazeKeyDown(e) {
    if (!landGrabMaze.gameState.active) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            landGrabMaze.gameState.keys.up = true;
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            landGrabMaze.gameState.keys.down = true;
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            landGrabMaze.gameState.keys.left = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            landGrabMaze.gameState.keys.right = true;
            e.preventDefault();
            break;
    }
}

// Handle key release events
function handleMazeKeyUp(e) {
    if (!landGrabMaze.gameState.active) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            landGrabMaze.gameState.keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            landGrabMaze.gameState.keys.down = false;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            landGrabMaze.gameState.keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            landGrabMaze.gameState.keys.right = false;
            break;
    }
}

// Update game state
function updateLandGrabMaze() {
    if (!landGrabMaze.gameState.active) return;
    
    // Update player position
    updatePlayer();
    
    // Update ghosts
    updateGhosts();
    
    // Check collisions
    checkCollisions();
    
    // Update power-ups
    updatePowerUps();
    
    // Check win/lose conditions
    checkGameState();
    
    // Update UI
    updateMazeUI();
}

// Update player position
function updatePlayer() {
    const player = landGrabMaze.player;
    const { keys } = landGrabMaze.gameState;
    const { cellSize } = landGrabMaze.maze;
    
    let newX = player.x;
    let newY = player.y;
    
    if (keys.up) newY -= player.speed;
    if (keys.down) newY += player.speed;
    if (keys.left) newX -= player.speed;
    if (keys.right) newX += player.speed;
    
    // Check wall collisions
    if (!isWall(newX - player.size/2, newY - player.size/2) &&
        !isWall(newX + player.size/2, newY - player.size/2) &&
        !isWall(newX - player.size/2, newY + player.size/2) &&
        !isWall(newX + player.size/2, newY + player.size/2)) {
        player.x = newX;
        player.y = newY;
    }
    
    // Keep player within bounds
    player.x = Math.max(player.size/2, Math.min(800 - player.size/2, player.x));
    player.y = Math.max(player.size/2, Math.min(800 - player.size/2, player.y));
}

// Update ghost AI
function updateGhosts() {
    const player = landGrabMaze.player;
    
    landGrabMaze.ghosts.forEach(ghost => {
        const dx = player.x - ghost.x;
        const dy = player.y - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let targetX = ghost.x;
        let targetY = ghost.y;
        
        switch(ghost.behavior) {
            case 'random':
                // Disease Ghost - moves randomly
                if (Math.random() < 0.1) {
                    ghost.direction = Math.random() * Math.PI * 2;
                }
                targetX += Math.cos(ghost.direction) * ghost.speed;
                targetY += Math.sin(ghost.direction) * ghost.speed;
                break;
                
            case 'hunt':
                // Colonial Ghost - hunts the player
                if (distance > 0) {
                    targetX += (dx / distance) * ghost.speed;
                    targetY += (dy / distance) * ghost.speed;
                }
                break;
                
            case 'block':
                // Law Ghost - tries to block player's path
                if (distance < 200) {
                    const angle = Math.atan2(dy, dx);
                    targetX += Math.cos(angle + Math.PI/2) * ghost.speed;
                    targetY += Math.sin(angle + Math.PI/2) * ghost.speed;
                } else {
                    targetX += Math.cos(ghost.direction) * ghost.speed;
                    targetY += Math.sin(ghost.direction) * ghost.speed;
                }
                break;
                
            case 'charge':
                // War Ghost - charges in bursts
                if (distance < 150 && Math.random() < 0.3) {
                    targetX += (dx / distance) * ghost.speed * 2;
                    targetY += (dy / distance) * ghost.speed * 2;
                } else {
                    targetX += Math.cos(ghost.direction) * ghost.speed;
                    targetY += Math.sin(ghost.direction) * ghost.speed;
                }
                break;
        }
        
        // Check wall collisions for ghosts
        if (!isWall(targetX - 10, targetY - 10) &&
            !isWall(targetX + 10, targetY - 10) &&
            !isWall(targetX - 10, targetY + 10) &&
            !isWall(targetX + 10, targetY + 10)) {
            ghost.x = targetX;
            ghost.y = targetY;
        }
        
        // Keep ghosts within bounds
        ghost.x = Math.max(10, Math.min(790, ghost.x));
        ghost.y = Math.max(10, Math.min(790, ghost.y));
    });
}

// Check collisions
function checkCollisions() {
    const player = landGrabMaze.player;
    
    // Check resource collisions
    landGrabMaze.maze.resources.forEach(resource => {
        if (!resource.collected) {
            const dx = player.x - resource.x;
            const dy = player.y - resource.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                resource.collected = true;
                landGrabMaze.gameState.score += resource.points;
                landGrabMaze.gameState.resourcesCollected++;
            }
        }
    });
    
    // Check power-up collisions
    landGrabMaze.maze.powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
            const dx = player.x - powerUp.x;
            const dy = player.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                powerUp.collected = true;
                activatePowerUp(powerUp.type);
            }
        }
    });
    
    // Check ghost collisions
    if (!landGrabMaze.powerUps.resistanceShield.active) {
        landGrabMaze.ghosts.forEach(ghost => {
            const dx = player.x - ghost.x;
            const dy = player.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20) {
                // Player caught by ghost
                landGrabMaze.gameState.lives--;
                if (landGrabMaze.gameState.lives <= 0) {
                    landGrabMaze.gameState.gameOver = true;
                } else {
                    // Reset player position
                    landGrabMaze.player.x = 400;
                    landGrabMaze.player.y = 400;
                }
            }
        });
    }
}

// Activate power-up
function activatePowerUp(type) {
    landGrabMaze.powerUps[type].active = true;
    landGrabMaze.powerUps[type].timer = landGrabMaze.powerUps[type].duration;
}

// Update power-ups
function updatePowerUps() {
    Object.keys(landGrabMaze.powerUps).forEach(key => {
        const powerUp = landGrabMaze.powerUps[key];
        if (powerUp.active) {
            powerUp.timer -= 16; // Assuming 60fps
            if (powerUp.timer <= 0) {
                powerUp.active = false;
                powerUp.timer = 0;
            }
        }
    });
}

// Check game state
function checkGameState() {
    if (landGrabMaze.gameState.resourcesCollected >= landGrabMaze.gameState.totalResources) {
        landGrabMaze.gameState.gameWon = true;
        landGrabMaze.gameState.active = false;
    }
}

// Update UI
function updateMazeUI() {
    document.getElementById('mazeScore').textContent = landGrabMaze.gameState.score;
    document.getElementById('mazeLives').textContent = landGrabMaze.gameState.lives;
    document.getElementById('mazeResources').textContent = `${landGrabMaze.gameState.resourcesCollected}/${landGrabMaze.gameState.totalResources}`;
    document.getElementById('mazeLevel').textContent = landGrabMaze.gameState.level;
    
    // Update power-up displays
    updatePowerUpDisplay('peaceTreaty', landGrabMaze.powerUps.peaceTreaty);
    updatePowerUpDisplay('resistanceShield', landGrabMaze.powerUps.resistanceShield);
    updatePowerUpDisplay('migrationPath', landGrabMaze.powerUps.migrationPath);
}

// Update power-up display
function updatePowerUpDisplay(powerUpId, powerUp) {
    const element = document.getElementById(powerUpId);
    const timerElement = document.getElementById(powerUpId.replace('Treaty', 'Timer').replace('Shield', 'Timer').replace('Path', 'Timer'));
    
    if (powerUp.active) {
        element.classList.add('active');
        timerElement.textContent = Math.ceil(powerUp.timer / 1000) + 's';
    } else {
        element.classList.remove('active');
        timerElement.textContent = '0s';
    }
}

// Render the game
function renderLandGrabMaze() {
    if (!landGrabMaze.ctx) return;
    
    const { ctx, canvas } = landGrabMaze;
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw walls
    ctx.fillStyle = '#34495e';
    landGrabMaze.maze.walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Draw resources
    landGrabMaze.maze.resources.forEach(resource => {
        if (!resource.collected) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#f39c12';
            ctx.fillText(resource.icon, resource.x, resource.y + 5);
        }
    });
    
    // Draw power-ups
    landGrabMaze.maze.powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#2ecc71';
            ctx.fillText(powerUp.icon, powerUp.x, powerUp.y + 5);
        }
    });
    
    // Draw ghosts
    landGrabMaze.ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ghost emoji
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        const ghostEmojis = { disease: '🦠', colonial: '🏰', law: '⚖️', war: '⚔️' };
        ctx.fillText(ghostEmojis[ghost.type], ghost.x, ghost.y + 4);
    });
    
    // Draw player
    const character = mazeCharacters[landGrabMaze.gameState.selectedCharacter];
    ctx.fillStyle = character.color;
    ctx.beginPath();
    ctx.arc(landGrabMaze.player.x, landGrabMaze.player.y, landGrabMaze.player.size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player character icon
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(character.icon, landGrabMaze.player.x, landGrabMaze.player.y + 5);
    
    // Draw power-up effects
    if (landGrabMaze.powerUps.peaceTreaty.active) {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(landGrabMaze.player.x - 25, landGrabMaze.player.y - 25, 50, 50);
        ctx.setLineDash([]);
    }
    
    if (landGrabMaze.powerUps.resistanceShield.active) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(landGrabMaze.player.x, landGrabMaze.player.y, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Game loop
function gameLoop() {
    if (landGrabMaze.gameState.active) {
        updateLandGrabMaze();
        renderLandGrabMaze();
        landGrabMaze.animationId = requestAnimationFrame(gameLoop);
    }
}

// Character selection for maze
function selectMazeCharacter(character) {
    // Remove previous selection
    document.querySelectorAll('.character-card-maze').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    event.currentTarget.classList.add('selected');
    
    // Update game state
    landGrabMaze.gameState.selectedCharacter = character;
    landGrabMaze.player.color = mazeCharacters[character].color;
}

// Start the maze game
function startLandGrabMaze() {
    if (!landGrabMaze.gameState.selectedCharacter) {
        alert('Please select a character first!');
        return;
    }
    
    // Hide instructions
    document.getElementById('mazeInstructions').style.display = 'none';
    
    // Reset game state
    landGrabMaze.gameState.active = true;
    landGrabMaze.gameState.gameOver = false;
    landGrabMaze.gameState.gameWon = false;
    landGrabMaze.gameState.score = 0;
    landGrabMaze.gameState.lives = 3;
    landGrabMaze.gameState.resourcesCollected = 0;
    
    // Reset player position
    landGrabMaze.player.x = 400;
    landGrabMaze.player.y = 400;
    
    // Reset resources
    landGrabMaze.maze.resources.forEach(resource => {
        resource.collected = false;
    });
    
    // Reset power-ups
    landGrabMaze.maze.powerUps.forEach(powerUp => {
        powerUp.collected = false;
    });
    
    // Reset power-up states
    Object.keys(landGrabMaze.powerUps).forEach(key => {
        landGrabMaze.powerUps[key].active = false;
        landGrabMaze.powerUps[key].timer = 0;
    });
    
    // Start game loop
    gameLoop();
}

// Show game over screen
function showMazeGameOver() {
    const gameOverDiv = document.getElementById('mazeGameOver');
    const titleElement = document.getElementById('mazeResultTitle');
    const textElement = document.getElementById('mazeResultText');
    const historicalElement = document.getElementById('mazeHistoricalText');
    
    if (landGrabMaze.gameState.gameWon) {
        titleElement.textContent = 'Victory!';
        textElement.textContent = `You collected all resources! Final Score: ${landGrabMaze.gameState.score}`;
    } else {
        titleElement.textContent = 'Game Over';
        textElement.textContent = `You were caught by the ghosts! Final Score: ${landGrabMaze.gameState.score}`;
    }
    
    // Show historical reflection
    const character = landGrabMaze.gameState.selectedCharacter;
    historicalElement.textContent = historicalReflections[character];
    
    gameOverDiv.style.display = 'block';
}

// Restart the maze game
function restartLandGrabMaze() {
    // Hide game over screen
    document.getElementById('mazeGameOver').style.display = 'none';
    
    // Show instructions
    document.getElementById('mazeInstructions').style.display = 'block';
    
    // Stop current game
    if (landGrabMaze.animationId) {
        cancelAnimationFrame(landGrabMaze.animationId);
    }
    
    landGrabMaze.gameState.active = false;
}

// Exit the maze game
function exitLandGrabMaze() {
    // Stop current game
    if (landGrabMaze.animationId) {
        cancelAnimationFrame(landGrabMaze.animationId);
    }
    
    landGrabMaze.gameState.active = false;
    
    // Hide maze screen
    document.getElementById('landGrabMazeScreen').style.display = 'none';
    
    // Show mini-game collection
    document.getElementById('miniGameScreen').style.display = 'block';
}

// Play Land Grab Maze (called from mini-game collection)
function playLandGrabMaze() {
    // Hide mini-game collection
    document.getElementById('miniGameScreen').style.display = 'none';
    
    // Show maze screen
    document.getElementById('landGrabMazeScreen').style.display = 'block';
    
    // Initialize if not already done
    if (!landGrabMaze.canvas) {
        initLandGrabMaze();
    }
}

// Update the game loop to check for game over
function updateLandGrabMaze() {
    if (!landGrabMaze.gameState.active) return;
    
    // Update player position
    updatePlayer();
    
    // Update ghosts
    updateGhosts();
    
    // Check collisions
    checkCollisions();
    
    // Update power-ups
    updatePowerUps();
    
    // Check win/lose conditions
    checkGameState();
    
    // Update UI
    updateMazeUI();
    
    // Check for game over
    if (landGrabMaze.gameState.gameOver || landGrabMaze.gameState.gameWon) {
        landGrabMaze.gameState.active = false;
        if (landGrabMaze.animationId) {
            cancelAnimationFrame(landGrabMaze.animationId);
        }
        showMazeGameOver();
    }
}

// ========================================
// QUIZ SYSTEM
// ========================================

// Quiz state management
let quizState = {
    currentQuestion: 0,
    answers: [],
    isComplete: false,
    score: 0
};

// Quiz questions data
const quizQuestions = [
    {
        question: "What was the primary source of wealth and status for Khoi-San communities?",
        options: ["Gold and precious metals", "Cattle herds", "Trade goods from Europe", "Agricultural crops"],
        correct: "B"
    },
    {
        question: "What major epidemic devastated Khoi-San communities in the 1700s?",
        options: ["Malaria", "Smallpox", "Yellow fever", "Cholera"],
        correct: "B"
    },
    {
        question: "What was the main reason Dutch settlers initially came to the Cape in 1652?",
        options: ["To establish a permanent colony", "To create a supply station for ships", "To find gold and silver", "To convert locals to Christianity"],
        correct: "B"
    },
    {
        question: "How did Khoi-San communities typically respond to Dutch land claims?",
        options: ["They immediately accepted European authority", "They resisted through both negotiation and conflict", "They completely abandoned their traditional lands", "They formed permanent alliances with the Dutch"],
        correct: "B"
    },
    {
        question: "What traditional Khoi-San practice conflicted most with Dutch farming methods?",
        options: ["Their religious ceremonies", "Their nomadic herding lifestyle", "Their hunting techniques", "Their trading practices"],
        correct: "B"
    },
    {
        question: "Which company sent the first Dutch settlers to the Cape?",
        options: ["Dutch West India Company", "Dutch East India Company", "Royal Dutch Trading Company", "Cape Colony Company"],
        correct: "B"
    },
    {
        question: "What was the main challenge Dutch settlers faced regarding labor?",
        options: ["Finding skilled craftsmen", "Obtaining enough food", "Getting workers for their farms", "Learning local languages"],
        correct: "C"
    },
    {
        question: "How did Dutch settlers typically acquire land from Khoi-San communities?",
        options: ["Through formal treaties and purchases", "Through gradual expansion and taking", "Through military conquest only", "Through religious conversion"],
        correct: "B"
    },
    {
        question: "What crop became most important for Dutch farmers in the Cape?",
        options: ["Wheat", "Corn", "Wine grapes", "Sugar cane"],
        correct: "C"
    },
    {
        question: "What was the relationship between Dutch settlers and the Company?",
        options: ["Settlers always followed Company orders", "Settlers often wanted more independence", "The Company had no control over settlers", "Settlers and Company were always in agreement"],
        correct: "B"
    },
    {
        question: "When did the British take control of the Cape Colony?",
        options: ["1795", "1806", "1815", "1820"],
        correct: "A"
    },
    {
        question: "What major policy change did the British implement regarding slavery?",
        options: ["They expanded slavery significantly", "They began to restrict and eventually abolish slavery", "They maintained the same policies as the Dutch", "They only used slave labor for mining"],
        correct: "B"
    },
    {
        question: "What was the Great Trek?",
        options: ["A British military campaign", "Dutch settlers migrating inland to escape British rule", "A Khoi-San migration northward", "A Bantu expansion southward"],
        correct: "B"
    },
    {
        question: "What were pass laws designed to do?",
        options: ["Control the movement of Khoi-San people", "Regulate trade between groups", "Establish new borders", "Organize military service"],
        correct: "A"
    },
    {
        question: "Which group did the British fight in the frontier wars?",
        options: ["Only the Khoi-San", "Only the Dutch settlers", "Primarily Xhosa and other Bantu groups", "All groups equally"],
        correct: "C"
    },
    {
        question: "When did Bantu-speaking groups begin migrating southward into what is now South Africa?",
        options: ["Around 200 AD", "Around 1000 AD", "Around 1400 AD", "Around 1600 AD"],
        correct: "B"
    },
    {
        question: "What was the primary economic activity of Bantu communities?",
        options: ["Hunting and gathering only", "Agriculture and herding", "Mining and metalworking", "Trading with Europeans"],
        correct: "B"
    },
    {
        question: "How did Bantu communities typically organize their societies?",
        options: ["As individual family units", "As large centralized kingdoms", "As loose confederations of chiefdoms", "As nomadic tribes"],
        correct: "C"
    },
    {
        question: "What was the main challenge Bantu groups faced when encountering European settlers?",
        options: ["Language barriers", "Competition for land and resources", "Religious differences", "Technological inferiority"],
        correct: "B"
    },
    {
        question: "How did Bantu communities typically respond to colonial pressure?",
        options: ["They immediately adopted European ways", "They used a combination of resistance, adaptation, and migration", "They completely avoided contact with Europeans", "They formed permanent alliances with colonial powers"],
        correct: "B"
    }
];

// Quiz functions
function showQuiz() {
    hideAllScreens();
    document.getElementById('quizScreen').style.display = 'block';
    startQuiz();
}

function hideQuiz() {
    document.getElementById('quizScreen').style.display = 'none';
}

function startQuiz() {
    quizState = {
        currentQuestion: 0,
        answers: [],
        isComplete: false,
        score: 0
    };
    displayQuestion();
}

function displayQuestion() {
    const question = quizQuestions[quizState.currentQuestion];
    const progress = `Question ${quizState.currentQuestion + 1} of ${quizQuestions.length}`;
    
    document.getElementById('quizProgress').textContent = progress;
    document.getElementById('quizQuestion').textContent = question.question;
    
    // Update options
    document.getElementById('optionA').textContent = question.options[0];
    document.getElementById('optionB').textContent = question.options[1];
    document.getElementById('optionC').textContent = question.options[2];
    document.getElementById('optionD').textContent = question.options[3];
    
    // Reset option selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Enable submit button if we have an answer for this question
    const submitBtn = document.getElementById('submitQuizBtn');
    if (quizState.answers[quizState.currentQuestion]) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
    
    // Hide result screen
    document.getElementById('quizResult').style.display = 'none';
}

function selectAnswer(letter) {
    // Remove previous selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    event.target.closest('.quiz-option').classList.add('selected');
    
    // Store answer
    quizState.answers[quizState.currentQuestion] = letter;
    
    // Enable submit button
    document.getElementById('submitQuizBtn').disabled = false;
}

function submitQuiz() {
    if (quizState.currentQuestion < quizQuestions.length - 1) {
        // Move to next question
        quizState.currentQuestion++;
        displayQuestion();
    } else {
        // Quiz complete - calculate score
        calculateQuizScore();
        showQuizResult();
    }
}

function calculateQuizScore() {
    quizState.score = 0;
    for (let i = 0; i < quizQuestions.length; i++) {
        if (quizState.answers[i] === quizQuestions[i].correct) {
            quizState.score++;
        }
    }
    quizState.isComplete = true;
}

function showQuizResult() {
    const resultDiv = document.getElementById('quizResult');
    const resultTitle = document.getElementById('quizResultTitle');
    const resultText = document.getElementById('quizResultText');
    const successDiv = document.getElementById('quizSuccess');
    const failureDiv = document.getElementById('quizFailure');
    
    resultTitle.textContent = 'Quiz Complete!';
    resultText.textContent = `You scored ${quizState.score}/${quizQuestions.length} correct answers.`;
    
    // Track quiz attempts
    const attempts = parseInt(localStorage.getItem('quizAttempts') || '0') + 1;
    localStorage.setItem('quizAttempts', attempts.toString());
    
    if (quizState.score === quizQuestions.length) {
        // Perfect score - unlock Fort Defense
        successDiv.style.display = 'block';
        failureDiv.style.display = 'none';
        
        // Store that Fort Defense is unlocked
        localStorage.setItem('fortDefenseUnlocked', 'true');
        
        // Update mini-game collection if it's visible
        if (document.getElementById('miniGameScreen').style.display !== 'none') {
            updateMiniGameCollection();
        }
    } else {
        // Not perfect score
        successDiv.style.display = 'none';
        failureDiv.style.display = 'block';
    }
    
    resultDiv.style.display = 'block';
}

function restartQuiz() {
    startQuiz();
}

function playFortDefense() {
    hideQuiz();
    showFortDefense();
}

// ========================================
// FORT DEFENSE GAME
// ========================================

// Fort Defense game state
let fortDefenseGame = {
    canvas: null,
    ctx: null,
    gameState: {
        active: false,
        playerScore: 0,
        enemyScore: 0,
        currentTurn: 'player', // 'player' or 'enemy'
        wind: 0,
        angle: 45,
        velocity: 50,
        projectile: null,
        animationId: null
    },
    forts: {
        player: { x: 100, y: 400, width: 80, height: 60, health: 100 },
        enemy: { x: 700, y: 400, width: 80, height: 60, health: 100 }
    }
};

function showFortDefense() {
    hideAllScreens();
    document.getElementById('fortDefenseScreen').style.display = 'block';
    initFortDefense();
}

function hideFortDefense() {
    document.getElementById('fortDefenseScreen').style.display = 'none';
    if (fortDefenseGame.gameState.animationId) {
        cancelAnimationFrame(fortDefenseGame.gameState.animationId);
    }
}

function exitFortDefense() {
    hideFortDefense();
    showMiniGameCollection();
}

function initFortDefense() {
    fortDefenseGame.canvas = document.getElementById('fortDefenseCanvas');
    fortDefenseGame.ctx = fortDefenseGame.canvas.getContext('2d');
    
    // Reset game state
    fortDefenseGame.gameState = {
        active: false,
        playerScore: 0,
        enemyScore: 0,
        currentTurn: 'player',
        wind: Math.random() * 20 - 10, // -10 to 10
        angle: 45,
        velocity: 50,
        projectile: null,
        animationId: null
    };
    
    // Reset fort health
    fortDefenseGame.forts.player.health = 100;
    fortDefenseGame.forts.enemy.health = 100;
    
    updateFortDefenseUI();
    drawFortDefense();
}

function updateAngle() {
    fortDefenseGame.gameState.angle = parseInt(document.getElementById('angleSlider').value);
    document.getElementById('angleValue').textContent = fortDefenseGame.gameState.angle;
}

function updateVelocity() {
    fortDefenseGame.gameState.velocity = parseInt(document.getElementById('velocitySlider').value);
    document.getElementById('velocityValue').textContent = fortDefenseGame.gameState.velocity;
}

function fireProjectile() {
    if (fortDefenseGame.gameState.currentTurn !== 'player') return;
    
    const angle = (fortDefenseGame.gameState.angle * Math.PI) / 180;
    const velocity = fortDefenseGame.gameState.velocity;
    const wind = fortDefenseGame.gameState.wind;
    
    fortDefenseGame.gameState.projectile = {
        x: fortDefenseGame.forts.player.x + 40,
        y: fortDefenseGame.forts.player.y,
        vx: velocity * Math.cos(angle) + wind * 0.5,
        vy: -velocity * Math.sin(angle),
        gravity: 0.3,
        active: true
    };
    
    fortDefenseGame.gameState.active = true;
    animateProjectile();
}

function animateProjectile() {
    if (!fortDefenseGame.gameState.projectile || !fortDefenseGame.gameState.projectile.active) {
        endTurn();
        return;
    }
    
    const proj = fortDefenseGame.gameState.projectile;
    
    // Update position
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.vy += proj.gravity;
    
    // Check for ground collision
    if (proj.y >= 450) {
        proj.active = false;
        endTurn();
        return;
    }
    
    // Check for fort collision
    const enemyFort = fortDefenseGame.forts.enemy;
    if (proj.x >= enemyFort.x && proj.x <= enemyFort.x + enemyFort.width &&
        proj.y >= enemyFort.y && proj.y <= enemyFort.y + enemyFort.height) {
        // Hit!
        enemyFort.health -= 20;
        fortDefenseGame.gameState.playerScore += 10;
        proj.active = false;
        createExplosion(proj.x, proj.y);
        endTurn();
        return;
    }
    
    // Check for player fort collision (friendly fire)
    const playerFort = fortDefenseGame.forts.player;
    if (proj.x >= playerFort.x && proj.x <= playerFort.x + playerFort.width &&
        proj.y >= playerFort.y && proj.y <= playerFort.y + playerFort.height) {
        playerFort.health -= 10;
        proj.active = false;
        endTurn();
        return;
    }
    
    drawFortDefense();
    fortDefenseGame.gameState.animationId = requestAnimationFrame(animateProjectile);
}

function createExplosion(x, y) {
    // Simple explosion effect
    const ctx = fortDefenseGame.ctx;
    ctx.save();
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Reset after short delay
    setTimeout(() => {
        drawFortDefense();
    }, 200);
}

function endTurn() {
    fortDefenseGame.gameState.projectile = null;
    fortDefenseGame.gameState.active = false;
    
    // Switch turns
    if (fortDefenseGame.gameState.currentTurn === 'player') {
        fortDefenseGame.gameState.currentTurn = 'enemy';
        // AI turn
        setTimeout(() => {
            aiTurn();
        }, 1000);
    } else {
        fortDefenseGame.gameState.currentTurn = 'player';
        // Update wind
        fortDefenseGame.gameState.wind = Math.random() * 20 - 10;
    }
    
    updateFortDefenseUI();
    drawFortDefense();
    
    // Check for game over
    if (fortDefenseGame.forts.player.health <= 0 || fortDefenseGame.forts.enemy.health <= 0) {
        showFortDefenseGameOver();
    }
}

function aiTurn() {
    if (fortDefenseGame.gameState.currentTurn !== 'enemy') return;
    
    // Simple AI - random angle and velocity
    const angle = Math.random() * 60 + 15; // 15-75 degrees
    const velocity = Math.random() * 60 + 30; // 30-90 velocity
    
    const angleRad = (angle * Math.PI) / 180;
    const wind = fortDefenseGame.gameState.wind;
    
    fortDefenseGame.gameState.projectile = {
        x: fortDefenseGame.forts.enemy.x + 40,
        y: fortDefenseGame.forts.enemy.y,
        vx: -velocity * Math.cos(angleRad) + wind * 0.5,
        vy: -velocity * Math.sin(angleRad),
        gravity: 0.3,
        active: true
    };
    
    fortDefenseGame.gameState.active = true;
    animateProjectile();
}

function drawFortDefense() {
    const ctx = fortDefenseGame.ctx;
    const canvas = fortDefenseGame.canvas;
    
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 450, canvas.width, canvas.height - 450);
    
    // Draw forts
    const playerFort = fortDefenseGame.forts.player;
    const enemyFort = fortDefenseGame.forts.enemy;
    
    // Player fort
    ctx.fillStyle = playerFort.health > 50 ? '#4CAF50' : playerFort.health > 25 ? '#FF9800' : '#F44336';
    ctx.fillRect(playerFort.x, playerFort.y, playerFort.width, playerFort.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerFort.x, playerFort.y, playerFort.width, playerFort.height);
    
    // Enemy fort
    ctx.fillStyle = enemyFort.health > 50 ? '#2196F3' : enemyFort.health > 25 ? '#FF9800' : '#F44336';
    ctx.fillRect(enemyFort.x, enemyFort.y, enemyFort.width, enemyFort.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(enemyFort.x, enemyFort.y, enemyFort.width, enemyFort.height);
    
    // Draw health bars
    drawHealthBar(playerFort.x, playerFort.y - 20, playerFort.width, playerFort.health, '#4CAF50');
    drawHealthBar(enemyFort.x, enemyFort.y - 20, enemyFort.width, enemyFort.health, '#2196F3');
    
    // Draw projectile
    if (fortDefenseGame.gameState.projectile && fortDefenseGame.gameState.projectile.active) {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(fortDefenseGame.gameState.projectile.x, fortDefenseGame.gameState.projectile.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw wind indicator
    const wind = fortDefenseGame.gameState.wind;
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Wind: ${wind.toFixed(1)}`, 10, 30);
    
    // Draw wind arrow
    const windX = 100;
    const windY = 30;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(windX, windY);
    ctx.lineTo(windX + wind * 2, windY);
    ctx.stroke();
}

function drawHealthBar(x, y, width, health, color) {
    const ctx = fortDefenseGame.ctx;
    const barHeight = 8;
    const healthWidth = (health / 100) * width;
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, barHeight);
    
    // Health
    ctx.fillStyle = color;
    ctx.fillRect(x, y, healthWidth, barHeight);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, barHeight);
}

function updateFortDefenseUI() {
    document.getElementById('playerScore').textContent = fortDefenseGame.gameState.playerScore;
    document.getElementById('enemyScore').textContent = fortDefenseGame.gameState.enemyScore;
    document.getElementById('windSpeed').textContent = fortDefenseGame.gameState.wind.toFixed(1);
    document.getElementById('currentTurn').textContent = fortDefenseGame.gameState.currentTurn === 'player' ? 'Player' : 'Enemy';
    
    // Update sliders
    document.getElementById('angleSlider').value = fortDefenseGame.gameState.angle;
    document.getElementById('velocitySlider').value = fortDefenseGame.gameState.velocity;
    document.getElementById('angleValue').textContent = fortDefenseGame.gameState.angle;
    document.getElementById('velocityValue').textContent = fortDefenseGame.gameState.velocity;
}

function showFortDefenseGameOver() {
    const gameOverDiv = document.getElementById('fortDefenseGameOver');
    const resultTitle = document.getElementById('fortDefenseResultTitle');
    const resultText = document.getElementById('fortDefenseResultText');
    const finalPlayerScore = document.getElementById('finalPlayerScore');
    const finalEnemyScore = document.getElementById('finalEnemyScore');
    
    if (fortDefenseGame.forts.enemy.health <= 0) {
        resultTitle.textContent = 'Victory!';
        resultText.textContent = 'You destroyed the enemy fort!';
    } else {
        resultTitle.textContent = 'Defeat!';
        resultText.textContent = 'Your fort was destroyed!';
    }
    
    finalPlayerScore.textContent = fortDefenseGame.gameState.playerScore;
    finalEnemyScore.textContent = fortDefenseGame.gameState.enemyScore;
    
    gameOverDiv.style.display = 'block';
}

function restartFortDefense() {
    document.getElementById('fortDefenseGameOver').style.display = 'none';
    initFortDefense();
}

// Check if Fort Defense is unlocked
function isFortDefenseUnlocked() {
    return localStorage.getItem('fortDefenseUnlocked') === 'true';
}

function playFortDefenseFromCollection() {
    if (isFortDefenseUnlocked()) {
        hideMiniGameCollection();
        showFortDefense();
    }
}

// Update hideAllScreens function to include new screens
function hideAllScreens() {
    const screens = [
        'titleScreen', 'gameScreen', 'endingScreen', 'infoScreen', 
        'miniGameScreen', 'collectorScreen', 'tradingChallengeScreen',
        'harborHustleScreen', 'cattleChaseScreen', 'frontierWarsScreen',
        'landGrabMazeScreen', 'quizScreen', 'fortDefenseScreen'
    ];
    
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'none';
        }
    });
}

// Update mini-game collection to include Fort Defense
function updateMiniGameCollection() {
    // Update existing mini-games
    updateTradingChallengeProgress();
    updateCattleChaseProgress();
    updateHarborHustleProgress();
    updateFrontierWarsProgress();
    updateLandGrabMazeProgress();
    
    // Update Fort Defense progress
    updateFortDefenseProgress();
    
    // Update total count
    const totalMiniGames = 6; // Now includes Fort Defense
    const unlockedCount = getUnlockedMiniGameCount();
    document.getElementById('miniGameCount').textContent = `${unlockedCount}/${totalMiniGames}`;
    document.getElementById('miniGameProgress').textContent = `${unlockedCount} of ${totalMiniGames} mini-games unlocked`;
}

function updateFortDefenseProgress() {
    const isUnlocked = isFortDefenseUnlocked();
    const miniGameItem = document.getElementById('fortDefenseMiniGame');
    const playBtn = miniGameItem.querySelector('.play-mini-game-btn');
    const statusIcon = miniGameItem.querySelector('.status-icon');
    const statusText = miniGameItem.querySelector('.status-text');
    const progressContainer = miniGameItem.querySelector('.progress-bar-container');
    const progressText = document.getElementById('fortDefenseProgressText');
    const progressFill = document.getElementById('fortDefenseProgressFill');
    
    if (isUnlocked) {
        miniGameItem.classList.remove('locked');
        miniGameItem.classList.add('unlocked');
        playBtn.disabled = false;
        statusIcon.textContent = '✅';
        statusText.textContent = 'Unlocked';
        progressContainer.style.display = 'none';
    } else {
        miniGameItem.classList.add('locked');
        miniGameItem.classList.remove('unlocked');
        playBtn.disabled = true;
        statusIcon.textContent = '🔒';
        statusText.textContent = 'Locked';
        progressContainer.style.display = 'block';
        
        // Update progress (this would be based on quiz attempts or other criteria)
        const quizAttempts = parseInt(localStorage.getItem('quizAttempts') || '0');
        const progress = Math.min(quizAttempts * 5, 100); // 5% per attempt, max 100%
        progressText.textContent = `${Math.floor(progress / 5)}/20`;
        progressFill.style.width = `${progress}%`;
    }
}

function getUnlockedMiniGameCount() {
    let count = 0;
    
    // Check each mini-game unlock status
    if (isTradingChallengeUnlocked()) count++;
    if (isCattleChaseUnlocked()) count++;
    if (isHarborHustleUnlocked()) count++;
    if (isFrontierWarsUnlocked()) count++;
    if (isLandGrabMazeUnlocked()) count++;
    if (isFortDefenseUnlocked()) count++;
    
    return count;
}

// End of file
