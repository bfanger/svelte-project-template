/**
 * Typed wrapper for localStorage with automatic JSON serialization/deserialization
 */
const namespace = "app:";
const storage = {
  get<T>(key: string, defaultValue: T) {
    try {
      const value = localStorage.getItem(namespace + key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (e) {
      console.warn("Reading from localStorage failed", e);
      return defaultValue;
    }
  },
  set(key: string, value: any) {
    try {
      localStorage.setItem(namespace + key, JSON.stringify(value));
    } catch (e) {
      console.warn("Saving to localStorage failed", e);
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(namespace + key);
    } catch (e) {
      console.warn("Removing from localStorage failed", e);
    }
  },
  isAvailable() {
    const key = "has-localStorage";
    this.set(key, true);
    const returnValue = this.get(key, null);
    this.remove(key);

    return !!returnValue;
  },
};

export default storage;
