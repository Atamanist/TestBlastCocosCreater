import { BlockBonusType } from "./BlockBonusType";
import { BlockColor } from "./BlockColor";
import { BlockType } from "./BlockType";
import { BonusBlock } from "./BonusBlock";
import { ColorBlock } from "./ColorBlock";
import { IBlock } from "./IBlock";

export class BlocksModel{
    private grid:IBlock<BlockColor|BlockBonusType>[][];

    public get Grid(): IBlock<BlockColor|BlockBonusType>[][] {
        return this.grid;
    }

    constructor(width:number,height:number) {
        this.grid=new Array(width);
        for (let i = 0; i < this.grid.length; i++){
            this.grid[i] = new Array(height);
        }
        this.FillModel();
    }

    private FillModel():void{
        for (let i = 0; i < this.grid.length; i++){
            for (let j = 0; j < this.grid[i].length; j++){
                let color=this.RandomIntFromInterval(0,(Object.keys(BlockColor).length/2)-1);
                let block=new ColorBlock(i,j,BlockType.color,color)
                this.grid[i][j] = block;
            }
        }
    }

    private RandomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    public DeleteBlock(x:number,y:number):void{
        this.grid[x][y]=null;
    }
    
    public DestroyAllBlocks(): void {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid.length; y++) {
                this.grid[x][y] = null;
            }
        }
    }

    public MoveBlock(xTo:number,yTo:number,xFrom:number,yFrom:number):void{
        this.grid[xTo][yTo] = this.grid[xFrom][yFrom];
        this.grid[xFrom][yFrom] = null;
    }

    public SetTile(x:number,y:number,tile:IBlock<BlockColor|BlockBonusType>):void{
        tile.ChangePosition(x,y);
        this.grid[x][y] = tile;
    }

    public CreateColorBlock(x:number,y:number):void{
        let color=this.RandomIntFromInterval(0,4);
        let block=new ColorBlock(x,y,BlockType.color,color)
        this.grid[x][y] = block;
    }

    public CreateBonusBlock(x:number,y:number,type:BlockBonusType):void{
        let block=new BonusBlock(x,y,BlockType.bonus,type)
        this.grid[x][y] = block;
    }
}