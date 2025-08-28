export interface ActivityItem {
  id: string;
  type: 'prescription' | 'report';
  title: string;
  subtitle: string;
  timestamp: number;
  relatedId: string;
  memberId?: string;
  memberName?: string;
}

const STORAGE_KEY = 'recentActivity';
const MAX_ITEMS = 10;

export class RecentActivityManager {
  private static getStoredActivity(): ActivityItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading recent activity:', error);
      return [];
    }
  }

  private static saveActivity(items: ActivityItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      // Trigger storage event for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(items)
      }));
    } catch (error) {
      console.error('Error saving recent activity:', error);
    }
  }

  static addPrescriptionView(
    prescriptionId: string,
    medicationName: string,
    doctor: string,
    memberId?: string,
    memberName?: string
  ): void {
    const items = this.getStoredActivity();
    
    // Remove existing entry for the same prescription
    const filteredItems = items.filter(item => 
      !(item.type === 'prescription' && item.relatedId === prescriptionId)
    );

    // Create new activity item
    const newItem: ActivityItem = {
      id: `prescription-${prescriptionId}-${Date.now()}`,
      type: 'prescription',
      title: medicationName,
      subtitle: `Dr. ${doctor}${memberName ? ` - ${memberName}` : ''}`,
      timestamp: Date.now(),
      relatedId: prescriptionId,
      memberId,
      memberName
    };

    // Add to beginning and limit to MAX_ITEMS
    const updatedItems = [newItem, ...filteredItems].slice(0, MAX_ITEMS);
    
    this.saveActivity(updatedItems);
  }

  static addReportView(
    reportId: string,
    reportType: string,
    reportTitle: string,
    memberId: string,
    memberName: string
  ): void {
    const items = this.getStoredActivity();
    
    // Remove existing entry for the same report
    const filteredItems = items.filter(item => 
      !(item.type === 'report' && item.relatedId === reportId)
    );

    // Create new activity item
    const newItem: ActivityItem = {
      id: `report-${reportId}-${Date.now()}`,
      type: 'report',
      title: reportTitle || reportType,
      subtitle: `${memberName} - ${reportType}`,
      timestamp: Date.now(),
      relatedId: reportId,
      memberId,
      memberName
    };

    // Add to beginning and limit to MAX_ITEMS
    const updatedItems = [newItem, ...filteredItems].slice(0, MAX_ITEMS);
    
    this.saveActivity(updatedItems);
  }

  static getRecentActivity(): ActivityItem[] {
    return this.getStoredActivity();
  }

  static clearActivity(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: null
    }));
  }

  static getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  static removeActivity(itemId: string): void {
    const items = this.getStoredActivity();
    const filteredItems = items.filter(item => item.id !== itemId);
    this.saveActivity(filteredItems);
  }
}