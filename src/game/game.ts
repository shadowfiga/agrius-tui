// game.ts
export class Game {
    credits = 0;

    tick(dtSec: number) {
        // dtSec in seconds
        this.credits += 1 * dtSec;
    }
}
