(()=>{
  const viewport=document.querySelector('#customer-logos');
  if(!viewport)return;
  const sourceCards=[...viewport.children].filter(card=>card.matches('.customer-logo'));
  if(sourceCards.length<2)return;
  if(document.body.classList.contains('home-page') || document.body.classList.contains('customer-gallery-page')){
    viewport.classList.add('three-row-logos');
    const rows=Array.from({length:3},()=>[]);
    sourceCards.forEach((card,index)=>rows[index%3].push(card));
    rows.forEach((cards,index)=>{
      const lane=document.createElement('div');
      lane.className='logo-lane';
      const rowTrack=document.createElement('div');
      rowTrack.className='logo-track is-moving';
      // CSS motion stays enabled even if an optional browser API is unavailable.
      cards.forEach((card,cardIndex)=>{
        card.style.setProperty('--logo-offset',[-12,14,0][cardIndex%3]);
        card.dataset.floatGroup=String((cardIndex+index)%4+1);
        rowTrack.append(card);
      });
      rowTrack.dataset.originalCount=String(cards.length);
      for(let repeat=0;repeat<3;repeat++){
        cards.forEach(card=>{
          const clone=card.cloneNode(true);
          clone.setAttribute('aria-hidden','true');
          clone.querySelectorAll('a,button,[tabindex]').forEach(el=>el.setAttribute('tabindex','-1'));
          rowTrack.append(clone);
        });
      }
      lane.append(rowTrack);
      viewport.append(lane);
    });
    const mediaMatches=query=>typeof window.matchMedia==='function' && window.matchMedia(query).matches;
    const animationsFor=element=>{
      try{return element && typeof element.getAnimations==='function'?element.getAnimations():[];}
      catch{return [];}
    };
    const railAnimation=track=>animationsFor(track).find(item=>item.animationName==='logo-drift');
    const setRailSpeed=()=>{
      viewport.style.setProperty('--rail-viewport-width',`${document.documentElement.clientWidth}px`);
      const pixelsPerSecond=mediaMatches('(prefers-reduced-motion: reduce)')?12:mediaMatches('(max-width:700px)')?27.5:55;
      viewport.querySelectorAll('.logo-track').forEach(track=>{
        const count=Number(track.dataset.originalCount);
        const first=track.firstElementChild;
        const firstClone=track.children[count];
        // Matching edges include all actual card widths, margins and flex gaps.
        // Count × first-card width misses the inherited customer-gallery gap.
        const measuredWidth=firstClone.getBoundingClientRect().left-first.getBoundingClientRect().left;
        // Ignore floating-point noise from subtracting translated positions.
        const loopWidth=Math.round(measuredWidth*1e6)/1e6;
        if(!(loopWidth>0))return;

        // Keep a complete extra cycle beyond the visible area, even on wide screens.
        // Append only whole, identical sequences so every seam has the same spacing.
        const copies=Math.max(2,Math.ceil(viewport.clientWidth/loopWidth)+2);
        while(track.children.length<count*copies){
          for(let i=0;i<count;i++){
            const clone=track.children[i].cloneNode(true);
            clone.setAttribute('aria-hidden','true');
            clone.querySelectorAll('a,button,[tabindex]').forEach(el=>el.setAttribute('tabindex','-1'));
            track.append(clone);
            // New copies must share the originals' floating phase at the seam.
            const sourceAnimations=animationsFor(track.children[i].querySelector('.logo-image'));
            const cloneAnimations=animationsFor(clone.querySelector('.logo-image'));
            cloneAnimations.forEach(animation=>{
              const source=sourceAnimations.find(item=>item.animationName===animation.animationName);
              if(source){try{animation.currentTime=source.currentTime;}catch{ /* Optional decorative synchronization. */ }}
            });
          }
        }

        const duration=loopWidth/pixelsPerSecond;
        const distanceValue=`${-loopWidth}px`;
        const durationValue=`${duration}s`;
        if(track.style.getPropertyValue('--logo-loop-distance')!==distanceValue ||
           track.style.getPropertyValue('--rail-duration')!==durationValue){
          const animation=railAnimation(track);
          let progress=0;
          try{progress=animation?.effect?.getComputedTiming?.().progress||0;}catch{ /* CSS remains the motion engine. */ }
          track.style.setProperty('--logo-loop-distance',distanceValue);
          track.style.setProperty('--rail-duration',durationValue);
          // A duration change otherwise reinterprets elapsed time and visibly jumps.
          // Preserve the current point in the sequence across responsive breakpoints.
          const updated=railAnimation(track);
          if(updated){try{updated.currentTime=progress*duration*1000;}catch{ /* Timing control is optional. */ }}
        }
        track.style.animationPlayState='running';
      });
    };
    let resizeFrame=0;
    const scheduleRailLayout=()=>{
      if(resizeFrame)return;
      if(typeof requestAnimationFrame!=='function'){setRailSpeed();return;}
      resizeFrame=requestAnimationFrame(()=>{
        resizeFrame=0;
        setRailSpeed();
      });
    };
    // Measure synchronously before first paint; never depend on unpausing later.
    setRailSpeed();
    if(typeof ResizeObserver==='function'){
      try{
        const resizeObserver=new ResizeObserver(scheduleRailLayout);
        resizeObserver.observe(viewport);
        viewport.querySelectorAll('.logo-track').forEach(track=>resizeObserver.observe(track));
      }catch{ /* Resize/pageshow listeners remain available. */ }
    }
    window.addEventListener('resize',scheduleRailLayout,{passive:true});
    window.addEventListener('pageshow',scheduleRailLayout);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRailLayout();});
    if(typeof window.matchMedia==='function'){
      const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
      if(typeof preference.addEventListener==='function')preference.addEventListener('change',scheduleRailLayout);
      else if(typeof preference.addListener==='function')preference.addListener(scheduleRailLayout);
    }
    return;
  }
  const track=document.createElement('div');
  track.className='logo-track is-moving';
  sourceCards.forEach(card=>track.append(card));
  sourceCards.forEach(card=>{
    const clone=card.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    clone.querySelectorAll('a,button,[tabindex]').forEach(el=>el.setAttribute('tabindex','-1'));
    track.append(clone);
  });
  viewport.append(track);

  const controls=document.querySelector('.carousel-controls');
  const toggle=controls?.querySelector('[data-carousel="toggle"]');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused=reduceMotion.matches;
  let staticPosition=0;
  const playText='\u0e40\u0e25\u0e48\u0e19';
  const pauseText='\u0e2b\u0e22\u0e38\u0e14';
  const getAnimation=()=>track.getAnimations().find(animation=>animation.animationName==='logo-drift');
  const loopWidth=()=>track.scrollWidth/2;
  const updateToggle=()=>{
    toggle?.setAttribute('aria-pressed',String(manuallyPaused));
    if(toggle){
      toggle.textContent=manuallyPaused?playText:pauseText;
      toggle.setAttribute('aria-label',manuallyPaused?'Play client logos':'Pause client logos');
    }
  };
  const setPauseState=paused=>{
    manuallyPaused=paused;
    track.classList.toggle('is-paused',paused);
    if(paused&&reduceMotion.matches&&!track.classList.contains('motion-enabled')){
      track.style.transform=`translate3d(${-staticPosition}px,0,0)`;
    }else if(!paused){
      track.style.transform='';
      if(reduceMotion.matches)track.classList.add('motion-enabled');
      else track.classList.remove('motion-enabled');
    }
    updateToggle();
  };
  controls?.addEventListener('click',event=>{
    const button=event.target.closest('button');
    const action=button?.dataset.carousel;
    if(action==='toggle'){setPauseState(!manuallyPaused);return;}
    if(action!=='next'&&action!=='prev')return;
    const direction=action==='next'?1:-1;
    const width=loopWidth();
    if(width<=0)return;
    const advance=Math.max(1,Math.min(viewport.clientWidth*.72,width*.72));
    const animation=getAnimation();
    if(reduceMotion.matches&&manuallyPaused&&!track.classList.contains('motion-enabled')){
      staticPosition=(staticPosition+direction*advance+width)%width;
      track.style.transform=`translate3d(${-staticPosition}px,0,0)`;
      return;
    }
    if(manuallyPaused&&!reduceMotion.matches)setPauseState(false);
    const activeAnimation=getAnimation();
    if(activeAnimation&&typeof activeAnimation.effect.getTiming().duration==='number'){
      const duration=activeAnimation.effect.getTiming().duration;
      const current=(Number(activeAnimation.currentTime)||0)%duration;
      const step=duration*advance/width;
      activeAnimation.currentTime=(current+direction*step+duration)%duration;
      if(!manuallyPaused)activeAnimation.play();
    }else if(!reduceMotion.matches){
      staticPosition=(staticPosition+direction*advance+width)%width;
      track.style.transform=`translate3d(${-staticPosition}px,0,0)`;
    }
  });
  if(manuallyPaused)setPauseState(true);
  reduceMotion.addEventListener?.('change',event=>{
    track.classList.remove('motion-enabled');
    staticPosition=0;
    track.style.transform='';
    setPauseState(event.matches);
  });
})();
