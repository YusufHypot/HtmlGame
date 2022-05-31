var cvs = document.getElementById('canvas')
var ctx = cvs.getContext('2d')
cvs.width = innerWidth
cvs.height = innerHeight

var scoreDiv = document.getElementById('scoreDiv')
var scoreTxt = document.getElementById('score')
var panel = document.querySelector('.panel')
var bigScore = document.querySelector('.bigScore')
var startButton = document.querySelector('.button')
var scoreTable = document.querySelector('.scoreTable')
var playerScore = document.querySelector('.playerScore')
var startMenu = document.querySelector('.startMenu')

class Player {
  constructor(x, y, r, c) {
    this.x = x 
    this.y = y 
    this.r = r 
    this.c = c
  }
  draw() {
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
  }
}

class Projectile {
  constructor(x, y, r, c, velocity) {
    this.x = x 
    this.y = y 
    this.r = r 
    this.c = c
    this.velocity = velocity
  }
  draw() {
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
  }
  update() {
    this.draw()
    this.x += this.velocity.x 
    this.y += this.velocity.y 
  }
}

class Enemy {
  constructor(x, y, r, c, velocity) {
    this.x = x 
    this.y = y 
    this.r = r 
    this.c = c
    this.velocity = velocity
  }
  draw() {
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
  }
  update() {
    this.draw()
    this.x += this.velocity.x 
    this.y += this.velocity.y 
  }
}

class Particle {
  constructor(x, y, r, c, velocity) {
    this.x = x 
    this.y = y 
    this.r = r 
    this.c = c
    this.velocity = velocity
    this.alpha = 1
    this.friction = 0.99
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.restore()
  }
  update() {
    this.draw()
    this.velocity.x *= this.friction
    this.velocity.y *= this.friction
    this.x += this.velocity.x 
    this.y += this.velocity.y 
    this.alpha -= 0.01
  }
}

var x = cvs.width / 2
var y = cvs.height / 2 
var player = new Player(x, y, 10,"white")

var projectiles = []
var enemies = []
var particles = []
var save = []
var score = 0

function reset() {
  projectiles = []
  enemies = []
  particles = []
  score = 0 
  scoreTxt.innerHTML = score 
  bigScore.innerHTML = score 
}

var animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  ctx.fillStyle = "rgba(0,0,0,0.1)"
  ctx.fillRect(0,0,cvs.width,cvs.height)
  player.draw()
  
  spawnEnemySpeed()
  
  particles.forEach((particle,index) => {
    if(particle.alpha <= 0) {
      particles.splice(index, 1)
    }else {
      particle.update()
    }
  })
  
  projectiles.forEach((projectile,index) => {
    projectile.update()
    if(
      projectile.x + projectile.r < 0 ||
      projectile.x - projectile.r > cvs.width ||
      projectile.y + projectile.r < 0 ||
      projectile.y - projectile.r > cvs.height) {
        projectiles.splice(index, 1)
      }
  })
  enemies.forEach((enemy, index) => {
    enemy.update()
    
    var dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if(dist - player.r - enemy.r < 1) {
      cancelAnimationFrame(animationId)
      clearInterval(enemyTime)
      bigScore.innerHTML = score
      panel.style.display = "flex"
      
    }
    
    projectiles.forEach((projectile,projectileIndex) => {
      var dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y)
      if(dist - enemy.r - projectile.r < 1) {
        
        for(var i = 0; i < enemy.r * 0.5; i++){
          var r = Math.random() * 2 
          var velocity = {
            x: (Math.random() - 0.5) * (Math.random() * 8),
            y: (Math.random() - 0.5) * (Math.random() * 8),
          }
          particles.push(new Particle(projectile.x, projectile.y, r, enemy.c, velocity))
        }
        
        if(enemy.r - 10 > 10) {
          score += 50
          scoreTxt.innerHTML = score
          gsap.to(enemy, {r: enemy.r - 10})
          projectiles.splice(projectileIndex, 1)
        }else {
          score += 100
          scoreTxt.innerHTML = score
          enemies.splice(index, 1)
          projectiles.splice(projectileIndex, 1)
        }
      }
    })
  })
}

function spawnEnemySpeed() {
  if(score >= 1500 && score <= 3000) {
    speed = 2
  }else if(score >= 3000) {
    speed = 3
  }
}

var enemyTime
var speed = 1
function spawnEnemy() {
  enemyTime = setInterval(() => {
    var r = Math.random() * (30 - 5) + 5
    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 -r : cvs.width + r
      y = Math.random() * cvs.height
    }else{
      x = Math.random() * cvs.width 
      y = Math.random() < 0.5 ? 0 - r : cvs.height + r
    }
    var c = `hsl(${Math.random() * 360}, 50%, 50%)`
    var angle = Math.atan2(cvs.height/2 - y, cvs.width/2 - x)
    var velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    }
    enemies.push(new Enemy(x, y, r, c, velocity))
  }, 1000)
}

cvs.addEventListener("click", (e) => {
  var x = cvs.width / 2 
  var y = cvs.height / 2
  var r = 4
  var c = "white"
  var angle = Math.atan2(e.clientY - cvs.height/2, e.clientX - cvs.width/2)
  var velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5 
  }
  projectiles.push(new Projectile(x, y, r, c, velocity))
})

startButton.addEventListener("click", () => {
  reset()
  animate()
  spawnEnemy()
  panel.style.display = "none"
  startMenu.style.display = "none"
  scoreDiv.style.display = "inline-block"
})




