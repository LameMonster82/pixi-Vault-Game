import * as PIXI from "pixi.js";

export function loadImageToContainer(image: string, xoffset: number, yoffset: number, scale: number, container: PIXI.Container): PIXI.Sprite {
    //console.log(image)
    let imageSprite: PIXI.Sprite = PIXI.Sprite.from(image);
    imageSprite.position.set(window.innerWidth / 2 + xoffset, window.innerHeight / 2 + yoffset);
    imageSprite.anchor.set(0.5);
    imageSprite.scale.set(
        Math.max(window.innerWidth / imageSprite.texture.width, window.innerHeight / imageSprite.texture.height)
        / scale
    );
    // @ts-ignore
    imageSprite.name = image.textureCacheIds[1];
    container.addChild(imageSprite);

    return imageSprite;
}

export function closestNumber(n: number, m: number) {
    return Math.round(n / m) * m;
}

export function roundDown(n: number, m: number) {
    return Math.floor(n / m) * m;
}