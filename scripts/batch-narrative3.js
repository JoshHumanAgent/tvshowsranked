const fs = require('fs');

const updates = {
  'its-a-sin': {
    char: "Scoring 8, the young ensemble captures 1980s London with authenticity—friends navigating sexuality and crisis. Olly Alexander leads with vulnerability; the supporting cast feels like real found family. The performances are emotionally raw without exploitation.",
    world: "Scoring 8, 1980s London built through music, fashion, and the AIDS epidemic's devastating progression. The show creates a specific time and place—the innocence before, the horror during. The flat becomes a character.",
    cine: "Scoring 7.5, the show captures period atmosphere through production design. The visual approach is functional, serving the emotional story. It's appropriate without being distinctive.",
    spect: "Scoring 6.5, spectacle is understated—this is intimate drama. The show delivers emotional power through faces, not scale. The period recreation provides visual context.",
    conc: "Scoring 7.5, the show explores the AIDS crisis, queer identity, friendship, and political indifference. The density is personal tragedy within historical catastrophe. It's devastating and necessary.",
    drive: "Scoring 8, the narrative moves from joy to devastation across five episodes. The pace accelerates as the crisis deepens. The structure honors both the friendship and the loss.",
    resol: "Scoring 7.5, the final episode is heartbreaking—survivor's guilt, memory, and the cost. It acknowledges those lost. The ending is appropriate to the tragedy—it cannot fully resolve."
  },
  'the-underground-railroad': {
    char: "Scoring 8, Thuso Mbedu's Cora provides vulnerable determination; Joel Edgerton's Ridgeway is terrifying in his conviction. The performances are grounded and devastating. The acting serves the historical weight.",
    world: "Scoring 9, the alternate-history Underground Railroad is built with imagination and specificity—each state as different nightmare. The show creates a fantastical journey through real horror. The world building is extraordinary.",
    cine: "Scoring 9, Jenkins crafts some of television's most beautiful images—candles, fields, fire, faces in darkness. The cinematography is painterly and purposeful. It's visual poetry.",
    spect: "Scoring 7.5, the images are beautiful even when depicting horror. Jenkins finds transcendence in suffering. The visual power comes from composition rather than action.",
    conc: "Scoring 8.5, the show explores American slavery, freedom, the mythology of progress, and intergenerational trauma. The density is historical and philosophical. It's among the most intellectually ambitious limited series.",
    drive: "Scoring 7, the episodic structure moves through different states/stations, which can feel uneven. Some chapters are propulsive; others are contemplative. The pacing is deliberately varied.",
    resol: "Scoring 7.5, the final episode provides closure for Cora's journey while acknowledging endless struggle. It's not triumphant. The ending honors the ongoing cost of freedom.",
    speel: "Scoring 7, the episodic structure moves through different states/stations, which can feel uneven. Some chapters are propulsive; others are contemplative. The pacing is deliberately varied."
  },
  'halt-and-catch-fire': {
    char: "Scoring 8, Lee Pace's Joe MacMillan is charismatic emptiness; Mackenzie Davis's Cameron provides the show's heart. The ensemble (Scoot McNairy, Kerry Bishé) creates the most authentic partnership in television. The acting is subtle and cumulative.",
    world: "Scoring 8.5, the 1980s-90s tech industry is built through specific detail—hardware, software, business culture, the personal computer revolution. The show captures Silicon Valley before it was called that. The world evolves with the industry.",
    cine: "Scoring 7.5, the show captures period through production design and costumes. The visual approach is functional. The focus is on people, not visual invention.",
    spect: "Scoring 6.5, spectacle is restrained—this is people coding, arguing, building. The show finds poetry in mundanity. No set pieces, just human moments.",
    conc: "Scoring 8, the show explores creation, failure, partnership, and the personal cost of ambition. It's about what we build and why. The density is emotional and philosophical.",
    drive: "Scoring 7.5, each season covers different era (computers, internet, web). The narrative moves deliberately. Later seasons focused on Cameron and Donna achieve momentum."
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
