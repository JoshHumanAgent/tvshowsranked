const fs = require('fs');

const updates = {
  'peaky-blinders': {
    char: "Scoring 7.5, Cillian Murphy's Tommy Shelby is magnetic—contained violence, strategic brilliance, wounded humanity. The ensemble (Paul Anderson, Helen McCrory, Tom Hardy in guest spots) commits to period gangster grandeur. The acting serves the stylized tone.",
    world: "Scoring 8, 1920s Birmingham is built through industrial grime, criminal hierarchy, and family mythology. The show creates convincing working-class gangster world. The Peaky Blinders become legend through accumulated detail.",
    cine: "Scoring 8, the show looks gorgeous—anachronistic modern music, stylized violence, period atmosphere. The cinematography is deliberately cool. Slow motion and montage create distinctive visual language.",
    spect: "Scoring 8.5, the show delivers stylized violence, gang warfare, and period production value. The spectacle is central to appeal. Every episode has visual punch.",
    conc: "Scoring 6.5, the show explores family, loyalty, and the cost of ambition. Themes exist but secondary to style. It's more concerned with cool than philosophy.",
    drive: "Scoring 7.5, the narrative moves through gangster rise with propulsive energy. Seasonal arcs build effectively. Later seasons lose some momentum as the scope expands.",
    resol: "Scoring 6, the final season provides closure of sorts but feels rushed. The movie continuation is planned. It's incomplete but the character journey has shape."
  },
  'foundation': {
    char: "Scoring 7, Jared Harris provides gravitas; Lee Pace is magnetic as multiple emperors. The ensemble is capable but material sometimes overwhelms. Acting is committed but variable.",
    world: "Scoring 9, the galaxy-spanning empire is built with scale—Trantor, Terminus, multiple worlds. The show delivers convincing space opera production value. World building honors Asimov while expanding.",
    cine: "Scoring 8.5, the show looks expensive—visual effects, production design, cinematography all at high level. The scope is cinematic. It justifies the Apple budget.",
    spect: "Scoring 8.5, space opera spectacle—ships, planets, the fall of Trantor. The show delivers visual scale. The genetic dynasty visual concept is striking.",
    conc: "Scoring 7.5, the show explores empire, decline, psychohistory, and determinism. The density is present but sometimes overwhelmed by production. Ideas exist but compete with spectacle.",
    drive: "Scoring 7, the narrative moves through multiple timelines with varying success. The scope creates momentum issues. Some storylines are more compelling than others.",
    resol: "Scoring 5, the show is ongoing; storylines are incomplete. The Seldon Plan spans centuries so resolution is distant. It feels like prologue."
  },
  'twin-peaks-the-return': {
    char: "Scoring 8, Kyle MacLachlan playing multiple Coopers is extraordinary—Dougie's innocence, Mr. C's evil, the original's return. The ensemble (Lynch regulars, new faces) commits to the dream. The acting serves the surrealism.",
    world: "Scoring 9, Twin Peaks expanded across dimensions, the Black Lodge, Las Vegas, South Dakota. Lynch creates uncanny reality. The world is the show's greatest achievement—unlike anything else.",
    cine: "Scoring 9.5, Lynch directs hours of the most visually adventurous television ever made. The cinematography is experimental and beautiful. Episode 8 is pure cinema.",
    spect: "Scoring 8, spectacle arrives through surrealism—the atomic sequence, the woodsmen, the roadhouse. The show delivers unforgettable images. Lynch uses the medium as art.",
    conc: "Scoring 9, the show explores time, identity, evil, dreams, and the nature of reality. The density is extraordinary and elusive. It resists interpretation—which is the point.",
    drive: "Scoring 6.5, the narrative moves at Lynch's pace—which means glacial mystery punctuated by inexplicable horror. The structure defies conventional momentum. It's experiential rather than propulsive.",
    resol: "Scoring 7, the finale—Cooper and Laura's return to the past, the unresolved scream—is pure Lynch. It doesn't resolve but it resonates. The ending is appropriate to the dream logic."
  },
  'for-all-mankind': {
    char: "Scoring 7.5, Joel Kinnaman's Baldwin anchors the alternate history with convincing astronaut gravitas. The ensemble rotates through decades but maintains continuity. The acting serves the epic scope.",
    world: "Scoring 8.5, the alternate space race is built with technical authenticity—NASA culture, space missions, the expanding timeline. The show creates convincing aerospace world that diverges from our own.",
    cine: "Scoring 8, the space sequences look expensive and convincing. The cinematography captures both technical realism and wonder. The Mars sequences achieve genuine visual scope.",
    spect: "Scoring 8, space travel provides spectacle—launches, spacewalks, lunar bases, Mars colonies. The show delivers space opera grounded in engineering. The scale justifies the Apple budget.",
    conc: "Scoring 7, the show explores American exceptionalism, sacrifice, and the value of exploration. The density is present but sometimes overwhelmed by plot mechanics. Ideas exist but compete with timeline juggling.",
    drive: "Scoring 7.5, the narrative leaps through decades, creating momentum through technological escalation. Seasonal arcs vary in propulsion. The later seasons accelerate toward Mars.",
    resol: "Scoring 5, the show is ongoing; humanity's space future continues. Season endings provide partial closure while teasing future expansion. It's incomplete by design."
  },
  'the-queens-gambit': {
    char: "Scoring 8, Anya Taylor-Joy's Beth Harmon is iconic—intensity, vulnerability, genius addiction. The performance carries the limited series. Supporting cast (Bill Camp, Marielle Heller) provides grounding.",
    world: "Scoring 8, 1960s chess culture and international competition is built through period detail and competitive atmosphere. The show makes chess visually compelling. The orphanage-to-stardom trajectory is convincing.",
    cine: "Scoring 8.5, the show is visually stunning—chess as geometry, period production design, hallucinatory sequences. The cinematography makes strategy cinematic. The visual language is distinctive.",
    spect: "Scoring 7.5, spectacle arrives through chess matches rendered as psychological warfare. The show finds drama in stillness. The tournament sequences have genuine tension.",
    conc: "Scoring 7, the show explores addiction, genius, gender barriers, and found family. The density is personal rather than philosophical. It asks what excellence costs.",
    drive: "Scoring 8, the narrative follows Beth's rise through competition with propulsive energy. The structure is classic sports movie but executed with style. The pacing is perfect for the format.",
    resol: "Scoring 8, the finale—Moscow, the final match, the park bench—provides satisfying triumph. It's earned and complete. The limited series format allows genuine closure."
  },
  'generation-kill': {
    char: "Scoring 7.5, the ensemble of unknowns creates convincing Marine culture—banter, hierarchy, confusion. Alexander Skarsgård stands out as Iceman. The acting is naturalistic and immersive.",
    world: "Scoring 8.5, the 2003 Iraq invasion is built through embedded detail—military procedure, chain of command chaos, cultural collision. The show is journalism as drama.",
    cine: "Scoring 7.5, the show captures desert warfare with documentary realism. The cinematography serves the journalistic tone. It's unglamorous and appropriate.",
    spect: "Scoring 7, combat provides spectacle but the show emphasizes confusion over heroism. The Humvee convoy sequences have tension. No glorification.",
    conc: "Scoring 8, the show explores military culture, incompetence, the fog of war, and American imperialism. The density comes from observation rather than argument. It's smart war reporting.",
    drive: "Scoring 7.5, the episodic structure follows the invasion's progression. The narrative moves with purpose toward Baghdad. The momentum is inexorable.",
    resol: "Scoring 7, the series ends with arrival in Baghdad—mission incomplete, war ongoing. It provides situational closure but not narrative resolution. The ending honors the reality."
  },
  'girls': {
    char: "Scoring 7.5, Lena Dunham's Hannah is self-absorbed, narcissistic, occasionally brilliant. The ensemble (Allison Williams, Jemima Kirke, Zosia Mamet) creates specific millennial types. The acting is raw and uncomfortable.",
    world: "Scoring 7, 2010s Brooklyn is built through specific reference points—jobs, apartments, relationships, cultural context. The show creates a particular urban millennial experience.",
    cine: "Scoring 7, the show is shot intimately—close-ups, natural lighting, handheld feel. The cinematography serves the personal drama. It's unshowy.",
    spect: "Scoring 5, spectacle is non-existent—this is people in rooms talking. The show finds drama in interpersonal awkwardness. No visual ambition.",
    conc: "Scoring 7, the show explores millennial entitlement, friendship, creative ambition, and privileged angst. The density is sociological. It captures a specific cultural moment.",
    drive: "Scoring 7, the narrative follows twenty-something drift—careers, relationships, growing up. The pacing is deliberately aimless. Some seasons are more propulsive than others.",
    resol: "Scoring 7.5, the finale—Hannah as mother, the final confrontation—provides character closure. It's appropriate to the show's ambivalence. Not everyone grows up."
  },
  'pose': {
    char: "Scoring 8, the cast brings authentic trans experience—MJ Rodriguez, Dominique Jackson, Indya Moore. Billy Porter's Pray Tell is extraordinary. The acting is grounded in real community.",
    world: "Scoring 8.5, 1980s-90s New York ballroom culture is built with love and authenticity—the houses, the categories, the AIDS crisis. The show creates a world rarely seen on television.",
    cine: "Scoring 7.5, the show captures period through production design and costume. The ballroom sequences have visual energy. The cinematography is functional with flashes of beauty.",
    spect: "Scoring 7, the ballroom performances provide spectacle—costumes, dancing, competition. The show finds joy in community. The AIDS crisis provides tragic counterpoint.",
    conc: "Scoring 7.5, the show explores chosen family, trans identity, the AIDS crisis, and survival. The density is personal and political. It's historically important.",
    drive: "Scoring 7.5, the narrative moves through the years with accumulating loss. The structure follows house mothers and their children. Season three accelerates toward conclusion.",
    resol: "Scoring 7.5, the final season provides closure for characters—some survive, many don't. The ending honors the history—joy and grief intertwined."
  },
  'the-pacific': {
    char: "Scoring 7.5, the ensemble is capable—James Badge Dale, Jon Seda, Joseph Mazzello. The acting serves the material. Different actors take focus in different episodes. It's ensemble war drama.",
    world: "Scoring 9, the Pacific Theater is built through island-hopping hell—Guadalcanal, Peleliu, Iwo Jima, Okinawa. The show creates convincing jungle warfare. The World War II recreation is extraordinary.",
    cine: "Scoring 8.5, the show is visually stunning—jungle combat, naval battles, tropical hell. The cinematography captures both beauty and horror. It matches Band of Brothers' production values.",
    spect: "Scoring 9, war spectacle—combat sequences are brutal and technically impressive. The show delivers Pacific Theater scale. The production value is extraordinary.",
    conc: "Scoring 7.5, the show explores the Pacific War's particular horror, PTSD, and survival. The density is in the experience. It asks what war costs.",
    drive: "Scoring 7.5, the narrative follows different units across campaigns. The structure is episodic rather than unified. It builds cumulative weight through repetition.",
    resol: "Scoring 7.5, the finale returns home—survivors changed, some unable to leave the war. It provides closure through individual stories. The ending is appropriate."
  },
  'the-handmaids-tale': {
    char: "Scoring 8, Elisabeth Moss carries the series—June's suffering, rage, and resistance. The performance is physically committed. The ensemble (Yvonne Strahovski, Ann Dowd, O-T Fagbenle) provides strong support.",
    world: "Scoring 9, Gilead is built with documentary precision—the rituals, the oppression, the geography of tyranny. The show creates convincing dystopia through detail. The world is terrifyingly plausible.",
    cine: "Scoring 8, the show looks distinctive—red cloaks, the Wall, the commanders' houses. The cinematography emphasizes surveillance and oppression. It's visually striking.",
    spect: "Scoring 7.5, the show delivers through Gilead's ritual horror—ceremonies, punishments, rebellions. The spectacle is ideological. The escapes provide action.",
    conc: "Scoring 8.5, the show explores patriarchy, reproductive rights, resistance, and survival. The density is political and urgent. It's among the most thematically loaded series.",
    drive: "Scoring 6, the narrative stretches beyond its natural length. Some seasons feel repetitive. The momentum wavers as the story expands. It's better in concentrated doses.",
    resol: "Scoring 5, the show continues beyond the source material; June's story lacks clear endpoint. It feels ongoing rather than building toward conclusion. The story needs an ending."
  }
};

let count = 0;
for (const [slug, texts] of Object.entries(updates)) {
  const file = `./docs/shows/${slug}.md`;
  if (!fs.existsSync(file)) {
    console.log(`Missing: ${slug}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('Analysis for')) {
    console.log(`Already done: ${slug}`);
    continue;
  }
  
  content = content
    .replace(/Analysis for Characters & Acting dimension\./, texts.char)
    .replace(/Analysis for World Building dimension\./, texts.world)
    .replace(/Analysis for Cinematography dimension\./, texts.cine)
    .replace(/Analysis for Visual Spectacle dimension\./, texts.spect)
    .replace(/Analysis for Conceptual Density dimension\./, texts.conc)
    .replace(/Analysis for Narrative Drive dimension\./, texts.drive)
    .replace(/Analysis for Narrative Resolution dimension\./, texts.resol);
  
  fs.writeFileSync(file, content);
  console.log(`Updated: ${slug}`);
  count++;
}

console.log(`\nTotal: ${count}`);
