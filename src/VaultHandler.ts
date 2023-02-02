import {
    CreateRandomKeyCombo,
    finishRotatingWheels,
    KeyDescriptor,
    KeyDirections,
    secretWheelCombo,
    secretWheels
} from "./passcodeWheels";
import * as PIXI from "pixi.js";
import {Application, Container} from "pixi.js";
import {addTimerToTicker, removeTimerToTicker, resetTimer} from "./counter";
import {gsap} from "gsap";
import {handleSprite} from "./handleHandler";

let app: Application;
let endGameTimeoutSeconds = 0;
let backgroundContainer: Container;
let handleContainer: Container;
let endScreenContainer: Container;
let keyComboAnswer: KeyDescriptor[];

function openVault() {
    for (let i = 0; i < secretWheelCombo.length; i++) {
        finishRotatingWheels(i);
    }

    if (checkCode()) {
        let door = backgroundContainer.children.find(value => value.name === "doorClosed") as PIXI.Sprite;
        PIXI.Assets.load("doorOpened").then(value => door.texture = value.doorOpened);
        door.position.set(window.innerWidth / 2 + window.innerWidth / 4, window.innerHeight / 2);
        door.name = "doorOpened";

        app.stage.removeChild(handleContainer);
        secretWheels.forEach(value => app.stage.removeChild(value));

        app.stage.addChild(endScreenContainer);
        removeTimerToTicker();

        app.ticker.add(resetAfter);
    } else {
        keyComboAnswer = resetVault();
        console.log(keyComboAnswer);
    }
}

function resetVault(): KeyDescriptor[] {
    for (let j = 0; j < secretWheelCombo.length; j++) {
        //secretWheels[j].children[0].rotation = 0;
        secretWheelCombo[j].secretKey = 1;
        secretWheelCombo[j].direction = KeyDirections.Left;
        secretWheelCombo[j].rotation = 0;
        if(secretWheelCombo[j].tweenAnim != undefined) {
            // @ts-ignore
            secretWheelCombo[j].tweenAnim.kill()
        }

        secretWheelCombo[j].tweenAnim = gsap.to(secretWheels[j].children[0] as PIXI.Sprite, {pixi:{rotation: 0}, duration: 1});

        let shieldSprite = secretWheels[j].children[1] as PIXI.Sprite;
        shieldSprite.texture = PIXI.Assets.get("wheelShield");
    }
    gsap.to(handleSprite, {pixi: {rotation: 999}, duration: 1});
    addTimerToTicker();
    resetTimer();
    return CreateRandomKeyCombo(secretWheelCombo.length);
}

function resetAfter() {
    endGameTimeoutSeconds += app.ticker.deltaMS / 1000;
    if (endGameTimeoutSeconds >= 5) {
        let door = backgroundContainer.children.find(value => value.name === "doorOpened") as PIXI.Sprite;
        PIXI.Assets.load("doorClosed").then(value => door.texture = value.doorClosed);
        door.position.set(window.innerWidth / 2 + 28, window.innerHeight / 2 - 12);
        door.name = "doorClosed";

        app.stage.addChild(handleContainer);
        secretWheels.forEach(value => app.stage.addChild(value));

        app.stage.removeChild(endScreenContainer);

        app.ticker.remove(resetAfter);
        keyComboAnswer = resetVault();
        endGameTimeoutSeconds = 0;
        resetTimer();

        console.log(keyComboAnswer);
    }
}

function checkCode(): boolean {
    for (let i = 0; i < secretWheelCombo.length; i++) {
        if(secretWheelCombo[i].secretKey != keyComboAnswer[i].secretKey ||
            secretWheelCombo[i].direction != keyComboAnswer[i].direction) {
            console.log("WRONG " + i);
            return false;
        }
    }
    console.log("Good");
    return true;
}

export function setupVault(enterCodeButton: string,
    background: Container,handle: Container,
    endScreen: Container, application: Application)
{
    backgroundContainer = background;
    handleContainer = handle;
    endScreenContainer = endScreen;
    app = application;

    keyComboAnswer = CreateRandomKeyCombo(3);
    console.log(keyComboAnswer);

    let buttonSprite: PIXI.Sprite = PIXI.Sprite.from(enterCodeButton);
    buttonSprite.position.set(window.innerWidth / 2 + window.innerWidth / 4,window.innerHeight / 2);
    buttonSprite.anchor.set(0.5,0.5);
    buttonSprite.interactive = true;
    buttonSprite.on('pointerdown', openVault);

    secretWheels.push(buttonSprite);
    app.stage.addChild(buttonSprite);

}