/**
 * ISO Management
 */
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
export declare class ISOManager {
    listISOs(directory: string): Promise<ISOInfo[]>;
    getInfo(iso: string): Promise<ISOInfo>;
    verifyISO(iso: string): Promise<boolean>;
    verifyChecksum(iso: string): Promise<boolean>;
    checkBootable(iso: string): Promise<boolean>;
    checkLiveBoot(iso: string): Promise<boolean>;
    detectUSBDevices(): Promise<USBDevice[]>;
    flashToUSB(iso: string, device: string, onProgress?: (progress: number) => void): Promise<void>;
    verifyFlash(device: string): Promise<boolean>;
    private calculateSHA256;
    private formatBytes;
}
export {};
//# sourceMappingURL=iso-manager.d.ts.map