class GenerateTrackingAndOrderId {
  private static PREFIX = 'KK'; // Prefix for Karnival Kookies

  // Generate a unique Order ID
  static generateOrderId(): string {
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, ''); // e.g., '20241201'
    const randomPart = this.generateAlphanumeric(6); // Random 6-character string
    return `${datePart}-${randomPart}`; // Format: YYYYMMDD-RANDOM
  }

  // Generate a simple tracking number
  static generateTrackingNumber(): string {
    const uniquePart = this.generateAlphanumeric(12); // 12-character unique identifier
    return `${this.PREFIX}-${uniquePart}`; // Format: KK-UNIQUE
  }

  // Validate the tracking number format
  static validateTrackingNumber(trackingNumber: string): boolean {
    const regex = /^KK-[A-Z0-9]{12}$/; // Format: KK-12 Alphanumeric
    return regex.test(trackingNumber);
  }

  // Helper: Generate a unique alphanumeric string
  private static generateAlphanumeric(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }
}

export { GenerateTrackingAndOrderId };
