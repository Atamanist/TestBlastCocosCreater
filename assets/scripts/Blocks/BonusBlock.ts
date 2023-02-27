import { BlockBonusType } from "./BlockBonusType";
import { BlockType } from "./BlockType";
import { IBlock } from "./IBlock";

export class BonusBlock implements IBlock<BlockBonusType>{
    private x:number;
    private y:number;
    private type:BlockType;
    private bonusType:BlockBonusType;

    public get X(): number {
        return this.x;
    }
    public get Y(): number {
        return this.y;
    }
    public get Type(): BlockType {
        return this.type;
    }
    public get Subtype(): BlockBonusType {
        return this.bonusType;
    }

    constructor(x:number,y:number, type:BlockType, bonusType:BlockBonusType) {
        this.x=x;
        this.y=y;
        this.type=type;
        this.bonusType=bonusType;
    }

    ChangePosition(x:number,y:number):void{
        this.x=x;
        this.y=y;
    }
}