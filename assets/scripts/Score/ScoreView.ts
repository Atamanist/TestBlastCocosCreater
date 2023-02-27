import { _decorator, Component, Node, RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreView')
export class ScoreView extends Component {
    @property({ type: [RichText] })
    private text: RichText;

    SetText(text:string):void{
        this.text.string=text;
    }
}


