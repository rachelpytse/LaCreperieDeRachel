const crepeMaker1Button = document.querySelector("#crepeMakerContainer1");
const crepeMaker2Button = document.querySelector("#crepeMakerContainer2");
const crepeFromMachine1Button = document.querySelector("#crepeOnMachine1");
const crepeFromMachine2Button = document.querySelector("#crepeOnMachine2");
const startGameButton = document.querySelector("#startGame");
const addChantillyButton = document.querySelector("#bowlChantilly");
const addStrawberryButton = document.querySelector("#bowlStrawberries");
const sendCrepe1Button = document.querySelector("#plateContainer1Btn");
const sendCrepe2Button = document.querySelector("#plateContainer2Btn");
const cookTimeClockCanvas1 = document.getElementById("cookTimeClock1");
const cookTimeClockcontext1 = cookTimeClockCanvas1.getContext("2d");
const cookTimeClockCanvas2 = document.getElementById("cookTimeClock2");
const cookTimeClockcontext2 = cookTimeClockCanvas2.getContext("2d");
const clients = [];
const orders = ["simple", "chantilly", "strawberry", "chantilly-strawberry"];
const crepes = [];
const score = document.querySelector("#score");
let count = 0;
let leftClient = null;
let rightClient = null;

class Client {
  constructor(side) {
    this.side = side;
    this.element = document.createElement("img");
    this.element.className = "client";
    this.element.src = this.getRandomImage(side);
    this.element.style.height = "300px";
    this.element.style.width = "200px";
    this.element.classList.add(side === 0 ? "client-left" : "client-right");
    document.body.appendChild(this.element);
    this.order = orders[Math.floor(Math.random() * orders.length)];
    this.satisfactionBar = this.createSatisfactionBar();
    document.body.appendChild(this.satisfactionBar);
    this.waitingTime = 30;
    this.satisfactionDecreaseInterval = setInterval(() => {
      this.waitingTime -= 1;
      this.satisfactionBar.style.height = `${(this.waitingTime / 30) * 100}px`;
      if (this.waitingTime <= 0) {
        clearInterval(this.satisfactionDecreaseInterval);
      }
    }, 1000);
    this.orderImage = this.showOrderImage();
    this.hasLeft = false;
  }

  getRandomImage(side) {
    const leftImages = [
      "images/client1.png",
      "images/client2.png",
      "images/client3.png",
    ];
    const rightImages = [
      "images/client4.png",
      "images/client5.png",
      "images/client6.png",
    ];
    const images = side === 0 ? leftImages : rightImages;
    return images[Math.floor(Math.random() * images.length)];
  }

  showOrderImage() {
    const orderImage = document.createElement("img");
    orderImage.src = `images/${this.order}.png`;
    orderImage.style.height = "100px";
    orderImage.alt = this.order;
    orderImage.className = "order";
    document.body.appendChild(orderImage);
    if (this.side === 0) {
      orderImage.style.position = "absolute";
      orderImage.style.top = `250px`;
      orderImage.style.left = "10px";
    } else {
      orderImage.style.position = "absolute";
      orderImage.style.top = `250px`;
      orderImage.style.right = "10px";
    }
    return orderImage;
  }

  createSatisfactionBar() {
    const bar = document.createElement("div");
    bar.className = "satisfaction-bar";
    bar.style.height = "100px";
    if (this.side === 0) {
      bar.style.left = "50px";
    } else {
      bar.style.right = "50px";
    }
    bar.style.top = "100px";
    return bar;
  }

  leaveScene() {
    clearInterval(this.satisfactionDecreaseInterval);
    this.satisfactionBar.remove();
    this.orderImage.remove();
    this.element.style.animation =
      this.side === 0
        ? "slideOutToLeft 3s forwards"
        : "slideOutToRight 3s forwards";
    setTimeout(() => {
      this.element.remove();
      if (this.side === 0) {
        leftClient = null;
      } else {
        rightClient = null;
      }
    }, 3000);
    this.hasLeft = true;

    spawnClient(this.side);
    console.log("spawn client");
  }

  happy() {
    this.element.src = this.element.src.replace(".png", "happy.png");
    count += 1;
    score.innerHTML = `${count}`;
  }
  sad() {
    this.element.src = this.element.src.replace(".png", "sad.png");
  }
}

function spawnClient(side) {
  const client = new Client(side);
  clients.push(client);
  if (side === 0) {
    leftClient = client;
  } else {
    rightClient = client;
  }
  setTimeout(() => {
    if (!client.hasLeft) {
      client.sad();
      client.leaveScene();
    }
  }, 30000);
}

class Machine {
  constructor(el, canvas) {
    this.el = el;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cookState = 0;
    this.currentTime = 0;
    this.color = "green";
  }

  drawCookTimeClock() {
    let cookTimeFillColor = this.color;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.cookState === 1 || this.cookState === 2) {
      const cookTime = 8;
      this.currentTime += 16 / 1000;
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const radius = this.canvas.width / 2 - 10;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.stroke();
      const fillAngle = 2 * Math.PI * (this.currentTime / cookTime);
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + fillAngle
      );
      this.ctx.closePath();
      this.ctx.fillStyle = cookTimeFillColor;
      this.ctx.fill();
    }
  }
}

class Plate {
  constructor() {
    this.occupy = false;
  }
}

class Crepe {
  constructor(location, target, state = 0) {
    this.location = location; //m1, m2, p1, p2, c1, c2
    this.target = target; // 'simple' | 'chantilly' | 'strawberry' | 'chantilly-strawberry'
    this.state = state;
    this.image = document.createElement("img");
    this.image.src = "";
    document.body.appendChild(this.image);
    this.image.addEventListener("load", () => {
      this.image.style.zIndex = "100";
      this.image.style.position = "absolute";
    });
  }

  draw() {
    if (this.location === "mc1" && this.state === 1) {
      this.image.src = "images/crepeNotFinished.png";
      this.image.style.right = "12vw";
      this.image.style.bottom = "25vh";
      this.image.style.height = "30px";
    } else if (this.location === "mc1" && this.state === 2) {
      this.image.src = "images/crepeFinished.png";
      this.image.style.right = "12vw";
      this.image.style.bottom = "25vh";
      this.image.style.width = "100px";
    } else if (this.location === "mc1" && this.state === 3) {
      this.image.src = "images/crepeOvercooked.png";
      this.image.style.right = "12vw";
      this.image.style.bottom = "25vh";
      this.image.style.height = "20px";
    } else if (this.location === "mc2" && this.state === 1) {
      this.image.src = "images/crepeNotFinished.png";
      this.image.style.right = "12vw";
      this.image.style.bottom = "12vh";
      this.image.style.height = "30px";
    } else if (this.location === "mc2" && this.state === 2) {
      this.image.src = "images/crepeFinished.png";
      this.image.style.right = "12vw";
      this.image.style.bottom = "12vh";
      this.image.style.width = "100px";
    } else if (this.location === "mc2" && this.state === 3) {
      this.image.src = "images/crepeOvercooked.png";
      this.image.style.right = "12vw";
      this.image.style.bottom = "12vh";
      this.image.style.height = "20px";
    } else if (this.location == "p1" && this.target === "simple") {
      this.image.src = "images/simple.png";
      this.image.style.left = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (this.location == "p1" && this.target === "chantilly") {
      this.image.src = "images/chantilly.png";
      this.image.style.left = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (this.location == "p1" && this.target === "strawberry") {
      this.image.src = "images/strawberry.png";
      this.image.style.left = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (
      this.location == "p1" &&
      this.target === "chantilly-strawberry"
    ) {
      this.image.src = "images/chantilly-strawberry.png";
      this.image.style.left = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (this.location == "p2" && this.target === "simple") {
      this.image.src = "images/simple.png";
      this.image.style.right = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (this.location == "p2" && this.target === "chantilly") {
      this.image.src = "images/chantilly.png";
      this.image.style.right = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (this.location == "p2" && this.target === "strawberry") {
      this.image.src = "images/strawberry.png";
      this.image.style.right = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    } else if (
      this.location == "p2" &&
      this.target === "chantilly-strawberry"
    ) {
      this.image.src = "images/chantilly-strawberry.png";
      this.image.style.right = "35vw";
      this.image.style.bottom = "100px";
      this.image.style.height = "200px";
      this.image.style.width = "200px";
    }
  }
}

let machine1 = new Machine(
  document.querySelector("#crepeOnMachine1"),
  cookTimeClockCanvas1
);

let machine2 = new Machine(
  document.querySelector("#crepeOnMachine2"),
  cookTimeClockCanvas2
);

let plate1 = new Plate(document.querySelector("#plateContainer1"));
let plate2 = new Plate(document.querySelector("#plateContainer2"));

crepeMaker1Button.addEventListener("click", () => {
  if (machine1.cookState === 0) {
    machine1.cookState = 1;
    machine1.color = "green";
    machine1.currentTime = 0;

    let crepe = new Crepe();
    crepe.location = "mc1";
    crepe.state = 1;
    crepes.push(crepe);

    setTimeout(() => {
      machine1.currentTime = 0;
      machine1.cookState = 2;
      crepe.state = 2;
      machine1.color = "red";
      machine1.timeout = setTimeout(() => {
        machine1.cookState = 3;
        crepe.state = 3;
      }, 8000);
    }, 8000);
  } else if (machine1.cookState === 2) {
    clearTimeout(machine1.timeout);
    machine1.cookState = 0;

    for (let i = 0; i < crepes.length; i++) {
      if (crepes[i].location === "mc1") {
        crepes[i].target = "simple";
        if (plate1.occupy === false) {
          crepes[i].location = "p1";
          plate1.occupy = true;
        } else if (plate1.occupy === true && plate2.occupy === false) {
          crepes[i].location = "p2";
          plate2.occupy = true;
        }
      }
    }
  }
});

crepeMaker2Button.addEventListener("click", () => {
  if (machine2.cookState === 0) {
    machine2.cookState = 1;
    machine2.color = "green";
    machine2.currentTime = 0;

    let crepe = new Crepe();
    crepe.location = "mc2";
    crepe.state = 1;
    crepes.push(crepe);

    setTimeout(() => {
      machine2.currentTime = 0;
      machine2.cookState = 2;
      crepe.state = 2;
      machine2.color = "red";
      machine2.timeout = setTimeout(() => {
        machine2.cookState = 3;
        crepe.state = 3;
      }, 8000);
    }, 8000);
  } else if (machine2.cookState === 2) {
    clearTimeout(machine2.timeout);
    machine2.cookState = 0;

    for (let i = 0; i < crepes.length; i++) {
      if (crepes[i].location === "mc2") {
        crepes[i].target = "simple";
        if (plate1.occupy === false) {
          crepes[i].location = "p1";
          plate1.occupy = true;
        } else if (plate1.occupy === true && plate2.occupy === false) {
          crepes[i].location = "p2";
          plate2.occupy = true;
        }
      }
    }
  }
});

addChantillyButton.addEventListener("click", () => {
  const crepeToAddChantilly = crepes.find(
    (crepe) =>
      crepe.target === "simple" &&
      (crepe.location === "p1" || crepe.location === "p2")
  );
  if (crepeToAddChantilly) {
    crepeToAddChantilly.target = "chantilly";
  }
});

addStrawberryButton.addEventListener("click", () => {
  let crepeToAddStrawberry = crepes.find(
    (crepe) =>
      crepe.target === "simple" &&
      (crepe.location === "p1" || crepe.location === "p2")
  );
  if (crepeToAddStrawberry) {
    crepeToAddStrawberry.target = "strawberry";
  } else if (!crepeToAddStrawberry) {
    crepeToAddStrawberry = crepes.find(
      (crepe) =>
        crepe.target === "chantilly" &&
        (crepe.location === "p1" || crepe.location === "p2")
    );
    if (crepeToAddStrawberry) {
      crepeToAddStrawberry.target = "chantilly-strawberry";
    }
  }
});

sendCrepe1Button.addEventListener("click", () => {
  console.log("click button 1");
  for (let i = 0; i < clients.length; i++) {
    for (let r = 0; r < crepes.length; r++) {
      if (
        crepes[r].location === "p1" &&
        crepes[r].target === clients[i].order
      ) {
        crepes[r].image.remove();
        crepes.splice(r, 1);
        plate1.occupy = false;
        console.log("client received order");

        clients[i].happy();
        clients[i].leaveScene();
        clients.splice(i, 1);
      }
    }
  }
});

sendCrepe2Button.addEventListener("click", () => {
  console.log("click button 2");
  for (let i = 0; i < clients.length; i++) {
    for (let r = 0; r < crepes.length; r++) {
      if (
        crepes[r].location === "p2" &&
        crepes[r].target === clients[i].order
      ) {
        crepes[r].image.remove();
        crepes.splice(r, 1);
        plate1.occupy = false;
        console.log("client received order");

        clients[i].happy();
        clients[i].leaveScene();
        clients.splice(i, 1);
      }
    }
  }
});

function animloop() {
  for (i = 0; i < crepes.length; i++) {
    crepes[i].draw();
  }
  machine1.drawCookTimeClock("green"); // affiche le timer si besoin
  machine2.drawCookTimeClock("green"); // idem machine2
  requestAnimationFrame(animloop);
}

function startGame() {
  machine1.cookState = 0;
  machine2.cookState = 0;

  const targetScore = 10;
  const timeLimit = document.querySelector("#gameTimeSecond");
  const result = document.querySelector("#result");
  let timeCount = 90;
  let score = 0;

  timeLimit.innerHTML = `${timeCount}`;
  let timer = setInterval(() => {
    timeCount--;
    timeLimit.innerHTML = `${timeCount}`;
    if (timeCount <= 0) {
      clearInterval(timer);
      if (score >= targetScore) {
        result.innerHTML = "You win!";
      } else {
        result.innerHTML = "You lose!";
      }
    }
  }, 1000);
}

startGameButton.addEventListener("click", () => {
  startGame();
  setTimeout(() => spawnClient(0), 1000);
  setTimeout(() => spawnClient(1), 6000);
  animloop();
});

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('start').addEventListener('click', () => {
      document.body.className = "step2";
      switchScene('instruction');
  });

  document.getElementById('play').addEventListener('click', () => {
      document.body.className = "step3";
      switchScene('game');
      
  });

  
});

function switchScene(sceneId) {
  document.querySelectorAll('.scene').forEach((scene) => {
      scene.classList.add('hidden');
  });

  document.getElementById(sceneId).classList.remove('hidden');
}
