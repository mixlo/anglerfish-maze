var modalsg = document.querySelector(".modal-sg");
var btnStartGame = document.querySelector(".btnStartGame");
var sgBtnQuit=document.querySelector(".sg-btnQuit");
var sgBtnStart=document.querySelector(".sg-btnStart");


var modalnl = document.querySelector(".modal-nl");
var btnNextLevel = document.querySelector(".btnNextLevel");
var nlBtnQuit=document.querySelector(".nl-btnQuit");
var nlBtnStart=document.querySelector(".nl-btnStart");

var modallg = document.querySelector(".modal-lg");
var btnLoosingGame = document.querySelector(".btnLoosingGame");
var lgBtnQuit = document.querySelector(".lg-btnQuit");
var lgBtnStart = document.querySelector(".lg-btnStart");


function toggleModalStartGame() {
    modalsg.classList.toggle("show-modal-sg");

}

function toggleModalNextLevel() {
    modalnl.classList.toggle("show-modal-nl");

}

function toggleModalLoosingGame() {
  modallg.classList.toggle("show-modal-lg");
}


function windowOnClick(event) {
    location.replace("Home_page.html")
}

btnStartGame.addEventListener("click", toggleModalStartGame);
sgBtnQuit.addEventListener("click",windowOnClick);
sgBtnStart.addEventListener("click", toggleModalStartGame);

btnNextLevel.addEventListener("click", toggleModalNextLevel);
nlBtnQuit.addEventListener("click",toggleModalNextLevel);
nlBtnStart.addEventListener("click", windowOnClick);

btnLoosingGame.addEventListener("click", toggleModalLoosingGame);
lgBtnQuit.addEventListener("click", toggleModalLoosingGame);
lgBtnStart.addEventListener("click", windowOnClick);
