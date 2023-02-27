import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class ScoreModel{
    private score:number;

    public get Score(): number {
        return this.score;
    }
    public set Score(value:number){
        this.score=value;
    }

    constructor(startScore:number) {
        this.score=startScore;
    }
}


