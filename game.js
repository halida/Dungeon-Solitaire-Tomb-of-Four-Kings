// Suit symbols
const SUIT_SYMBOLS = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣'
};

// Card types
const CARD_TYPES = {
    MONSTER: 'monster',
    TRAP: 'trap',
    DOOR: 'door',
    TORCH: 'torch',
    SKILL: 'skill',
    DIVINE: 'divine',
    TREASURE: 'treasure',
    TOMB: 'tomb',
    SCROLL: 'scroll',
    HP: 'hp'
};

// Game State
let game = {
    deck: [],
    discardPile: [],
    torches: [],
    hitPoints: [],
    playerHand: [],
    delve: [],
    retreat: [],
    currentTurn: null,
    currentTurnIndex: 0,
    gameStatus: 'setup', // setup, active, won, lost
    message: '',
    phase: 'delve', // delve or retreat
    scrollUsed: false,
    jokerInHand: false,
    log: [],
    lastCard: null,
    startTime: null,
    endTime: null,
    elapsedTime: 0
};

// High score storage key
const HIGH_SCORES_KEY = 'dungeon-solitaire-highscores';

/**
 * Add entry to game log
 * @param {string} message - Log message
 */
function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    game.log.push(`[${timestamp}] ${message}`);
    renderLog();
}

/**
 * Render the game log
 */
function renderLog() {
    const container = document.getElementById('game-log');
    if (!container) return;
    container.innerHTML = '';
    // Show newest first, but keep chronological order for reading
    for (let i = game.log.length - 1; i >= 0; i--) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = game.log[i];
        container.appendChild(entry);
    }
    // Scroll to bottom (top in our reversed display)
    container.scrollTop = 0;
}

/**
 * Card constructor - playing card data
 * @param {string} suit - Card suit (spades, hearts, diamonds, clubs, joker)
 * @param {string} rank - Card rank (A, 2-10, J, Q, K, Joker)
 * @constructor
 */
function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.id = `${rank}${suit}`;
    this.faceUp = true;

    // Get numeric value
    if (rank === 'A') this.value = 1;
    else if (rank === 'J') this.value = 11;
    else if (rank === 'Q') this.value = 12;
    else if (rank === 'K') this.value = 13;
    else this.value = parseInt(rank);

    // Joker is special
    if (rank === 'Joker') {
        this.value = 6;
        this.faceUp = true;
    }
}

/**
 * Turn constructor - a single dungeon turn/room
 * @constructor
 */
function Turn() {
    this.cards = [];
    this.encounter = null;
    this.resolved = false;
    this.escape = false;
}

/**
 * Create a full shuffled game deck according to rules
 * @returns {Card[]} Shuffled deck
 */
function createDeck() {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            // 2-10 of hearts are separated for hit points
            if (suit === 'hearts' && rank !== 'A' && rank !== 'J' && rank !== 'Q' && rank !== 'K') {
                continue;
            }
            deck.push(new Card(suit, rank));
        }
    }

    // Add joker
    deck.push(new Card('joker', 'Joker'));

    return shuffleDeck(deck);
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Card[]} deck - Input deck
 * @returns {Card[]} Shuffled deck
 */
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Create hit point stack (2-10 of hearts, 10 on top)
 * @returns {Card[]} Hit point cards
 */
function createHitPoints() {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const hp = [];
    // 2 at bottom, 10 on top
    for (const rank of ranks) {
        hp.push(new Card('hearts', rank));
    }
    return hp;
}

/**
 * Start a new game
 */
function newGame() {
    game = {
        deck: createDeck(),
        discardPile: [],
        torches: [],
        hitPoints: createHitPoints(),
        playerHand: [],
        delve: [],
        retreat: [],
        currentTurn: null,
        currentTurnIndex: 0,
        gameStatus: 'active',
        message: 'Game started! Click "Draw Card" to begin the first delve turn.',
        phase: 'delve',
        scrollUsed: false,
        jokerInHand: false,
        log: [],
        lastCard: null,
        startTime: Date.now(),
        endTime: null,
        elapsedTime: 0
    };

    addLog("New game started - beginning delve.");
    // Save to localStorage
    saveGame();

    // Update UI
    if (typeof renderAll === 'function') {
        renderAll();
    }
    if (document.getElementById('draw-card-btn')) {
        document.getElementById('draw-card-btn').disabled = false;
    }
    setMessage(game.message);
}

// Draw a card from deck
/**
 * Draw a card from the deck
 * @returns {Card|null} Drawn card or null if deck is empty and game over
 */
function drawCard() {
    if (game.deck.length === 0) {
        // Check if we have 4 torches and can use scroll
        if (game.torches.length >= 4) {
            // Can we use Scroll of Light?
            const scrollIndex = game.playerHand.findIndex(c => c.rank === 'Joker');
            if (scrollIndex >= 0) {
                // Use it immediately
                game.playerHand.splice(scrollIndex, 1);
                const ace = game.torches.pop();
                // Put ace on bottom of deck
                game.deck.unshift(ace);
                game.scrollUsed = true;
                addLog(`Fourth torch while deck empty! Used Scroll of Light - returned ace to bottom of deck, torches now ${game.torches.length}`);
                setMessage("Fourth torch! You used your Scroll of Light to return the torch to the bottom of the deck. You're safe for now.");
                saveGame();
                if (typeof renderAll === 'function') {
                    renderAll();
                }
                // Now we have a card in deck again
                const card = game.deck.pop();
                return card;
            } else {
                gameOver('lost', 'You have run out of cards and all torches are out. You are lost forever in the darkness.');
            }
        } else {
            gameOver('lost', 'You have run out of cards before reaching the exit.');
        }
        return null;
    }

    const card = game.deck.pop();
    return card;
}

// Handle immediate effects of special cards (aces, jacks)
// Returns true if card was consumed (should NOT be added to current turn)
function handleSpecialCard(card) {
    // Ace = Torch - consumed immediately, not added to turn
    if (card.rank === 'A') {
        const cardName = `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
        addLog(`Ace ${cardName} → Torch ${game.torches.length + 1}/4`);
        game.torches.push(card);
        checkTorchGameOver();
        return true; // consumed
    }

    // Jack = Skill - goes to hand immediately, not added to turn
    if (card.rank === 'J' && card.rank !== 'Joker') {
        const cardName = `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
        addLog(`Jack ${cardName} → Skill added to hand`);
        game.playerHand.push(card);
        saveGame();
        if (typeof renderAll === 'function') {
            renderAll();
        }
        return true; // consumed
    }

    // Joker = Scroll of Light - stays in turn until end
    if (card.rank === 'Joker') {
        addLog(`Joker → Scroll of Light added to turn (will go to hand when resolved)`);
        game.jokerInHand = true;
        return false; // stays in turn
    }

    // Not a special card
    return false;
}

// Check if 4th torch causes game over
function checkTorchGameOver() {
    if (game.torches.length === 4) {
        // Can we use Scroll of Light?
        const scrollIndex = game.playerHand.findIndex(c => c.rank === 'Joker');
        if (scrollIndex >= 0) {
            // Use it immediately
            game.playerHand.splice(scrollIndex, 1);
            const ace = game.torches.pop();
            // Put ace on bottom of deck
            game.deck.unshift(ace);
            game.scrollUsed = true;
            addLog(`Fourth torch! Used Scroll of Light - returned ace to bottom of deck, torches now ${game.torches.length}`);
            setMessage("Fourth torch! You used your Scroll of Light to return the torch to the bottom of the deck. You're safe for now.");
            saveGame();
            if (typeof renderAll === 'function') {
                renderAll();
            }
            return;
        } else {
            // No Scroll of Light available - game over immediately per rules
            addLog(`GAME OVER: Fourth torch drawn, no Scroll of Light (Joker) available`);
            gameOver('lost', 'Four torches have burned out and you have no Scroll of Light. You are lost in the dark dungeon forever.');
        }
    }
}

// Start a new turn
function startNewTurn() {
    if (game.gameStatus !== 'active') return;

    const turn = new Turn();
    game.currentTurn = turn;

    if (game.phase === 'delve') {
        game.delve.push(turn);
        game.currentTurnIndex = game.delve.length - 1;
        addLog(`Starting new delve turn #${game.delve.length}`);
    } else {
        game.retreat.push(turn);
        game.currentTurnIndex = game.retreat.length - 1;
        addLog(`Starting new retreat turn #${game.retreat.length}`);
    }

    setMessage(`New ${game.phase} turn started. Draw until you get an encounter.`);
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

// Draw card to current turn
function drawToCurrentTurn() {
    if (game.gameStatus !== 'active') return;

    if (!game.currentTurn || game.currentTurn.resolved) {
        startNewTurn();
    }

    const card = drawCard();
    if (!card) return;

    processDrawnCard(card);
    saveGame();
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

/**
 * Process a drawn card for the current turn
 * @param {Card} card - The drawn card to process
 */
function processDrawnCard(card) {
    game.lastCard = card;
    const cardName = card.rank === 'Joker' ? 'Joker' : `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
    addLog(`${game.phase === 'delve' ? 'Delve' : 'Retreat'} turn ${game.currentTurnIndex + 1}: Drew ${cardName}`);

    // Check if card was already handled (ace/jack) - don't add to turn
    const handled = handleSpecialCard(card);
    if (handled) {
        return;
    }

    game.currentTurn.cards.push(card);

    // Check if we have an encounter yet
    if (!game.currentTurn.encounter) {
        processNonEncounterCard(card);
    } else {
        // We already have an encounter - this is an action card
        addLog(`Action card ${cardName} against ${game.currentTurn.encounter.type} (value ${card.value} vs ${game.currentTurn.encounter.card.value})`);
        resolveAction(card);
    }
}

/**
 * Process a non-encounter card when no encounter exists yet
 * @param {Card} card - The non-encounter card to process
 */
function processNonEncounterCard(card) {
    if (isEncounterCard(card)) {
        const type = getEncounterType(card);
        game.currentTurn.encounter = { type, card };

        addLog(`Encounter: ${getEncounterName(type)} (value ${card.value})`);

        // Check for divine favor already in turn
        const hasDivine = game.currentTurn.cards.some(c => c.rank === 'Q');
        if (hasDivine) {
            addLog(`Divine favor already in turn - automatically wins`);
            // Divine favor automatically wins
            resolveEncounter(true);
            return;
        }

        setMessage(`Encounter: ${getEncounterName(type)} (${card.value}). Play from deck or use a skill from your hand.`);
    } else if (card.rank === 'K') {
        addLog(`Found Tomb Hoard (K) - added to potential treasure, draw again`);
        // Tomb hoard - keep as treasure, draw another
        setMessage(`Found a Tomb Hoard! Draw another card.`);
    } else if (card.rank === 'Q') {
        addLog(`Divine favor (Q) - next encounter will be auto-won`);
        // Divine favor before encounter - keep drawing
        setMessage(`Divine favor! You will automatically win the next encounter. Keep drawing.`);
    }
}

// Check if card is a number card (2-10)
/**
 * @param {Card} card - Card to check
 * @returns {boolean} True if card is a number card (2-10)
 */
function isNumberCard(card) {
    return !isNaN(parseInt(card.rank));
}

// Check if card is an encounter card (2-10 of spades/diamonds/clubs)
/**
 * @param {Card} card - Card to check
 * @returns {boolean} True if card is an encounter card
 */
function isEncounterCard(card) {
    const isNumber = isNumberCard(card);
    const isRightSuit = ['spades', 'diamonds', 'clubs'].includes(card.suit);
    return isNumber && isRightSuit;
}

// Check if card is a treasure card (diamonds 2-10, kings, or joker)
/**
 * @param {Card} card - Card to check
 * @returns {boolean} True if card is a treasure card
 */
function isTreasureCard(card) {
    return (card.suit === 'diamonds' && isNumberCard(card)) ||
           card.rank === 'K' ||
           card.rank === 'Joker';
}

// Check if a skill card is playable against current encounter
/**
 * @param {Card} skill - Skill card from hand
 * @param {Object} encounter - Current encounter
 * @returns {boolean} True if skill can be played
 */
function isSkillPlayable(skill, encounter) {
    if (skill.rank !== 'J') return false;

    if (skill.suit === 'spades' && encounter.type === 'monster') return true;
    if (skill.suit === 'diamonds' && encounter.type === 'trap') return true;
    if (skill.suit === 'clubs' && encounter.type === 'door') return true;
    if (skill.suit === 'hearts') return hasFlippedDamage(); // Can always use if damage taken

    return false;
}

function getEncounterType(card) {
    if (card.suit === 'spades') return 'monster';
    if (card.suit === 'diamonds') return 'trap';
    if (card.suit === 'clubs') return 'door';
    return null;
}

function getEncounterName(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

// Resolve an action card against current encounter
function resolveAction(actionCard) {
    const encounter = game.currentTurn.encounter;
    const encounterValue = encounter.card.value;
    const actionValue = actionCard.value;
    const success = actionValue >= encounterValue;
    const cardName = actionCard.rank === 'Joker' ? 'Joker' : `${actionCard.rank}${SUIT_SYMBOLS[actionCard.suit]}`;

    addLog(`Resolving ${getEncounterName(encounter.type)} with ${cardName} (${actionValue} vs ${encounterValue}) → ${success ? 'SUCCESS' : 'FAILURE'}`);

    switch (encounter.type) {
        case 'monster':
            if (success) {
                resolveEncounter(true);
            } else {
                const damage = encounterValue - actionValue;
                takeDamage(damage);
                addLog(`Monster attack hits - ${damage} damage taken`);
                setMessage(`Your ${actionCard.rank}${SUIT_SYMBOLS[actionCard.suit]} is too weak. You take ${damage} damage. Draw another card.`);
                checkGameOverAfterDamage();
            }
            break;

        case 'trap':
            // Only one chance
            if (success) {
                resolveEncounter(true);
            } else {
                const damage = encounterValue - actionValue;
                takeDamage(damage);
                addLog(`Trap triggered - ${damage} damage taken, no treasure`);
                resolveEncounter(false);
                setMessage(`Your ${actionCard.rank}${SUIT_SYMBOLS[actionCard.suit]} failed to disarm. You take ${damage} damage. No treasure collected.`);
            }
            break;

        case 'door':
            // Only one chance with action card
            if (success) {
                resolveEncounter(true);
            } else {
                const discardCount = encounterValue - actionValue;
                addLog(`Door opening failed - discard ${discardCount} card(s) from deck, no treasure`);
                discardFromDeck(discardCount);
                resolveEncounter(false);
                setMessage(`Your ${actionCard.rank}${SUIT_SYMBOLS[actionCard.suit]} failed to open. ${discardCount} card(s) discarded. No treasure collected.`);
                if (typeof renderAll === 'function') {
                    renderAll();
                }
            }
            break;
    }
}

// Player plays a skill from hand
function playFromHand(cardIndex) {
    if (game.gameStatus !== 'active') return;
    if (!game.currentTurn || !game.currentTurn.encounter || game.currentTurn.resolved) return;

    const card = game.playerHand[cardIndex];
    const encounterType = game.currentTurn.encounter.type;
    const cardName = `${card.rank}${SUIT_SYMBOLS[card.suit]}`;

    addLog(`Playing skill ${cardName} from hand against ${encounterType}`);

    // Check if this skill works for this encounter
    let success = false;

    if (card.rank === 'J') {
        // J♠ = Go Berserk beats any monster
        if (card.suit === 'spades' && encounterType === 'monster') {
            success = true;
        }
        // J♦ = Disarm beats any trap
        else if (card.suit === 'diamonds' && encounterType === 'trap') {
            success = true;
        }
        // J♣ = Pick Lock opens any door
        else if (card.suit === 'clubs' && encounterType === 'door') {
            success = true;
        }
        // J♥ = Dodge Blow avoids one damage instance
        // Can be used when taking damage already? No - use it before?
        // According to rules: "Dodge Blow (J♥) is played on lost hit points to avoid one instance of damage"
        else if (card.suit === 'hearts') {
            // Unflip the most recently flipped damage card
            unflippedLastDamage();
            game.playerHand.splice(cardIndex, 1);
            addLog(`Dodge Blow used - restored last damage`);
            setMessage(`You used Dodge Blow to avoid the last instance of damage.`);
            saveGame();
            if (typeof renderAll === 'function') {
                renderAll();
            }
            return;
        }
    }
    // Divine favor already handled earlier
    // Queens are already turned after the turn

    if (success) {
        addLog(`Skill ${cardName} succeeded - encounter won`);
        game.playerHand.splice(cardIndex, 1);
        resolveEncounter(true);
        setMessage(`You used your ${card.rank}${SUIT_SYMBOLS[card.suit]} skill to ${getSkillAction(card)}.`);
    } else {
        addLog(`Skill ${cardName} doesn't work on this encounter`);
        setMessage(`That skill doesn't work on this ${encounterType}. Try another or draw from the deck.`);
    }

    saveGame();
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

function getSkillAction(card) {
    if (card.suit === 'spades') return 'defeat the monster';
    if (card.suit === 'diamonds') return 'disarm the trap';
    if (card.suit === 'clubs') return 'open the door';
    return 'avoid damage';
}

// Unflip the last flipped damage card for Dodge Blow
function unflippedLastDamage() {
    for (let i = game.hitPoints.length - 1; i >= 0; i--) {
        if (game.hitPoints[i].flipped) {
            game.hitPoints[i].flipped = false;
            break;
        }
    }
}

// Escape a monster encounter by dropping treasure
function escapeMonsterDropTreasure(cardIndex) {
    if (!game.currentTurn || !game.currentTurn.encounter || game.currentTurn.resolved) return;
    if (game.currentTurn.encounter.type !== 'monster') return;

    const treasureCard = game.playerHand[cardIndex];
    const monsterValue = game.currentTurn.encounter.card.value;
    const cardName = treasureCard.rank === 'Joker' ? 'Joker' : `${treasureCard.rank}${SUIT_SYMBOLS[treasureCard.suit]}`;

    addLog(`Attempting escape: drop treasure ${cardName} (value ${treasureCard.value}) to distract monster (needs ${monsterValue})`);

    // Check if treasure value >= monster value (king=10, joker=6)
    let treasureValue = treasureCard.value;
    if (treasureCard.rank === 'K') treasureValue = 10;

    if (treasureValue >= monsterValue) {
        // Drop the treasure, resolve encounter without collecting
        game.playerHand.splice(cardIndex, 1);
        // Add the treasure to the turn (stays there face down)
        game.currentTurn.cards.push(treasureCard);
        game.currentTurn.escape = true;
        resolveEncounter(false);
        addLog(`Escape successful - ${cardName} dropped, no treasure collected`);
        setMessage(`You dropped ${treasureCard.rank}${SUIT_SYMBOLS[treasureCard.suit]} and escaped the monster. No treasure collected.`);
    } else {
        addLog(`Escape failed - treasure value too low`);
        setMessage(`That treasure (value ${treasureValue}) is not high enough to distract the monster (needs ${monsterValue}).`);
    }

    saveGame();
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

// Discard N cards from deck (for failed doors)
function discardFromDeck(count) {
    for (let i = 0; i < count && game.deck.length > 0; i++) {
        const card = drawCard(); // handles aces/jacks automatically
        if (card) {
            game.discardPile.push(card);
        }
    }
}

// Resolve the encounter after all actions
function resolveEncounter(won) {
    game.currentTurn.resolved = true;
    game.currentTurn.encounter.won = won;

    addLog(`Turn ${game.currentTurnIndex + 1} resolved - encounter ${won ? 'WON' : 'LOST'}`);

    if (won) {
        // Collect treasure
        collectTreasure();
        addLog(`Treasure collected from this turn`);
        const phaseDone = checkPhaseComplete();
        if (!phaseDone) {
            if (game.phase === 'delve') {
                setMessage(`Encounter won! You can start the next delve turn or begin retreat.`);
            } else {
                setMessage(`Encounter won! Continue retreating to the exit.`);
            }
        }
    }

    saveGame();
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

// Collect treasure from the turn to hand
function collectTreasure() {
    // Collect: diamonds (any in turn), kings, joker (scroll)
    for (const card of game.currentTurn.cards) {
        if (isTreasureCard(card)) {
            if (!game.playerHand.includes(card)) {
                game.playerHand.push(card);
            }
        }
    }

    // If all cards are treasure, leave one behind to mark the turn
    const allTreasure = game.currentTurn.cards.every(c => isTreasureCard(c));

    if (allTreasure && game.currentTurn.cards.length > 0) {
        // Leave the first non-joker treasure behind
        const firstTreasure = game.currentTurn.cards.find(c => isTreasureCard(c) && c.rank !== 'Joker');
        if (firstTreasure) {
            const idx = game.playerHand.indexOf(firstTreasure);
            if (idx >= 0) {
                game.playerHand.splice(idx, 1);
            }
        }
    }
}

// Take damage
function takeDamage(amount) {
    addLog(`Taking ${amount} damage`);
    let remaining = amount;
    for (let i = game.hitPoints.length - 1; i >= 0 && remaining > 0; i--) {
        if (!game.hitPoints[i].flipped) {
            game.hitPoints[i].flipped = true;
            remaining--;
        }
    }
    checkGameOverAfterDamage();
}

// Check if we're dead after damage
function checkGameOverAfterDamage() {
    // When 2 of hearts is flipped, you're dead
    const twoHearts = game.hitPoints.find(c => c.rank === '2');
    if (twoHearts && twoHearts.flipped) {
        gameOver('lost', 'Your hit points are depleted. You have fallen in the dungeon.');
    }
}

// Check if current phase (delve/retreat) is complete and check for victory
function checkPhaseComplete() {
    if (game.phase === 'delve') {
        // Player can choose to start retreat at any time after completing a delve turn
        // So just return false - player decides
        return false;
    } else {
        // Retreat is complete when we've gone past turn 1
        if (game.retreat.length === game.delve.length - 1) {
            // We made it to the exit!
            checkVictory();
            return true;
        }
        return false;
    }
}

// Player decides to start retreat
function startRetreat() {
    if (game.phase !== 'delve') return;
    addLog(`Player starting retreat after ${game.delve.length} delve turns`);
    game.phase = 'retreat';
    game.currentTurn = null;
    // Check if we've already reached the exit (when starting retreat after 1 delve turn)
    if (checkPhaseComplete()) {
        return;
    }
    setMessage(`You begin retreating from the dungeon. Retreat turns go from right to left. Draw your first retreat turn card.`);
    saveGame();
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

// Check for victory - we've reached the exit
/**
 * Check if player has won by reaching the exit
 */
function checkVictory() {
    const score = calculateScore();
    const fourKings = score.kings === 4;
    addLog(`VICTORY! Reached exit alive - ${score.kings} kings, ${score.total} points`);

    if (fourKings) {
        gameOver('won', `You have made it out alive with all four Tomb Hoards! You win the game!`, score);
    } else {
        gameOver('won', `You have made it out alive with ${score.kings} Tomb Hoards and ${score.total} points!`, score);
    }

    game.gameStatus = 'won';
}

// Calculate final score
/**
 * Calculate final score from player hand
 * @returns {Object} Score object with kings count and total points
 */
function calculateScore() {
    let total = 0;
    let kings = 0;

    for (const card of game.playerHand) {
        if (card.rank === 'K') {
            total += 10;
            kings++;
        } else if (card.suit === 'diamonds' && isNumberCard(card)) {
            total += card.value;
        } else if (card.rank === 'Joker') {
            total += 6;
        }
    }

    return { kings, total };
}

// Game over
function gameOver(result, message, score) {
    if (game.endTime === null && game.startTime !== null) {
        game.endTime = Date.now();
        // Add current session time to any previously elapsed time from saves
        game.elapsedTime += Math.floor((game.endTime - game.startTime) / 1000); // seconds
    }
    addLog(`GAME OVER: ${result.toUpperCase()} - ${message}`);
    game.gameStatus = result === 'won' ? 'won' : 'lost';
    if (document.getElementById('draw-card-btn')) {
        document.getElementById('draw-card-btn').disabled = true;
    }

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const msgEl = document.getElementById('game-over-message');
    const scoreEl = document.getElementById('game-over-score');
    const timeEl = document.getElementById('game-over-time');
    const highScoresContainer = document.getElementById('high-scores-container');

    if (title) {
        if (result === 'won') {
            title.textContent = 'Victory!';
            title.style.color = '#4caf50';
        } else {
            title.textContent = 'Game Over';
            title.style.color = '#f44336';
        }
    }

    if (msgEl) {
        msgEl.textContent = message;
    }

    if (scoreEl) {
        if (score) {
            scoreEl.innerHTML = `<br><strong>Score: ${score.kings}/${score.total}</strong><br>${score.total * 100} gold pieces`;
        } else {
            scoreEl.innerHTML = '';
        }
    }

    // Display time taken
    if (timeEl && game.startTime && result === 'won') {
        const minutes = Math.floor(game.elapsedTime / 60);
        const seconds = game.elapsedTime % 60;
        timeEl.innerHTML = `<br><strong>Time: ${minutes}:${seconds.toString().padStart(2, '0')}</strong>`;

        // Save score to high scores
        if (score) {
            saveHighScore(score.total, game.elapsedTime);
        }
    } else if (timeEl) {
        timeEl.innerHTML = '';
    }

    // Display high scores
    if (typeof renderHighScores === 'function' && highScoresContainer) {
        renderHighScores(highScoresContainer);
    }

    if (modal) {
        modal.classList.add('show');
    }
    clearGameSave();
}

// Load high scores from localStorage
function loadHighScores() {
    try {
        const saved = localStorage.getItem(HIGH_SCORES_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        // Ignore
    }
    return [];
}

// Save high score - keep only top 10
function saveHighScore(score, elapsedSeconds) {
    const highScores = loadHighScores();
    const now = new Date();
    const dateTime = now.toLocaleString(); // Full date and time

    highScores.push({
        score: score,
        time: elapsedSeconds,
        dateTime: dateTime
    });

    // Sort by score (descending), then by time (ascending - faster is better for same score)
    highScores.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.time - b.time;
    });

    // Keep only top 10
    const topTen = highScores.slice(0, 10);

    try {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(topTen));
    } catch (e) {
        // Ignore storage errors
    }
}

// Render high scores table
function renderHighScores(container) {
    const highScores = loadHighScores();

    if (highScores.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <h3>Top 10 Scores</h3>
        <table>
            <tr>
                <th>Rank</th>
                <th>Score</th>
                <th>Time</th>
                <th>Date & Time</th>
            </tr>
    `;

    highScores.forEach((entry, index) => {
        const minutes = Math.floor(entry.time / 60);
        const seconds = entry.time % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const dateTimeStr = entry.dateTime || entry.date; // Backward compatible

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${entry.score}</td>
                <td>${timeStr}</td>
                <td>${dateTimeStr}</td>
            </tr>
        `;
    });

    html += `
        </table>
        <button class="clear-scores-btn" onclick="clearHighScores(event)">Clear All Scores</button>
    `;

    container.innerHTML = html;
}

// Clear all high scores
function clearHighScores(event) {
    if (confirm('Are you sure you want to clear all high scores?')) {
        localStorage.removeItem(HIGH_SCORES_KEY);
        const container = document.getElementById('high-scores-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

function hideGameOver() {
    const modal = document.getElementById('game-over-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Show top scores modal
function showTopScores() {
    const modal = document.getElementById('top-scores-modal');
    const container = document.getElementById('top-scores-container');
    if (modal && container) {
        renderHighScores(container);
        modal.classList.add('show');
    }
}

function hideTopScores() {
    const modal = document.getElementById('top-scores-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Set game message
function setMessage(msg) {
    game.message = msg;
    if (document.getElementById('game-message')) {
        document.getElementById('game-message').textContent = msg;
    }
}

// Card size variants for createCardElement
const CARD_SIZES = {
    STANDARD: 'standard',  // Normal play card (65x90px)
    HAND: 'hand',          // Larger for player hand (78x108px)
    SMALL: 'small',        // Last card display (50x70px)
    TINY: 'tiny'           // Torch display (40x56px)
};

/**
 * Restore Card prototypes after loading from JSON
 * @param {Array} cards - Array of plain card objects
 */
function restoreCardPrototypes(cards) {
    for (let i = 0; i < cards.length; i++) {
        Object.setPrototypeOf(cards[i], Card.prototype);
    }
}

/**
 * Restore Turn prototypes after loading from JSON
 * @param {Array} turns - Array of plain turn objects
 */
function restoreTurnPrototypes(turns) {
    for (let i = 0; i < turns.length; i++) {
        Object.setPrototypeOf(turns[i], Turn.prototype);
        // Cards inside turns also need prototype restoration
        restoreCardPrototypes(turns[i].cards);
    }
}

// Save current game state to localStorage
function saveGame() {
    try {
        localStorage.setItem('dungeon-solitaire-save', JSON.stringify(game));
    } catch (e) {
        console.error('Error saving game to localStorage:', e);
    }
}

// Clear saved game from localStorage
function clearGameSave() {
    try {
        localStorage.removeItem('dungeon-solitaire-save');
    } catch (e) {
        console.error('Error clearing saved game:', e);
    }
}

// Load saved game
/**
 * Load saved game from localStorage
 * @returns {boolean} True if game loaded successfully
 */
function loadGame() {
    try {
        const saved = localStorage.getItem('dungeon-solitaire-save');
        if (saved) {
            game = JSON.parse(saved);

            // Restore all prototypes since JSON.parse doesn't preserve them
            restoreCardPrototypes(game.deck);
            restoreCardPrototypes(game.discardPile);
            restoreCardPrototypes(game.torches);
            restoreCardPrototypes(game.hitPoints);
            restoreCardPrototypes(game.playerHand);
            restoreTurnPrototypes(game.delve);
            restoreTurnPrototypes(game.retreat);

            // Adjust startTime if game is still active (preserve elapsed time)
            if (game.gameStatus === 'active' && game.startTime && !game.endTime) {
                // When game was saved, startTime was the original start time
                // We need to keep the already elapsed time and set new startTime to now
                const now = Date.now();
                if (!game.elapsedTime) {
                    game.elapsedTime = 0;
                }
                // The time from original startTime to when we saved is already accounted for in game.elapsedTime
                // So just set new startTime to now
                game.startTime = now;
            }

            setMessage(game.message);
            if (typeof renderAll === 'function') {
                renderAll();
            }
            if (document.getElementById('draw-card-btn')) {
                document.getElementById('draw-card-btn').disabled = game.gameStatus !== 'active';
            }
            return true;
        }
    } catch (e) {
        console.error('Error loading saved game:', e);
    }
    return false;
}

function hasFlippedDamage() {
    return game.hitPoints.some(c => c.flipped);
}
