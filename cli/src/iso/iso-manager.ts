/**
 * ISO Management
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

interface USBDevice {
  device: string;
  size: string;
  model: string;
  vendor: string;
}

interface ISOInfo {
  name: string;
  size: string;
  modified: string;
  bootable: boolean;
  liveboot: boolean;
}

export class ISOManager {
  async listISOs(directory: string): Promise<ISOInfo[]> {
    const files = await fs.readdir(directory);
    const isos: ISOInfo[] = [];

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

  async getInfo(iso: string): Promise<ISOInfo> {
    const stats = await fs.stat(iso);

    return {
      name: path.basename(iso),
      size: this.formatBytes(stats.size),
      modified: stats.mtime.toISOString(),
      bootable: await this.checkBootable(iso),
      liveboot: await this.checkLiveBoot(iso)
    };
  }

  async verifyISO(iso: string): Promise<boolean> {
    try {
      await fs.access(iso);

      // Check if file size is reasonable (> 100MB)
      const stats = await fs.stat(iso);
      if (stats.size < 100 * 1024 * 1024) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async verifyChecksum(iso: string): Promise<boolean> {
    const checksumFile = `${iso}.sha256`;

    try {
      const expected = (await fs.readFile(checksumFile, 'utf-8')).split(' ')[0];
      const actual = await this.calculateSHA256(iso);

      return expected === actual;
    } catch {
      // If checksum file doesn't exist, just verify the ISO exists
      return await this.verifyISO(iso);
    }
  }

  async checkBootable(iso: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`isoinfo -d -i "${iso}" 2>/dev/null`);
      return stdout.includes('El Torito');
    } catch {
      return false;
    }
  }

  async checkLiveBoot(iso: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`isoinfo -d -i "${iso}" 2>/dev/null`);
      // Check for live boot indicators
      return stdout.includes('live') || stdout.includes('LIVE');
    } catch {
      return false;
    }
  }

  async detectUSBDevices(): Promise<USBDevice[]> {
    try {
      const { stdout } = await execAsync('lsblk -d -o NAME,SIZE,MODEL,VENDOR -J');
      const data = JSON.parse(stdout);

      return data.blockdevices
        .filter((dev: any) => dev.name.startsWith('sd') && !dev.name.endsWith('1'))
        .map((dev: any) => ({
          device: `/dev/${dev.name}`,
          size: dev.size,
          model: dev.model || 'Unknown',
          vendor: dev.vendor || 'Unknown'
        }));
    } catch (error) {
      throw new Error(`Failed to detect USB devices: ${error.message}`);
    }
  }

  async flashToUSB(
    iso: string,
    device: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      // Unmount device
      await execAsync(`sudo umount ${device}* 2>/dev/null || true`);

      // Flash with dd
      const stats = await fs.stat(iso);
      const totalSize = stats.size;

      // Use pv if available for progress
      try {
        await execAsync('which pv');

        const ddProcess = exec(
          `sudo sh -c "pv -n '${iso}' | dd of=${device} bs=4M oflag=sync"`,
          { maxBuffer: 1024 * 1024 * 100 }
        );

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
            if (code === 0) resolve(null);
            else reject(new Error(`dd exited with code ${code}`));
          });
        });
      } catch {
        // Fallback to plain dd
        await execAsync(
          `sudo dd if="${iso}" of=${device} bs=4M status=progress oflag=sync`
        );
      }

      // Sync
      await execAsync('sudo sync');

    } catch (error) {
      throw new Error(`Flash failed: ${error.message}`);
    }
  }

  async verifyFlash(device: string): Promise<boolean> {
    try {
      // Simple verification: check if device is readable
      await execAsync(`sudo dd if=${device} of=/dev/null bs=4M count=100 status=none`);
      return true;
    } catch {
      return false;
    }
  }

  private async calculateSHA256(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = require('fs').createReadStream(file);

      stream.on('data', (data: Buffer) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private formatBytes(bytes: number): string {
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
