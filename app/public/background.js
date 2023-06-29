var angle = 0

var changeBackground = function (){
  angle = angle + 0.5
  document.body.style.backgroundImage = "linear-gradient(" + angle + "deg, #6008AA, #EFB274)"
  
  requestAnimationFrame(changeBackground)
}

changeBackground()