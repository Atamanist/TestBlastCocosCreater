import { ScoreModel } from './ScoreModel';
import { ScoreView } from './ScoreView';
import{ScoreSettings} from './ScoreSettings';
import { GameStateController } from "db://assets/scripts/GameState/GameStateController";
import { IInitializable } from "db://assets/scripts/IInitializable";

export class ScoreController implements IInitializable{

    private model: ScoreModel;
    private view: ScoreView;
    private settings: ScoreSettings;
    private gameStateController:GameStateController;

    constructor(model: ScoreModel, view: ScoreView, settings: ScoreSettings,gameStateController:GameStateController) {
        this.model = model;
        this.view = view;
        this.settings = settings;
        this.gameStateController=gameStateController;
    }

    public Init(): void {
        this.view.SetText("Score "+this.model.Score);
    }

    public AddScore(score:number):void{
        this.model.Score=this.model.Score+score;
        this.view.SetText("Score "+this.model.Score);
        if(this.model.Score>this.settings.FinishScore)
        {
            this.gameStateController.WinGame();
        }
    }
}