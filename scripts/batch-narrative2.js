const fs = require('fs');

const updates = {
  'mr-robot': {
    char: "Scoring 8.5, Rami Malek's Elliot Alderson is career-defining—alienated, paranoid, unreliable narrator. The performance carries four seasons of psychological fragmentation. The ensemble—Christian Slater, Carly Chaikin, Portia Doubleday—operates at high level. The acting serves the show's stylistic demands.",
    world: "Scoring 8.5, the hacker underground, Evil Corp, and Elliot's fractured perception create a paranoid reality. The show builds convincing technological dystopia. The world encompasses actual hacktivism and corporate conspiracy.",
    cine: "Scoring 8.5, Esmail directs with aggressive style—unstable framing, aspect ratio shifts, unreliable perspective. The cinematography mirrors Elliot's psychology. The show looks distinctive and intentional.",
    spect: "Scoring 7.5, spectacle emerges through style rather than scale—single-take episodes, visual experiments, hacking sequences. The deliver is cinematic audacity. The fsociety headquarters sequences provide memorable imagery.",
    conc: "Scoring 8.5, the show explores capitalism, identity, mental illness, and social control. Elliot's unreliable narration allows for complex storytelling. The density comes from psychological and political layers.",
    drive: "Scoring 8.5, the narrative twists and turns with genuine surprises. The pacing is relentless. Season one builds to spectacular revelation; later seasons maintain tension. The plotting is among TV's most ambitious.",
    resol: "Scoring 8.5, the series finale provides resolution for Elliot's story—revelation about his identity, redemption through connection. It's emotionally complete. The show sticks the landing on a difficult premise."
  },
  'the-haunting-of-hill-house': {
    char: "Scoring 8, the ensemble operates across two timelines with different actors playing the same characters. The performances are emotionally grounded—Henry Thomas, Carla Gugino, Victoria Pedretti. The acting sells the horror through human response rather than genre theatrics.",
    world: "Scoring 8.5, Hill House is a character—architecture as threat, the Red Room, the supernatural rules. The show builds convincing haunted house mythology. The family history spanning decades provides structure.",
    cine: "Scoring 8.5, Flanagan composes every frame with dread—the hidden ghosts, the symmetry, the color coding. The show looks beautiful even when terrifying. The long takes are technically impressive.",
    spect: "Scoring 7.5, horror provides spectacle through dread rather than gore. The Bent-Neck Lady, the hidden ghosts, the Red Room—these create lasting images. The show is scary through implication.",
    conc: "Scoring 7.5, the show explores family trauma, grief, and how the past haunts the present. The horror is metaphor made literal. The density is emotional rather than philosophical.",
    drive: "Scoring 8, the dual-timeline structure creates mystery and revelation. The pacing builds dread effectively. The show moves between past and present with purpose. The Red Room revelation provides satisfying payoff.",
    resol: "Scoring 7, the ending—the family sacrificing themselves to save the youngest—provides closure while honoring the tragedy. Some viewers find it sentimental. The haunted house genre demands ambiguous endings; this is relatively decisive."
  },
  'sharp-objects': {
    char: "Scoring 8.5, Amy Adams's Camille is devastating—self-harm survivor, alcoholic, damaged journalist. The performance is raw and brave. Patricia Clarkson's mother is monstrous; Eliza Scanlen's sister is heartbreaking. The acting is uniformly exceptional.",
    world: "Scoring 8, small-town Missouri is built through oppressive heat, social hierarchy, and buried secrets. The show creates Wind Gap as Gothic South. The world serves the psychological thriller.",
    cine: "Scoring 8.5, Jean-Marc Vallée's direction is dreamlike—flashbacks, subjectivity, fragmented memory. The editing and music create hypnotic atmosphere. The show looks distinctive and artful.",
    spect: "Scoring 7, spectacle is understated—this is faces and interiors. The show finds horror in domestic spaces. The flashback sequences provide visual interest.",
    conc: "Scoring 8, the show explores trauma, self-harm, family dysfunction, and small-town evil. Vallee and Flynn create dense psychological portrait. It's thematically rich and emotionally difficult.",
    drive: "Scoring 7.5, the mystery unfolds deliberately across eight episodes. The pacing is slow, building toward revelation. The show requires patience but rewards attention. The final episodes accelerate effectively.",
    resol: "Scoring 6, the limited series ends with the killer revealed and Camille's fate ambiguous. It's emotionally powerful but not fully resolved. Some storylines feel truncated. The ending honors the tragedy rather than resolving it."
  },
  'the-last-of-us': {
    char: "Scoring 8, Pedro Pascal and Bella Ramsey are perfectly cast—Pascal providing weary humanity, Ramsey providing tough vulnerability. Their chemistry drives the series. The episode guests (Murray Bartlett, Nick Offerman) deliver memorable one-offs.",
    world: "Scoring 9, the post-pandemic United States is built with production value—Boston, Pittsburgh, Kansas City. The infected and the landscape feel grounded. The world honors the game while working on its own terms.",
    cine: "Scoring 8.5, the show looks cinematic—Druckmann's game brought to prestige television scale. The cinematography captures both beauty and horror. The Clickers are genuinely terrifying.",
    spect: "Scoring 8, spectacle includes infected hordes, collapsed cities, clicker encounters. The show delivers action when needed, though it prioritizes character. Production value justifies the budget.",
    conc: "Scoring 7.5, the show explores survival, found family, and what we become in extremis. The themes are there but less dense than the game. It's character-driven storytelling.",
    drive: "Scoring 8, the road-trip structure provides momentum through different locations and encounters. The pacing is patient, allowing episodes to breathe. The show balances standalone episodes with serialized arc.",
    resol: "Scoring 6, season one ends where the game does—with Joel's choice and Ellie's suspicion. The story is ongoing. It's incomplete by design."
  },
  'the-white-lotus': {
    char: "Scoring 7.5, each season casts new group—season one: Murray Bartlett, Natasha Rothwell, Alexandra Daddario. Season two: F. Murray Abraham, Aubrey Plaza. The performances are appropriately heightened. The acting serves the satire.",
    world: "Scoring 8, the resorts are characters—Hawaii in season one, Sicily in season two. The show builds luxury as both beautiful and oppressive. The locations provide commentary on wealth tourism.",
    cine: "Scoring 8, the show looks gorgeous—tropical vistas, European architecture, wealthy interiors. The cinematography creates beauty that becomes claustrophobic. Opening credits are distinctive.",
    spect: "Scoring 7.5, spectacle comes from location—tropical beaches, Italian palaces. The show delivers beautiful settings as character. The deaths provide plot structure and imagery.",
    conc: "Scoring 7.5, White explores wealth, privilege, colonialism, and terrible rich people. The satire is sharp if occasionally too on-the-nose. The density is social commentary rather than philosophy.",
    drive: "Scoring 8, each season is a closed mystery—who dies, how, why. The structure provides inherent momentum. The episodic format allows for revelation and escalation.",
    resol: "Scoring 7.5, each season resolves its central mystery. Season one provides tragedy; season two provides irony. The endings are appropriate to the satire."
  },
  'fargo': {
    char: "Scoring 7.5, each season casts different ensemble at high level—Billy Bob Thornton, Martin Freeman, Kirsten Dunst, Ewan McGregor, Carrie Coon. The performances serve the Coen-esque tone. Acting is consistently strong.",
    world: "Scoring 8.5, Midwest Minnesota/North Dakota is built with affection and irony—snow, politeness, underlying violence. The show creates distinctive regional identity. The world is familiar yet strange.",
    cine: "Scoring 8, the show mimics Coen brothers' visual language—snowy vistas, careful composition, dark comedy timing. It looks like a prestige cable drama. The cinematography is handsome.",
    spect: "Scoring 7.5, violence provides spectacle—a Coen signature. The show delivers shocking moments amid mundanity. The winter landscapes provide visual scope.",
    conc: "Scoring 7.5, the show explores coincidence, evil, morality, and the absurdity of existence. The density comes from crime thriller tropes examined philosophically. It's smart without being heavy.",
    drive: "Scoring 7, the plotting varies by season—some propulsive, some meandering. The anthology structure starts fresh each year. Some seasons achieve momentum; others drift.",
    resol: "Scoring 7, each season resolves its crime story. The endings vary in emotional impact. The anthology format means closure is built in."
  },
  'westworld': {
    char: "Scoring 7, the ensemble is excellent—Hopkins, Harris, Newton, Wood, Marsden—but the material eventually overwhelms them. Acting is committed despite the writing. Performance quality remains even as plot quality declines.",
    world: "Scoring 9, the park itself is extraordinary—Western, Shogun, Raj, the real world. The show built convincing multi-themed simulation. The world building is the show's greatest achievement.",
    cine: "Scoring 9, the show looks stunning—production values match feature film. The cinematography is consistently beautiful. The Western aesthetic is particularly gorgeous.",
    spect: "Scoring 8.5, the robots, the violence, the landscape—it's visually spectacular. The show delivers HBO-scale action sequences. Production design is extraordinary.",
    conc: "Scoring 7.5, the show explores consciousness, free will, human nature, and what makes us who we are. Early seasons are philosophically dense. Later seasons become about plot mechanics.",
    drive: "Scoring 6.5, the narrative becomes increasingly convoluted. Season one is brilliantly structured. Later seasons lose momentum in twist proliferation. The show becomes confusing where it was once mysterious.",
    resol: "Scoring 4, the show was cancelled after four seasons. The ending is incomplete—storylines unresolved, characters fates unknown. Season four attempts closure but it doesn't feel finished."
  },
  'the-crown': {
    char: "Scoring 8, three actors playing Elizabeth across decades—Foy, Colman, Debicki—all excellent. The ensemble rotates with historical period. The performances are consistently strong, occasionally exceptional.",
    world: "Scoring 8.5, the monarchy is built through decade-appropriate detail—political history, royal protocol, period atmosphere. The show creates convincing Westminster and royal world.",
    cine: "Scoring 8, the show looks expensive—stately homes, period recreation, beautiful costuming. The cinematography is appropriately dignified. Production values justify the budget.",
    spect: "Scoring 7.5, spectacle arrives through historical recreation—coronations, weddings, state occasions. The show delivers royal pageantry as entertainment.",
    conc: "Scoring 7, the show explores duty, power, and private lives lived publicly. The density is historical and biographical. It asks what royalty means in modern world.",
    drive: "Scoring 7, the historical progression provides structure. Some seasons cover more ground than others. The final seasons accelerate toward conclusion.",
    resol: "Scoring 5, the show ends with Diana's death and Charles's future. It's partial closure—history continues beyond the series. The final season feels like stopping rather than finishing."
  },
  'happy-valley': {
    char: "Scoring 8.5, Sarah Lancashire's Catherine Cawood is extraordinary—prickly, wounded, resilient, funny, dangerous. One of television's great performances. The ensemble supports effectively but this is Lancashire's show.",
    world: "Scoring 8, West Yorkshire is built through specific detail—local dialect, class dynamics, landscape, community. The show creates convincing Northern England.",
    cine: "Scoring 7.5, the show is shot directly—functional cinematography serving the performances. The bleak landscape provides visual character. It's unshowy but appropriate.",
    spect: "Scoring 7, the show delivers crime thriller moments but prioritizes character. The violence is brief and impactful. No action spectacle, just human stakes.",
    conc: "Scoring 8, the show explores trauma, family, redemption, and working-class life. The density comes from character psychology. It asks whether people can change and forgive.",
    drive: "Scoring 8, the three seasons build across years—Catherine's confrontation with her demons. The plotting is propulsive. The series finale is devastating and earned.",
    resol: "Scoring 9, the finale is perfect—Catherine's choices, the confrontation, the aftermath. It's one of British television's most satisfying endings."
  },
  'broadchurch': {
    char: "Scoring 8, David Tennant and Olivia Colman create an iconic partnership—his grief, her warmth, their chemistry. The ensemble (Jodie Whittaker, Andrew Buchan) provides community and suspects. The acting serves the mystery through human specificity.",
    world: "Scoring 8.5, the Dorset town is built through weather, cliffs, community, secrets. The show creates convincing small-town Britain. The location becomes character.",
    cine: "Scoring 8, the show looks beautiful—the cliffs, the sea, the changing weather. The cinematography emphasizes isolation. The cliff location is striking.",
    spect: "Scoring 7, the show delivers through location rather than action. The Dorset coast provides visual scope. The crime scenes are appropriately bleak.",
    conc: "Scoring 7.5, the show explores grief, community, and the impact of murder on small towns. It's character-driven crime drama. The density is emotional.",
    drive: "Scoring 8, the mystery unfolds over eight episodes with genuine twists. The pacing builds tension effectively. Season one is propulsive. Season two struggles with aftermath.",
    resol: "Scoring 7, season one resolves the mystery with satisfying revelation. Season two provides legal aftermath. Season three is a different case. The show ends appropriately."
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
