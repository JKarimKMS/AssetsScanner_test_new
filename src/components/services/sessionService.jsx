import { Session, Site } from "@/api/entities";
import { SESSION_STATUS, POSITION_TYPES, ADDITIONAL_SCREENS_BY_ZONE } from "../utils/constants";

/**
 * Service for handling session-related operations
 */
export class SessionService {
  
  /**
   * Create a new session with proper layout generation
   */
  static async createSession(siteId, configuration) {
    try {
      // Get site details
      const siteData = await Site.filter({ id: siteId });
      const site = siteData[0];
      
      if (!site) {
        throw new Error("Site not found");
      }

      // Generate complete position layout
      const layout = this.generateSessionLayout(configuration);
      
      const sessionData = {
        site_id: siteId,
        site_name: site.name,
        site_code: site.code,
        config_id: configuration.id,
        config_name: configuration.name,
        config_type: configuration.type,
        brand: site.brand,
        start_time: new Date().toISOString(),
        status: SESSION_STATUS.ACTIVE,
        scan_results: [],
        layout: layout,
        configuration: {
          type: configuration.type,
          brand: site.brand,
          gantry_positions: this.extractGantryPositions(configuration),
          additional_positions: this.extractAdditionalPositions(configuration)
        }
      };

      return await Session.create(sessionData);
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Generate complete layout from configuration
   */
  static generateSessionLayout(configuration) {
    const layout = [];
    
    // Add gantry positions
    if (configuration.gantry_layout) {
      const { topRow = [], bottomRow = [] } = configuration.gantry_layout;
      
      [...topRow, ...bottomRow].forEach(position => {
        layout.push({
          id: position.id,
          label: position.label,
          type: position.type,
          row: position.row,
          column: position.column,
          zone: "gantry",
          is_quad: position.type === POSITION_TYPES.QUAD
        });
      });
    }

    // Add additional screen positions
    if (configuration.additional_screens) {
      Object.entries(configuration.additional_screens).forEach(([zone, screens]) => {
        screens.forEach((screenName, index) => {
          layout.push({
            id: `${zone}-${index}`,
            label: screenName,
            type: POSITION_TYPES.ADDITIONAL,
            row: null,
            column: null,
            zone: zone,
            is_quad: false
          });
        });
      });
    }

    return layout;
  }

  /**
   * Extract gantry positions with metadata
   */
  static extractGantryPositions(configuration) {
    const positions = [];
    
    if (configuration.gantry_layout) {
      const { topRow = [], bottomRow = [] } = configuration.gantry_layout;
      
      [...topRow, ...bottomRow].forEach(position => {
        positions.push({
          id: position.id,
          label: position.label,
          type: position.type,
          row: position.row,
          column: position.column,
          is_quad: position.type === POSITION_TYPES.QUAD
        });
      });
    }

    return positions;
  }

  /**
   * Extract additional positions with metadata
   */
  static extractAdditionalPositions(configuration) {
    const positions = [];
    
    if (configuration.additional_screens) {
      Object.entries(configuration.additional_screens).forEach(([zone, screens]) => {
        screens.forEach((screenName, index) => {
          positions.push({
            id: `${zone}-${index}`,
            label: screenName,
            type: POSITION_TYPES.ADDITIONAL,
            location: zone
          });
        });
      });
    }

    return positions;
  }

  /**
   * Update session with scan result
   */
  static async updateSessionWithScan(sessionId, scanResult) {
    try {
      const sessionData = await Session.filter({ id: sessionId });
      const session = sessionData[0];
      
      if (!session) {
        throw new Error("Session not found");
      }

      const existingResults = session.scan_results || [];
      const existingIndex = existingResults.findIndex(r => r.position_id === scanResult.position_id);

      if (existingIndex >= 0) {
        existingResults[existingIndex] = scanResult;
      } else {
        existingResults.push(scanResult);
      }

      // Update session with new scan results
      await Session.update(sessionId, { 
        scan_results: existingResults,
        last_updated: new Date().toISOString()
      });

      return existingResults;
    } catch (error) {
      console.error("Error updating session with scan:", error);
      throw error;
    }
  }

  /**
   * Complete a session
   */
  static async completeSession(sessionId) {
    try {
      await Session.update(sessionId, {
        status: SESSION_STATUS.COMPLETED,
        end_time: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error completing session:", error);
      throw error;
    }
  }

  /**
   * Mark session as exported
   */
  static async markAsExported(sessionId) {
    try {
      await Session.update(sessionId, {
        status: SESSION_STATUS.EXPORTED,
        exported_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error marking session as exported:", error);
      throw error;
    }
  }

  /**
   * Get session progress statistics
   */
  static getSessionProgress(session) {
    if (!session || !session.layout) {
      return {
        totalPositions: 0,
        scannedPositions: 0,
        gantryTotal: 0,
        gantryScanned: 0,
        additionalTotal: 0,
        additionalScanned: 0,
        progressPercentage: 0
      };
    }

    const layout = session.layout;
    const scanResults = session.scan_results || [];
    
    const gantryPositions = layout.filter(p => p.zone === "gantry");
    const additionalPositions = layout.filter(p => p.zone !== "gantry");
    
    const scannedPositionIds = new Set(scanResults.map(r => r.position_id));
    
    const gantryScanned = gantryPositions.filter(p => scannedPositionIds.has(p.id)).length;
    const additionalScanned = additionalPositions.filter(p => scannedPositionIds.has(p.id)).length;
    
    const totalScanned = gantryScanned + additionalScanned;
    const totalPositions = layout.length;
    
    return {
      totalPositions,
      scannedPositions: totalScanned,
      gantryTotal: gantryPositions.length,
      gantryScanned,
      additionalTotal: additionalPositions.length,
      additionalScanned,
      progressPercentage: totalPositions > 0 ? Math.round((totalScanned / totalPositions) * 100) : 0
    };
  }

  /**
   * Get positions by zone for display
   */
  static getPositionsByZone(session) {
    if (!session || !session.layout) {
      return {};
    }

    const positionsByZone = {};
    
    session.layout.forEach(position => {
      const zone = position.zone || "unknown";
      if (!positionsByZone[zone]) {
        positionsByZone[zone] = [];
      }
      positionsByZone[zone].push(position);
    });

    return positionsByZone;
  }

  /**
   * Check if position is scanned
   */
  static isPositionScanned(session, positionId) {
    if (!session || !session.scan_results) {
      return false;
    }
    
    return session.scan_results.some(result => result.position_id === positionId);
  }

  /**
   * Get scan result for position
   */
  static getScanResultForPosition(session, positionId) {
    if (!session || !session.scan_results) {
      return null;
    }
    
    return session.scan_results.find(result => result.position_id === positionId) || null;
  }

  /**
   * Save session to local storage (offline mode)
   */
  static saveSessionLocally(session) {
    try {
      localStorage.setItem(`session_${session.id}`, JSON.stringify(session));
      
      // Track pending changes
      const pendingChanges = parseInt(localStorage.getItem('pendingChanges') || '0') + 1;
      localStorage.setItem('pendingChanges', pendingChanges.toString());
    } catch (error) {
      console.error("Error saving session locally:", error);
    }
  }

  /**
   * Load session from local storage
   */
  static loadSessionLocally(sessionId) {
    try {
      const sessionData = localStorage.getItem(`session_${sessionId}`);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error("Error loading session locally:", error);
      return null;
    }
  }
}