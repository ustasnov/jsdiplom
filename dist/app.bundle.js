!function(){"use strict";class e{constructor(e,t,a){this.row=e,this.column=t,this.boardSize=a}static byIndex(e,t){return new this(Math.floor(e/t),(e+t)%t,t)}get index(){return this.row*this.boardSize+this.column}}function t(t,a){const s=e.byIndex(t,a),i=a-1;return 0===s.column?0===s.row?"top-left":s.row===i?"bottom-left":"left":s.column===i?0===s.row?"top-right":s.row===i?"bottom-right":"right":0===s.row?"top":s.row===i?"bottom":"center"}function a(e){return parseInt(Math.round(e).toFixed(0),10)}class s{constructor(){this.boardSize=8,this.container=null,this.boardEl=null,this.cells=[],this.cellClickListeners=[],this.cellEnterListeners=[],this.cellLeaveListeners=[],this.newGameListeners=[],this.saveGameListeners=[],this.loadGameListeners=[]}bindToDOM(e){if(!(e instanceof HTMLElement))throw new Error("container is not HTMLElement");this.container=e}drawUi(e){this.checkBinding(),this.container.innerHTML='\n      <div class="controls">\n        <button data-id="action-restart" class="btn">Новая игра</button>\n        <button data-id="action-save" class="btn">Сохранить игру</button>\n        <button data-id="action-load" class="btn">Загрузить игру</button>\n      </div>\n      <div class="board-container">\n        <div data-id="board" class="board"></div>\n      </div>\n    ',this.newGameEl=this.container.querySelector("[data-id=action-restart]"),this.saveGameEl=this.container.querySelector("[data-id=action-save]"),this.loadGameEl=this.container.querySelector("[data-id=action-load]"),this.newGameEl.addEventListener("click",(e=>this.onNewGameClick(e))),this.saveGameEl.addEventListener("click",(e=>this.onSaveGameClick(e))),this.loadGameEl.addEventListener("click",(e=>this.onLoadGameClick(e))),this.boardEl=this.container.querySelector("[data-id=board]"),this.boardEl.classList.add(e);for(let e=0;e<this.boardSize**2;e+=1){const a=document.createElement("div");a.classList.add("cell","map-tile",`map-tile-${t(e,this.boardSize)}`),a.addEventListener("mouseenter",(e=>this.onCellEnter(e))),a.addEventListener("mouseleave",(e=>this.onCellLeave(e))),a.addEventListener("click",(e=>this.onCellClick(e))),this.boardEl.appendChild(a)}this.cells=Array.from(this.boardEl.children)}redrawPositions(e){for(const e of this.cells)e.innerHTML="";for(const a of e){const e=this.boardEl.children[a.position],s=document.createElement("div");s.classList.add("character",a.character.type);const i=document.createElement("div");i.classList.add("health-level");const r=document.createElement("div");r.classList.add("health-level-indicator","health-level-indicator-"+((t=a.character.health)<15?"critical":t<50?"normal":"high")),r.style.width=`${a.character.health}%`,i.appendChild(r),s.appendChild(i),e.appendChild(s)}var t}addCellEnterListener(e){this.cellEnterListeners.push(e)}addCellLeaveListener(e){this.cellLeaveListeners.push(e)}addCellClickListener(e){this.cellClickListeners.push(e)}addNewGameListener(e){this.newGameListeners.push(e)}addSaveGameListener(e){this.saveGameListeners.push(e)}addLoadGameListener(e){this.loadGameListeners.push(e)}onCellEnter(e){e.preventDefault();const t=this.cells.indexOf(e.currentTarget);this.cellEnterListeners.forEach((e=>e.call(null,t)))}onCellLeave(e){e.preventDefault();const t=this.cells.indexOf(e.currentTarget);this.cellLeaveListeners.forEach((e=>e.call(null,t)))}onCellClick(e){const t=this.cells.indexOf(e.currentTarget);this.cellClickListeners.forEach((e=>e.call(null,t)))}onNewGameClick(e){e.preventDefault(),this.newGameListeners.forEach((e=>e.call(null)))}onSaveGameClick(e){e.preventDefault(),this.saveGameListeners.forEach((e=>e.call(null)))}onLoadGameClick(e){e.preventDefault(),this.loadGameListeners.forEach((e=>e.call(null)))}static showError(e){alert(e)}static showMessage(e){alert(e)}selectCell(e,t="yellow"){this.deselectCell(e),this.cells[e].classList.add("selected",`selected-${t}`)}deselectCell(e){const t=this.cells[e];t.classList.remove(...Array.from(t.classList).filter((e=>e.startsWith("selected"))))}showCellTooltip(e,t){this.cells[t].title=e}hideCellTooltip(e){this.cells[e].title=""}showDamage(e,t){return new Promise((a=>{const s=this.cells[e],i=document.createElement("span");i.textContent=t,i.classList.add("damage"),s.appendChild(i),i.addEventListener("animationend",(()=>{s.removeChild(i),a()}))}))}setCursor(e){this.boardEl.style.cursor=e}checkBinding(){if(null===this.container)throw new Error("GamePlay not bind to DOM")}}var i="desert",r="arctic",n="mountain";class l{constructor(e,t="generic"){if(this.level=e,this.attack=0,this.defence=0,this.health=50,this.type=t,this.id=-1,"Character"===new.target.name)throw new Error("You cannot instantiate this class!")}getTooltip(){return`🎖 ${this.level} ⚔ ${this.attack} 🛡 ${this.defence} ❤ ${this.health}`}increaseLevel(e){for(let t=this.level;t<e;t+=1)this.attack=Math.max(this.attack,a((80+this.health)*(this.attack/100))),this.defence=Math.max(this.defence,a((80+this.health)*(this.defence/100))),this.level+=1,this.health=Math.min(this.health+80,100)}}class c{constructor(e,t){if(!(e instanceof l))throw new Error("character must be instance of Character or its children");if("number"!=typeof t)throw new Error("position must be a number");this.character=e,this.position=t}}var h="pointer",o="crosshair",d="not-allowed";class m extends l{constructor(e){super(e,"bowman"),this.attack=25,this.defence=25,this.distance=2,this.attackDistance=2}}class g extends l{constructor(e){super(e,"swordsman"),this.attack=40,this.defence=10,this.distance=4,this.attackDistance=1}}class u extends l{constructor(e){super(e,"magician"),this.attack=10,this.defence=40,this.distance=1,this.attackDistance=4}}class p extends l{constructor(e){super(e,"vampire"),this.attack=25,this.defence=25,this.distance=2,this.attackDistance=2}}class f extends l{constructor(e){super(e,"undead"),this.attack=40,this.defence=10,this.distance=4,this.attackDistance=1}}class v extends l{constructor(e){super(e,"daemon"),this.attack=10,this.defence=10,this.distance=1,this.attackDistance=4}}class y{constructor(e){this.characters=[],Array.from(e).forEach((e=>{this.characters.push(e)}))}}class S{constructor(){this.playerTeam=null,this.rivalTeam=null,this.score=[0,0],this.gameRound=0,this.playerTurn=!0,this.playerAlive=4,this.rivalAlive=4,this.positionedCharacters=[],this.selectedIndex=-1,this.playerTypes={bowman:m,swordsman:g,magician:u},this.rivalTypes={vampire:p,undead:f,daemon:v}}createCharacter(e){let t=null;return t=e.type in this.playerTypes?new this.playerTypes[e.type](e.level):new this.rivalTypes[e.type](e.level),t.id=e.id,t.health=e.health,t.attack=e.attack,t.defence=e.defence,t.distance=e.distance,t.attackDistance=e.attackDistance,t}createPosCharacter(e){const t=e.character.type in this.playerTypes?this.playerTeam.characters.find((t=>t.id===e.character.id)):this.rivalTeam.characters.find((t=>t.id===e.character.id));return new c(t,e.position)}static from(e){const t=new S;return t.score=e.score,t.gameRound=e.gameRound,t.playerTurn=!0,t.playerAlive=e.playerAlive,t.rivalAlive=e.rivalAlive,t.selectedIndex=e.selectedIndex,t.playerTeam=new y(Array.from(e.playerTeam.characters).map((e=>t.createCharacter(e)))),t.rivalTeam=new y(Array.from(e.rivalTeam.characters).map((e=>t.createCharacter(e)))),t.positionedCharacters=Array.from(e.positionedCharacters).map((e=>t.createPosCharacter(e))),t}}function w(e,t){const a=e+Math.random()*(t+1-e);return Math.floor(a)}function C(e,t,a){const s=function*(e,t){for(;;){const a=w(0,e.length-1),s=w(1,t),i=new e[a](1);i.increaseLevel(s),yield i}}(e,t),i=[];for(let e=0;e<a;e+=1){const t=s.next().value;t.id=e,i.push(t)}return new y(i)}const x=new s;x.bindToDOM(document.querySelector("#game-container"));const L=new class{constructor(e){this.storage=e}save(e){this.storage.setItem("state",JSON.stringify(e))}load(){try{return JSON.parse(this.storage.getItem("state"))}catch(e){throw new Error("Invalid state")}}}(localStorage),k=new class{constructor(e,t){this.gamePlay=e,this.stateService=t,this.rounds=4,this.selectedGreenIndex=-1,this.selectedRedIndex=-1,this.cellsForMove=[],this.cellsForAttack=[],this.gameState=new S}get theme(){let e="prairie";switch(this.gameRound){case 2:e=i;break;case 3:e=r;break;case 4:e=n}return e}placeTeam(t){const a=this.gamePlay.boardSize,s=2*a,i=[],r=[0,1];t===this.gameState.rivalTeam&&(r[0]=a-2,r[1]=a-1),Array.from(t.characters).forEach((t=>{let n=w(0,s-1);for(;i.indexOf(n)>-1;)n=w(0,s-1);i.push(n);const l=n<a?new e(n,r[0],a).index:new e(n-a,r[1],a).index;this.gameState.positionedCharacters.push(new c(t,l))}))}addListeners(){this.gamePlay.addNewGameListener(this.onNewGame.bind(this)),this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this)),this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this)),this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this)),this.gamePlay.addCellClickListener(this.onCellClick.bind(this))}clearButtonsListeners(){this.gamePlay.newGameListeners=[],this.gamePlay.saveGameListeners=[],this.gamePlay.loadGameListeners=[]}clearMouseListeners(){this.gamePlay.cellClickListeners=[],this.gamePlay.cellEnterListeners=[]}init(){this.gameState.gameRound=0,this.gameState.score[0]=0,this.gameState.score[1]=0;const e=Object.getOwnPropertyNames(this.gameState.playerTypes).map((e=>this.gameState.playerTypes[e])),t=Object.getOwnPropertyNames(this.gameState.rivalTypes).map((e=>this.gameState.rivalTypes[e]));this.gameState.playerTeam=C(e,2,4),this.gameState.rivalTeam=C(t,2,4),this.startRound(),this.addListeners()}gameOver(e=!0){return!e&&!confirm("Начать новую игру?")||(new Promise((e=>{this.gameState.selectedIndex>-1&&(this.gamePlay.deselectCell(this.gameState.selectedIndex),this.gameState.selectedIndex=-1),this.gameState.positionedCharacters=[],this.gamePlay.redrawPositions(this.gameState.positionedCharacters),this.clearMouseListeners(),e()})).then((()=>{setTimeout((()=>{e?this.gameState.score[0]>this.gameState.score[1]?s.showMessage(`Игра окончена: вы выиграли. Общий счет ${this.gameState.score[0]}:${this.gameState.score[1]}`):s.showMessage(`Игра окончена: вы проиграги. Общий счет ${this.gameStateis.score[0]}:${this.gameState.score[1]}`):(this.clearButtonsListeners(),this.init())}),200)})),!0)}startRound(){this.gameState.gameRound+=1,this.gameState.playerTurn=!0,this.gameState.playerAlive=4,this.gameState.rivalAlive=4,this.gameState.positionedCharacters=[],this.gamePlay.drawUi(this.theme),this.placeTeam(this.gameState.playerTeam),this.placeTeam(this.gameState.rivalTeam),this.gamePlay.redrawPositions(this.gameState.positionedCharacters)}nextRound(){let e=!0;this.gameState.playerTeam.characters.indexOf(this.gameState.positionedCharacters[0].character)>-1?this.gameState.score[0]+=1:(this.gameState.score[1]+=1,e=!1),this.gameState.gameRound===this.rounds?this.gameOver():new Promise((e=>{Array.from(this.gameState.playerTeam.characters).forEach((e=>e.increaseLevel(e.level+1))),Array.from(this.gameState.rivalTeam.characters).forEach((e=>e.increaseLevel(e.level+1))),this.gameState.selectedIndex>-1&&(this.gamePlay.deselectCell(this.gameState.selectedIndex),this.gameState.selectedIndex=-1),this.gameState.positionedCharacters=[],this.gamePlay.redrawPositions(this.gameState.positionedCharacters),e()})).then((()=>{setTimeout((()=>{e?s.showMessage(`Вы выиграли этот раунд. Общий счет ${this.gameState.score[0]}:${this.gameState.score[1]}`):s.showMessage(`Вы проиграли этот раунд. Общий счет ${this.gameState.score[0]}:${this.gameState.score[1]}`),this.startRound()}),200)}))}getCellsForMove(t){const a=function(t,a){const s=[],i=e.byIndex(t.position,a),r=new e(i.row,i.column,a),n=Math.min(i.column+t.character.distance,a-1),l=Math.max(i.column-t.character.distance,0),c=Math.min(i.row+t.character.distance,a-1),h=Math.max(i.row-t.character.distance,0);for(let e=1;e<=t.character.distance;e+=1){const t=i.column+e,a=i.row+e,o=i.column-e,d=i.row-e;t<=n&&(r.row=i.row,r.column=t,s.push(r.index)),o>=l&&(r.row=i.row,r.column=o,s.push(r.index)),d>=h&&(r.column=i.column,r.row=d,s.push(r.index)),a<=c&&(r.column=i.column,r.row=a,s.push(r.index)),t<=n&&d>=h&&(r.row=d,r.column=t,s.push(r.index)),o>=l&&d>=h&&(r.row=d,r.column=o,s.push(r.index)),o>=l&&a<=c&&(r.column=o,r.row=a,s.push(r.index)),t<=n&&a<=c&&(r.row=a,r.column=t,s.push(r.index))}return s}(t,this.gamePlay.boardSize);this.cellsForMove=a.filter((e=>void 0===Array.from(this.gameState.positionedCharacters).find((t=>t.position===e))))}getCellsForAttack(t){this.cellsForAttack=function(t,a){const s=[],i=e.byIndex(t.position,a),r=new e(i.row,i.column,a),n=Math.min(i.column+t.character.attackDistance,a-1),l=Math.max(i.column-t.character.attackDistance,0),c=Math.min(i.row+t.character.attackDistance,a-1);for(let e=Math.max(i.row-t.character.attackDistance,0);e<=c;e+=1)for(let t=l;t<=n;t+=1)r.row=e,r.column=t,s.push(r.index);return s}(t,this.gamePlay.boardSize)}moveCharacter(e,t){Array.from(this.gameState.positionedCharacters).find((t=>t.position===e)).position=t,this.gamePlay.redrawPositions(this.gameState.positionedCharacters),this.onCellClick(t),this.passMove()}attack(e,t){const s=Array.from(this.gameState.positionedCharacters).find((e=>e.position===t)),i=a(Math.max(e.character.attack-s.character.defence,.1*e.character.attack));this.gamePlay.showDamage(s.position,i).then((()=>{s.character.health=Math.max(s.character.health-i,0),0!==s.character.health||(this.died(s),0!==this.gameState.playerAlive&&0!==this.gameState.rivalAlive)?(this.gamePlay.redrawPositions(this.gameState.positionedCharacters),this.passMove()):this.nextRound()}))}died(e){e.position===this.gameState.selectedIndex&&(this.gamePlay.deselectCell(this.gameState.selectedIndex),this.gameState.selectedIndex=-1),e.position===this.selectedRedIndex&&(this.gamePlay.deselectCell(this.selectedRedIndex),this.selectedRedIndex=-1),this.gameState.playerTeam.characters.indexOf(e.character)>-1?this.gameState.playerAlive-=1:this.gameState.rivalAlive-=1,this.gameState.positionedCharacters.splice(this.gameState.positionedCharacters.indexOf(e),1),this.gamePlay.redrawPositions(this.gameState.positionedCharacters)}getTargets(){return Array.from(this.cellsForAttack).filter((e=>{const t=Array.from(this.gameState.positionedCharacters).find((t=>t.position===e));return!!t&&this.gameState.playerTeam.characters.indexOf(t.character)>-1}))}passMove(){this.gameState.playerTurn=!this.gameState.playerTurn,this.gameState.playerTurn?this.onCellClick(this.gameState.selectedIndex):this.rivalTurn()}rivalTurn(){const e=Array.from(this.gameState.positionedCharacters).filter((e=>this.gameState.rivalTeam.characters.indexOf(e.character)>-1));if(e.length>0){let t=null,a=0,s=[];for(let i=0;i<e.length;i+=1)this.getCellsForAttack(e[i]),s=this.getTargets(),s.length>0&&e[i].character.attack>a&&(a=e[i].character.attack,t=e[i]);if(t)this.getCellsForAttack(t),s=this.getTargets(),this.attack(t,s[w(0,s.length-1)]);else{t=null;let a=0;for(let s=0;s<e.length;s+=1)e[s].character.defence>a&&(a=e[s].character.defence,t=e[s]);t&&(this.getCellsForMove(t),this.moveCharacter(t.position,this.cellsForMove[w(0,this.cellsForMove.length-1)]))}}}onCellClick(e){if(!this.gameState.playerTurn||-1===e)return;const t=Array.from(this.gameState.positionedCharacters).find((t=>t.position===e));if(t)if(this.gameState.playerTeam.characters.indexOf(t.character)>-1)-1!==this.gameState.selectedIndex&&this.gamePlay.deselectCell(this.gameState.selectedIndex),this.gamePlay.selectCell(e),this.gameState.selectedIndex=e,this.getCellsForMove(t),this.getCellsForAttack(t);else if(-1===this.gameState.selectedIndex)s.showError("Этот персонаж не из вашей команды!");else if(-1===this.cellsForAttack.indexOf(e))s.showError("Не достаточно расстояния для атаки!");else{const t=Array.from(this.gameState.positionedCharacters).find((e=>e.position===this.gameState.selectedIndex));this.attack(t,e)}else-1===this.selectedGreenIndex?s.showError("Сюда нельзя ходить!"):this.moveCharacter(this.gameState.selectedIndex,this.selectedGreenIndex)}onCellEnter(e){-1!==this.selectedGreenIndex&&this.gameState.selectedIndex!==this.selectedGreenIndex&&(this.gamePlay.deselectCell(this.selectedGreenIndex),this.selectedGreenIndex=-1),-1!==this.selectedRedIndex&&this.gameState.selectedIndex!==this.selectedRedIndex&&(this.gamePlay.deselectCell(this.selectedRedIndex),this.selectedRedIndex=-1);const t=Array.from(this.gameState.positionedCharacters).find((t=>t.position===e));t?(-1!==this.gameState.playerTeam.characters.indexOf(t.character)?this.gamePlay.setCursor(h):-1!==this.gameState.rivalTeam.characters.indexOf(t.character)&&(-1!==this.cellsForAttack.indexOf(t.position)&&-1!==this.gameState.selectedIndex?(this.gamePlay.setCursor(o),this.gamePlay.selectCell(e,"red"),this.selectedRedIndex=e):this.gamePlay.setCursor(d)),this.gamePlay.showCellTooltip(t.character.getTooltip(),e)):-1!==this.gameState.selectedIndex&&-1!==this.cellsForMove.indexOf(e)?(this.gamePlay.setCursor(h),this.gamePlay.selectCell(e,"green"),this.selectedGreenIndex=e):this.gamePlay.setCursor(d)}onCellLeave(e){this.gamePlay.hideCellTooltip(e)}onNewGame(){this.gameOver(!1)}onSaveGame(){if(confirm("Сохранить игру?")){try{this.stateService.save(this.gameState)}catch(e){return void s.showError(`Игра не сохранена из-за ошибки: ${e.message}`)}s.showMessage("Игра успешно сохранена.")}}onLoadGame(){if(!confirm("Загрузить ранее сохраненную игру?"))return;let e=null;try{e=this.stateService.load()}catch(e){return void s.showError(`Не удалось загрузить игру из-за ошибки: ${e.message}`)}this.selectedGreenIndex=-1,this.selectedRedIndex=-1,this.selectedIndex=-1,this.clearButtonsListeners(),this.clearMouseListeners(),this.addListeners(),this.gameState=S.from(e),this.gamePlay.drawUi(this.theme),this.gamePlay.redrawPositions(this.gameState.positionedCharacters),this.onCellClick(this.gameState.selectedIndex)}}(x,L);k.init()}();