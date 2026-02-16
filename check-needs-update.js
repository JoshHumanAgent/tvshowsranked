const fs = require("fs");
const data = require("./data/shows/index.json");

// Find shows that still have generic "Analysis for..." text
const docsDir = "./docs/shows";
let needsUpdate = [];

data.shows.forEach(show => {
  const filePath = docsDir + "/" + show.slug + ".md";
  if (!fs.existsSync(filePath)) {
    console.log("Missing file:", show.slug);
    return;
  }
  
  const content = fs.readFileSync(filePath, "utf8");
  
  // Check if still has generic text
  if (content.includes("Analysis for Characters & Acting") || 
      content.includes("Analysis for World Building") ||
      content.includes("Analysis for Cinematography") ||
      content.includes("Analysis for Visual Spectacle") ||
      content.includes("Analysis for Conceptual Density") ||
      content.includes("Analysis for Narrative Drive") ||
      content.includes("Analysis for Narrative Resolution")) {
    needsUpdate.push(show);
  }
});

console.log("Shows needing narrative update:", needsUpdate.length);
console.log("Total shows:", data.shows.length);
console.log("\nSlugs to update:");
needsUpdate.forEach(s => console.log(s.slug));

// Save list for processing
fs.writeFileSync("needs-update.json", JSON.stringify(needsUpdate.map(s => s.slug), null, 2));
