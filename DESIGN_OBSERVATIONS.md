# UI Observations

## Current Read

The redesign is much closer to the target mood than the earlier passes.
The table now reads as a single object instead of a generic app dashboard.
The proportions between the left rail and the betting field are far better.
The circular chips and quieter split markers were the right move.

## What Is Working

- The overall burgundy-and-felt palette is finally in the right family.
- The board frame feels more grounded and less like floating website panels.
- The number discs are much easier to read than the earlier rectangular cells.
- The betting field has enough breathing room now that the inside grid reads first.
- The left rail grouping of chips, wheel, and RNG log makes structural sense.
- The header is far less bloated than before and no longer dominates the page.

## What Still Feels Off

- The top header still feels like site chrome instead of part of the table object.
- The maroon title wedge above the felt is still too graphic and not table-like enough.
- The left rail is close, but it still feels paneled rather than carved or upholstered.
- The wheel art is serviceable, but it does not yet match the richness of the felt/table area.
- The betting surface is still slightly too clean and digital; it needs more subtle material texture.
- The table is a little too vertically tall in the lower half, especially below the outside bets.
- The bottom dashboard cards still read like generic admin panels and should be quieter or more integrated.
- The tiny vertical `2 to 1` labels are functional but still not elegant.
- The overlay toggle placement works mechanically, but it is visually detached from the rest of the board.

## Strong Next Moves

1. Fold the top status bar into the stage more convincingly, or reduce it to a slimmer control rail.
2. Replace the angular maroon title band with a treatment that feels stitched, inlaid, or framed.
3. Give the left rail more tactile depth using softer interior shading and less obvious card framing.
4. Improve the wheel rendering so it feels like a premium object rather than a placeholder illustration.
5. Reduce empty green mass below the outside bets by tightening the lower apron proportions.
6. Rework the bottom info panels so they support the stage instead of competing with it.
7. Consider a more elegant treatment for column labels than the current narrow vertical text.
8. Keep the split and corner targets visually quiet unless hover or overlay mode is active.

## Current Fix Status

- The old study overlay concept was removed rather than refined. It had become structurally noisy and was masking layout problems instead of clarifying them.
- Inner edge-bet target markup for splits, corners, streets, six lines, and zero-edge combinations was stripped from the board for a clean reset.
- Chip rendering was restricted so hidden edge bets no longer leak ghost stacks into the lower field.
- The main field geometry was tightened and then rebalanced around shared height variables so the number grid, zero lane, column rail, dozen row, and outside row register more consistently.
- The board now reads cleaner, but the bet-surface architecture still wants a more unified geometric system instead of ad hoc visual alignment.

## What Still Needs Work Next

- Rebuild inside edge-bet positions from scratch on top of the cleaned field. Do not resurrect the old overlay-era target markup.
- Derive all future seam targets from one canonical board geometry model so split, corner, street, six-line, zero-edge, and column placements align mechanically instead of by visual approximation.
- Revisit the right-side `2 to 1` rail. It now has better breathing room, but the pill treatment still needs a more exact fit inside the column strip.
- Continue refining line registration where the inside grid meets the zero lane, right rail, dozen row, and outside row.
- Keep the felt background shading as-is. It is in the right family now.
- Preserve the calmer surface treatment. The earlier faux-glare and over-annotated overlay language should not come back.
- Number markers should continue moving toward the wheel aesthetic: flatter elliptical lozenges, subtler highlight, less digital gloss.

## Latest Layout Learnings

- The recent stage unification work was directionally correct. The board should continue owning the stage instead of sitting inside a large unused felt field.
- The oversized green void around the table is a composition bug, not a styling opportunity. Treat exposed felt as apron and trim, not empty room.
- The top bar reads better when it is limited to title plus status readouts. It should not be the main home for the action cluster.
- The primary action buttons (`Undo`, `Clear`, `Repeat`, `Help`, `Stats`, `Spin`) should live below the betting table in the lower stage area rather than in the top header.
- That lower control rail should feel integrated with the table assembly, not like a generic extra toolbar or dashboard card.
- The wheel panel still wants occupancy and header cleanup later, but board ownership and control placement take priority.

## Implementation Notes For The Next Pass

- Prefer one shared set of CSS geometry variables for row heights, rail width, and band heights before reintroducing edge-bet hit areas.
- Treat the current board as a clean-room baseline. Reintroduce only one bet-position family at a time and verify placement visually before adding the next.
- Avoid fallback rendering paths that can place orphaned chip stacks into generic field space.
- If a study aid returns later, it should be redesigned from zero after the physical betting geometry is correct.

## Constraints To Preserve

- Keep the existing bet keys, chip stack hooks, and interaction wiring intact.
- Preserve direct-open support through `index.html` and the checked-in `src/app.bundle.js`.
- Maintain the traditional European layout direction; do not drift back into abstract dashboard composition.
- Keep the look glitzy through material, depth, and trim rather than flashy ornament.
