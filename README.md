# Witness Puzzle Solver

Intent is to solve with regular ol' recursive backtracking. Which means I'm gonna need to prune the
shit out of the tree as close to the root as possible.

So, *quickly* defining regions in the graph and validating them is pretty important.

Most of the rules should be trivial. Tetris blocks, though, are gonna be a bastard. Well, maybe, I don't think
we'll have to go full bin packing.

And Typescript because it's awesome.