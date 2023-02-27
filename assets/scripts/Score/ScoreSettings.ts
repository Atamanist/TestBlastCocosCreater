export class ScoreSettings {
    private startScore: number;
    private finishScore: number;

    public get StartScore(): number {
        return this.startScore;
    }
    public get FinishScore(): number {
        return this.finishScore;
    }

    constructor(startScore: number, finishScore: number) {
        this.startScore = startScore;
        this.finishScore = finishScore;
    }

}