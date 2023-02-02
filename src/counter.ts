import * as PIXI from "pixi.js";

let timeText: PIXI.Text;
let timerInSeconds = 0;
let appCache: PIXI.Application;

export function setupTimer(app: PIXI.Application) {
    appCache = app;
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

    timeText = new PIXI.Text(0, style);
    timeText.position.set(window.innerWidth / 2 - window.innerWidth / 5, window.innerHeight / 2 - window.innerHeight / 17);
    timeText.anchor.set(0.5,0.5);
    addTimerToTicker();
    app.stage.addChild(timeText);
}

export function trackTime() {
    timerInSeconds += appCache.ticker.elapsedMS / 1000;
    timeText.text = new Date(timerInSeconds * 1000).toISOString().slice(14, 19);
}

export function addTimerToTicker() {
    appCache.ticker.add(trackTime);
}

export function removeTimerToTicker() {
    appCache.ticker.remove(trackTime);
}

export function resetTimer() {
    timerInSeconds = 0;
}
