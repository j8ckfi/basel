
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { init } from '../../src/cli/commands/init.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');
vi.mock('chalk', () => ({
    default: {
        green: (msg: string) => msg,
        cyan: (msg: string) => msg,
        dim: (msg: string) => msg,
        yellow: (msg: string) => msg,
        red: (msg: string) => msg,
    }
}));
// Mock console.log to avoid noise
global.console.log = vi.fn();

describe('CLI Init', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('creates .basel directory structure if missing', async () => {
        // simulate access failing (dir missing)
        vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

        await init('/test/cwd');

        // Expect mkdir calls
        expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('.basel'), { recursive: true });
        expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('project'), { recursive: true });

        // Expect file writes
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('config.yaml'),
            expect.stringContaining('registry:')
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('manifest.json'),
            expect.stringContaining('"version": "1.0"')
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('_example.md'),
            expect.stringContaining('status: closed') // Check usage of new schema
        );
    });

    it('does nothing if .basel already exists', async () => {
        // simulate access success
        vi.mocked(fs.access).mockResolvedValue(undefined);

        await init('/test/cwd');

        expect(fs.mkdir).not.toHaveBeenCalled();
        expect(fs.writeFile).not.toHaveBeenCalled();
    });
});
