const fs = require("fs");
const data = require("./data/shows/index.json");

// Top 20 shows
const top20 = [
  "game-of-thrones-s1-4", // 1
  "breaking-bad", // 2  
  "band-of-brothers", // 3
  "the-wire", // 4
  "better-call-saul", // 5
  "the-sopranos", // 6 - DONE
  "boardwalk-empire", // 7
  "chernobyl", // 8 - DONE
  "succession", // 9 - DONE
  "deadwood", // 10 - DONE
  "andor", // 11
  "adolescence", // 12
  "house-of-the-dragon", // 13
  "angels-in-america", // 14
  "the-expanse", // 15
  "the-leftovers", // 16
  "mad-men", // 17
  "euphoria", // 18
  "silo", // 19
  "the-americans" // 20
];

// Check which need narrative updates
const needsUpdate = [];
top20.forEach(slug => {
  const filePath = `./docs/shows/${slug}.md`;
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes("Analysis for")) {
    needsUpdate.push(slug);
  }
});

console.log("Top 20 shows needing narrative:", needsUpdate.length);
console.log(needsUpdate.join("\n"));
