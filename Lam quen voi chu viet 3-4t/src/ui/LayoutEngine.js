export default class LayoutEngine {

constructor(scene, layout, designWidth, designHeight){

this.scene = scene
this.layout = layout

this.scaleX = scene.scale.width / designWidth
this.scaleY = scene.scale.height / designHeight

}

image(name, texture){

const item = this.layout[name]

const x = item.x * this.scaleX
const y = item.y * this.scaleY

const img = this.scene.add.image(x,y,texture)

if(item.scale){
img.setScale(item.scale * this.scaleX)
}

return img

}

}