const fs = require('fs');

const updates = {
  'dark': {
    char: "Scoring 7.5, the German ensemble commits fully to the show's complexity—actors playing multiple versions of themselves across time. Louis Hofmann's Jonas anchors the emotional chaos; Lisa Vicari's Martha provides tragic romance. The dual-role performances require extraordinary discipline. The acting serves the plot's demands rather than transcending them.",
    world: "Scoring 9.5, Winden is built through generations—the same locations across 1953, 1986, 2019, 2052. The show creates convincing small-town Germany while layering temporal paradox. The interconnected families spanning decades is the show's architectural marvel. Time travel world-building done right.",
    cine: "Scoring 8, the visual approach is muted and deliberate—dark forests, industrial facilities, domestic interiors. The cinematography emphasizes dread over spectacle. The show uses its limited locations effectively through time period differentiation. It looks expensive and thoughtful.",
    spect: "Scoring 7, spectacle is restrained—the show delivers through implication. The time travel portals, the wormhole, the apocalypse events are shown economically. The show's power comes from mystery, not scale. The red cave provides striking visual anchor.",
    conc: "Scoring 9, Dark is a masterclass in conceptual density—determinism vs. free will, the bootstrap paradox, time travel mechanics, family trauma, cycles of abuse. It asks: Can we change fate? The density requires attention but rewards it. It's philosophy wrapped in thriller.",
    drive: "Scoring 8.5, the narrative operates across three seasons with escalating complexity—seasons 1-2 build the mystery; season 3 explodes the multiverse. The pacing is patient, requiring viewer investment. The final season achieves genuine momentum toward revelation.",
    resol: "Scoring 8, the series finale resolves the central paradox (Jonas and Martha's choice) while acknowledging the tragedy. It's not happy but it's complete. The show honors its determinism theme—ending is inevitable, but meaning is chosen. It sticks the landing."
  },
  'babylon-berlin': {
    char: "Scoring 8.5, Volker Bruch's Gereon Rath provides noir gravitas; Liv Lisa Fries's Charlotte offers period-defying independence. The German ensemble creates convincing Weimar Republic atmosphere. The performances serve the historical recreation without showboating. The acting is committed and appropriate.",
    world: "Scoring 9, 1929 Berlin is rendered in obsessive detail—political factions, cabaret culture, economic desperation, rising fascism. The show builds Weimar Germany as a powder keg waiting to ignite. The world is historically authentic and politically timely.",
    cine: "Scoring 8, the show looks gorgeous—period production values, careful framing, appropriate glamour amid decay. Cinematography serves historical recreation without drawing attention. The visual approach is expensive and convincing.",
    spect: "Scoring 7.5, spectacle emerges through production scale—street scenes, train stations, clubs, political gatherings. The show delivers period atmosphere as spectacle. Big set pieces occur but are secondary to character.",
    conc: "Scoring 7.5, the show explores Weimar collapse, political extremism, gender liberation, and crime in desperate times. The density is historical and political. It asks how societies fail and what individuals do when systems crumble.",
    drive: "Scoring 7, the mystery-procedural structure provides momentum across multiple seasons. The plot moves deliberately through cases and conspiracies. The pacing is patient, rewarding attention. Some seasons drag compared to others.",
    resol: "Scoring 6, the show is ongoing (continuing production); it addresses historical endpoint (1933) approaching. Some character arcs complete while the political situation worsens. Resolution is partial by necessity."
  },
  'true-detective-s1': {
    char: "Scoring 8.5, McConaughey's Rust Cohle is iconic—philosophical, broken, magnetic. Harrelson's Marty provides perfect counterpoint—conventional, compromised, human. The two-hander structure lets both actors shine. Supporting cast is functional. The performances elevate the material into something memorable.",
    world: "Scoring 8.5, Louisiana's bayou country becomes a character—Spanish moss, industrial decay, regional religion, cultic history. The show builds a convincing Southern Gothic atmosphere. The world is specific, atmospheric, and threatening.",
    cine: "Scoring 9, Cary Fukunaga's direction is extraordinary—6-minute tracking shot, careful composition, natural lighting, the Yellow King imagery. This is prestige television cinematography at its peak. The show looks like cinema.",
    spect: "Scoring 8, spectacle arrives through location—the bayou, abandoned churches, industrial landscapes. The show delivers haunting images: the tree, the spiral, the Ledoux compound. The 6-minute tracking shot is legendary.",
    conc: "Scoring 8, the show explores time, memory, masculinity, religion, and cosmic horror. Cohle's philosophical monologues provide intellectual density. Questions of determinism, evil, and human nature pervade. It's smart without being pretentious.",
    drive: "Scoring 8.5, the dual-timeline structure (1995/2012/2014) creates mystery and momentum. The narrative is propulsive despite philosophical digressions. Eight episodes is the perfect length—no fat. Every scene advances or reveals.",
    resol: "Scoring 8, the ending—Cohle's realization about the light, Marty's bemused acceptance—provides emotional closure while honoring ambiguity. The case resolves; the questions remain. It's a complete story well-told."
  },
  'the-knick': {
    char: "Scoring 8, Clive Owen's Thackery is magnetic—addicted genius, cruel brilliance, occasional humanity. The ensemble (André Holland, Eve Hewson, Juliet Rylance) creates convincing period hospital ecosystem. The performances serve medical procedural demands while adding depth.",
    world: "Scoring 9, 1900 New York and the Knickerbocker Hospital is built with documentary precision—medical procedures, ethnic neighborhoods, electrical lighting, period technology. The show captures medicine emerging from barbarism. The world is historically authentic and visceral.",
    cine: "Scoring 8.5, Soderbergh shoots with period-appropriate techniques—lens choices, color grading, directorial restraint. The surgery scenes are unflinching. The show looks expensive and historically convincing.",
    spect: "Scoring 7.5, spectacle includes surgery sequences—unflinching medical procedures, early electrical experiments. The show delivers period recreation as spectacle. Hospital scale and location provide visual interest.",
    conc: "Scoring 7.5, the show explores medical ethics, addiction, race, class, and scientific progress. The density comes from historical medicine's moral complexity. It asks what doctors owe patients, what progress costs.",
    drive: "Scoring 7, the medical-procedural structure provides weekly cases amid seasonal arcs. The pacing is deliberate, occasionally slow. The show trusts viewers to follow medical detail. Character development outweighs plot urgency.",
    resol: "Scoring 7, Season 2 ends with closure for some characters, cliffhangers for others. The show was cancelled before planned completion. It's incomplete but not unsatisfying. The journey outweighs the destination."
  },
  'penny-dreadful': {
    char: "Scoring 8, Eva Green's Vanessa Ives is the show's dark heart—possessed, powerful, tragic. The ensemble—Josh Hartnett, Timothy Dalton, Rory Kinnear—commits to gothic excess. The performances serve horror melodrama without irony. Eva Green is extraordinary; others support effectively.",
    world: "Scoring 8.5, Victorian London plus supernatural elements—Frankenstein, Dracula, Dorian Gray, werewolves, witchcraft. The show builds a cohesive mythology from disparate sources. The world is atmospheric and literate.",
    cine: "Scoring 8, the show looks gorgeous—gothic production design, candlelit interiors, fog-wrapped exteriors. Visually appropriate for the genre. The show creates convincing 19th-century atmosphere.",
    spect: "Scoring 7.5, supernatural horror provides spectacle—creatures, possessions, occult rituals. The show delivers gothic imagery effectively. The horror is more atmospheric than action-oriented.",
    conc: "Scoring 4, the show prioritizes atmosphere over ideas. Themes exist—faith, damnation, identity—but remain underdeveloped compared to character and style. It's beautiful and empty.",
    drive: "Scoring 7.5, the supernatural mystery structure creates momentum across three seasons. Vanessa's story provides narrative through-line. The plotting can be uneven. Character moments outweigh plot mechanics.",
    resol: "Scoring 7.5, the series finale kills Vanessa—tragic but appropriate. The monster assembly is satisfying. Some characters get closure; others tease future stories. The ending honors the gothic tradition."
  },
  'station-eleven': {
    char: "Scoring 8, Mackenzie Davis and Himesh Patel ground the post-apocalypse in human specificity. The ensemble weaves between pre- and post-pandemic timelines with grace. The Traveling Symphony provides community within devastation. The acting is quiet, human, unshowy.",
    world: "Scoring 8.5, the post-pandemic Great Lakes region is built through accumulation—abandoned airports, repurposed malls, the dangerous territory between settlements. The show creates convincing aftermath through mundanity. The world feels like tourism through collapse.",
    cine: "Scoring 8, the show looks beautiful—Toronto standing in for multiple locations, careful composition, natural light. The cinematography captures both the emptiness and the reclaimed beauty. It's visually poetic without ostentation.",
    spect: "Scoring 7, spectacle is understated—the show finds beauty in abandoned spaces rather than destruction. The Traveling Symphony performances provide moments of visual interest. The focus is on human scale, not set pieces.",
    conc: "Scoring 7.5, the show explores memory, art, community, and what survives catastrophe. The density is emotional rather than philosophical. It asks what we owe each other and what endures. The pandemic framing gained resonance post-COVID.",
    drive: "Scoring 7, the interwoven timelines require patience but reward attention. The narrative moves deliberately through memory and present. Some viewers find the pace slow. The structure serves theme over propulsion.",
    resol: "Scoring 7, the series finale connects timelines and characters—Tyler's redemption, Kirsten's peace, the Symphony's continuity. It provides closure without tidiness. The ending affirms art's persistence through loss."
  },
  'severance': {
    char: "Scoring 9, Adam Scott's duality as innie and outtie is technically extraordinary—same actor, different performances. The ensemble—Britt Lower, John Turturro, Christopher Walken, Patricia Arquette—commits fully to the premise's absurdity. The acting balances deadpan comedy with existential dread flawlessly.",
    world: "Scoring 10, Lumon Industries is built with obsessive detail—the Macrodata Refinement floor, the hallways, the perpetually 1970s aesthetic. The show creates uncanny corporate limbo. The world feels simultaneously familiar and alien. It's among TV's best world-building.",
    cine: "Scoring 9, the visual approach is sterile perfection—symmetrical compositions, liminal lighting, corporate horror. The cinematography makes office work visually compelling. The show is funny, disturbing, and gorgeous simultaneously.",
    spect: "Scoring 7.5, spectacle arrives through implication—the hallway scenes, the perpetuity wing, the goat room. The show delivers memorable images without action. The visual power comes from design intelligence.",
    conc: "Scoring 9, Severance interrogates work-life balance literally—what parts of ourselves we sacrifice for employment. It explores identity, consciousness, memory, and capitalism's colonization of the self. The density is extraordinary; every episode layers meaning.",
    drive: "Scoring 8.5, the mystery structure is propulsive—each episode provides revelations and new questions. The pacing is masterful, building toward season finales that explode expectations. The show maintains tension through restraint.",
    resol: "Scoring 6, season one ends on a cliffhanger—the innies outside Lumon. Season two is ongoing. It's incomplete by design. The journey so far is extraordinary but the story isn't over."
  },
  'hannibal': {
    char: "Scoring 8.5, Mads Mikkelsen's Hannibal is otherworldly—elegant, terrifying, seductive. Hugh Dancy's Will Graham matches him through empathy and fragmentation. The two-hander drives the series. Supporting cast—Laurence Fishburne, Gillian Anderson—provides grounding.",
    world: "Scoring 8.5, the show builds a heightened reality where killers create art from bodies. The FBI and Hannibal's world blur—his practice, his kitchen, his victims as aesthetic. It's a fairy tale rendered in blood and cuisine.",
    cine: "Scoring 9, Fuller created television's most visually ambitious show—every frame composed like a painting. The horror is beautiful; the violence is aesthetic. The show looks more expensive than it was. It's pure visual excess.",
    spect: "Scoring 8.5, the death tableaux are genuinely stunning—horror as art installation. The show delivers visual spectacle through audacity. The kitchen scenes, the murders, the dream sequences—all are unforgettable.",
    conc: "Scoring 8, the show explores empathy, obsession, identity, and the relationship between creator and subject. The density is psychological—what it means to understand monsters, to become them, to love them. It's intellectually ambitious.",
    drive: "Scoring 6.5, the plot moves slowly, prioritizing aesthetic and psychology over propulsion. Individual episodes can feel static. The show requires patience. The Red Dragon arc accelerates in the final season. It's a slow burn.",
    resol: "Scoring 3.5, the series was cancelled mid-story. The finale—Cliff of the Fallen—provides beautiful imagery but incomplete narrative. It's among TV's most frustrating endings. The movie or revival never came."
  },
  'wolf-hall': {
    char: "Scoring 9, Mark Rylance's Cromwell says more with silence than most do with speeches. The performance is minutely observed—every glance, every pause, every calculated movement. The ensemble (Damian Lewis, Claire Foy) operates at the same level. It's acting as art.",
    world: "Scoring 8.5, 1530s England is built through detail—court protocols, religious politics, factional maneuvering. The show creates convincing Tudor court as dangerous chess game. The world is historically authentic and politically treacherous.",
    cine: "Scoring 8.5, the visual approach is candle-lit and shadowed—natural lighting, meticulous framing, period accuracy. The show looks like paintings come to life. The cinematography serves history without romanticizing it.",
    spect: "Scoring 6.5, spectacle is restrained—this is people talking in rooms. The show delivers through performance rather than scale. Individual scenes have visual power; there's no action to speak of.",
    conc: "Scoring 7.5, the show explores power, loyalty, religion, and survival in treacherous times. Mantel's source material provides intellectual heft. It asks how individuals navigate systems that consume them.",
    drive: "Scoring 7.5, the narrative follows history—Cromwell's rise, Anne's fall. The pacing is deliberate, even slow. The show trusts viewers to engage with court politics. Historical knowledge helps but isn't required.",
    resol: "Scoring 7.5, season one ends with Anne's execution; season two covers Cromwell's fall. The historical arc completes his story. It's tragic but complete. The show honors the historical record while dramatizing brilliantly."
  },
  'rome': {
    char: "Scoring 8, the ensemble commits to HBO's historical soap—Ciaran Hinds' Caesar, Kevin McKidd, Ray Stevenson. The performances are theatrical in the best sense—emotional, direct, compelling. The show knows it's melodrama and plays it straight.",
    world: "Scoring 9, ancient Rome is built with obsessive detail—the Forum, the streets, the costumes, the daily life. The show captures Republic transitioning to Empire. The world feels lived-in and historically plausible.",
    cine: "Scoring 7.5, the show looks handsome—period production values, competent coverage. The cinematography serves the story without distinction. It's consistently professional.",
    spect: "Scoring 8, spectacle includes Colosseum scenes, Senate drama, battles, the city itself. The show delivers ancient Rome at scale. The production value justifies the premium cable budget.",
    conc: "Scoring 7, the show explores power, loyalty, politics, and the personal cost of empire. The density is historical—how Republic became Empire. It's smart without being philosophical.",
    drive: "Scoring 8, the historical narrative moves with purpose—from Caesar's rise to his fall, through Octavian's emergence. The plotting is propulsive despite compression. Two seasons cover many years efficiently.",
    resol: "Scoring 7, season two ends with Antony and Cleopatra's deaths, Octavian triumphant. It reaches the historical endpoint, though some characters were invented or their fates altered. The show provides closure."
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
