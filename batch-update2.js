const fs = require("fs");

const updates = {
  "the-leftovers": {
    char: "Scoring 7.5, Justin Theroux's Kevin Garvey anchors the show with barely-contained desperation; Carrie Coon's Nora provides emotional devastation; Amy Brenneman's silent Laurie is revelatory. The ensemble commits to the show's absurdity, whether dealing with grief cults or alternate realities. The acting sells the premise's inherent ridiculousness through absolute sincerity.",
    world: "Scoring 8.5, the post-Departure world is built through absence—what's lost defines what remains. The show maps grief onto geography: Mapleton, Miracle, and the spaces between. The cults—GR, FR, Holy Wayne—create competing visions of meaning in a meaningless universe. The world is both familiar and alien, recognizable reality filtered through theological crisis.",
    cine: "Scoring 7.5, the visual approach is sometimes stylized, sometimes naturalistic, always purposeful. The show experiments—season two's opening credits change, international episodes shift visual language. The cinematography captures dreamlike quality without becoming incoherent. It's visually adventurous.",
    spect: "Scoring 8, spectacle includes the sudden disappearances (the opening), the hotel afterlife sequences, the Departure anniversaries, the bridge scene. The show delivers stunning images: the opening credits, the final episode's hotel, the lion. The spectacle serves metaphysical questions.",
    conc: "Scoring 8.5, The Leftovers asks: How do we live with unresolvable loss? It explores grief, faith, family, depression, and meaning-making in a meaningless universe. The density is emotional and philosophical. It asks whether stories we tell ourselves help or harm. It's about the lies we need to believe.",
    drive: "Scoring 8, each season accelerates toward revelation. Season one builds to cult confrontation; season two to Miracle's secrets; season three toward literal apocalypse. The narrative is propulsive despite its strangeness. The final season achieves genuine momentum toward the unknown.",
    resol: "Scoring 8, the series finale is perfect—Nora's story, whether true or not, provides emotional truth. The final scene, years later, offers reunion and ambiguity. It answers enough while honoring mystery. The ending understands that some questions resist answers but people deserve peace anyway."
  },
  "mad-men": {
    char: "Scoring 8.5, Jon Hamm's Don Draper is one of television's great performances—charming, empty, self-destructive, occasionally capable of genuine connection. The ensemble—Elisabeth Moss, Vincent Kartheiser, January Jones, John Slattery, Christina Hendricks—creates a world of professionals performing competence while falling apart. Every character is a study in period performance.",
    world: "Scoring 8, 1960s New York is built through details—cigarettes in offices, martinis at lunch, casual misogyny as wallpaper. The advertising industry provides perfect lens for exploring American dreams and lies. The decade's progression—from Kennedy to Nixon—is mapped onto professional and personal lives.",
    cine: "Scoring 7.5, the show looks gorgeous—period-perfect production design captured with careful composition. The visuals serve the era: bright colors giving way to film grain. It's consistently handsome without being visually revolutionary.",
    spect: "Scoring 8.5, spectacle arrives through period recreation—street scenes, parties, office life. The show's visual power comes from accumulation: how did people dress, smoke, drink, interact? The historical moments—Kennedy assassination, moon landing—provide anchor points.",
    conc: "Scoring 8, Mad Men explores identity, consumerism, American mythology, and the lies men tell themselves. Don Draper as self-invention, as impostor syndrome given flesh. The show interrogates advertising's relationship to truth. It's thematically rich.",
    drive: "Scoring 8, the show moves through seasons with accumulating weight. Each year brings new clients, new crises, new self-destruction. The narrative rewards patience with emotional payoff. The final season achieves genuine forward momentum.",
    resol: "Scoring 7.5, the finale—Don's smile, Peggy and Stan's confession, Pete and Trudy's reconciliation, Betty's fate—provides closure while acknowledging continuation. The Coke ad ending is debated: cynical or hopeful? Either way, it honors the show's ambivalence."
  },
  "euphoria": {
    char: "Scoring 8.5, Zendaya's Rue provides the show's emotional center—a performance of addiction's chaos and occasional beauty. The ensemble—Hunter Schafer, Sydney Sweeney, Jacob Elordi—is young and fearless. The acting is vulnerable, exposed, occasionally shocking. These performers commit completely.",
    world: "Scoring 7.5, the high school world is stylized—heightened, dreamlike, more vivid than real life. Social media, drugs, sexuality—it's Gen Z rendered in hyper-saturated color. The world feels authentic in emotional truth if not documentary realism.",
    cine: "Scoring 9.5, the show is visually stunning—music video aesthetic applied to television. Labrinth's score, the lighting, the camera movement, the editing—all create sensory experience equal to the emotional content. This is some of television's most adventurous visual storytelling.",
    spect: "Scoring 8, spectacle includes the carnival sequences, the New Year's party, the play, the dreams. The show delivers stunning images—Rue's fantasy sequences, the lighting design, the fashion. The visual power comes from aesthetic confidence.",
    conc: "Scoring 8, addiction, identity, sexuality, trauma, social media—Euphoria explores all with genuine insight. The conceptual density is emotional rather than intellectual. It captures the feeling of being young and overwhelmed now.",
    drive: "Scoring 8, the narrative moves in waves—Rue's relapses, the group's crises, the special episodes. The show takes time for detours that serve character. The pacing is deliberate, sometimes slow, always intense.",
    resol: "Scoring 7, the show is ongoing; storylines remain unresolved. Season two ends with Rue acknowledging the cost of her addiction but not recovered. It avoids easy redemption arcs, which is honest but incomplete."
  },
  "silo": {
    char: "Scoring 7.5, Rebecca Ferguson's Juliette anchors the mystery with determined intelligence; Tim Robbins provides moral authority; the ensemble is capable. The acting serves the plot's revelations. It's professional if not transcendent.",
    world: "Scoring 9, the silo itself is a character—144 floors underground, self-contained civilization, secrets buried in history. The show builds convincing vertical society with its own customs, taboos, and power structures. The world building is the show's greatest strength.",
    cine: "Scoring 8, the show looks expensive—production design creates convincing underground world. The silo's scale is conveyed through careful framing. The visual approach is functional but handsome, serving the mystery.",
    spect: "Scoring 7, spectacle is restrained—this is people talking in rooms, not action sequences. The world beyond the silo provides occasional visual variety. The show's power comes from implication, not scale.",
    conc: "Scoring 7.5, the show explores truth, control, history, and what societies need to believe to function. The density is in the mystery—layered revelations about the silo's origins. It's intellectual science fiction.",
    drive: "Scoring 7, the narrative moves through mystery structure—questions, partial answers, more questions. The pacing is measured, occasionally slow. The plot propulsion comes from information rather than action.",
    resol: "Scoring 6, the story is ongoing; the book series continues well beyond season one. The ending provides some closure while opening new mysteries. It's not complete but satisfying for the season's scope."
  },
  "the-americans": {
    char: "Scoring 8.5, Keri Russell and Matthew Rhys as Elizabeth and Philip Jennings deliver career-defining work—underneath the wigs, the accents, the violence, they're always recognizable as a couple trying to survive. The performances require extraordinary range: suburban parents, Soviet spies, various cover identities, all while maintaining emotional coherence.",
    world: "Scoring 8, 1980s Washington DC and the suburbs are rendered with period accuracy—clothing, cars, Cold War paranoia. The show builds the KGB's American network, the FBI's counter-intelligence, the world of illegal agents. It's convincing historical fiction.",
    cine: "Scoring 7.5, the show is shot with appropriate naturalism—period aesthetics, functional coverage. The cinematography serves the performances and period rather than drawing attention. It's consistently competent.",
    spect: "Scoring 8, action sequences are brutal and brief—realistic violence rather than stylized. The show delivers suspense through implication: dead drops, surveillance, near-misses. The spectacle is psychological.",
    conc: "Scoring 8.5, the marriage-as-cover interrogates love, loyalty, duty, and identity. What does it mean to pretend to be something for decades? The show explores marriage, parenthood, patriotism, and betrayal with genuine insight.",
    drive: "Scoring 8, each season builds tension—missions escalate, the FBI closes in, the children grow suspicious. The narrative is consistently propulsive. The final seasons achieve genuine suspense.",
    resol: "Scoring 8.5, the series finale is devastating and perfect—the parking garage, the phone call, the train, the future glimpsed in silence. It's one of television's best endings—earned, painful, inevitable, hopeful."
  }
};

let count = 0;
for (const [slug, texts] of Object.entries({
  "the-leftovers": updates["the-leftovers"],
  "mad-men": updates["mad-men"],
  "euphoria": updates["euphoria"],
  "silo": updates["silo"],
  "the-americans": updates["the-americans"]
})) {
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
