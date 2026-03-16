import Phaser from "phaser";
import { SceneBase } from "../SceneBase";
import { SceneKeys } from "../../consts/Keys";

export class TraceScene extends SceneBase {
    constructor() {
        super("TraceScene");
    }
    
    create() {
        super.create();
        this.add.text(this.scale.width / 2, this.scale.height / 2, "TraceScene", { fontSize: '48px', color: '#000' }).setOrigin(0.5);
    }
}
