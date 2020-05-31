//This code was created for hector martinez Github hector-manny
//************** MIT LICENSE ************* */
let canvas;
let ctx;
let controller;
let countDownPlace;




//------vip variables------ (in the explosion namespace)
let explosion = {
    radius: 10, //radius of a firework in px
    fireworks: 4, //number of fireworks right after you run the script
    gravity: 1, //overall gravity (only for the fireworks - not for the particles)
    minVelocityY: 20,
    minVelocityX: -5,
    deltaVelocityX: 10,
    deltaVelocityY: 17,
    maxParticles: 40, //how many small particles will spawn
    particleRadius: 4, //radius of a small particle
    particleSpeed: 7, //speed of a small particle
    particleGravity: 0.1, //gravity for the particles
    clearFactor: 0.08, //background reset (this is the alpha)
    chanceForNewFireworks: 4, //in %
    particleLifeTime: 40, //in frames
    autoAdjustValues: true //<--name should be enough
};

function countdown() {
    //current date
    var now = new Date();
    //New Year's eve
    var newYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0);
    //r = remaining
    var rSecs = Math.floor(((newYear - now) / 1000) % 60);
    var rMins = Math.floor((newYear - now) / 1000 / 60 % 60);
    var rHours = Math.floor(((newYear - now) / 1000 / 60 / 60) % 24);
    var rDays = Math.floor((newYear - now) / 1000 / 60 / 60 / 24);

    //assign the calculated values
    countDownPlace[0].innerHTML = rDays;
    countDownPlace[1].innerHTML = rHours;
    countDownPlace[2].innerHTML = rMins;
    countDownPlace[3].innerHTML = rSecs;
}

//fireworks
function startfireworks() {
    //create a Color
    //smallestColorValue to avoid black (background is already black)
    function Color(smallestColorValue, alpha) {
        //if not set use 0 instead
        smallestColorValue = smallestColorValue || 0;
        //default alpha will be 0.8
        this.alpha = alpha || 0.8;

        //red, green and blue values
        this.r = getColorValue(smallestColorValue);
        this.g = getColorValue(smallestColorValue);
        this.b = getColorValue(smallestColorValue);

        //generate a string out of these values
        this.colorString = "rgba(" + this.r + "," + this.g + "," + this.b + ", " + this.alpha + ")";

        //return the string
        return this.colorString;
    }

    //get a single integer value for the color starting at smallestColorValue
    function getColorValue(smallestColorValue) {
        return Math.floor(Math.random() * 255) + smallestColorValue;
    }

    //a single firework
    function Firework() {

        //current x and y coordinates
        //random spawn at the bottom of the canvas
        this.x = window.innerWidth / 5 + Math.random() * (window.innerWidth / 5) * 3;
        this.y = window.innerHeight;
        //x-movement
        this.VelocityX = explosion.minVelocityX + Math.random() * explosion.deltaVelocityX;
        //y-movement (goes upwards)
        this.VelocityY = (explosion.minVelocityY + Math.random() * explosion.deltaVelocityY) * -1;
        //current radius
        this.radius = explosion.radius;
        //is the firework still alive? Did it explode?
        this.alive = true;
        //the color a singel firework
        this.color = new Color(40);

        //little particles after the explosion
        this.particles = [];

        //cmon, the name is enough
        this.noParticlesLeft = false;

        //draw the firework
        this.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

            ctx.fillStyle = this.color.colorString;
            ctx.lineWidth = 1;
            ctx.fill();
        };

        //no longer draws the firework, only the particles - use this after the explosion
        this.explode = function () {
            //if no particles exist yet - create new ones
            this.particles = (this.particles.length > 0) ? this.particles : this.createParticles();

            //update all the particles
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].draw();
                if (this.particles[i].update()) {
                    this.particles.splice(i, 1);
                }
                //oops we've run out of particles, time to clear the memory and remove the element from the array
                if (this.particles.length === 0) {
                    this.noParticlesLeft = true;
                }
            }
        };

        //create an array containing n particles
        this.createParticles = function () {
            let maxParticles = explosion.maxParticles;
            let temporaryParticleArray = [];

            //used for special shapes
            let effectIndex = Math.floor(Math.random() * 8);

            for (let i = 0; i < maxParticles; i++) {
                temporaryParticleArray.push(new Particle(this.x, this.y, Math.PI * 2 / maxParticles * i, this.color.colorString, this.getEffect(effectIndex, i)));
            }
            return temporaryParticleArray;
        };

        //returns the speed of each particle
        this.getEffect = function (effectIndex, i) {
            //here are all the explosion effencts - in fact I only change the speed of the individual particles, here are the formuls (completely random, I was just experimenting)
            switch (effectIndex) {
                case 0:
                    return explosion.particleSpeed;
                  
                case 1:
                    return i / 3.5;
                    
                case 2:
                    return Math.abs(Math.sin(i) * 6);
                    
                case 3:
                    return Math.abs(Math.cos(i) * 6);
                    
                case 4:
                    return Math.sqrt(i * Math.PI) + 2;
                    
                case 5:
                    return i % 2;
                    
                case 6:
                    return i % 3;
                    
                case 7:
                    return i % 7;
                
            }
        };

        //update the firework (move it)
        this.update = function () {
            this.x += this.VelocityX;
            this.y += this.VelocityY;

            this.VelocityY += explosion.gravity;

            if (this.VelocityY >= 0) {
                this.alive = false;
            }
        };
    }

    //the Particle class, a particle is the small dot that spaws when the firework explodes
    function Particle(x, y, angle, color, speed) {
        this.x = x;//x coordinate
        this.y = y;//y coordinate
        this.radius = explosion.particleRadius;//radius of a particle
        this.speed = speed || explosion.particleSpeed;//speed of a particle
        this.color = color;//the COLOR what did you expect?
        this.angle = angle;//the angle in which the particle will move (direction)
        this.velocityX = Math.cos(this.angle) * this.speed;//X velocity
        this.velocityY = Math.sin(this.angle) * this.speed;//Y velocity
        this.age = 0;//the age of a particle (increases each frame)

        //update the particles (move them)
        this.update = function () {
            this.x += this.velocityX;
            this.y += this.velocityY;

            this.velocityY += explosion.particleGravity;
            this.age++;

            //delete them after they reach a specific age
            if (this.age > explosion.particleLifeTime) {
                //true == deleteThisPArticle :(
                return true;
            }
        };

        //draw the particle
        this.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.lineWidth = 1;
            ctx.fill();
        };

    }

    //The Brain (or the Controller)
    function Controller() {

        //all the visible fireworks are stored here
        this.fireworks = [];
        
        //create all the fireworks (only 1 time at the beginning)
        this.init = function () {
            for (let i = 0; i < explosion.fireworks; i++) {
                this.fireworks.push(new Firework());
            }
        };

        //update all the fireworks
        this.update = function () {
            for (let i = 0; i < this.fireworks.length; i++) {
                let currentFirework = this.fireworks[i];
                currentFirework.update();
                if (currentFirework.alive) {
                    currentFirework.draw();
                } else if (currentFirework.noParticlesLeft) {
                    this.fireworks.splice(i, 1);
                } else {
                    currentFirework.explode();
                }
            }
            //a little trick in ES6 (keep 'this')
            window.requestAnimationFrame(() => this.update());

            //clear the canvas each frame
            clearCanvas();

            //create new Fireworks for the next Frame

            //when you're lucky, a new firework will spawn ^^
            if (Math.random() * 100 < explosion.chanceForNewFireworks) {
                this.fireworks.push(new Firework());
            }
        }
    }

    //create the controller, initialize it and call the update function which starts the animation (I use requestAnimationFrame for that)
    controller = new Controller();
    controller.init();
    controller.update();
}

//function to clear the canvas --amazin comment --very helpful
function clearCanvas() {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 0,' + explosion.clearFactor + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//make the canvas full-screen
function adjustCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //Change values based on the canvas size
    adjustValues();
}

//adjust all the values based on the size of the canvas (mobile friendly)
function adjustValues() {
    if (!explosion.autoAdjustValues) return;

    let heigthReached = 0;
    let velocityY = 0;
    while (heigthReached < window.innerHeight) {
        velocityY += explosion.gravity;
        heigthReached += velocityY;
    }

    explosion.minVelocityY = velocityY / 2;
    explosion.deltaVelocityY = velocityY - explosion.minVelocityY;

    explosion.minVelocityX = window.innerWidth / 4 / (velocityY / 2) * -1;
    explosion.deltaVelocityX = 2 * explosion.minVelocityX * -1;
}

//start everything
function init() {
    countDownPlace = document.querySelectorAll("section div");

    //set all important variables
    canvas = document.querySelector("canvas");

    //keep the canvas full-screen, even when the window is resized
    adjustCanvas();
    window.addEventListener("resize", adjustCanvas);

    //get the drawing context
    ctx = canvas.getContext("2d");

    //let the show begin
    startfireworks();

    //start the countdown
    countdown();
    setInterval(countdown, 1000);
}

//wait until the DOM loads
window.addEventListener("DOMContentLoaded", init);
//Code of Hector Martinez 


