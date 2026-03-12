export default function enableDevTools(scene){

    if(!import.meta.env.DEV) return

    scene.input.keyboard.on("keydown-ONE", ()=>{
        scene.scene.start("IntroScene")
    })

    scene.input.keyboard.on("keydown-TWO", ()=>{
        scene.scene.start("TraceBallScene")
    })

    scene.input.keyboard.on("keydown-THREE", ()=>{
        scene.scene.start("TrangBaScene")
    })

    scene.input.keyboard.on("keydown-FOUR", ()=>{
        scene.scene.start("TraceTrangBa")
    })
    scene.input.keyboard.on("keydown-FIVE", ()=>{
        scene.scene.start("EndScene")
    })
}