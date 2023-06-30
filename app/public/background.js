let angle = 0

let changeBackground = function (){
  angle = angle + 0.2
  document.body.style.backgroundImage = "linear-gradient(" + angle + "deg, #d8e2dc, #ece4db)"
  
  requestAnimationFrame(changeBackground)
}

changeBackground()