import { BlockType } from "./BlockType";

export interface IBlock<T>{
    get X(): number;
    get Y(): number;
    get Type(): BlockType;
    get Subtype():T;
    ChangePosition(x:number,y:number):void;
}