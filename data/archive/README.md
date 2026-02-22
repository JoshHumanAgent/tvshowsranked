# TV Shows Ranked - Data Documentation

This directory contains the structured data foundation for the TV Shows Ranked website.

## Directory Structure

```
data/
├── shows/
│   ├── index.json              # Master index of all 109 ranked shows
│   ├── <slug>.json             # Individual show intelligence files (109 files)
│   └── README.md               # This file
│
├── show_candidates/
│   └── candidates_500.json     # 500-show expansion pool
│
└── methodology/
    ├── system_scoring_doctrine.md    # Ranking methodology
    └── current_rankings_rationale.md # Top shows analysis

docs/
└── shows/
    └── <slug>.md               # Human-readable show documentation (109 files)
```

## Data Schema

### Show Intelligence File (JSON)

Each show has a structured JSON file containing:

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | URL-friendly identifier |
| `title` | string | Canonical show title |
| `year` | int | First air year |
| `month` | int | First air month (1-12) |
| `status` | string | "ended", "continuing", or "completed" |
| `seasons` | int | Total season count |
| `episodes` | int | Total episode count |
| `runtime` | string | Typical episode runtime (e.g., "45-55") |
| `country` | string | Production country |
| `genres` | array | Genre tags |
| `creator` | array | Show creator(s) |
| `network` | string | Original network |
| `tmdbId` | int | TMDB API identifier for posters |
| `external_ratings` | object | IMDb, RT, Metacritic scores |
| `consensus_highlights` | string | Critical consensus summary |
| `ranking_system` | object | Our 7-dimension category scores |
| `streaming` | object | US/UK streaming availability |
| `notes` | string | Additional scoring notes |

### Example Show JSON

```json
{
  "slug": "breaking-bad",
  "title": "Breaking Bad",
  "year": 2008,
  "month": 1,
  "status": "ended",
  "seasons": 5,
  "episodes": 62,
  "runtime": "47-58",
  "country": "United States",
  "genres": ["crime", "drama", "thriller"],
  "creator": ["Vince Gilligan"],
  "network": "AMC",
  "tmdbId": 1396,
  "external_ratings": {
    "imdb": {
      "score": 9.5,
      "scale": 10,
      "count": "2.4M",
      "date_accessed": "2026-02-15",
      "url": "https://www.imdb.com/title/tt0903747/"
    },
    "rotten_tomatoes": {
      "season_1": { "score": 86, "scale": 100 },
      "season_5": { "score": 97, "scale": 100 },
      "date_accessed": "2026-02-15",
      "url": "https://www.rottentomatoes.com/tv/breaking_bad"
    },
    "metacritic": {
      "score": 85,
      "scale": 100,
      "date_accessed": "2026-02-15",
      "url": "https://www.metacritic.com/tv/breaking-bad"
    }
  },
  "consensus_highlights": "Breaking Bad is a masterclass in television storytelling...",
  "ranking_system": {
    "characters_acting": 9.5,
    "world_building": 8.5,
    "cinematography": 9.0,
    "visual_spectacle": 8.5,
    "conceptual_density": 9.0,
    "narrative_drive": 9.0,
    "narrative_resolution": 9.5,
    "final_score": 8.89
  },
  "streaming": {
    "us": ["Netflix", "AMC+", "Amazon Prime Video"],
    "uk": ["Netflix", "Amazon Prime Video"]
  },
  "notes": "Breaking Bad represents peak character study television..."
}
```

### Human-Readable Documentation (MD)

Each show has a Markdown companion file with:
- Overview table with key metadata
- "What It Feels Like to Watch" section (non-spoiler experiential description)
- External ratings table
- Ranking justification section

## Index.json

The master index contains:
- All 109 shows with ranking, slug, title, year, month, genres, final score
- Abbreviated category scores: `char`, `world`, `cine`, `spect`, `conc`, `drive`, `resol`
- `episodes` count and `poster` URL (TMDB)
- `tmdbId` field for each show for poster fetching
- `streaming` object with US and UK availability
- Sorted by final rank (1-109)

## Candidate Pool

`candidates_500.json` contains 500 potential shows for future expansion:
- Mix of acclaimed series, cult classics, and genre standouts
- IMDb scores and genre tags for filtering
- Coverage from 1951-2024
- Includes notes on cultural significance

## TMDB Integration

All 109 shows have TMDB IDs for poster images:
- Base URL: `https://image.tmdb.org/t/p/w500`
- API key stored in website configuration
- Posters fetched at 2:3 aspect ratio

## Methodology

Scoring uses 7 dimensions (10 points each):
1. **Characters & Acting** (`char`) — 20% weight
2. **World Building** (`world`) — 15% weight  
3. **Cinematography** (`cine`) — 10% weight
4. **Visual Spectacle** (`spect`) — 10% weight
5. **Conceptual Density** (`conc`) — 15% weight
6. **Narrative Drive** (`drive`) — 15% weight
7. **Narrative Resolution** (`resol`) — 15% weight

Episode count multipliers are applied to adjust final scores based on show length.

External ratings from IMDb, Rotten Tomatoes, and Metacritic inform but don't determine final scores.

## Non-Spoiler Policy

All descriptions focus on experiential qualities:
- Tone and pacing
- Emotional texture
- What kind of viewer it rewards
- What makes it distinct

**No plot events, twists, or endings are revealed.**

## Data Quality

- All 109 shows have JSON + MD files
- All 109 shows have TMDB IDs and poster URLs
- All 109 shows have US/UK streaming data
- All external ratings include source URLs and date accessed
- Episode counts cross-referenced across multiple sources
- Exports available: CSV and full JSON

## Future Expansion

500-show candidate pool available for systematic expansion.
Recent additions include acclaimed 2022-2024 shows like:
- Slow Horses, The Day of the Jackal, Adolescence, Shogun (2024), Pluribus

---

*Last updated: 2026-02-15*
