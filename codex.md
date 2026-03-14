I am building a localhost web app called “Savvy Wardrobe Improvement MVP”.

Current state:
- It works functionally, but the frontend looks stale, plain, and awkwardly spaced
- The recommendations page is the worst offender
- Long recommendation links bleed off the right margin and wreck the layout
- The whole app feels like raw default HTML instead of a polished product
- I want it to feel modern, clean, minimal, and actually pleasant to use

Your task:
Redesign and improve the frontend styling and layout across the app, with special attention to the Recommendations page.

Pages involved:
- Wardrobe Manager
- Analysis Dashboard
- Recommendations

Overall design direction:
- modern
- minimal
- soft, clean aesthetic
- polished but not flashy
- strong spacing and visual hierarchy
- subtle borders, muted colors, rounded corners, clean typography
- should feel like a startup MVP with taste, not a school project
- desktop-first, but still responsive enough to not break on smaller screens

Main problems to solve:
1. Recommendations page links overflow horizontally and bleed off the container
2. Content blocks feel too wide, flat, and visually dead
3. Navigation looks unstyled and weak
4. Forms and filters look like default browser controls with no cohesion
5. Recommendation cards are dense and hard to scan
6. Overall spacing, typography, and grouping need much better rhythm

What I want on the Recommendations page:
- Convert the recommendation list into clean card-based results
- Each recommendation should be visually separated with padding, border, radius, and subtle shadow or elevated surface styling
- Show title, price, marketplace/source, compatibility/score, gap filled, reasoning, and link in a readable hierarchy
- The link must never overflow the container
- Long URLs should wrap safely or be replaced by a styled “View item” link/button
- Preserve functionality, but improve presentation a lot
- Filters at the top should look like a polished control bar
- Improve readability and scanability
- Budget and filter controls should align nicely and respond well to screen width changes

What I want on the Wardrobe Manager page:
- Better form layout
- Cleaner item list
- Better visual treatment for current wardrobe items
- Delete buttons should look intentional and not like default HTML buttons
- Improve spacing, grouping, and section styling

What I want on the Analysis Dashboard:
- Better card styling for summary sections
- Better typography for headings and stats
- The detected gaps section should feel more like an actual dashboard module
- Improve structure without making it too busy

Implementation requirements:
- Keep the existing functionality and data flow intact
- Focus on frontend only unless a tiny backend/template change is absolutely necessary for layout
- Prefer reusable styling and component structure over one-off hacks
- If this is React, extract reusable components where it makes sense
- If this uses plain CSS, organize the CSS clearly
- Avoid heavy UI libraries unless already present
- Do not introduce unnecessary dependencies unless there is a very strong reason
- Make the app feel custom and cohesive

Important technical fixes:
- Prevent horizontal overflow globally where appropriate
- Ensure recommendation text and URLs wrap correctly
- Use max-width containers and sensible content widths
- Improve spacing between sections
- Add hover/focus states for interactive elements
- Make sure buttons, inputs, cards, and nav links share a consistent visual language

Nice aesthetic details to include:
- centered content container with good max-width
- soft neutral palette
- subtle background contrast between page and cards
- bold but tasteful page headings
- nav tabs with active state
- polished buttons
- well-spaced labels and controls
- readable font sizing and line height

Output format:
1. Briefly explain the design changes you are making
2. Then make the code changes
3. Keep edits focused and practical
4. Do not remove existing functionality
5. Do not leave the app half-finished

If you need to choose a style direction, choose:
“modern neutral wardrobe assistant” with soft grays, clean white surfaces, rounded cards, compact but breathable spacing, and strong readability

One specific requirement:
On the Recommendations page, do NOT show raw long URLs as naked text if that hurts layout. Replace them with a compact clickable element like:
- “View item”
- “Open listing”
- or a small styled anchor button

Also:
Please make the interface feel noticeably better, not just slightly less bad.