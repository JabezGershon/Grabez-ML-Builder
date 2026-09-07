// src/services/vizService.js
// Service to call the Python Flask Visualization API

const VIZ_API_BASE = 'http://localhost:5000';

export class VizService {
  static async visualize(payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${VIZ_API_BASE}/api/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Visualization API error ${res.status}: ${text}`);
      }

      const json = await res.json();
      return json; // { success, charts: [{type,title,image}], type }
    } catch (err) {
      throw new Error(err.message || 'Visualization request failed');
    } finally {
      clearTimeout(timeout);
    }
  }
}


