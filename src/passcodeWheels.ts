import {gsap} from "gsap";
import * as PIXI from "pixi.js";
import {Application, Container} from "pixi.js";
import {handleSprite} from "./handleHandler";
import {closestNumber, roundDown} from "./utilities";

export enum KeyDirections {
    Left = "Left",
    Right = "Right"
}

export interface KeyDescriptor {
    secretKey: number;
    direction: KeyDirections;
    rotation: number;
    tweenAnim?: gsap.core.Tween;
}

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 56,
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
});

export let wheelIndex = 0;
export let secretWheelCombo: KeyDescriptor[] = [
    {secretKey: 1, direction: KeyDirections.Left, rotation: 0},
    {secretKey: 1, direction: KeyDirections.Left, rotation: 0},
    {secretKey: 1, direction: KeyDirections.Left, rotation: 0},
]
export const secretWheels: PIXI.Container[] = [];

export function randomCombo(keyComboLenght: number): KeyDescriptor[] {
    let answer: KeyDescriptor[] = [];
    for (let i = 0; i < keyComboLenght; i++) {
        let randomCombo: KeyDescriptor = {
            secretKey: Math.floor(Math.random() * 9) + 1,
            direction: Math.round(Math.random()) == 0 ? KeyDirections.Left : KeyDirections.Right,
            rotation: 0,
        };
        answer.push(randomCombo)
    }

    return answer;
}

export function createComboWheel(radius: number, x: number, y: number): PIXI.Container {
    let newWheel: PIXI.Container = new PIXI.Container();
    newWheel.pivot.set(window.innerWidth / 2, window.innerHeight / 2);
    newWheel.position.set(x, y);

    for (let i = 0; i < 9; i++) {
        let text = new PIXI.Text(i + 1, style);
        let radiant = (40 * i + 260) * Math.PI / 180;
        let xcord = radius * Math.cos(radiant);
        let ycord = radius * Math.sin(radiant);

        xcord += window.innerWidth / 2;
        ycord += window.innerHeight / 2;
        //console.log(window.innerHeight)
        text.position.set(xcord, ycord);
        text.rotation = radiant + Math.PI / 2;
        newWheel.addChild(text)
    }
    newWheel.calculateBounds();
    return newWheel;
}

export function finalizeComboWheels(index: number) {
    let degrees = secretWheelCombo[index].rotation * 180 / Math.PI;

    let newDegrees = closestNumber(degrees, 40);
    handleSprite.rotation = (Math.PI / 180) * newDegrees;
    if (newDegrees > 0) {
        newDegrees = -(360 - newDegrees);
    }
    if (secretWheelCombo[index].tweenAnim != undefined) {
        // @ts-ignore
        secretWheelCombo[index].tweenAnim.kill();
    }

    secretWheelCombo[index].tweenAnim = gsap.to(secretWheels[index].children[0] as PIXI.Sprite, {
        pixi: {rotation: newDegrees},
        duration: 1
    });
    console.log(degrees);
    //secretWheels[index].children[0].rotation = (Math.PI / 180) * newDegrees;

    let key = ((Math.abs(degrees) + 40) / 40) - roundDown((Math.abs(degrees) + 40) / 40, 9);
    if (key === 0)
        key = 9; //Edge case

    secretWheelCombo[index].secretKey = Math.round(key);
}

export function setupComboWheels(wheelRadius: number, secretWheels: Container[], app: Application) {
    PIXI.Assets.load(["wheelShield", "wheelShieldLeft", "wheelShieldRight"]).then(texture => {
        for (let i = -1; i < 2; i++) {
            let wheelContainer = new PIXI.Container();

            let positionx = window.innerWidth / 2 + (window.innerWidth / 4 * i);
            let positiony = window.innerHeight / 2 - window.innerHeight / 3;
            let secretWheelText = createComboWheel(wheelRadius, positionx,
                positiony);
            //secretWheelText.pivot.set(positionx,positiony);

            wheelContainer.pivot.set(positionx, positiony);
            wheelContainer.position.set(positionx, positiony);
            wheelContainer.interactive = true;
            wheelContainer.on('pointerdown', function () {
                wheelIndex = (i + 1);
            })

            let wheelShield: PIXI.Sprite = PIXI.Sprite.from(texture.wheelShield);
            wheelShield.position.set(positionx, positiony);
            wheelShield.anchor.set(0.5, 0.5);
            //wheelShield.position.set(positionx,positiony);
            wheelShield.scale.set(1.25);


            //wheelShield.pivot.set(0.5,0.5);

            wheelContainer.addChild(secretWheelText, wheelShield);

            //secretWheelText.position.set(0,0);
            secretWheels.push(wheelContainer);
        }

        secretWheels.forEach(value => app.stage.addChild(value))
    });
}