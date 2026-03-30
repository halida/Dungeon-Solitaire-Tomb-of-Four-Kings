# Dungeon Solitaire: Tomb of Four Kings

A single-file HTML/CSS/JavaScript implementation of **Dungeon Solitaire: Tomb of Four Kings**, a solitaire card game based on the design by Matthew Lowes.

## Overview

This is a complete, self-contained implementation of the game. No build tools, no dependencies - just open it in a browser and play.

## How to Play

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start playing!

The game automatically saves your progress to `localStorage`, so you can refresh the page and continue where you left off.

## Game Rules

### Card Types
- **Spades (2-10)**: Monsters
- **Diamonds (2-10)**: Traps/Treasure
- **Clubs (2-10)**: Doors
- **Hearts (2-10)**: Hit Points
- **Aces**: Torches (burnt when drawn)
- **Jacks**: Skills (can be saved and played to beat any encounter of their type)
  - J♠ beats any monster
  - J♦ disarms any trap
  - J♣ opens any door
  - J♥ undoes last damage taken
- **Queens**: Divine favor (automatically wins the encounter)
- **Kings**: Tomb Hoards (valuable treasure for scoring)
- **Joker**: Scroll of Light (saves you from a 4th torch; worth 6 points)

### Game Flow
1. **Delve Phase**: Draw cards left-to-right going deeper into the dungeon
2. When an encounter (monster/trap/door) is drawn, you must defeat it with an action card from the deck or a skill from your hand
3. If you defeat it, continue delving. If you escape, the retreat phase begins
4. **Retreat Phase**: Move right-to-left back through the dungeon
5. **Win Condition**: Complete the retreat and exit the dungeon alive
6. **Lose Conditions**: 4 torches burned (without Scroll of Light), or all hit points lost

### Scoring
- Each King: 10 points
- Each diamond treasure: Face value
- Joker/Scroll of Light: 6 points

## Running Tests

This project includes automated tests for game logic in `tests.js`. To run the tests:

1. Open `tests.html` in any modern web browser
2. Click the **"Run All Tests"** button
3. View the test results - all tests should pass

The tests cover core game mechanics including:
- Deck creation and shuffling
- Card drawing and special card handling
- Encounter resolution
- Damage handling
- Victory/loss conditions
- Score calculation
- Skill card usage

## Project Structure

```
├── index.html      - Main game file (all HTML, CSS, and JavaScript)
├── tests.html      - Test runner HTML
├── tests.js        - Automated tests for game logic
├── guide.md        - Original game rules and walkthrough by Matthew Lowes
├── CLAUDE.md       - Development guidelines for this project
└── README.md       - This file
```

## Technical Details

- Pure vanilla JavaScript - no frameworks or dependencies
- Responsive CSS layout works on desktop and mobile
- Dark theme with proper card color coding
- Game state persisted to localStorage
- Single-file architecture for simplicity

## License

This is an independent implementation of a game design by Matthew Lowes. Original game design can be found at [http://www.matthewlowes.com/games/dungeonsolitaire/](http://www.matthewlowes.com/games/dungeonsolitaire/)
