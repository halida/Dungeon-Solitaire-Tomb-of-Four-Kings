# Task Plan: Dungeon Solitaire - Tomb of Four Kings

## Goal
Create a complete one-page HTML + JavaScript implementation of the Dungeon Solitaire (Tomb of Four Kings) card game based on the rules in guide.md.

## Current Phase
Phase 5 (Complete)

## Phases

### Phase 1: Requirements & Discovery
- [x] Understand user intent
- [x] Identify constraints and requirements
- [x] Document findings in findings.md
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Define technical approach (single-page HTML/CSS/JS)
- [x] Define game architecture and data structures
- [x] Document decisions with rationale
- **Status:** complete

### Phase 3: Implementation
- [x] Create HTML structure for game board layout
- [x] Implement CSS styling for card display and game areas
- [x] Implement core game logic in JavaScript:
  - Deck creation and shuffling
  - Game setup (hit points, initial deal)
  - Delve and retreat turn management
  - Encounter resolution (monsters, traps, doors)
  - Skill/divine favor/torch mechanics
  - Escape with treasure drop
  - Victory/defeat detection
  - Scoring
- [x] Implement interactive player controls
- [x] Test incrementally
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Verify all rules from guide.md are implemented correctly
- [x] Test game flow: setup → delve → retreat → victory/defeat
- [x] Test edge cases (4th torch, death, Scroll of Light usage)
- [x] Fix any issues found (none found in code review)
- [x] Document test results in progress.md
- **Status:** complete

### Phase 5: Delivery
- [x] Review all output files (single HTML file)
- [x] Ensure deliverables are complete (one page as requested)
- [x] Deliver to user
- **Status:** complete

## Key Questions
1. Should the game use standard playing card graphics or simplified CSS cards?
2. Is mobile responsiveness required?
3. Should game state be saved to localStorage for persistence?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Single-file HTML/CSS/JS implementation | User requested "one page html js poker game" - everything in one file for simplicity |
| Use plain JavaScript (no frameworks) | Keeps it simple, no build step required, just open in browser |
| Minimal card style (simple rectangles with text) | User requested minimal - clean, lightweight, no dependencies |
| Responsive flexbox/grid layout | User requested mobile responsiveness - works on both desktop and mobile |
| Game state stored in a single JS object | Easy to manage and debug |
| localStorage persistence | User requested persistence - saves game between page reloads |

## Architecture & Data Structures

**HTML Structure (`index.html`):**
- Header with game title and controls (New Game, Restart)
- Torch area at top
- Dungeon area with two sections: Delve row and Retreat row
- Bottom row: Discard pile, Hit Points, Player Hand
- Status/Message area for game events
- Score display

**JavaScript Objects:**
- `Card`: { suit, rank, value, id, faceUp }
- `GameState`: {
    deck: Card[],
    discardPile: Card[],
    torches: Card[],
    hitPoints: Card[],
    playerHand: Card[],
    delve: Turn[],
    retreat: Turn[],
    currentTurn: Turn | null,
    gameStatus: 'setup' | 'active' | 'won' | 'lost',
    message: string,
    phase: 'delve' | 'retreat'
  }
- `Turn`: { cards: Card[], encounter: Encounter | null, resolved: boolean }
- `Encounter`: { type: 'monster' | 'trap' | 'door', card: Card }

**Key Functions:**
- `createDeck()` - creates and shuffles the deck
- `setupGame()` - initializes hit points, prepares deck
- `drawCard()` - draws from deck, handles special cards (aces immediately)
- `startNewTurn()` - starts a new turn in delve/retreat
- `resolveEncounter()` - handles encounter resolution based on type
- `playFromHand()` - player plays a skill/treasure from hand
- `escapeWithTreasure()` - handles monster escape mechanic
- `checkGameOver()` - checks for win/loss conditions
- `calculateScore()` - computes final score

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions (attention manipulation)
- Log ALL errors - they help avoid repetition
