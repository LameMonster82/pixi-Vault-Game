import {Ticker} from "pixi.js";


let timeTrack: number = 0;
Ticker.shared.add(function (delta) {
    timeTrack += delta;
    console.log(timeTrack)
})

console.log(Ticker.shared.started);
