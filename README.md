# Deepforge prototype

Current build: **Deepforge v0.5.0 - Mining Satisfaction**

A standalone, framework-free HTML5 prototype for the mining loop:

`dig terrain -> open a tunnel -> reveal hidden ore -> collect it -> sell -> upgrade -> dig deeper`

## Controls

- Desktop: `WASD` / arrow keys to move, hold `Space` to mine, `E` to interact.
- Mobile: left joystick to move, hold the `MINE` button to swing.
- Your latest movement direction aims the pickaxe, so push toward a mine wall while holding mine to carve a tunnel.
- Walk near the Assay Cart, Forge, or sealed gate to reveal their action.

## Run locally

From this directory:

```powershell
python -m http.server 4180 --bind 0.0.0.0
```

Open `http://127.0.0.1:4180` on the same computer.

## Prototype scope

- One continuous world with four visually distinct areas.
- Every mine is now four to five times deeper: aim with movement, hold mine to carve persistent tunnels, and let the camera follow the descent.
- Terrain is generated lazily in compact 16 x 16-cell typed-array chunks and only visible cells are drawn, avoiding one heavy object per rock tile on mobile.
- Deterministic connected ore veins run through the deep terrain in clusters of 4-10 nodes instead of isolated random rocks.
- Buried chambers remain visually concealed until the player breaks through their perimeter, then permanently reveal their name and rare find.
- Stone, copper, Moonglass, armored Emberstone, Astralite, and four valuable rare veins.
- Five pickaxe tiers with stronger damage and faster swings.
- Emberstone shells that can be ground down normally or cracked quickly with precision strikes.
- Four timed bonus veins that reward clearing a full connected cluster quickly.
- Broken ore now bursts onto the ground, settles physically, and must be collected by walking over it. Uncollected ore fades after five minutes.
- Ember Pickaxe requires 12 lifetime Emberstone mined plus 650 gold.
- Five Ember Mastery ranks extend progression after the final pickaxe. Each rank needs gold plus a lifetime Sunslag milestone, then grants higher power, swing speed, shell penetration, precision frequency, and bonus yield.
- Damage left over after breaking an armored shell now carries into the ore core, so stronger pickaxes never waste their extra power at the shell boundary.
- Ember Mastery 5 opens the Starfall Master Seal and reveals Starfall Depths, armored Astralite, rare Crownstone, and the Starfall Lattice.
- The Starforge consumes Astralite and Crownstone to unlock three swappable endgame styles: the heavy Astral Crusher, rapid Comet Edge, and high-yield Crownseeker.
- Three visible rock-damage stages and optional timing-based precision strikes.
- Stronger mining feedback with staged terrain cracks, compact camera kick, brief impact weight, material-tuned audio, optional haptics, escalating vein feedback, and discovery/jackpot bursts.
- A five-step Mining Focus streak for accurate active play.
- Animated resource selling with a smooth gold count-up.
- Local browser save.
- No framework or external runtime dependency.
