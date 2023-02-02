import * as PIXI from "pixi.js";
import {Container, Sprite} from "pixi.js";
import {finishRotatingWheels, KeyDirections, secretWheelCombo, secretWheels, wheelIndex} from "./passcodeWheels";
import {loadImageToContainer} from "./utilities";

export let handleSprite: Sprite;

function rotateHandle(event: PIXI.FederatedPointerEvent) {
    if (event.buttons === 1) {
        if (secretWheelCombo[wheelIndex].tweenAnim != undefined) {
            // @ts-ignore
            secretWheelCombo[wheelIndex].tweenAnim.kill();
        }

        let newRotation = (Math.PI / 180) * event.movementX;
        secretWheels[wheelIndex].children[0].rotation += newRotation;
        secretWheelCombo[wheelIndex].rotation += newRotation;


        if (newRotation > 0) {
            let shieldSprite = secretWheels[wheelIndex].children[1] as PIXI.Sprite;
            shieldSprite.texture = PIXI.Assets.get("wheelShieldRight");
            secretWheelCombo[wheelIndex].direction = KeyDirections.Right;
        } else if (newRotation < 0) {
            let shieldSprite = secretWheels[wheelIndex].children[1] as PIXI.Sprite;
            shieldSprite.texture = PIXI.Assets.get("wheelShieldLeft");
            secretWheelCombo[wheelIndex].direction = KeyDirections.Left;
        }

        handleSprite.rotation += newRotation;
    } else {
        finishRotatingWheels(wheelIndex);
    }
}

export function SetupHandle(handle: string, handleShadow: string, handleContainer: Container): Sprite {
    handleSprite = loadImageToContainer(handleShadow, 0, 0, 9, handleContainer);
    let handleSpriteReal = loadImageToContainer(handle, -10, -12, 3.9, handleSprite);

    handleSpriteReal.position.set(-10, -12);


    handleSprite.hitArea = new PIXI.Rectangle(-window.innerWidth / 2, -window.innerHeight / 2, window.innerWidth, window.innerHeight);
    handleSprite.interactive = true;
    handleSprite.on('pointermove', rotateHandle);
    return handleSprite
}