"use strict";
/**
 * ISO Management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISOManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const crypto = __importStar(require("crypto"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ISOManager {
    async listISOs(directory) {
        const files = await fs.readdir(directory);
        const isos = [];
        for (const file of files) {
            if (file.endsWith('.iso')) {
                const filePath = path.join(directory, file);
                const stats = await fs.stat(filePath);
                isos.push({
                    name: file,
                    size: this.formatBytes(stats.size),
                    modified: stats.mtime.toISOString(),
                    bootable: await this.checkBootable(filePath),
                    liveboot: await this.checkLiveBoot(filePath)
                });
            }
        }
        return isos.sort((a, b) => b.modified.localeCompare(a.modified));
    }
    async getInfo(iso) {
        const stats = await fs.stat(iso);
        return {
            name: path.basename(iso),
            size: this.formatBytes(stats.size),
            modified: stats.mtime.toISOString(),
            bootable: await this.checkBootable(iso),
            liveboot: await this.checkLiveBoot(iso)
        };
    }
    async verifyISO(iso) {
        try {
            await fs.access(iso);
            // Check if file size is reasonable (> 100MB)
            const stats = await fs.stat(iso);
            if (stats.size < 100 * 1024 * 1024) {
                return false;
            }
            return true;
        }
        catch {
            return false;
        }
    }
    async verifyChecksum(iso) {
        const checksumFile = `${iso}.sha256`;
        try {
            const expected = (await fs.readFile(checksumFile, 'utf-8')).split(' ')[0];
            const actual = await this.calculateSHA256(iso);
            return expected === actual;
        }
        catch {
            // If checksum file doesn't exist, just verify the ISO exists
            return await this.verifyISO(iso);
        }
    }
    async checkBootable(iso) {
        try {
            const { stdout } = await execAsync(`isoinfo -d -i "${iso}" 2>/dev/null`);
            return stdout.includes('El Torito');
        }
        catch {
            return false;
        }
    }
    async checkLiveBoot(iso) {
        try {
            const { stdout } = await execAsync(`isoinfo -d -i "${iso}" 2>/dev/null`);
            // Check for live boot indicators
            return stdout.includes('live') || stdout.includes('LIVE');
        }
        catch {
            return false;
        }
    }
    async detectUSBDevices() {
        try {
            const { stdout } = await execAsync('lsblk -d -o NAME,SIZE,MODEL,VENDOR -J');
            const data = JSON.parse(stdout);
            return data.blockdevices
                .filter((dev) => dev.name.startsWith('sd') && !dev.name.endsWith('1'))
                .map((dev) => ({
                device: `/dev/${dev.name}`,
                size: dev.size,
                model: dev.model || 'Unknown',
                vendor: dev.vendor || 'Unknown'
            }));
        }
        catch (error) {
            throw new Error(`Failed to detect USB devices: ${error.message}`);
        }
    }
    async flashToUSB(iso, device, onProgress) {
        try {
            // Unmount device
            await execAsync(`sudo umount ${device}* 2>/dev/null || true`);
            // Flash with dd
            const stats = await fs.stat(iso);
            const totalSize = stats.size;
            // Use pv if available for progress
            try {
                await execAsync('which pv');
                const ddProcess = (0, child_process_1.exec)(`sudo sh -c "pv -n '${iso}' | dd of=${device} bs=4M oflag=sync"`, { maxBuffer: 1024 * 1024 * 100 });
                if (onProgress) {
                    ddProcess.stderr?.on('data', (data) => {
                        const match = data.toString().match(/(\d+)/);
                        if (match) {
                            const progress = parseInt(match[1]);
                            onProgress(progress);
                        }
                    });
                }
                await new Promise((resolve, reject) => {
                    ddProcess.on('exit', (code) => {
                        if (code === 0)
                            resolve(null);
                        else
                            reject(new Error(`dd exited with code ${code}`));
                    });
                });
            }
            catch {
                // Fallback to plain dd
                await execAsync(`sudo dd if="${iso}" of=${device} bs=4M status=progress oflag=sync`);
            }
            // Sync
            await execAsync('sudo sync');
        }
        catch (error) {
            throw new Error(`Flash failed: ${error.message}`);
        }
    }
    async verifyFlash(device) {
        try {
            // Simple verification: check if device is readable
            await execAsync(`sudo dd if=${device} of=/dev/null bs=4M count=100 status=none`);
            return true;
        }
        catch {
            return false;
        }
    }
    async calculateSHA256(file) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = require('fs').createReadStream(file);
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}
exports.ISOManager = ISOManager;
//# sourceMappingURL=iso-manager.js.map