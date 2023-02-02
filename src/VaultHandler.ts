import {
    finalizeComboWheels,
    KeyDescriptor,
    KeyDirections,
    randomCombo,
    secretWheelCombo,
    secretWheels
} from "./passcodeWheels";
import * as PIXI from "pixi.js";
import {Application, Container} from "pixi.js";
import {resetTimer, startGameTimer, stopGameTimer} from "./counter";
import {gsap} from "gsap";
import {handleSprite} from "./handleHandler";

let pixiApp: Application;
let endGameTimeKeeper = 0;
let backgroundContainer: Container;
let handleContainer: Container;
let endScreenContainer: Container;
let secretComboAnswer: KeyDescriptor[];

async function tryOpenVault() {
    for (let i = 0; i < secretWheelCombo.length; i++) {
        finalizeComboWheels(i);
    }

    if (checkCombo()) {
        let vaultDoor = backgroundContainer.children.find(value => value.name === "doorClosed") as PIXI.Sprite;
        vaultDoor.texture = await PIXI.Assets.load("doorOpened");
        vaultDoor.position.set(window.innerWidth / 2 + window.innerWidth / 4, window.innerHeight / 2);
        vaultDoor.name = "doorOpened";

        pixiApp.stage.removeChild(handleContainer);
        secretWheels.forEach(value => pixiApp.stage.removeChild(value));

        pixiApp.stage.addChild(endScreenContainer);
        stopGameTimer();

        pixiApp.ticker.add(resetAfterWin);
    } else {
        secretComboAnswer = resetVault();
        console.log(secretComboAnswer);
    }
}

function resetVault(): KeyDescriptor[] {
    for (let j = 0; j < secretWheelCombo.length; j++) {
        //secretWheels[j].children[0].rotation = 0;
        secretWheelCombo[j].secretKey = 1;
        secretWheelCombo[j].direction = KeyDirections.Left;
        secretWheelCombo[j].rotation = 0;
        if (secretWheelCombo[j].tweenAnim != undefined) {
            // @ts-ignore
            secretWheelCombo[j].tweenAnim.kill()
        }

        secretWheelCombo[j].tweenAnim = gsap.to(secretWheels[j].children[0] as PIXI.Sprite, {
            pixi: {rotation: 0},
            duration: 1
        });

        let shieldSprite = secretWheels[j].children[1] as PIXI.Sprite;
        shieldSprite.texture = PIXI.Assets.get("wheelShield");
    }
    gsap.to(handleSprite, {pixi: {rotation: 999}, duration: 1});
    startGameTimer();
    resetTimer();
    return randomCombo(secretWheelCombo.length);
}

async function resetAfterWin() {
    endGameTimeKeeper += pixiApp.ticker.deltaMS / 1000;
    if (endGameTimeKeeper >= 5) {
        let door = backgroundContainer.children.find(value => value.name === "doorOpened") as PIXI.Sprite;
        door.texture = await PIXI.Assets.load("doorClosed");
        door.position.set(window.innerWidth / 2 + 28, window.innerHeight / 2 - 12);
        door.name = "doorClosed";

        pixiApp.stage.addChild(handleContainer);
        secretWheels.forEach(value => pixiApp.stage.addChild(value));

        pixiApp.stage.removeChild(endScreenContainer);

        pixiApp.ticker.remove(resetAfterWin);
        secretComboAnswer = resetVault();
        endGameTimeKeeper = 0;
        resetTimer();

        console.log(secretComboAnswer);
    }
}

function checkCombo(): boolean {
    for (let i = 0; i < secretWheelCombo.length; i++) {
        if (secretWheelCombo[i].secretKey != secretComboAnswer[i].secretKey ||
            secretWheelCombo[i].direction != secretComboAnswer[i].direction) {
            console.log("WRONG " + i);
            return false;
        }
    }
    console.log("Good");
    return true;
}

export function setupVault(enterCodeButton: string,
                           background: Container, handle: Container,
                           endScreen: Container, application: Application) {
    backgroundContainer = background;
    handleContainer = handle;
    endScreenContainer = endScreen;
    pixiApp = application;

    secretComboAnswer = randomCombo(3);
    console.log(secretComboAnswer);

    let buttonSprite: PIXI.Sprite = PIXI.Sprite.from(enterCodeButton);
    buttonSprite.position.set(window.innerWidth / 2 + window.innerWidth / 4, window.innerHeight / 2);
    buttonSprite.anchor.set(0.5, 0.5);
    buttonSprite.interactive = true;
    buttonSprite.on('pointerdown', tryOpenVault);

    secretWheels.push(buttonSprite);
    pixiApp.stage.addChild(buttonSprite);

}