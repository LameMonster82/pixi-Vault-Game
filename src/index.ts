import {Application, Assets, Container, FederatedPointerEvent, Rectangle, Sprite, Text, TextStyle,} from 'pixi.js'

const app: Application = new Application({
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: 0x6495ed,
	width: window.innerWidth,
	height: window.innerHeight
});

enum KeyDirections {
	Left = "Left",
	Right = "Right"
}
interface keyCombo {
	secretKey: number;
	direction: KeyDirections;
}



const backgroundContainer = new Container();
app.stage.addChild(backgroundContainer);
let handleSprite: Sprite;
const secretWheels: Container[] = [];
const handleContainer = new Container();
app.stage.addChild(handleContainer);
const endScreen = new Container();
let wheelRadius = 120;
let wheelIndex = 0;
const keyComboCount = 3;
let keyComboAnswer: keyCombo[] = CreateRandomKeyCombo(keyComboCount);
let secretWheelCombo: keyCombo[] = [
	{secretKey: 1, direction: KeyDirections.Left},
	{secretKey: 1, direction: KeyDirections.Left},
	{secretKey: 1, direction: KeyDirections.Left},

]

console.log(keyComboAnswer);

function CreateRandomKeyCombo(keyComboLenght: number): keyCombo[]  {
	let answer: keyCombo[] = [];
	for (let i = 0; i < keyComboLenght; i++) {
		let randomCombo: keyCombo = {
			secretKey: Math.floor(Math.random() * 9) + 1,
			direction: Math.round(Math.random()) == 0 ? KeyDirections.Left : KeyDirections.Right};
		answer.push(randomCombo)
	}

	return answer;
}

function loadImageToContainer(image: string, xoffset: number, yoffset: number, scale: number, container: Container): Sprite {
	//console.log(image)
	let imageSprite: Sprite = Sprite.from(image);
	imageSprite.position.set(app.screen.width/2 + xoffset, app.screen.height/2 + yoffset );
	imageSprite.anchor.set(0.5);
	imageSprite.scale.set(
		Math.max(app.screen.width / imageSprite.texture.width, app.screen.height / imageSprite.texture.height)
		/ scale
	);
	// @ts-ignore
	imageSprite.name = image.textureCacheIds[1];
	container.addChild(imageSprite);

	return imageSprite;
}

const style = new TextStyle({
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


function createPasscodeWheels(radius: number, x: number, y: number): Container {
	let newWheel: Container = new Container();
	newWheel.pivot.set(window.innerWidth / 2, window.innerHeight / 2);
	newWheel.position.set(x, y);

	for (let i = 0; i < 9; i++) {
		let text = new Text(i + 1, style);
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

function rotateHandle(event: FederatedPointerEvent) {
	if(event.buttons === 1 ) {
		let newRotation = (Math.PI / 180) * event.movementX;
		secretWheels[wheelIndex].children[0].rotation += newRotation;

		if(newRotation > 0) {
			let shieldSprite = secretWheels[wheelIndex].children[1] as Sprite;
			shieldSprite.texture = Assets.get("wheelShieldRight");
			secretWheelCombo[wheelIndex].direction = KeyDirections.Right;
		} else if (newRotation < 0) {
			let shieldSprite = secretWheels[wheelIndex].children[1] as Sprite;
			shieldSprite.texture = Assets.get("wheelShieldLeft");
			secretWheelCombo[wheelIndex].direction = KeyDirections.Left;
		}

		handleSprite.rotation += newRotation;
	} else {
		let degrees = secretWheels[wheelIndex].children[0].rotation * 180/Math.PI;
		let newDegrees = closestNumber(degrees, 40);
		handleSprite.rotation = (Math.PI / 180) * newDegrees;
		if(newDegrees > 0) {
			newDegrees = -(360 - newDegrees);
		}
		secretWheels[wheelIndex].children[0].rotation = (Math.PI / 180) * newDegrees;

		let key = ((Math.abs(degrees) + 40) / 40) - roundDown((Math.abs(degrees) + 40) / 40, 9);
		if(key === 0)
			key = 9; //Edge case

		secretWheelCombo[wheelIndex].secretKey = Math.round(key);
		console.log(newDegrees + " " + key);
	}
}

function finishRotatingWheels(index: number) {
	let degrees = secretWheels[index].children[0].rotation * 180/Math.PI;
	let newDegrees = closestNumber(degrees, 40);
	handleSprite.rotation = (Math.PI / 180) * newDegrees;
	if(newDegrees > 0) {
		newDegrees = -(360 - newDegrees);
	}
	secretWheels[index].children[0].rotation = (Math.PI / 180) * newDegrees;

	let key = ((Math.abs(degrees) + 40) / 40) - roundDown((Math.abs(degrees) + 40) / 40, 9);
	if(key === 0)
		key = 9; //Edge case

	secretWheelCombo[index].secretKey = Math.round(key);
}

function closestNumber(n: number, m: number) {
	return Math.round(n/m) * m;
}

function roundDown(n: number, m: number) {
	return Math.floor(n/m) * m;
}

function checkCode(): boolean {
	for (let i = 0; i < keyComboCount; i++) {
		if(secretWheelCombo[i].secretKey != keyComboAnswer[i].secretKey ||
			secretWheelCombo[i].direction != keyComboAnswer[i].direction) {
			console.log("WRONG " + i);

			console.log(keyComboAnswer);
			return false;
		}
	}
	console.log("Good");
	return true;
}

async function openVault() {
	for (let i = 0; i < keyComboCount; i++) {
		finishRotatingWheels(i);
	}

	if (checkCode() || true) {
		let door = backgroundContainer.children.find(value => value.name === "doorClosed") as Sprite;
		door.texture = await Assets.load("doorOpened");
		door.position.set(window.innerWidth / 2 + window.innerWidth / 4, window.innerHeight / 2);

		app.stage.removeChild(handleContainer);
		secretWheels.forEach(value => app.stage.removeChild(value));

		app.stage.addChild(endScreen);
	} else {
		for (let j = 0; j < keyComboCount; j++) {
			secretWheels[j].children[0].rotation = 0;
			secretWheelCombo[j].secretKey = 1;
			secretWheelCombo[j].direction = KeyDirections.Left;

			let shieldSprite = secretWheels[j].children[1] as Sprite;
			shieldSprite.texture = Assets.get("wheelShield");
		}
		keyComboAnswer = CreateRandomKeyCombo(keyComboCount);
	}
}

Assets.add("background", "bg.png");
Assets.add("doorClosed", "door.png");
Assets.add("doorOpened", "doorOpen.png");
Assets.add("handle", "handle.png");
Assets.add("handleShadow", "handleShadow.png");
Assets.add("wheelShield","wheelShield.png");
Assets.add("wheelShieldLeft","wheelShieldLeft.png");
Assets.add("wheelShieldRight","wheelShieldRight.png");
Assets.add("enterCodeButton", "enterCode.png");
Assets.add("glitter", "blink.png");


Assets.load(["background", "doorClosed", "handle", "handleShadow", "enterCodeButton", "glitter"]).then(bgTexture => {
	loadImageToContainer(bgTexture.background, 0, 0, 1, backgroundContainer);
	loadImageToContainer(bgTexture.doorClosed, 28, -12, 3, backgroundContainer);
	handleSprite = loadImageToContainer(bgTexture.handleShadow, 0, 0, 9, handleContainer);
	let handleSpriteReal = loadImageToContainer(bgTexture.handle, -10, -12, 3.9, handleSprite);

	handleSpriteReal.position.set(-10,-12);

	handleSprite.hitArea = new Rectangle(-window.innerWidth / 2,-window.innerHeight / 2, window.innerWidth, window.innerHeight);
	handleSprite.interactive = true;
	handleSprite.on('pointermove', rotateHandle);

	let buttonSprite: Sprite = Sprite.from(bgTexture.enterCodeButton);
	buttonSprite.position.set(window.innerWidth / 2 + window.innerWidth / 4,window.innerHeight / 2);
	buttonSprite.anchor.set(0.5,0.5);
	buttonSprite.interactive = true;
	buttonSprite.on('pointerdown', openVault);

	secretWheels.push(buttonSprite);
	app.stage.addChild(buttonSprite);

	loadImageToContainer(bgTexture.glitter, -160, -40 ,10, endScreen );
	loadImageToContainer(bgTexture.glitter, -120, 160 ,10, endScreen );
	loadImageToContainer(bgTexture.glitter, 160, 80 ,10, endScreen );

	let endText = new Text("You WIN!!", new TextStyle({
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
	endText.anchor.set(0.5,0.5);
	endText.position.set(window.innerWidth / 2, window.innerHeight / 2 - window.innerHeight / 3);
	endScreen.addChild(endText);
	//console.log(backgroundContainer);
});

Assets.load(["wheelShield", "wheelShieldLeft", "wheelShieldRight"]).then(texture => {
	for (let i = -1; i < 2; i++) {
		let wheelContainer = new Container();

		let positionx = window.innerWidth / 2 + (window.innerWidth / 4 * i) ;
		let positiony = window.innerHeight / 2 - window.innerHeight / 3;
		let secretWheelText = createPasscodeWheels(wheelRadius, positionx,
			positiony);
		//secretWheelText.pivot.set(positionx,positiony);

		wheelContainer.pivot.set(positionx, positiony);
		wheelContainer.position.set(positionx, positiony);
		wheelContainer.interactive = true;
		wheelContainer.on('pointerdown', function (){
			wheelIndex = (i + 1);
		})

		let wheelShield: Sprite = Sprite.from(texture.wheelShield);
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