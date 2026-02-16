const fs = require("fs");
const path = require("path");

const updates = {
  "adolescence": {
    char: "Scoring 8.5, the ensemble—led by newcomer Owen Cooper as the accused 13-year-old Jamie—is devastatingly naturalistic. The show's one-shot format demands perfection from every actor over four unbroken hours. Stephen Graham as the father captures bewildered helplessness with remarkable restraint. The DCI and barrister provide procedural counterpoint. This is ensemble acting as endurance art.",
    world: "Scoring 5, the world is deliberately contained: one police station over one night. The show builds its environment through claustrophobia—institutional corridors, interview rooms, holding cells. The British juvenile justice system becomes a character itself. The location is specific: a provincial UK police station rendered in suffocating detail.",
    cine: "Scoring 6.5, the one-shot approach is technically extraordinary—four continuous shots over four hours. The camera work is invisible by design, serving the performances. The cinematography captures the institutional grimness: fluorescent-lit rooms, rain-streaked windows. The visual style is documentary-like, prioritizing presence over polish.",
    spect: "Scoring 7, spectacle emerges from the real-time constraint—the accumulating pressure of performance. There are no action sequences, no grand vistas. The power comes from faces in close-up across four hours. The rain, the time passing, the physical endurance required—these become the spectacle.",
    conc: "Scoring 9.5, Adolescence interrogates masculinity, social media, boyhood violence, and systemic failure with devastating precision. Every scene layers meaning—how the father blames himself, how the system processes children as data, how online culture shapes offline violence. The density is extraordinary; unpacking it requires multiple viewings.",
    drive: "Scoring 7, the real-time structure creates inherent momentum—four episodes, one night, no way out. The pacing alternates between slow-burn intensity and genuine revelation. The one-shot format means every minute counts. It never drags but demands viewer investment.",
    resol: "Scoring 9, the ending refuses easy answers. There is no courtroom catharsis, no happy family reunion. The final image—father and son separated by glass, both crying—is devastating precisely because it offers no resolution. We know Jamie's fate (sentenced), the father's helplessness (complete), and the system's indifference (absolute). It's brutally honest."
  },
  "house-of-the-dragon": {
    char: "Scoring 8, the ensemble operates at high level, though not quite Game of Thrones' peak. Paddy Considine's Viserys provides tragic humanity; Matt Smith's Daemon is magnetic chaos; Emma D'Arcy's Rhaenyra grows into power visibly. The time jumps require multiple actors per character, handled gracefully. The secondary cast—Olivia Cooke, Rhys Ifans—is strong.",
    world: "Scoring 9, Westeros is expanded with Targaryen history—Valyrian legacy, dragon lore, dynastic politics. The world feels lived-in and ancient. The locations are stunning (Croatian coastlines representing Driftmark). The show builds a convincing prehistory that enriches the original series.",
    cine: "Scoring 8, the visual approach mirrors Thrones' production values—beautiful locations, careful composition, dragon CGI integrated convincingly. The Battle of the Stepstones demonstrates capable action direction. The show looks expensive and cinematic throughout.",
    spect: "Scoring 8.5, spectacle involves dragons—multiple fully-realized creatures with distinct personalities. The dragon-riding sequences are thrilling. The show delivers action set pieces (tournaments, battles) alongside quieter court intrigue. The scale justifies the Thrones heritage.",
    conc: "Scoring 7.5, the show explores patriarchy, succession anxiety, maternal grief, and the corrupting nature of power. The themes are there but sometimes less dense than the original. The focus on gender and legitimacy provides thematic through-line. It's prestige drama concepts rather than philosophical inquiry.",
    drive: "Scoring 7.5, the narrative moves with purpose across generations. The time jumps create momentum while occasionally sacrificing intimacy. The central conflict—Rhaenyra vs. Alicent—builds effectively. Season one ends with civil war brewing; season two accelerates into open conflict.",
    resol: "Scoring 6.5, the story is ongoing (continues in future seasons). Season one provides incomplete arcs by design. The resolution to come depends on future seasons. The prequel structure means we know the Targaryen dynasty's ultimate fate, creating tragic irony."
  },
  "angels-in-america": {
    char: "Scoring 8, the performances are theatrical in the best sense—emotional, technical, heightened. Al Pacino as Roy Cohn is spectacular scenery-chewing; Meryl Streep disappears into multiple roles; Justin Kirk and Ben Shenkman provide human anchor. The acting serves Kushner's language, which demands commitment and style. It's theatre on screen.",
    world: "Scoring 7.5, 1980s New York during the AIDS crisis is rendered with period detail and dreamlike interludes. The show moves between reality and fantasy, heaven and earth. The world building encompasses both documentary realism and magical realist imagination. Angels appear; ancestors visit; the scale is metaphysical as well as geographical.",
    cine: "Scoring 7, Nichols directs with careful attention to performance, occasionally at the expense of visual ingenuity. The show looks good without being distinctive. The heavenly sequences provide visual variety. The approach serves the material without transcending it.",
    spect: "Scoring 7.5, spectacle arrives through theatrical magic—angels descending, ancestors materializing, fantastical sequences interrupting reality. The show understands that spectacle serves Kushner's vision rather than dominates it. The angel wings, celestial locations, and dream sequences provide visual interest.",
    conc: "Scoring 9, Kushner's text is the star—exploring AIDS, Mormonism, Judaism, conservatism, sexuality, and American identity through multiple lenses. The density is extraordinary; every scene operates on multiple levels. It's one of the great American plays, adapted with its intellectual heft intact.",
    drive: "Scoring 8.5, the six-hour runtime builds like theatre—acts accumulating toward revelation. The structure requires patience but rewards it. The narrative moves through multiple storylines that eventually intertwine. The pacing is deliberate, allowing Kushner's ideas space to breathe.",
    resol: "Scoring 8, the conclusion—Prior's benediction, Harper's departure, Louis's return—provides emotional closure while acknowledging ongoing struggle. The show refuses false hope while affirming survival. The ending is messy, human, earned. It honors the text's ambivalence about progress and defeat."
  },
  "the-expanse": {
    char: "Scoring 7.5, the ensemble is solid without being exceptional. Thomas Jane's Miller provides noir edge; Steven Strait's Holden grows into command; Shohreh Aghdashloo's Avasarala steals every scene. The supporting cast—Dominique Tipper, Wes Chatham, Frankie Adams—is capable but functional. The acting serves the world more than transcending it.",
    world: "Scoring 10, the solar system is built with unprecedented scientific rigor—Belter culture, Martian society, Earth politics, the outer planets. The show creates distinct civilizations with their own languages (Belter creole), customs, and grievances. The world building is the show's greatest achievement; the science fiction feels plausible.",
    cine: "Scoring 8.5, space opera visuals are handled with grounded realism—ships have inertia, space is silent, colonies look functional rather than glamorous. The show nails the physics and aesthetic of near-future space colonization. The visual approach supports the grounded science fiction.",
    spect: "Scoring 9, spectacle includes the Ring gates, massive space battles, zero-G sequences, and planetary-scale destruction. The show delivers impressive scale on television budget. The protomolecule sequences are genuinely uncanny. The space battles respect physics while delivering excitement.",
    conc: "Scoring 8.5, the show explores colonialism, resource exploitation, political systems, and first contact. The density comes from social science fiction—how societies organize, how resources drive conflict, how technology changes power. It's smart speculative fiction asking real questions.",
    drive: "Scoring 8, the narrative builds effectively across seasons—from noir mystery to political thriller to cosmic horror. The pacing is patient, trusting viewers to follow complex solar-system politics. The Ring gates change the game in season three. The show maintains momentum despite complexity.",
    resol: "Scoring 8, the show was cancelled after six seasons (covering six of nine books). The ending is satisfying without being complete—major plotlines resolve, characters arc, but the Laconian Empire awaits. It's better than expected given cancellation, though not the full saga promised."
  }
};

// Process each file
let count = 0;
for (const [slug, texts] of Object.entries(updates)) {
  const file = `./docs/shows/${slug}.md`;
  if (!fs.existsSync(file)) {
    console.log(`Missing: ${slug}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if has placeholder
  if (!content.includes('Analysis for')) {
    console.log(`Already done: ${slug}`);
    continue;
  }
  
  // Replace all placeholders
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

console.log(`\nTotal updated: ${count}`);
