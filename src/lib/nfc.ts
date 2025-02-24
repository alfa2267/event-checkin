// src/lib/nfc.ts
export interface NFCTagData {
  serialNumber: string;
  data?: {
    guestId?: string;
    checkInTime?: string;
    type: 'mainGuest' | 'plusOne';
  }
}

export class NFCService {
  private ndef: any;
  private isScanning: boolean = false;
  private isSimulation: boolean = true;

  async checkSupport(): Promise<boolean> {
    if (this.isSimulation) return true;
    return 'NDEFReader' in window;
  }

  simulateTag(): NFCTagData {
    return {
      serialNumber: `SIM:${Math.random().toString(36).substr(2, 9)}`,
      data: {
        type: 'mainGuest' // We need to provide the required 'type' field
      }
    };
  }

  async startScanning(onReading: (tag: NFCTagData) => void, onError: (error: string) => void) {
    if (this.isSimulation) {
      this.isScanning = true;
      setTimeout(() => {
        if (this.isScanning) {
          onReading(this.simulateTag());
        }
      }, 2000);
      return;
    }

    if (!await this.checkSupport()) {
      onError("NFC is not supported on this device");
      return;
    }

    try {
      this.ndef = new (window as any).NDEFReader();
      this.isScanning = true;
      
      await this.ndef.scan();
      
      this.ndef.addEventListener("reading", ({ serialNumber, message }: any) => {
        let data;
        try {
          const record = message.records.find((r: any) => 
            r.recordType === "text" && r.data.includes("checkin:")
          );
          
          if (record) {
            data = JSON.parse(record.data.slice(8));
          }
        } catch (e) {
          console.error("Error parsing NFC data", e);
        }

        onReading({ 
          serialNumber, 
          data: data ? { ...data, type: data.type || 'mainGuest' } : { type: 'mainGuest' }
        });
      });

    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to start NFC scan");
      this.isScanning = false;
    }
  }

  async writeToTag(data: any): Promise<void> {
    if (this.isSimulation) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    if (!this.ndef) throw new Error("NFC not initialized");

    try {
      await this.ndef.write({
        records: [{
          recordType: "text",
          data: `checkin:${JSON.stringify(data)}`
        }]
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to write to NFC tag");
    }
  }

  stopScanning() {
    this.isScanning = false;
    if (!this.isSimulation && this.ndef) {
      this.ndef = null;
    }
  }

  setSimulationMode(enabled: boolean) {
    this.isSimulation = enabled;
    this.stopScanning();
  }

  isInSimulationMode(): boolean {
    return this.isSimulation;
  }
}

export const nfcService = new NFCService();