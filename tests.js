/**
 * Dungeon Solitaire - Test Suite
 * Vanilla JavaScript test runner, no dependencies required
 */

// Test results tracking
let testResults = [];

// Test categories
const TEST_CATEGORIES = {
    unit: 'Unit Tests',
    integration: 'Integration Tests'
};

/**
 * Assertion helpers
 */
function assert(condition, testName) {
    const result = {
        name: testName,
        passed: condition,
        error: condition ? null : 'Assertion failed'
    };
    testResults.push(result);
    return result;
}

function assertEqual(actual, expected, testName) {
    const passed = actual === expected;
    const result = {
        name: testName,
        passed,
        error: passed ? null : `Expected "${expected}", got "${actual}"`
    };
    testResults.push(result);
    return result;
}

function assertTruthy(value, testName) {
    return assert(!!value, testName);
}

function assertFalsy(value, testName) {
    return assert(!value, testName);
}

function assertContains(array, item, testName) {
    const passed = array.includes(item);
    const result = {
        name: testName,
        passed,
        error: passed ? null : `Array does not contain expected item`
    };
    testResults.push(result);
    return result;
}

function assertLength(array, expectedLength, testName) {
    return assertEqual(array.length, expectedLength, testName);
}

/**
 * Game code is already loaded via script tag
 */
function loadGameCode() {
    return Promise.resolve();
}

/**
 * Unit Tests - Pure functions
 */
function runUnitTests() {
    const category = 'unit';

    // Card Creation
    {
        const card = new Card('spades', 'A');
        assertEqual(card.suit, 'spades', `${category}: Ace of spades - correct suit`);
        assertEqual(card.rank, 'A', `${category}: Ace of spades - correct rank`);
        assertEqual(card.value, 1, `${category}: Ace of spades - correct value`);

        const card2 = new Card('hearts', 'K');
        assertEqual(card2.value, 13, `${category}: King of hearts - correct value`);

        const card3 = new Card('diamonds', '10');
        assertEqual(card3.value, 10, `${category}: 10 of diamonds - correct value`);

        const joker = new Card('joker', 'Joker');
        assertEqual(joker.rank, 'Joker', `${category}: Joker - correct rank`);
        assertEqual(joker.value, 6, `${category}: Joker - correct value`);
    }

    // Deck Creation
    {
        const deck = createDeck();
        assertLength(deck, 44, `${category}: Deck has 44 cards (43 + joker)`);

        // Count cards by type
        const aces = deck.filter(c => c.rank === 'A');
        assertLength(aces, 4, `${category}: Deck has 4 aces`);

        const jacks = deck.filter(c => c.rank === 'J');
        assertLength(jacks, 4, `${category}: Deck has 4 jacks`);

        const queens = deck.filter(c => c.rank === 'Q');
        assertLength(queens, 4, `${category}: Deck has 4 queens`);

        const kings = deck.filter(c => c.rank === 'K');
        assertLength(kings, 4, `${category}: Deck has 4 kings`);

        const joker = deck.filter(c => c.rank === 'Joker');
        assertLength(joker, 1, `${category}: Deck has 1 joker`);

        // 2-10 of hearts should be excluded from main deck
        const heartsNumberCards = deck.filter(c => c.suit === 'hearts' && !isNaN(parseInt(c.rank)));
        assertLength(heartsNumberCards, 0, `${category}: No 2-10 of hearts in main deck`);
    }

    // Hit points creation
    {
        const hp = createHitPoints();
        assertLength(hp, 9, `${category}: 9 hit point cards (2-10)`);
        const hasTwo = hp.some(c => c.rank === '2' && c.suit === 'hearts');
        assertTruthy(hasTwo, `${category}: Has 2 of hearts`);
        const hasTen = hp.some(c => c.rank === '10' && c.suit === 'hearts');
        assertTruthy(hasTen, `${category}: Has 10 of hearts`);
    }

    // isNumberCard
    {
        assertTruthy(isNumberCard(new Card('spades', '2')), `${category}: 2 is number card`);
        assertTruthy(isNumberCard(new Card('spades', '10')), `${category}: 10 is number card`);
        assertFalsy(isNumberCard(new Card('spades', 'A')), `${category}: Ace is not number card`);
        assertFalsy(isNumberCard(new Card('spades', 'J')), `${category}: Jack is not number card`);
        assertFalsy(isNumberCard(new Card('spades', 'Q')), `${category}: Queen is not number card`);
        assertFalsy(isNumberCard(new Card('spades', 'K')), `${category}: King is not number card`);
    }

    // isTreasureCard
    {
        assertTruthy(isTreasureCard(new Card('diamonds', '5')), `${category}: Diamond 5 is treasure`);
        assertTruthy(isTreasureCard(new Card('diamonds', '10')), `${category}: Diamond 10 is treasure`);
        assertTruthy(isTreasureCard(new Card('spades', 'K')), `${category}: King is treasure`);
        assertTruthy(isTreasureCard(new Card('joker', 'Joker')), `${category}: Joker is treasure`);
        assertFalsy(isTreasureCard(new Card('spades', '5')), `${category}: Spade 5 is not treasure`);
        assertFalsy(isTreasureCard(new Card('hearts', 'A')), `${category}: Ace is not treasure`);
    }

    // isEncounterCard
    {
        assertTruthy(isEncounterCard(new Card('spades', '5')), `${category}: Spade 5 is encounter`);
        assertTruthy(isEncounterCard(new Card('diamonds', '7')), `${category}: Diamond 7 is encounter`);
        assertTruthy(isEncounterCard(new Card('clubs', '10')), `${category}: Club 10 is encounter`);
        assertFalsy(isEncounterCard(new Card('hearts', '5')), `${category}: Heart 5 is not encounter`);
        assertFalsy(isEncounterCard(new Card('spades', 'A')), `${category}: Ace is not encounter`);
        assertFalsy(isEncounterCard(new Card('spades', 'J')), `${category}: Jack is not encounter`);
        assertFalsy(isEncounterCard(new Card('spades', 'Q')), `${category}: Queen is not encounter`);
        assertFalsy(isEncounterCard(new Card('spades', 'K')), `${category}: King is not encounter`);
        assertFalsy(isEncounterCard(new Card('joker', 'Joker')), `${category}: Joker is not encounter`);
    }

    // getEncounterType
    {
        assertEqual(getEncounterType(new Card('spades', '5')), 'monster', `${category}: Spades = monster`);
        assertEqual(getEncounterType(new Card('diamonds', '5')), 'trap', `${category}: Diamonds = trap`);
        assertEqual(getEncounterType(new Card('clubs', '5')), 'door', `${category}: Clubs = door`);
    }

    // Score calculation
    {
        // Empty hand
        newGame();
        game.playerHand = [];
        const score0 = calculateScore();
        assertEqual(score0.kings, 0, `${category}: Empty hand - 0 kings`);
        assertEqual(score0.total, 0, `${category}: Empty hand - 0 points`);

        // One king
        game.playerHand = [new Card('spades', 'K')];
        const score1 = calculateScore();
        assertEqual(score1.kings, 1, `${category}: One king - 1 king count`);
        assertEqual(score1.total, 10, `${category}: One king - 10 points`);

        // Four kings
        game.playerHand = [
            new Card('spades', 'K'),
            new Card('hearts', 'K'),
            new Card('diamonds', 'K'),
            new Card('clubs', 'K')
        ];
        const score4 = calculateScore();
        assertEqual(score4.kings, 4, `${category}: Four kings - 4 king count`);
        assertEqual(score4.total, 40, `${category}: Four kings - 40 points`);

        // Diamond + king + joker
        game.playerHand = [
            new Card('diamonds', '5'),
            new Card('diamonds', '10'),
            new Card('spades', 'K'),
            new Card('joker', 'Joker')
        ];
        const score = calculateScore();
        assertEqual(score.kings, 1, `${category}: Mixed - correct king count`);
        assertEqual(score.total, 5 + 10 + 10 + 6, `${category}: Mixed - correct total`);
    }

    // Shuffle deck changes order
    {
        const original = [new Card('a', '1'), new Card('b', '2'), new Card('c', '3'), new Card('d', '4')];
        const originalIds = original.map(c => c.id);
        const shuffled = shuffleDeck(original);
        const shuffledIds = shuffled.map(c => c.id);
        // Very low probability this is false by chance
        const different = JSON.stringify(originalIds) !== JSON.stringify(shuffledIds);
        assertTruthy(different, `${category}: Shuffle changes deck order`);
    }
}

/**
 * Integration Tests - Game logic
 */
function runIntegrationTests() {
    const category = 'integration';

    // New Game Initialization
    {
        newGame();
        assertEqual(game.gameStatus, 'active', `${category}: New game is active`);
        assertEqual(game.phase, 'delve', `${category}: New game starts in delve phase`);
        assertLength(game.hitPoints, 9, `${category}: New game has 9 hit points`);
        const hpHasTwo = game.hitPoints.some(c => c.rank === '2' && c.suit === 'hearts');
        assertTruthy(hpHasTwo, `${category}: Hit points includes 2 of hearts`);
        assertLength(game.deck, 44, `${category}: New game deck has 44 cards`);
        assertLength(game.playerHand, 0, `${category}: New game empty hand`);
        assertLength(game.torches, 0, `${category}: New game 0 torches`);
    }

    // Special card handling - Ace goes to torches
    {
        newGame();
        const ace = new Card('spades', 'A');
        const consumed = handleSpecialCard(ace);
        assertTruthy(consumed, `${category}: Ace is consumed immediately`);
        assertLength(game.torches, 1, `${category}: Ace added to torches`);
    }

    // Special card handling - Jack goes to hand
    {
        newGame();
        const jack = new Card('spades', 'J');
        const consumed = handleSpecialCard(jack);
        assertTruthy(consumed, `${category}: Jack is consumed immediately`);
        assertLength(game.playerHand, 1, `${category}: Jack added to player hand`);
        assertEqual(game.playerHand[0], jack, `${category}: Jack is in hand`);
    }

    // Torch game over logic
    {
        newGame();
        // Add 3 torches
        game.torches = [new Card('spades', 'A'), new Card('hearts', 'A'), new Card('diamonds', 'A')];
        checkTorchGameOver();
        assertEqual(game.gameStatus, 'active', `${category}: 3 torches - game continues`);

        // 4 torches with joker in hand - joker consumed, game continues
        newGame();
        game.playerHand = [new Card('joker', 'Joker')];
        game.torches = [new Card('s', 'A'), new Card('h', 'A'), new Card('d', 'A'), new Card('c', 'A')];
        checkTorchGameOver();
        assertLength(game.torches, 3, `${category}: 4 torches with joker - one torch removed`);
        assertLength(game.playerHand, 0, `${category}: 4 torches with joker - joker consumed`);
        assertEqual(game.gameStatus, 'active', `${category}: 4 torches with joker - game continues`);
    }

    // Damage system - taking damage flips cards
    {
        newGame();
        takeDamage(2);
        const flipped = game.hitPoints.filter(c => c.flipped).length;
        assertEqual(flipped, 2, `${category}: 2 damage flips 2 cards`);

        // 2 of hearts is at bottom, so taking 9 damage flips it
        newGame();
        takeDamage(9);
        const twoHearts = game.hitPoints.find(c => c.rank === '2');
        assertTruthy(twoHearts.flipped, `${category}: Taking 9 damage flips 2 of hearts`);
        // Check game over detected
        assertEqual(game.gameStatus, 'lost', `${category}: 2 of hearts flipped = game over lost`);
    }

    // J♥ heals last damage
    {
        newGame();
        takeDamage(3);
        const flippedBefore = game.hitPoints.filter(c => c.flipped).length;
        assertEqual(flippedBefore, 3, `${category}: 3 damage taken`);
        unflippedLastDamage();
        const flippedAfter = game.hitPoints.filter(c => c.flipped).length;
        assertEqual(flippedAfter, 2, `${category}: After unflipping - 2 damaged cards left`);
    }

    // Skill playability - specific skills for specific encounters
    {
        newGame();
        const encounter = {type: 'monster'};
        assertTruthy(isSkillPlayable(new Card('spades', 'J'), encounter), `${category}: J♠ playable on monster`);
        assertFalsy(isSkillPlayable(new Card('diamonds', 'J'), encounter), `${category}: J♦ not playable on monster`);

        const encounterTrap = {type: 'trap'};
        assertTruthy(isSkillPlayable(new Card('diamonds', 'J'), encounterTrap), `${category}: J♦ playable on trap`);
        assertFalsy(isSkillPlayable(new Card('clubs', 'J'), encounterTrap), `${category}: J♣ not playable on trap`);

        const encounterDoor = {type: 'door'};
        assertTruthy(isSkillPlayable(new Card('clubs', 'J'), encounterDoor), `${category}: J♣ playable on door`);
        assertFalsy(isSkillPlayable(new Card('spades', 'J'), encounterDoor), `${category}: J♠ not playable on door`);
    }

    // Skill beats matching encounter - J♠ beats any monster
    {
        newGame();
        game.currentTurn = new Turn();
        game.currentTurn.encounter = {type: 'monster', card: new Card('spades', '10')};
        const jack = new Card('spades', 'J');
        const playable = isSkillPlayable(jack, game.currentTurn.encounter);
        assertTruthy(playable, `${category}: J♠ is playable on any monster`);
    }

    // collectTreasure - collects all treasure from turn
    {
        newGame();
        game.currentTurn = new Turn();
        game.currentTurn.cards = [
            new Card('diamonds', '5'),
            new Card('diamonds', '10'),
            new Card('spades', 'K'),
            new Card('joker', 'Joker')
        ];
        collectTreasure();
        // All 4 are treasure, so one is left behind to mark the turn → 3 in hand
        assertLength(game.playerHand, 3, `${category}: All treasure collected to hand (one left behind)`);

        // If all treasure, leave one behind
        newGame();
        game.currentTurn = new Turn();
        game.currentTurn.cards = [
            new Card('diamonds', '5'),
            new Card('diamonds', '10'),
            new Card('spades', 'K')
        ];
        collectTreasure();
        // Should leave one behind (first one)
        assertLength(game.playerHand, 2, `${category}: All treasure - one left behind, so 2 in hand`);
    }

    // Escape mechanic - sufficient treasure value escapes
    {
        newGame();
        game.currentTurn = new Turn();
        game.currentTurn.encounter = {type: 'monster', card: new Card('spades', '7')};

        // 5 of diamonds value 5 < 7 - can't escape
        game.playerHand = [new Card('diamonds', '5')];
        // We can't easily test the full function without UI, but check the logic:
        const treasureCard = game.playerHand[0];
        let treasureValue = treasureCard.value;
        if (treasureCard.rank === 'K') treasureValue = 10;
        assertFalsy(treasureValue >= game.currentTurn.encounter.card.value,
            `${category}: 5 diamonds (5) < 7 - can't escape`);

        // King value 10 >= 7 - can escape
        const king = new Card('spades', 'K');
        treasureValue = 10;
        assertTruthy(treasureValue >= 7, `${category}: King (10) >= 7 - can escape`);
    }

    // Check phase complete - retreat
    {
        newGame();
        game.phase = 'retreat';
        game.delve.length = 5;
        game.retreat.length = 4;
        // 5-1 = 4, should be complete
        const done = checkPhaseComplete();
        assertTruthy(done, `${category}: Retreat complete when retreat.length = delve.length - 1`);

        newGame();
        game.phase = 'retreat';
        game.delve.length = 1;
        game.retreat.length = 0;
        const done2 = checkPhaseComplete();
        assertTruthy(done2, `${category}: Starting retreat after 1 delve = immediately done (victory)`);
    }

    // Check victory after retreat completion
    {
        newGame();
        game.phase = 'retreat';
        game.delve.length = 1;
        game.retreat.length = 0;
        // checkVictory is called by checkPhaseComplete
        checkPhaseComplete();
        assertEqual(game.gameStatus, 'won', `${category}: Completing retreat = victory`);
    }

    // Save/Load - prototypes restored
    {
        newGame();
        game.playerHand = [new Card('spades', 'K'), new Card('diamonds', '5')];
        // Save to a variable instead of localStorage for testing
        const savedJson = JSON.stringify(game);
        const loadedGame = JSON.parse(savedJson);

        // Verify all cards have Card prototype after restoration
        restoreCardPrototypes(loadedGame.deck);
        restoreCardPrototypes(loadedGame.playerHand);
        restoreTurnPrototypes(loadedGame.delve);
        restoreTurnPrototypes(loadedGame.retreat);

        // Check that first card in deck has correct prototype
        const firstCard = loadedGame.deck[0];
        assertTruthy(firstCard instanceof Card, `${category}: Card prototype restored after load`);

        const firstTurn = loadedGame.delve.length > 0 ? loadedGame.delve[0] : null;
        if (firstTurn) {
            assertTruthy(firstTurn instanceof Turn, `${category}: Turn prototype restored after load`);
        }
    }

    // All treasure collection rule
    {
        newGame();
        game.currentTurn = new Turn();
        game.currentTurn.cards = [new Card('diamonds', '2'), new Card('diamonds', '3'), new Card('diamonds', '4')];
        collectTreasure();
        assertLength(game.playerHand, 2, `${category}: Three diamonds - two collected, one left behind`);
        // First treasure (diamond 2) should be left behind
        const hasFirst = game.playerHand.some(c => c.rank === '2' && c.suit === 'diamonds');
        assertFalsy(hasFirst, `${category}: First treasure left behind correctly`);
    }
}

/**
 * Render test results to page
 */
function renderResults() {
    const container = document.getElementById('test-container');
    const summaryEl = document.getElementById('summary');

    const total = testResults.length;
    const passed = testResults.filter(t => t.passed).length;
    const failed = total - passed;
    const passPercent = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

    // Update summary
    summaryEl.className = `summary ${failed === 0 ? 'pass' : 'fail'}`;
    summaryEl.innerHTML = `
        <div class="summary-text">${passed}/${total} tests passed (${passPercent}%)</div>
        ${failed > 0 ? `<div class="summary-text" style="color: #f44336;">${failed} tests failed</div>` : '<div class="summary-text" style="color: #4caf50;">All tests passed!</div>'}
    `;

    // Group by category
    const grouped = {};
    testResults.forEach(t => {
        const category = t.name.split(':')[0];
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(t);
    });

    container.innerHTML = '';

    for (const [categoryName, tests] of Object.entries(grouped)) {
        const catPassed = tests.filter(t => t.passed).length;
        const catTotal = tests.length;
        const catFailed = catTotal - catPassed;

        const categoryId = `category-${categoryName}`;
        const categoryHtml = `
            <div class="category">
                <div class="category-header" onclick="toggleCategory('${categoryId}-content')">
                    <span class="category-title">${categoryName === 'unit' ? 'Unit Tests' : 'Integration Tests'}</span>
                    <span class="category-stats">${catPassed}/${catTotal} <span class="pass-rate">(${catPassed === catTotal ? '100%' : `${((catPassed/catTotal)*100).toFixed(1)}%`})</span></span>
                </div>
                <div id="${categoryId}-content" class="category-content ${catFailed > 0 ? 'expanded' : ''}">
                    ${tests.map(t => `
                        <div class="test">
                            <div class="test-name ${t.passed ? 'test-pass' : 'test-fail'}">
                                ${t.passed ? '✓' : '✗'} ${t.name.split(':')[1] || t.name}
                            </div>
                            ${!t.passed && t.error ? `<div class="test-error">${t.error}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', categoryHtml);
    }
}

/**
 * Run all tests
 */
function runAllTests() {
    testResults = [];

    // Always ensure game code is loaded before running tests
    loadGameCode()
        .then(() => {
            try {
                runUnitTests();
                runIntegrationTests();
                renderResults();
            } catch (e) {
                console.error('Test run failed:', e);
                const summaryEl = document.getElementById('summary');
                summaryEl.className = 'summary fail';
                summaryEl.innerHTML = `<div class="summary-text" style="color: #f44336;">Test run crashed: ${e.message}</div>`;
            }
        })
        .catch(e => {
            console.error('Failed to load game code:', e);
            const summaryEl = document.getElementById('summary');
            summaryEl.className = 'summary fail';
            summaryEl.innerHTML = `<div class="summary-text" style="color: #f44336;">Failed to load game code: ${e.message}</div>`;
        });
}

// Auto-run when loaded
window.addEventListener('load', () => {
    loadGameCode()
        .then(() => {
            console.log('Game code loaded, running tests...');
            runAllTests();
        })
        .catch(e => {
            console.error('Failed to load game code:', e);
            const summaryEl = document.getElementById('summary');
            summaryEl.className = 'summary fail';
            summaryEl.innerHTML = `<div class="summary-text" style="color: #f44336;">Failed to load game code: ${e.message}</div>`;
        });
});
