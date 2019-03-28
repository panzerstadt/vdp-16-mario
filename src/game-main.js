import {startGame, vdp} from "../lib/vdp-lib";
import {clamp, getMapBlock, setMapBlock} from './utils';
// what these do
// every 

const collidesAtPosition = (left, top) => getMapBlock("level1", Math.floor(left / 16), Math.floor(top / 16)) === 38

function *main() {
	const mario = {
		left: 0,
		top: 0,
		width: 16,
		height: 16,
		horizontalVelocity: 0,
		verticalVelocity: 0,
		get right() {return this.left + this.width},
		get bottom() {return this.top + this.height},
		hasJumped: false
	}
	const camera = {
		left: 0,
		top: 0

	}

	const input = vdp.input
	vdp.configBackdropColor('#59f');  // no named color, only #rgb

	let counter = 0
	while (true) {
		const lineTransform = new vdp.LineTransformationArray();
		for (let line = 0; line < 256; line++) {
			const x = Math.sin((line + counter) / 20) * 10
			//lineTransform.translateLine(line, [x, 0])  // LSD
		}

		
		// vdp looks into everything in gfx folder
		vdp.drawBackgroundTilemap('level1', {scrollX: camera.left, lineTransform})
		vdp.drawObject(vdp.sprite("mario").tile(Math.floor(counter/8) % 3), mario.left - camera.left, mario.top, {width: mario.width, height: mario.height, flipH: mario.horizontalVelocity >= 0 ? false: true})

		vdp.drawObject(vdp.sprite("goomba").tile(3), 10,10)

		if (mario.left - camera.left > vdp.screenWidth / 2) {
			camera.left = mario.left - vdp.screenWidth/2
		}

		counter += 1
		const colors = [
			"#f00", "#f80", "#ff0", "#ff0", "#f80", "#f00"
		]

		const paletteData = vdp.readPalette("level1")
		paletteData.array[7] = vdp.color.make(colors[Math.floor(counter / 8) % colors.length])
		paletteData.array[5] = vdp.color.make(colors[Math.floor((counter + 3) / 8) % colors.length])
		vdp.writePalette('level1', paletteData)

		// line by line effects
		const colorArray = new vdp.LineColorArray(0,0)
		for (let line = 0; line < colorArray.length; line++) {
			// loop from top to bottom color
			colorArray.setLine(line, vdp.color.make(255, line, line*0.1))
		}
		vdp.configColorSwap([colorArray])

		// since we are in a loop, doing an integration
		// gravity == adding some constant to a velocity
		mario.verticalVelocity += 0.2

		// top bottom
		mario.top += mario.verticalVelocity;
		mario.top = Math.floor(mario.top)
		// pos of mario from top / 16 (tile size)
		// match pixel pos of mario with pixel pos of level1
		while (collidesAtPosition(mario.left, mario.bottom) || collidesAtPosition(mario.right, mario.bottom)) {
			mario.verticalVelocity = 0;
			mario.top -= 1;
		}

		while (collidesAtPosition(mario.left, mario.top) || collidesAtPosition(mario.right, mario.top)) {
			mario.verticalVelocity = 0;
			mario.top += 1;
		}

		// left right
		mario.left += mario.horizontalVelocity;
		mario.left = Math.floor(mario.left)
		while (collidesAtPosition(mario.left, mario.top) || collidesAtPosition(mario.left, mario.bottom)) {
			mario.horizontalVelocity = 0;
			mario.left += 1;
		}

		while (collidesAtPosition(mario.right, mario.top) || collidesAtPosition(mario.right, mario.bottom)) {
			mario.horizontalVelocity = 0;
			mario.left -= 1;
		}

		// if (input.isDown(input.Key.Up)) {
		// 	mario.top -= 1;
		// }
		// if (input.isDown(input.Key.Down)) {
		// 	mario.top += 1;
		// }
		if (input.isDown(input.Key.Left)) {
			mario.horizontalVelocity -= 0.1;
		} else
		if (input.isDown(input.Key.Right)) {
			mario.horizontalVelocity += 0.1;
		} else {
			mario.horizontalVelocity = 0
		}

		if (input.hasToggledDown(input.Key.Up) && !mario.hasJumped) {
			// this is a jump, its not a normal velocity
			// it should be an impulse, which is a velocity
			mario.hasJumped = true
			mario.verticalVelocity -= 5
		}
		if (mario.verticalVelocity === 0) {
			mario.hasJumped = false
		}
		

		
		yield;
	}
}

startGame('#glCanvas', vdp => main(vdp));
