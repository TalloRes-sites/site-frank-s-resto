// Lists texts that still need a translation (missing) or need a new one because the main-language
// text changed (stale). Used by the translator agent; see .claude/agents/translator.md.
//
//   npm run translations:status            human-readable report
//   npm run translations:status -- --json  machine-readable list (path, lang, source, sourceHash, limit)
//
// Exit code 0 always: this is a report, `npm run verify -- --strict` is the gate.
import { loadSite } from '../src/lib/site-data';

const { issues, content } = loadSite();
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(issues, null, 2));
} else if (!issues.length) {
  console.log(`All texts are translated for ${content.languages.join(', ')}.`);
} else {
  const missing = issues.filter((i) => i.kind === 'missing').length;
  const stale = issues.length - missing;
  console.log(`Main language: ${content.languages[0]}. Published: ${content.languages.join(', ')}.`);
  console.log(`${missing} missing, ${stale} stale. Write them to site/translations.json with "source": <sourceHash>.\n`);
  for (const i of issues) {
    console.log(`[${i.kind}] ${i.lang}  ${i.path}${i.limit ? `  (max ${i.limit})` : ''}  source=${i.sourceHash}`);
    console.log(`         ${JSON.stringify(i.source)}`);
  }
}
