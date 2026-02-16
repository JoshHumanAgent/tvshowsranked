const fs = require('fs');

const updates = {
  'line-of-duty': {
    char: "Scoring 8, Martin Compston's Steve, Vicky McClure's Kate, and Adrian Dunbar's Ted create the most compelling police procedural trio. The interrogations are masterclasses in acting under pressure. The rotating guest stars as suspects provide season-by-season excellence.",
    world: "Scoring 8.5, AC-12 and British policing are built with procedural authenticity—interviews, paperwork, hierarchy. The show creates convincing anti-corruption unit. The detail feels researched.",
    cine: "Scoring 7.5, the show captures interview room intensity through coverage and editing. The cinematography is functional. The focus is on faces and evidence.",
    spect: "Scoring 6.5, action is occasional—this is talk, not chase. The show finds tension in paperwork. The finale's spectacle is emotional, not visual.",
    conc: "Scoring 7.5, the show explores police corruption, institutional loyalty, and the cost of truth. The density is procedural and moral. It asks who watches the watchers.",
    drive: "Scoring 8.5, each season builds toward the interview—Hasting's catchphrase, the revelation. The narrative is propulsive. The central mystery accumulates.",
    resol: "Scoring 6.5, the finale was divisive—some answers, many questions. The H reveal disappointed some. It's closure but not the expected closure."
  },
  'the-killing-dk': {
    char: "Scoring 8.5, Sofie Gråbøl's Sarah Lund is iconic—scarf, obsessions, human damage. The performance is specific and lived-in. The supporting cast provides Danish procedural authenticity.",
    world: "Scoring 8.5, Copenhagen and Danish politics are built through location and social detail. The show creates convincing investigation environment. The rain and gray provide atmosphere.",
    cine: "Scoring 8, the show looks distinctive—Scandinavian gray, careful framing, intimate coverage. The cinematography creates mood. It's visually recognizable.",
    spect: "Scoring 7, the show delivers through intensity rather than scale. The investigation provides procedural spectacle. No action set pieces.",
    conc: "Scoring 7.5, the show explores obsession, family cost, and political corruption. The density is procedural with personal stakes. It's character study.",
    drive: "Scoring 8, each season builds toward revelation with genuine tension. The mystery structure is propulsive. The red herrings and reversals maintain momentum.",
    resol: "Scoring 7, each season provides killer revelation. The answers are sometimes satisfying, sometimes not. The journey outweighs the destination."
  },
  'lost': {
    char: "Scoring 7.5, the ensemble was large and capable—Fox, O'Quinn, Emerson, Lilly, Holloway. The performances served the material even as it became unwieldy. Individual actors elevated thin writing.",
    world: "Scoring 9, the Island is one of television's great achievements—mysterious, ancient, alive with mythology. The show built a world of endless questions. The mythology remains fascinating even unfinished.",
    cine: "Scoring 7.5, the show was shot on location in Hawaii—beautiful, distinctive, immediately recognizable. The cinematography captured the island's mystery and beauty.",
    spect: "Scoring 8, the smoke monster, the hatch, the Others—the Island delivered constant spectacle. The show used its location and budget effectively. The plane crash in episode one set the standard.",
    conc: "Scoring 8, the show explored faith vs. reason, destiny vs. free will, redemption, community. The density was extraordinary in early seasons. Later seasons sacrificed philosophy for mythology mechanics.",
    drive: "Scoring 6, the narrative became increasingly unfocused—mysteries accumulated faster than resolutions. The flash-forwards and sideways confused momentum. The show lost propulsion as it expanded.",
    resol: "Scoring 5, the finale disappointed many—emotional closure for characters but left mythology unexplained. The purgatory revelation felt like cheat. Some call it worst ending; others defend it."
  },
  'barry': {
    char: "Scoring 8.5, Bill Hader's Barry is extraordinary—hitman seeking acting, violence leaking into performance. The performance balances comedy and horror. The ensemble—Henry Winkler, Stephen Root, Sarah Goldberg—is equally adept.",
    world: "Scoring 7.5, Los Angeles acting class and criminal underworld are built with insider knowledge. The show captures audition humiliation and criminal logistics. The theater world feels authentic.",
    cine: "Scoring 8, the show is shot with style—deadpan comedy timing, sudden violence, LA locations. The cinematography serves the tone. It looks like indie film.",
    spect: "Scoring 7, action is brief and brutal—this is character comedy. The show delivers through performance, not scale. The violence is shocking.",
    conc: "Scoring 8, the show explores identity, violence, redemption, and performance. It asks if monsters can change. The density comes from tonal complexity—funny and horrifying simultaneously.",
    drive: "Scoring 7.5, each season escalates Barry's entanglement with professional and personal consequence. The plotting is propulsive. The narrative moves toward inevitable catastrophe.",
    resol: "Scoring 5, the show ended abruptly with Bill Hader's decision. The finale leaves characters in crisis without resolution. It's incomplete and frustrating."
  },
  'killing-eve': {
    char: "Scoring 8, Jodie Comer's Villanelle is iconic—playful, deadly, magnetic. Sandra Oh's Eve matches her through obsession and restraint. The two-hander was television's most compelling game of cat and cat.",
    world: "Scoring 7.5, international espionage is built through glamorous locations and hitman logistics. The show creates convincing spy-adjacent world. The Twelve organization remains mysterious.",
    cine: "Scoring 8, the show is stylish—European locations, fashion, murder-as-aesthetic. The cinematography is polished and colorful. It looks like expensive music video.",
    spect: "Scoring 7.5, the assassinations are staged with panache. The show delivers kills-as-entertainment. The set pieces are appropriately stylish.",
    conc: "Scoring 7, the show explores obsession, identity, sexuality, and morality. The density is present but sometimes overwhelmed by style. It's more interested in the game than philosophy.",
    drive: "Scoring 7, the will-they-won't-they murder plot propels early seasons. Later seasons lose momentum. The narrative becomes repetitive.",
    resol: "Scoring 4, the finale killed Villanelle and denied satisfaction. It felt rushed and wrong. Many fans rejected the ending."
  },
  'oz': {
    char: "Scoring 8, the ensemble is extraordinary—Simmons, Tergesen, Meloni, Winters, Reddick. The performances commit to the brutality. The acting serves the prison setting without exploitation.",
    world: "Scoring 8.5, Emerald City and Oz prison are built with claustrophobic detail—the cages, the gangs, the administration. The show creates convincing maximum security hell.",
    cine: "Scoring 7.5, the show is shot intimately—close on violence and degradation. The cinematography makes the prison feel suffocating. The theatrical narrator provides Greek chorus.",
    spect: "Scoring 7, violence is constant and brutal—this is prison life as horror. The show delivers through intensity rather than scale. The violence is the spectacle.",
    conc: "Scoring 7.5, the show explores punishment, redemption, race, sexuality, and institutional failure. The density is present but sometimes overwhelmed by soap opera. Ideas exist but compete with plot.",
    drive: "Scoring 6.5, the narrative moves through multiple storylines with varying success. The season arcs sometimes feel repetitive. The show takes on too many characters.",
    resol: "Scoring 7.5, the series finale provides closure for surviving characters. Many die along the way. The ending acknowledges the system's cruelty."
  },
  '24': {
    char: "Scoring 7, Kiefer Sutherland's Jack Bauer is iconic—tortured, relentless, damaged. The performance commits fully to the format. The ensemble rotates through presidential administrations with competence.",
    world: "Scoring 7.5, CTU and counter-terrorism are built through procedural detail—technology, protocols, politics. The show creates convincing security state. The real-time gimmick grounds it.",
    cine: "Scoring 7, the show is shot functionally—coverage, split-screens, ticking clock. The cinematography has energy but little artistry. It serves the format.",
    spect: "Scoring 8, action sequences are constant—chases, explosions, torture, shootings. The show delivers television-action spectacle. The real-time constraint creates propulsion.",
    conc: "Scoring 6, the show's politics are problematic—torture as heroism, security state as necessary evil. Few ideas beyond action mechanics. It's kinetic rather than thoughtful.",
    drive: "Scoring 8.5, the real-time structure creates inherent momentum—every minute counts. The ticking clock is genius. Each season accelerates toward apocalypse.",
    resol: "Scoring 6, the series ended multiple times. The final finale provided closure while leaving room for revival. It's complete but Jack's story continues (Legacy)."
  },
  'six-feet-under': {
    char: "Scoring 8.5, the ensemble is extraordinary—Peter Krause, Michael C. Hall, Rachel Griffiths, Frances Conroy. The performances find comedy in death and family dysfunction. Acting elevates material to art.",
    world: "Scoring 8, the funeral home and Fisher family are built through specific ritual detail. The show creates convincing family business and domestic dysfunction. The dead appear as commentary.",
    cine: "Scoring 7.5, the show captures LA light and family spaces. The cinematography is functional. The fantasy sequences provide variety.",
    spect: "Scoring 6.5, spectacle comes from death—every episode opens with demise. The funerals provide visual interest. No action.",
    conc: "Scoring 8, the show explores death, grief, family, and meaning. The density is philosophical and emotional. It asks what remains.",
    drive: "Scoring 7.5, the narrative follows family drama with accumulated weight. The episodic structure provides variety. Seasons build emotional momentum.",
    resol: "Scoring 9.5, the finale is legendary—Claire's vision, the song, the montage, the future deaths. One of television's most moving endings. It completes beautifully."
  },
  'the-x-files': {
    char: "Scoring 7.5, Duchovny and Anderson's Mulder and Scully created television's most compelling partnership—belief and skepticism, chemistry and restraint. The performances made genre material profound. Supporting cast varies by season.",
    world: "Scoring 8.5, the conspiracy mythology and monster-of-the-week built a universe of possibility. The show created endless paranoid potential. The world accumulated across nine seasons.",
    cine: "Scoring 7.5, Vancouver locations provided atmosphere. The cinematography improved with seasons. The mood is distinctive.",
    spect: "Scoring 7, aliens, monsters, government operatives—the show delivers genre spectacle weekly. The effects aged but were impressive for TV. The horror episodes achieved genuine scares.",
    conc: "Scoring 7.5, the show explores belief, truth, conspiracy, and faith. The density comes from mythology accumulation. It asks if we're alone.",
    drive: "Scoring 7, the mythology drives early seasons; later seasons lose momentum. The monster-of-the-week provides variety. The arc became unwieldy.",
    resol: "Scoring 5, the original series ended with movie continuation. The 2016 revival was mixed. The mythology was never fully resolved. It continues without completing."
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
