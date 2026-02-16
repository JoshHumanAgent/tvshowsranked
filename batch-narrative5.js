const fs = require('fs');

const updates = {
  'the-plot-against-america': {
    char: "Scoring 7.5, Zoe Kazan and Winona Ryder ground the alternate history in family experience. The performances are quietly devastating. The ensemble (John Turturro, Anthony Boyle) creates convincing 1940s community. The acting serves the historical warning.",
    world: "Scoring 8.5, 1940s Newark is built through period detail and the plausible nightmare of Lindbergh's America. The show creates convincing alternate history. The Jewish community feels authentic.",
    cine: "Scoring 7.5, the show is shot with period atmosphere and appropriate restraint. The cinematography serves the family drama. It's unshowy.",
    spect: "Scoring 6.5, spectacle is restrained—this is domestic drama. The show finds horror in political implication. No visual set pieces.",
    conc: "Scoring 8, the show explores fascism, American exceptionalism, Jewish identity, and the fragility of democracy. The density is political and urgently relevant. It's a warning.",
    drive: "Scoring 7.5, the narrative moves through the Lindbergh presidency with inexorable dread. The pacing builds effectively toward catastrophe. The alternative history structure provides momentum.",
    resol: "Scoring 7, the ending is ambiguous and devastating—history reset to familiar path, but the trauma remains. It provides closure without comfort. The finale is appropriate to the warning."
  },
  'mare-of-easttown': {
    char: "Scoring 8.5, Kate Winslet's Mare is extraordinary—Pennsylvania detective, grandmother, grieving mother, exhausted woman. The performance is specific and lived-in. The ensemble (Julianne Nicholson, Jean Smart) provides community.",
    world: "Scoring 8, working-class Pennsylvania is built through accents, locations, community dynamics. The show creates convincing small-town America. The local detail is specific and authentic.",
    cine: "Scoring 7.5, the show captures the gray East Coast atmosphere—winter, decay, domesticity. The cinematography is naturalistic. The location provides visual character.",
    spect: "Scoring 6.5, spectacle is minimal—this is faces and grief. The show finds power in small domestic spaces. No visual ambition beyond appropriate atmosphere.",
    conc: "Scoring 7.5, the show explores grief, addiction, working-class struggle, and small-town secrets. The density is personal rather than philosophical. It's character study.",
    drive: "Scoring 8, the mystery unfolds with genuine tension across seven episodes. The pacing is patient but propulsive. The revelation is earned.",
    resol: "Scoring 8, the finale resolves the mystery while acknowledging ongoing grief. It doesn't tidy everything. The ending honors the difficulty."
  },
  'watchmen-2019': {
    char: "Scoring 8, Regina King's Sister Night is commanding—mysterious, principled, devastating. The ensemble (Jean Smart, Jeremy Irons, Hong Chau) commits to the alternative history. Moore's material is honored if not fully captured.",
    world: "Scoring 9, the alternate America with Vietnam as 51st state and reparations for Tulsa is built with detail. The show creates convincing reality from Moore's excess. The world building is extraordinary.",
    cine: "Scoring 8.5, the show looks distinctive—masks, period mash-up, the Tulsa massacre rendered with horror. The cinematography serves the alternative history. It's visually adventurous.",
    spect: "Scoring 8, the vigilante action, the Tulsa rendering, the squid rain—spectacle serves theme. The show delivers memorable images. Episode 6 is particularly striking.",
    conc: "Scoring 9, the show explores race, history, vigilantism, and American mythology. The density is extraordinary—every layer refers outward. It asks who watches the Watchmen.",
    drive: "Scoring 8, the mystery of Cal's identity, the conspiracy, the Tulsa legacy—multiple plotlines converge. The pacing is propulsive. The nine episodes build effectively.",
    resol: "Scoring 7.5, the finale provides revelation and closure while leaving future open. It honors Moore's ambiguity while providing some resolution. The ending is appropriate."
  },
  'twin-peaks': {
    char: "Scoring 8, Kyle MacLachlan's Cooper is iconic—eccentric, sincere, otherworldly. The ensemble (Sherilyn Fenn, Sheryl Lee, Ray Wise) commits to the dream. The performances are stylized and appropriate.",
    world: "Scoring 9, the original Twin Peaks created television mythology—the town, the Lodge, the supernatural rules. The show built a world that felt both specific and universal. The woods hold secrets.",
    cine: "Scoring 8.5, 1990s television had rarely looked so cinematic. The dreamy atmosphere, the slow motion, the music. Lynch and Frost created visual language.",
    spect: "Scoring 7.5, the show delivers surreal imagery through implication. The Red Room, the waterfall, the music. The spectacle is atmospheric.",
    conc: "Scoring 8.5, the show explores evil, innocence, dreams, and American darkness. The density is mysterious and rich. It resists interpretation.",
    drive: "Scoring 7.5, the murder mystery structure was compelling until the network forced resolution. The Laura Palmer case drives early momentum. Later episodes wander.",
    resol: "Scoring 4, the network-mandated killer revelation undermined the mystery. The film provides additional context. The ending is compromised but culturally significant."
  },
  'slow-horses': {
    char: "Scoring 8, Gary Oldman's Lamb is magnificently disreputable—flatulent, brilliant, surprisingly humane. The ensemble (Jack Lowden, Kristin Scott Thomas) commits to the espionage drudgery. The performances find humor in failure.",
    world: "Scoring 8.5, Slough House and MI5 are built through bureaucratic detail—the failed spies, the institutional contempt, the London intelligence world. The show creates convincing espionage drudgery.",
    cine: "Scoring 7.5, the show captures London gray and the mundanity of spycraft. The cinematography is functional with occasional flair. The locations are appropriate.",
    spect: "Scoring 6.5, action is restrained—this is people in offices and cars. The show finds tension in surveillance. Minimal spectacle.",
    conc: "Scoring 7.5, the show explores loyalty, failure, institutional rot, and competence in incompetent systems. The density comes from character and observation. It's dry and smart.",
    drive: "Scoring 8, each season adapts a Herron novel with propulsive plotting. The mysteries build effectively. The pacing is confident.",
    resol: "Scoring 7, each season provides complete resolution while teasing future. The show maintains closure within continuity. It's satisfying."
  },
  'the-marvelous-mrs-maisel': {
    char: "Scoring 8, Rachel Brosnahan's Midge is rapid-fire perfection—wit, energy, fragility. The performance is technically extraordinary. Tony Shalhoub and Alex Borstein provide support. The acting serves the dialogue.",
    world: "Scoring 8.5, 1950s-60s New York is built through period detail—Borscht Belt, the Gaslight, the suburbs. The show creates convincing Jewish-American experience. The historical figures add authenticity.",
    cine: "Scoring 8, the show looks gorgeous—period production design, costume porn, beautiful locations. The cinematography is polished. The show is visually delightful.",
    spect: "Scoring 7, the stand-up sequences provide energy and entertainment value. The performances within performances are spectacle. The production value is evident.",
    conc: "Scoring 7, the show explores gender, ambition, performance, and family expectation. The density is present but sometimes overwhelmed by style. Ideas are there but compete with wit.",
    drive: "Scoring 7.5, the narrative follows Midge's career with professional highs and lows. The structure is episodic but cumulates. Later seasons lose some momentum.",
    resol: "Scoring 6.5, the final season rushes through years to provide closure. The finale is satisfying if expedient. The character arc completes."
  },
  'downton-abbey': {
    char: "Scoring 7.5, the ensemble creates convincing aristocratic and servant class dynamics. Maggie Smith's Violet is iconic. The performances serve the melodrama. The acting is polished and professional.",
    world: "Scoring 8.5, early 20th century English estate is built with obsessive detail—upstairs/downstairs, period rituals, historical events. The show creates convincing Edwardian world.",
    cine: "Scoring 7.5, the show looks handsome—Highclere Castle, period production, polished photography. The cinematography serves the heritage drama. It's appropriate.",
    spect: "Scoring 7, spectacle arrives through location—castle, grounds, period recreation. The show delivers heritage as entertainment. The film continues this.",
    conc: "Scoring 6.5, the show explores class, changing times, tradition. The density is present but secondary to melodrama. It's comfort food.",
    drive: "Scoring 7, the soap opera structure provides weekly developments and seasonal arcs. The plotting is reliable. Multiple storylines keep momentum.",
    resol: "Scoring 7, the series finale provides closure for characters—marriages, deaths, futures. The film adds additional resolution. It's complete."
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
