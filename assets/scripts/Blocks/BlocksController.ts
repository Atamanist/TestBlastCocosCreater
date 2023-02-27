import { BlocksModel } from './BlocksModel';
import { BlocksView } from './BlocksView';
import { BlocksSettings } from './BlocksSettings';
import { GameStateController } from "db://assets/scripts/GameState/GameStateController";
import { ScoreController } from "db://assets/scripts/Score/ScoreController";
import { IInitializable } from "db://assets/scripts/IInitializable";
import { BlockType } from './BlockType';
import { BlockBonusType } from './BlockBonusType';
import { BlockColor } from './BlockColor';

export class BlocksController implements IInitializable {

    private model: BlocksModel;
    private view: BlocksView;
    private settings: BlocksSettings;
    private scoreController: ScoreController;
    private gameStateController: GameStateController;
    private shuffleCount: number;
    private availableTurns: number;
    public get IsCanMove(): boolean {
        return this.gameStateController.IsCanMove;
    }

    constructor(model: BlocksModel, view: BlocksView, settings: BlocksSettings, scoreController: ScoreController, gameStateController: GameStateController) {
        this.model = model;
        this.view = view;
        this.settings = settings;
        this.scoreController = scoreController;
        this.gameStateController = gameStateController;
    }

    public Init(): void {
        this.shuffleCount = this.settings.ShuffleCount;
        this.availableTurns=this.settings.AvailableTurns;
        this.view.SetTextShuffleCount(this.shuffleCount.toString());
        this.view.SetTextAvailableTurn(this.availableTurns.toString());
        this.FillView();
    }

    private async FillView() {
        this.gameStateController.IsCanMove = false;
        this.view.CreateGrid(this.model.Grid.length, this.model.Grid[0].length, this);
        const createPromises: Promise<void>[] = [];

        for (let i = 0; i < this.model.Grid.length; i++) {
            for (let j = 0; j < this.model.Grid[i].length; j++) {
                let x = this.model.Grid[i][j].X;
                let y = this.model.Grid[i][j].Y;
                let type = this.model.Grid[i][j].Type;
                let subtype = this.model.Grid[i][j].Subtype;

                createPromises.push(this.view.CreateBlock(x, y, type, subtype));
            }
        }
        await Promise.all(createPromises);
        await this.CheckShuffle();
        this.gameStateController.IsCanMove = true;
    }

    public async OnClickedTile(x: number, y: number) {
        if (!this.IsCanMove) {
            return;
        }

        this.gameStateController.IsCanMove = false;

        let type = this.GetTypeOfClickedTile(x, y);
        let subtype = this.GetSubTypeOfClickedTile(x, y);
        let elementsToBeDeleted = [];
        let bonus;

        switch (type) {
            case BlockType.color:
                elementsToBeDeleted = this.OnClickedColor(x, y, subtype, elementsToBeDeleted)
                break;
            case BlockType.bonus:
                elementsToBeDeleted = this.OnClickedBonus(x, y, subtype, elementsToBeDeleted)
                break;
            default:
                console.log("unknow type");
                break;
        }

        const count = elementsToBeDeleted.length;

        if (type === BlockType.color && count < this.settings.MinimumTileToDestroy) {
            this.gameStateController.IsCanMove = true;
            return;
        }

        if (type === BlockType.color) {
            bonus = this.CheckToCreateBonus(x, y, elementsToBeDeleted);
        }

        await this.DeleteElements(elementsToBeDeleted);

        switch (bonus) {
            case BlockBonusType.bomb:
                await this.CreateBonus(x, y, BlockBonusType.bomb)
                break;
            default:
                break;
        }

        await this.BlockFalls();
        this.gameStateController.IsCanMove = true;
        this.scoreController.AddScore(count);
        this.availableTurns--;
        if(this.availableTurns===0){
            this.gameStateController.LoseGame();
        }
        this.view.SetTextAvailableTurn(this.availableTurns.toString());
    }

    private GetTypeOfClickedTile(x: number, y: number): BlockType {
        return this.model.Grid[x][y].Type;
    }

    private GetSubTypeOfClickedTile(x: number, y: number): BlockColor | BlockBonusType {
        return this.model.Grid[x][y].Subtype;
    }

    private OnClickedColor(x: number, y: number, subtype: BlockColor | BlockBonusType, elementsToBeDeleted: GridPoint[]): GridPoint[] {
        return elementsToBeDeleted = this.FindColorElements(x, y, subtype);
    }

    private OnClickedBonus(x: number, y: number, subtype: BlockColor | BlockBonusType, elementsToBeDeleted: GridPoint[]): GridPoint[] {
        switch (subtype) {
            case BlockBonusType.bomb:
                elementsToBeDeleted = this.OnClickedBomb(x, y, elementsToBeDeleted);
                break;
            default:
                console.log("unknow subtype");
                break;
        }
        return elementsToBeDeleted;
    }

    private OnClickedBomb(x: number, y: number, elementsToBeDeleted: GridPoint[]): GridPoint[] {
        let leftX = Math.max(x - this.settings.BombRadius, 0);
        let leftY = Math.max(y - this.settings.BombRadius, 0);
        let rightX = Math.min(x + this.settings.BombRadius, this.model.Grid.length - 1);
        let rightY = Math.min(y + this.settings.BombRadius, this.model.Grid[x].length - 1);

        for (let i = leftX; i <= rightX; i++) {
            for (let j = leftY; j <= rightY; j++) {
                if (!elementsToBeDeleted.some((item) => item.X === i && item.Y === j)) {
                    elementsToBeDeleted.push(new GridPoint(i, j));
                    if (this.model.Grid[i][j].Type === BlockType.bonus) {
                        elementsToBeDeleted = this.OnClickedBonus(i, j, this.model.Grid[i][j].Subtype, elementsToBeDeleted);
                    }
                }
            }
        }
        return elementsToBeDeleted;
    }

    private FindColorElements(x: number, y: number, subtype: BlockColor | BlockBonusType): GridPoint[] {
        const gridPoint = new GridPoint(x, y);
        const elementsToBeTraversed = [gridPoint];
        const foundElements = [gridPoint];

        while (elementsToBeTraversed.length > 0) {
            const { X: curX, Y: curY } = elementsToBeTraversed.shift();

            this.CheckElement(curX - 1, curY, subtype, foundElements, elementsToBeTraversed);
            this.CheckElement(curX + 1, curY, subtype, foundElements, elementsToBeTraversed);
            this.CheckElement(curX, curY + 1, subtype, foundElements, elementsToBeTraversed);
            this.CheckElement(curX, curY - 1, subtype, foundElements, elementsToBeTraversed);
        }
        return foundElements;
    }

    private CheckElement(x: number, y: number, subtype: BlockColor | BlockBonusType, toBeDeleted: GridPoint[], toBeTraversed: GridPoint[]): void {
        if (x < 0 || x >= this.model.Grid.length || y < 0 || y >= this.model.Grid[x].length) {
            return;
        }

        const cur = new GridPoint(x, y);
        if (toBeDeleted.some((item) => item.X === cur.X && item.Y === cur.Y) || toBeTraversed.some((item) => item.X === cur.X && item.Y === cur.Y)) {
            return;
        }

        if (this.model.Grid[x][y] && this.model.Grid[x][y].Type === BlockType.color && this.model.Grid[x][y].Subtype === subtype) {
            toBeDeleted.push(cur);
            toBeTraversed.push(cur);
        }
    }

    private async DeleteElements(elementsToBeDeleted: GridPoint[]) {
        elementsToBeDeleted.forEach(element => {
            this.model.DeleteBlock(element.X, element.Y);
        });

        const promises = elementsToBeDeleted.map(({ X: curX, Y: curY }) => this.view.DeleteBlock(curX, curY));
        await Promise.all(promises);
    }

    private CheckToCreateBonus(x: number, y: number, elementsToBeDeleted: GridPoint[]): BlockBonusType | undefined {
        if (this.CheckCreateBomb(x, y, elementsToBeDeleted))
            return BlockBonusType.bomb;
    }

    private CheckCreateBomb(x: number, y: number, elementsToBeDeleted: GridPoint[]): boolean {
        return elementsToBeDeleted.length > this.settings.MinimumTileToBomb;
    }

    private async CreateBonus(x: number, y: number, type: BlockBonusType) {
        this.model.CreateBonusBlock(x, y, type);
        await this.view.CreateBlock(this.model.Grid[x][y].X,
            this.model.Grid[x][y].Y,
            this.model.Grid[x][y].Type,
            this.model.Grid[x][y].Subtype,);
    }

    private async BlockFalls() {
        const movePromises: Promise<void>[] = [];
        for (let x = 0; x < this.model.Grid.length; x++) {
            for (let y = 0; y < this.model.Grid[x].length; y++) {
                if (!this.model.Grid[x][y]) {
                    let moved = false;
                    for (let indexY = y + 1; indexY < this.model.Grid[x].length; indexY++) {
                        if (this.model.Grid[x][indexY]) {
                            if (!moved) {
                                this.model.MoveBlock(x, y, x, indexY);
                                movePromises.push(this.view.MoveBlock(x, y, x, indexY));
                                moved = true;
                            }
                        }
                    }
                }
            }
        }
        await Promise.all(movePromises);
        await this.FillBlocks();
    }

    private async FillBlocks() {
        const movePromises: Promise<void>[] = [];
        const emptyCells: { x: number, y: number }[] = [];

        for (let x = 0; x < this.model.Grid.length; x++) {
            for (let y = 0; y < this.model.Grid[x].length; y++) {
                if (!this.model.Grid[x][y]) {
                    emptyCells.push({ x, y });
                }
            }
        }

        for (const cell of emptyCells) {
            this.model.CreateColorBlock(cell.x, cell.y);
            movePromises.push(this.view.CreateBlock(this.model.Grid[cell.x][cell.y].X, this.model.Grid[cell.x][cell.y].Y, this.model.Grid[cell.x][cell.y].Type, this.model.Grid[cell.x][cell.y].Subtype));
        }
        await Promise.all(movePromises);

        await this.CheckShuffle();
    }

    private async CheckShuffle() {
        if (this.CheckForBonusBlock() || this.CheckForAvailableMatches()) {
            return;
        }

        if (this.shuffleCount === 0) {
            this.gameStateController.LoseGame();
            return;
        }

        if (this.shuffleCount > 0) {
            this.shuffleCount--;
            this.view.SetTextShuffleCount(this.shuffleCount.toString());

            const createPromises: Promise<void>[] = [];

            for (let i = 0; i < this.model.Grid.length; i++) {
                for (let j = 0; j < this.model.Grid[i].length; j++) {
                    createPromises.push(this.view.DeleteBlock(i, j));
                }
            }
            await Promise.all(createPromises);

            await this.ShuffleTiles();
        }
    }

    private CheckForBonusBlock(): boolean {
        for (let x = 0; x < this.model.Grid.length; x++) {
            for (let y = 0; y < this.model.Grid[x].length; y++) {
                if (this.model.Grid[x][y].Type === BlockType.bonus) {
                    return true;
                }
            }
        }
        return false;
    }

    private CheckForAvailableMatches(): boolean {
        for (let x = 0; x < this.model.Grid.length; x++) {
            for (let y = 0; y < this.model.Grid[x].length; y++) {
                const subtype = this.model.Grid[x][y].Subtype;
                const elementsToBeDeleted = this.FindColorElements(x, y, subtype);
                if (elementsToBeDeleted.length >= this.settings.MinimumTileToDestroy) {
                    return true;
                }
            }
        }
        return false;
    }

    private async ShuffleTiles() {
        const rows = this.model.Grid.length;
        const cols = this.model.Grid[0].length;

        const tiles = [];
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                tiles.push(this.model.Grid[x][y]);
            }
        }

        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        let index = 0;
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                this.model.SetTile(x, y, tiles[index++])
            }
        }

        const createPromises: Promise<void>[] = [];

        for (var i = 0; i < this.model.Grid.length; i++) {
            for (var j = 0; j < this.model.Grid[i].length; j++) {
                var x = this.model.Grid[i][j].X;
                var y = this.model.Grid[i][j].Y;
                var type = this.model.Grid[i][j].Type;
                let subtype = this.model.Grid[i][j].Subtype;
                createPromises.push(this.view.CreateBlock(x, y, type, subtype));
            }
        }
        await Promise.all(createPromises);

        await this.CheckShuffle();
    }
}

export class GridPoint {
    private x: number;
    private y: number;

    public get X(): number {
        return this.x;
    }
    public get Y(): number {
        return this.y;
    }
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}