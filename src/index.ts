import * as PIXI from 'pixi.js';
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {setupTimer} from "./counter";
import {secretWheels, SetupWheels} from "./passcodeWheels";
import {SetupHandle} from "./handleHandler";
import {loadImageToContainer} from "./utilities";
import {setupVault} from "./VaultHandler";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const app: PIXI.Application = new PIXI.Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: window.innerWidth,
    height: window.innerHeight
});

const backgroundContainer = new PIXI.Container();
const handleContainer = new PIXI.Container();
const endScreen = new PIXI.Container();
let wheelRadius = 120;

app.stage.addChild(backgroundContainer);
app.stage.addChild(handleContainer);


PIXI.Assets.add("background", "bg.png");
PIXI.Assets.add("doorClosed", "door.png");
PIXI.Assets.add("doorOpened", "doorOpen.png");
PIXI.Assets.add("handle", "handle.png");
PIXI.Assets.add("handleShadow", "handleShadow.png");
PIXI.Assets.add("wheelShield", "wheelShield.png");
PIXI.Assets.add("wheelShieldLeft", "wheelShieldLeft.png");
PIXI.Assets.add("wheelShieldRight", "wheelShieldRight.png");
PIXI.Assets.add("enterCodeButton", "enterCode.png");
PIXI.Assets.add("glitter", "blink.png");


PIXI.Assets.load(["background", "doorClosed", "handle", "handleShadow", "enterCodeButton", "glitter"]).then(bgTexture => {
    loadImageToContainer(bgTexture.background, 0, 0, 1, backgroundContainer);
    loadImageToContainer(bgTexture.doorClosed, 28, -12, 3, backgroundContainer);

    SetupHandle(bgTexture.handle, bgTexture.handleShadow, handleContainer);

    loadImageToContainer(bgTexture.glitter, -160, -40, 10, endScreen);
    loadImageToContainer(bgTexture.glitter, -120, 160, 10, endScreen);
    loadImageToContainer(bgTexture.glitter, 160, 80, 10, endScreen);

    let endText = new PIXI.Text("You WIN!!", new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 128,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
        align: 'center',
    }));
    endText.anchor.set(0.5, 0.5);
    endText.position.set(window.innerWidth / 2, window.innerHeight / 2 - window.innerHeight / 3);
    endScreen.addChild(endText);

    setupVault(bgTexture.enterCodeButton, backgroundContainer, handleContainer, endScreen, app);
    //console.log(backgroundContainer);
});

SetupWheels(wheelRadius, secretWheels, app);
setupTimer(app);