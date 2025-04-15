# DGT Chess Board to Max

## Illegal moves

If an illegal move is submitted, an error will be reported and the current state will be marked as illegal. In order to get back to a legal state, the board must be put back into the most recent legal position (which is displayed).

One edge case here is if a move is submitted, but no pieces were moved, it will still register as an illegal move. To reset, pick up any piece and return it to it's original position.
