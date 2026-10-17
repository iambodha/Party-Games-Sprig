const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('Party Games.js', 'utf8');

function boot() {
  let screen=[], seed=42, timerId=0;
  const handlers=new Map(), timers=new Map();
  const math=Object.create(Math);
  math.random=()=> {seed=(seed*1664525+1013904223)>>>0; return seed/4294967296;};
  const context={Math:math, console, bitmap:s=>s[0], map:s=>s[0], color:s=>s.join(''),
    setLegend(){},setSolids(){},setMap(){},height:()=>16,afterInput(){},
    clearText(){screen=[];},addText(text){screen.push(text);},
    onInput(key,fn){assert.ok(!handlers.has(key),`Duplicate input handler: ${key}`);handlers.set(key,fn);},
    setTimeout(fn){timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);}};
  vm.runInNewContext(source, context);
  return {press:key=>handlers.get(key)(), screen:()=>screen.join('\n'), timers,
    finish(){for(let i=0;timers.size&&i<130;i++){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}}};
}

const formats=[[2,1],[3,1],[4,1],[5,1],[5,2],[6,2],[7,2],[8,2]];
test('every format reveals the advertised player and spy counts',()=>{
  formats.forEach(([players,spies],index)=>{
    const game=boot();game.press('w');for(let i=0;i<index;i++)game.press('d');
    assert.match(game.screen(),new RegExp(`${players} players`));
    game.press('i');let spyCount=0,wordCount=0;
    for(let i=0;i<players;i++){
      game.press('k');
      if(game.screen().includes('You are the'))spyCount++;
      if(game.screen().includes('The word is'))wordCount++;
      game.press('k');
    }
    assert.equal(spyCount,spies);assert.equal(wordCount,players-spies);
    assert.match(game.screen(),/Time Left: 120/);
  });
});
test('format navigation cannot escape into an unfinished menu',()=>{
  const game=boot();game.press('w');game.press('a');
  assert.match(game.screen(),/2 players/);
  for(let i=0;i<20;i++)game.press('d');
  assert.match(game.screen(),/8 players/);
});
test('restart does not accumulate handlers; menu return cancels the timer',()=>{
  const game=boot();game.press('w');game.press('i');for(let i=0;i<4;i++)game.press('k');
  game.finish();assert.match(game.screen(),/Time's up/);
  game.press('i');for(let i=0;i<4;i++)game.press('k');
  assert.equal(game.timers.size,1);
  game.press('j');assert.equal(game.timers.size,0);assert.match(game.screen(),/Choose the game/);
  game.press('w');game.press('i');assert.match(game.screen(),/Pass to next person/);
});
test('historical text mirror matches the canonical game source',()=>{
  assert.equal(fs.readFileSync('gameCode.txt','utf8'),source);
});
