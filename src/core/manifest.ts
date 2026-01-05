import fs from 'fs/promises';
import path from 'path';
import { Manifest, ManifestEntry, Entry } from './schema.js';

const MANIFEST_FILE = 'manifest.json';

export async function readManifest(baselDir: string): Promise<Manifest> {
    const manifestPath = path.join(baselDir, MANIFEST_FILE);
    try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        return Manifest.parse(JSON.parse(content));
    } catch {
        return { version: '1.0', entries: [] };
    }
}

export async function writeManifest(baselDir: string, manifest: Manifest): Promise<void> {
    const manifestPath = path.join(baselDir, MANIFEST_FILE);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

export function entryToManifestEntry(entry: Entry, baselDir: string): ManifestEntry {
    return {
        id: entry.id,
        path: path.relative(baselDir, entry.path),
        question: entry.question,
        tags: entry.tags,
        updated: entry.updated,
        confidence: entry.confidence,
        related: entry.related,
    };
}

export async function buildManifest(baselDir: string, entries: Entry[]): Promise<Manifest> {
    const manifestEntries = entries.map(e => entryToManifestEntry(e, baselDir));
    return {
        version: '1.0',
        entries: manifestEntries,
    };
}
