import { _decorator, Component, Node, Button, director } from 'cc';
import { Core } from '../Core';
const { ccclass, property } = _decorator;

@ccclass('StartSceneView')
export class StartSceneView extends Component {

    @property({ type: [Button] })
    private startButton: Button;

    start() {
        this.OnStartClick();
    }

    public OnStartClick() {
        this.startButton.node.on(Button.EventType.CLICK,function (event) {
            director.preloadScene("GameScene", function () {
                director.loadScene("GameScene");
            });
        }, this); 
    }
}


