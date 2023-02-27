import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneController')
export class SceneController extends Component {
    start() {

    }

    update(deltaTime: number) {
        director.loadScene("MyScene");
    }

    public LoadNextScene(){
        director.preloadScene("MyScene", function () {
            director.loadScene("Myscene");
        });
    }
}


