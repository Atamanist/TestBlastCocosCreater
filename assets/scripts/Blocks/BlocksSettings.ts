export class BlocksSettings {
    private minimumTileToDestroy: number;
    private shuffleCount: number;
    private availableTurns: number;
    private minimumTileToBomb: number;
    private bombRadius: number;

    public get MinimumTileToDestroy(): number {
        return this.minimumTileToDestroy;
    }
    public get ShuffleCount(): number {
        return this.shuffleCount;
    }
    public get AvailableTurns(): number {
        return this.availableTurns;
    }
    public get MinimumTileToBomb(): number {
        return this.minimumTileToBomb;
    }
    public get BombRadius(): number {
        return this.bombRadius;
    }

    constructor(minimumTileToDestroy: number, shuffleCount: number, availableTurns: number, minimumTileToBomb: number, bombRadius: number) {
        this.minimumTileToDestroy = minimumTileToDestroy;
        this.shuffleCount = shuffleCount;
        this.availableTurns = availableTurns;
        this.minimumTileToBomb = minimumTileToBomb;
        this.bombRadius = bombRadius;
    }
}