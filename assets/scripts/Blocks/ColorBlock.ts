import { BlockColor } from "./BlockColor";
import { BlockType } from "./BlockType";
import { IBlock } from "./IBlock";

export class ColorBlock implements IBlock<BlockColor>{
    private x:number;
    private y:number;
    private type:BlockType;
    private color:BlockColor;

    public get X(): number {
        return this.x;
    }
    public get Y(): number {
        return this.y;
    }
    public get Type(): BlockType {
        return this.type;
    }
    public get Subtype(): BlockColor {
        return this.color;
    }

    constructor(x:number,y:number, type:BlockType, color:BlockColor) {
        this.x=x;
        this.y=y;
        this.type=type;
        this.color=color;
    }

    ChangePosition(x:number,y:number):void{
        this.x=x;
        this.y=y;
    }
}