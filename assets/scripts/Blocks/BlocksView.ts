import { _decorator, Component, Node, tween, Vec3, instantiate, Prefab, RichText, UITransform } from 'cc';
import { BlocksController } from "db://assets/scripts/Blocks/BlocksController";
import { BlockType } from './BlockType';
const { ccclass, property } = _decorator;

@ccclass('BlocksView')
export class BlocksView extends Component {

    @property({ type: [Prefab] })
    private colorBlocks: Prefab[] = [];
    @property({ type: [Prefab] })
    private bonusBlocks: Prefab[] = [];

    @property
    private brickHeight: number = 50;
    @property
    private brickWidth: number = 50;
    @property
    private duration: number = 0.2;

    @property({ type: [RichText] })
    private shuffleCount: RichText;
    @property({ type: [RichText] })
    private availableTurnText: RichText;


    private grid: Node[][];
    private controller: BlocksController;

    public CreateGrid(gridWidth: number, gridHeight: number, controller: BlocksController): void {
        this.controller = controller;
        this.node.getComponent(UITransform)!.height = (gridHeight * this.brickHeight) + this.brickHeight;
        this.node.getComponent(UITransform)!.width = (gridWidth * this.brickWidth) + this.brickWidth;
        this.grid = new Array(gridWidth);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(gridHeight);
        }
    }

    public CreateBlock(x: number, y: number, type: number, subtype: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            let position = new Vec3(x * this.brickWidth + this.brickWidth, y * this.brickHeight + this.brickHeight, 0);
            let newBlock: Node;
            switch (type) {
                case BlockType.color:
                    newBlock = instantiate(this.colorBlocks[subtype]);
                    break;
                case BlockType.bonus:
                    newBlock = instantiate(this.bonusBlocks[subtype]);
                    break;
                default:
                    console.log("unknow view type");
                    break;
            }
            newBlock.position = position;
            let blockScale = new Vec3(newBlock.scale.x, newBlock.scale.y, newBlock.scale.z);;
            newBlock.scale = new Vec3(0, 0, 0);
            newBlock.name = x + "," + y;
            newBlock.on(Node.EventType.MOUSE_UP, function (event) {
                this.OnClickedTile(newBlock);
            }, this);

            this.node.addChild(newBlock);
            this.grid[x][y] = newBlock;

            tween(newBlock)
                .to(this.duration, { scale: blockScale })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public OnClickedTile(newBlock: Node): void {
        if (!this.controller.IsCanMove) {
            return;
        }
        for (let i = 0; i < this.grid.length; i++) {
            if ((newBlock.position.x >= this.grid[i][0].position.x - this.brickWidth / 2) &&
                (newBlock.position.x <= this.grid[i][0].position.x + this.brickWidth / 2)) {
                for (let j = 0; j < this.grid[i].length; j++) {
                    if ((newBlock.position.y >= this.grid[i][j].position.y - this.brickHeight / 2) &&
                        (newBlock.position.y <= this.grid[i][j].position.y + this.brickHeight / 2)) {
                        this.controller.OnClickedTile(i, j);
                        return;
                    }
                }
            }
        }
    }

    public DeleteBlock(x: number, y: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let nodeToDelete = this.grid[x][y];
            if (nodeToDelete) {
                this.grid[x][y] = null;
                tween(nodeToDelete)
                    .to(this.duration, { scale: new Vec3(0, 0, 0) })
                    .call(() => {
                        nodeToDelete.destroy();
                        resolve();
                    })
                    .start();
            } else {
                resolve();
            }
        });
    }

    public MoveBlock(xTo: number, yTo: number, xFrom: number, yFrom: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let to = new Vec3(xTo * this.brickWidth + this.brickWidth, yTo * this.brickHeight + this.brickHeight, 0);
            this.grid[xTo][yTo] = this.grid[xFrom][yFrom];
            const block = this.grid[xTo][yTo];
            block.name = xTo + "," + yTo;
            this.grid[xFrom][yFrom] = null;

            tween(block)
                .to(this.duration, { position: to })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public SetTextAvailableTurn(text: string): void {
        this.availableTurnText.string = "Available turn " + text;
    }

    public SetTextShuffleCount(text: string): void {
        this.shuffleCount.string = "Shuffle count " + text;
    }
}