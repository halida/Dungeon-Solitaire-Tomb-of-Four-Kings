# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-file HTML/CSS/JavaScript implementation of **Dungeon Solitaire: Tomb of Four Kings**, a solitaire card game based on the design by Matthew Lowes. All game code is contained in one file - no build tools, no dependencies, just open in a browser.

## Commands

Since this is a static HTML project, there are no build commands. To develop:

- Open `index.html` in a browser to run the game
- No npm/yarn/dependencies required - it's all vanilla HTML/CSS/JS

## Code Architecture

### File Structure

```
index.html     - Main game file (contains all HTML, CSS, and JavaScript)
README.md      - Project README with overview and how-to-play
guide.md       - Original game rules and walkthrough from Matthew Lowes
task_plan.md   - Implementation plan (completed)
findings.md    - Project findings
progress.md    - Implementation progress log
tests.html     - Test runner HTML
tests.js       - Automated tests for game logic
```

### All Code is in `index.html`

**HTML Structure:**
- Header with game title and controls (New Game, Draw Card)
- Torches area (tracks burnt-out torches/aces)
- Dungeon area with two rows: Delve (going deeper left-to-right) and Retreat (coming back right-to-left)
- Bottom row: Discard pile counter, Hit points display, Player hand (treasure & skills)
- Status area with game messages and score
- Game over modal for win/loss

**CSS:**
- Responsive flexbox/grid layout that works on desktop and mobile
- Minimal card styling - simple rectangles with text/suit symbols
- Dark theme with playing card colors (red for hearts/diamonds, black for spades/clubs)

**JavaScript Objects:**

| Object | Purpose |
|--------|---------|
| `Card` | Stores card data: `suit`, `rank`, `value`, `id`, `faceUp` |
| `Turn` | Stores turn data: `cards[]`, `encounter`, `resolved`, `escape` |
| `game` | Main game state object - everything lives here |

**Main Game State (`game` object):**
```javascript
{
  deck: Card[],
  discardPile: Card[],
  torches: Card[],        // Aces played (burnt torches)
  hitPoints: Card[],      // 2-10 of hearts (flipped when damaged)
  playerHand: Card[],     // Collected skills, treasure, kings, joker
  delve: Turn[],          // Delve turns (left-to-right)
  retreat: Turn[],        // Retreat turns (right-to-left)
  currentTurn: Turn|null,
  gameStatus: 'setup'|'active'|'won|'lost',
  message: string,        // Current status message
  phase: 'delve'|'retreat', // Current game phase
  scrollUsed: boolean,    // Whether joker/scroll was used
  jokerInHand: boolean
}
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `newGame()` | Initialize new game |
| `createDeck()` | Create shuffled deck per rules (46 cards + joker) |
| `drawCard()` | Draw from deck, handle special cards (aces → torches, jacks → hand) |
| `drawToCurrentTurn()` | Add drawn card to current turn, check for encounter |
| `handleSpecialCard()` | Immediate effects for aces, jacks, joker |
| `resolveAction()` | Resolve action card played against encounter |
| `resolveEncounter()` | Finalize encounter, collect treasure if won |
| `playFromHand()` | Play a skill card from player hand |
| `escapeMonsterDropTreasure()` | Drop treasure to escape monster encounter |
| `collectTreasure()` | Move treasure cards (diamonds, kings, joker) to player hand |
| `takeDamage()` | Flip hit point cards when damaged |
| `startRetreat()` | Switch from delve phase to retreat phase |
| `checkVictory()` | Check win condition (reached exit alive) |
| `calculateScore()` | Calculate final score (kings=10, diamonds=face value, joker=6) |
| `gameOver()` | Show game over modal with result |
| `renderAll()` | Re-render entire UI after every change |
| `saveGame()` / `loadGame()` | Persist game to localStorage |

## Game Rules Implemented

All rules from `guide.md` are implemented:

- Card mapping: Spades(2-10)=Monsters, Diamonds(2-10)=Traps/Treasure, Clubs(2-10)=Doors, Aces=Torches, Jacks=Skills, Queens=Divine Favor, Kings=Tomb Hoards, Joker=Scroll of Light, Hearts(2-10)=Hit Points
- Delve: left-to-right turns going deeper, Retreat: right-to-left coming back
- Must draw until encounter appears; encounter requires action card from deck or skill from hand
- Success when action value ≥ encounter value
- Skills: J♠ beats any monster, J♦ disarms any trap, J♣ opens any door, J♥ undoes last damage
- Queens automatically win the encounter when they appear before it
- 4 torches = game over unless Scroll of Light (joker) saved one
- Death when 2♥ gets flipped (all HP gone)
- Win when you complete retreat and exit the dungeon
- Score: kings (10 each) + diamond values + joker (6)

## Development Notes

- The game is fully functional - all features implemented
- localStorage persists game state between page reloads
- Mobile responsive via CSS media queries
- All logic is vanilla JavaScript - no frameworks
- Keep changes minimal - this is a complete single-file implementation
