// Pure discovery utility shared by audit tests. No game files are changed.
export function discoverGamePages(source) {
  return [...new Set([...source.matchAll(/\bareg-[a-z0-9-]+\.html\b/g)].map(match => match[0]))].sort();
}
export function localAssetReferences(html) {
  return [...new Set([...html.matchAll(/(?:src|href)\s*=\s*["'](\.\/[^"'#?]+(?:\?[^"'#]*)?)["']/gi)]
    .map(match => match[1].split('?')[0]))].sort();
}
