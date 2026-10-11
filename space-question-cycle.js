// AREG V289 trial — finite, no-repeat target deck for "Գտիր ճիշտ մոլորակը".
// Only the requested *target* must be unique; visual decoy choices may recur.
// Keep all 30 original approved PLANETS, UV textures and round animations.
export function createUniqueTargetCycle(items,shuffle){
  if(!Array.isArray(items)||!items.length)throw Error('Space target deck needs objects');
  if(typeof shuffle!=='function')throw Error('Space target deck needs shuffle');
  const ids=items.map(item=>item.id);
  if(new Set(ids).size!==ids.length)throw Error('Space target IDs must be unique');
  let pending=[],shown=[],previousOrder=[];
  function restart(){
    if(pending.length)throw Error('Cannot restart before the cycle is complete');
    const shuffled=shuffle(items);
    if(shuffled.length!==items.length||
       new Set(shuffled.map(item=>item.id)).size!==items.length||
       shuffled.some(item=>!ids.includes(item.id)))
      throw Error('Invalid shuffled Space question deck');
    const order=[...shuffled];
    // Even if RNG happens to yield the same shuffle, replay is different.
    if(order.length>1&&previousOrder.length===order.length&&
       order.every((item,i)=>item.id===previousOrder[i])){
      [order[0],order[1]]=[order[1],order[0]];
    }
    // No repeated question directly across "Խաղալ նորից".
    if(order.length>1&&order[0].id===previousOrder.at(-1)){
      const swap=order.findIndex(item=>item.id!==previousOrder.at(-1));
      [order[0],order[swap]]=[order[swap],order[0]];
    }
    pending=order;
    shown=[];
  }
  restart();
  return {
    peek:()=>pending[0]||null,
    // If the next original UV is still loading, only borrow an UNASKED
    // target. Don't silently replace it with an already asked 3D planet.
    chooseReady(readyIds){
      if(!readyIds)return pending[0]||null;
      return pending.find(item=>readyIds.has(item.id))||pending[0]||null;
    },
    commit(id){
      const index=pending.findIndex(item=>item.id===id);
      if(index<0)throw Error('Repeated or unknown Space target: '+id);
      const [item]=pending.splice(index,1);
      shown.push(item.id);
      return item;
    },
    get completed(){return pending.length===0},
    get remaining(){return pending.length},
    get askedIds(){return [...shown]},
    replay(){
      if(pending.length)throw Error('Replay before all questions answered');
      previousOrder=[...shown];
      restart();
    }
  };
}
