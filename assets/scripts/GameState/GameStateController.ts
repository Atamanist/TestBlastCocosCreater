import { GameStateView } from './GameStateView';
import { IInitializable } from "db://assets/scripts/IInitializable";

export class GameStateController implements IInitializable {

    private view: GameStateView;
    private isCanMove: boolean;

    public get IsCanMove(): boolean {
        return this.isCanMove;
    }

    public set IsCanMove(value: boolean) {
        this.isCanMove = value;
    }

    constructor(view: GameStateView) {
        this.view = view;
    }

    LoseGame(): void {
        this.view.SetText("GAMELOSE");
        this.isCanMove = false;
    }

    WinGame(): void {
        this.view.SetText("GAME WIN");
        this.isCanMove = false;
    }

    Init(): void {
        this.view.SetText("");
        this.isCanMove = true;
    }
}


