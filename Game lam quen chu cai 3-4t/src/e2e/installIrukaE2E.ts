import { game } from "@iruka-edu/mini-game-sdk"
import { __testSpy } from "@iruka-edu/mini-game-sdk"

declare global {
  interface Window {
    __irukaSpy?: any
    __irukaTest?: any
  }
}
export function installIrukaE2E(sdk:any){

const qs = new URLSearchParams(window.location.search)

if(qs.get("e2e") !== "true") return

const spy = __testSpy

if(spy?.enable){

spy.enable()

window.__irukaSpy = spy

}

window.__irukaTest = {

makeCorrect(n=1){

for(let i=0;i<n;i++){

game.recordCorrect({scoreDelta:1})

}

const snap = game.getStatsSnapshot()

sdk.score(snap.finalScore)

},

makeWrong(n=1){

for(let i=0;i<n;i++){

game.recordWrong()

}

},

finish(){

game.finalizeAttempt()

const submit = game.prepareSubmitData()

sdk.complete({

score:submit.finalScore,

timeMs:1000,

extras:{
reason:"e2e",
stats:submit
}

})

}

}

}