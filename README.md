# Export-DPI-safe-SVG
Adobe Illustrator SVG's open with wrong size in Fusion and CAD programs. This solves the problem.

Internally, Adobe Illustrator use 72 DPI resolution. Other softwares use 96 DPI resolution. The result is that Fusion 360, Inkscape, various CAD and laser cutting softwares open Illustrators SVGs at 75% of correct size. Forcing the user to enlarge the SVG with 133.33%, or get the wrong output.

This is incredibly annoying! 

One would assume there would be dozens of small utilities and scripts fixing the problem, but despite searching for a week, none have been found.

So, here is one!

Install in Adobe Illustrator's script folder. On a Mac, that's /Presets/en_US/Scripts/

It works by duplicating the document, scaling up the copy, then rewriting the SVG header to have the correct dimensions in millimeter. Making it the same size in all softwares!

If you like the script and find it useful, then find any magician on Youtube and click a like on any of their videos. And if you really really like it, and are well off, then buy me a coffee at https://paypal.me/tomstonemagic

I suppose that's it!
Do great things!
-Tom Stone (www.tomstone.se)
