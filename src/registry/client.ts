import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const REGISTRY_BASE = 'https://raw.githubusercontent.com/basel-registry/packs/main';

interface PackMetadata {
    name: string;
    description: string;
    version: string;
    entries: number;
}

interface RegistryIndex {
    packs: PackMetadata[];
}

export async function fetchRegistry(): Promise<RegistryIndex> {
    const response = await fetch(`${REGISTRY_BASE}/registry.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
    }
    return response.json() as Promise<RegistryIndex>;
}

export async function downloadPack(packName: string, destDir: string): Promise<void> {
    const packUrl = `${REGISTRY_BASE}/packs/${packName}`;

    const metaResponse = await fetch(`${packUrl}/pack.json`);
    if (!metaResponse.ok) {
        throw new Error(`Pack '${packName}' not found in registry`);
    }

    const metadata = await metaResponse.json() as { files: string[] };
    const packDir = path.join(destDir, packName);
    await fs.mkdir(packDir, { recursive: true });

    for (const file of metadata.files) {
        const fileResponse = await fetch(`${packUrl}/entries/${file}`);
        if (fileResponse.ok) {
            const content = await fileResponse.text();
            await fs.writeFile(path.join(packDir, file), content);
        }
    }
}

export async function listPacks(): Promise<void> {
    try {
        const registry = await fetchRegistry();
        console.log(chalk.cyan('Available packs:\n'));
        for (const pack of registry.packs) {
            console.log(`  ${chalk.green(pack.name)} - ${pack.description} (${pack.entries} entries)`);
        }
    } catch (e) {
        console.log(chalk.yellow('Pack registry is not yet available.'));
        console.log(chalk.dim('The community pack registry is coming soon.'));
        console.log(chalk.dim('\\nFor now, manually add entries with: basel add'));
    }
}

export async function installPack(packName: string, baselDir: string): Promise<void> {
    console.log(chalk.dim(`Installing pack: ${packName}...`));

    try {
        await downloadPack(packName, baselDir);
        console.log(chalk.green('✓ Installed pack:'), chalk.cyan(packName));
        console.log(chalk.dim('  Run `basel build` to update the index'));
    } catch (e) {
        console.log(chalk.red(`Failed to install pack: ${e instanceof Error ? e.message : 'Unknown error'}`));
    }
}
