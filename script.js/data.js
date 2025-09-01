// data.js  (clean + robust)
const TONES = ["light", "medium", "olive", "dark"];
const SEVERITIES = ["normal", "mild", "moderate", "severe"];

// Use SHORT keys for types (matches viewer normalizeType: neurodermatitis → "neuro")
const REGIONS = {
  atopic:       ["face-neck", "flexural-fold-elbow"],
  contact:      ["face", "hand"],
  seborrheic:   ["scalp", "face"],
  stasis:       ["ankles", "shins"],
  neuro:        ["neck", "wrists"],          // <-- short key
  nummular:     ["legs", "arms"],
  dyshidrotic:  ["palms", "soles"]
};

// Tell the generator what actually exists so we don't create 404s.
// You can start small and expand as you add files.
const AVAILABILITY = {
  atopic: {
    "face-neck":           { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    "flexural-fold-elbow": { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  },
  contact: {
    face: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    hand: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  },
  seborrheic: {
    scalp: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    face:  { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  },
  stasis: {
    ankles: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    shins:  { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  },
  neuro: {
    neck:   { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    wrists: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  },
  nummular: {
    legs: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    arms: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  },
  dyshidrotic: {
    palms: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] },
    soles: { tones: ["light","medium","olive","dark"], severities: ["normal","mild","moderate","severe"] }
  }
};


// Build the image list from availability (fallback: full TONES/SEVERITIES if omitted)
const images = [];
Object.keys(REGIONS).forEach(type => {
  REGIONS[type].forEach(region => {
    const avail = AVAILABILITY[type]?.[region] || { tones: TONES, severities: SEVERITIES };
    avail.tones.forEach(tone => {
      avail.severities.forEach(severity => {
        images.push({
          type,
          region,
          tone,
          severity,
          src: `../images/eczema/${type}/${type}-${region}-${tone}-${severity}.jpg`
        });
      });
    });
  });
});

// Expose globally
window.eczemaImages = images;
