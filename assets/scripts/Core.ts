import {BlocksModel} from "db://assets/scripts/Blocks/BlocksModel";
import {BlocksView} from "db://assets/scripts/Blocks/BlocksView";
import {BlocksController} from "db://assets/scripts/Blocks/BlocksController";
import {BlocksSettings} from "db://assets/scripts/Blocks/BlocksSettings";
import { GameStateController } from "db://assets/scripts/GameState/GameStateController";
import { GameStateView } from "db://assets/scripts/GameState/GameStateView";
import { ScoreView } from "db://assets/scripts/Score/ScoreView";
import { ScoreModel } from "db://assets/scripts/Score/ScoreModel";
import { ScoreController} from "db://assets/scripts/Score/ScoreController";
import { ScoreSettings } from "db://assets/scripts/Score/ScoreSettings";
import { IInitializable } from './IInitializable';
import { _decorator, Component, Node, director, Prefab, instantiate } from 'cc';
import { StartSceneView } from "./Scene/StartSceneView";
const { ccclass, property } = _decorator;

@ccclass('Core')
export class Core extends Component {

    @property
    private height : number = 8;
    @property
    private width: number  = 8;
    @property
    private minimumTileToDestroy:number=2;
    @property
    private shuffleCount:number=5;
    @property
    private availableTurns:number=20;
    @property
    private minimumTileToBomb: number=5;
    @property
    private bombRadius: number=2;
    @property
    private startScore: number=0;
    @property
    private finishScore: number=20;

    @property({ type: BlocksView})
    private blocksView:BlocksView;
    @property({ type: GameStateView})
    private gameStateView:GameStateView;
    @property({ type: ScoreView})
    private scoreView:ScoreView;

    private blocksModel:BlocksModel;
    private blocksController:BlocksController;
    private blocksSettings:BlocksSettings;

    private scoreModel:ScoreModel;
    private scoreController:ScoreController;
    private scoreSettings:ScoreSettings;

    private gameStateController:GameStateController;

    private initializables: IInitializable[]=[];

    start() {
        this.InitGameScene();
    }


    public LoadGameScene(){
        director.preloadScene("GameScene", function () {
            this.InitGameScene();
            director.loadScene("GameScene");
        });
    }


    InitGameScene() {
        this.CreateSettings();
        this.CreateModels();
        this.CreateControllers();
        this.Init();
    }

    private CreateSettings():void{
        this.scoreSettings=new ScoreSettings(this.startScore,this.finishScore);
        this.blocksSettings=new BlocksSettings(this.minimumTileToDestroy,this.shuffleCount,this.availableTurns,this.minimumTileToBomb,this.bombRadius);
    }

    private CreateModels():void{
        this.blocksModel=new BlocksModel(this.width,this.height);
        this.scoreModel=new ScoreModel(this.startScore);
    }

    private CreateControllers():void{
        this.gameStateController=new GameStateController(this.gameStateView);
        this.initializables.push(this.gameStateController);
        this.scoreController=new ScoreController(this.scoreModel,this.scoreView,this.scoreSettings,this.gameStateController);
        this.initializables.push(this.scoreController);
        this.blocksController=new BlocksController(this.blocksModel,this.blocksView,this.blocksSettings,this.scoreController,this.gameStateController);
        this.initializables.push(this.blocksController);
    }

    private Init():void{
        this.initializables.forEach(element => {
            element.Init();
        });
    }
}


