import Phaser from "phaser"

export default class CongratsScene extends Phaser.Scene {

constructor(){
super("CongratsScene")
}

/* nhận scene tiếp theo */

init(data){
this.nextScene = data?.nextScene
}

preload(){

this.load.image("bg","src/assets/bg_main.jpg")
this.load.image("banner_congrat","src/assets/banner_congrat.webp")

this.load.audio("correct_audio","src/assets/audio/Correct.mp3")

}

create(){

const screenWidth = this.scale.width
const screenHeight = this.scale.height

/* BACKGROUND */

const bg = this.add.image(screenWidth/2,screenHeight/2,"bg")

const scale = Math.max(
screenWidth/bg.width,
screenHeight/bg.height
)

bg.setScale(scale)

/* BANNER */

const banner = this.add.image(
screenWidth/2,
screenHeight/2-80,
"banner_congrat"
)

banner.setScale(0.8)

/* BANNER POP ANIMATION */

this.tweens.add({
targets: banner,
scale: 1,
duration: 400,
ease: "Back.easeOut"
})

/* PHÁT ÂM THANH CHÚC MỪNG */

if(this.sound && this.cache.audio.exists("correct_audio")){
this.sound.play("correct_audio")
}

/* CHUYỂN SCENE SAU 3s */

this.time.delayedCall(3000,()=>{

this.cameras.main.fadeOut(400,0,0,0)

this.cameras.main.once("camerafadeoutcomplete",()=>{

/* dùng nextScene */

if(!this.nextScene){
console.error("CongratsScene missing nextScene")
return
}

this.scene.start(this.nextScene)

})

})

}

}