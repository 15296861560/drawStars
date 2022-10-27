function reqCache() {
  // 缓存类型
  const cacheFrom = {
    local: "fromLocalCache",
    session: "fromSessionCache",
    page: "fromPageCache",
  }
  class API {
    constructor() {
      this.pageCache = {};
      this.fetchDeferredObj = {};
      this.LOCAL_STORAGE_CACHE_KEY = "DRAW_STARS_CACHE";
      this.SESSION_STORAGE_CACHE_KEY = "DRAW_STARS_CACHE";
    }

    async beforeFetch(url, opt) {
      return await this.checkCache(url, opt);
    }

    async afterFetch(resp, url, opt) {
      await this.setCache(resp, url, opt);
    }

    async checkCache(url, opt) {

      let cache;
      if (opt.cacheFrom === cacheFrom.local) {
        cache = await this.getLocalCache(url, opt);
      } else if (opt.cacheFrom === cacheFrom.session) {
        cache = await this.getSessionCache(url, opt);
      } else if (opt.cacheFrom === cacheFrom.page) {
        cache = await this.getPageCache(url, opt);
      }

      if (cache && cache.resp && (!opt.cacheDuration || new Date().getTime() - cache.timestamp <= opt.cacheDuration)) {
        return cache.resp;
      } else {
        return null;
      }
    }

    async setCache(resp, url, opt) {

      switch (opt.cacheFrom) {
        case cacheFrom.local: {
          await this.setLocalCache(resp, url, opt);
        }
        case cacheFrom.session: {
          await this.setSessionCache(resp, url, opt);
        }
        case cacheFrom.page: {
          await this.setPageCache(resp, url, opt);
          break;
        }
        default:
          break;

      }
    }

    async getLocalCache(url, opt) {
      const localCache = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_CACHE_KEY) || '{}');
      return await this.getCacheFromObj(localCache, url, opt, true);
    }
    async setLocalCache(resp, url, opt) {
      const localCache = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_CACHE_KEY) || '{}');
      await this.setCacheObj(resp, localCache, url, opt, true);
      localStorage.setItem(this.LOCAL_STORAGE_CACHE_KEY, JSON.stringify(localCache));
    }
    async getSessionCache(url, opt) {
      const sessionCache = JSON.parse(sessionStorage.getItem(this.SESSION_STORAGE_CACHE_KEY) || '{}');
      return await this.getCacheFromObj(sessionCache, url, opt, true);
    }

    async setSessionCache(resp, url, opt) {
      const sessionCache = JSON.parse(sessionStorage.getItem(this.SESSION_STORAGE_CACHE_KEY) || '{}');
      await this.setCacheObj(resp, sessionCache, url, opt, true);
      sessionStorage.setItem(this.SESSION_STORAGE_CACHE_KEY, JSON.stringify(sessionCache));
    }
    async getPageCache(url, opt) {
      return await this.getCacheFromObj(this.pageCache, url, opt);
    }
    async setPageCache(resp, url, opt) {
      await this.setCacheObj(resp, this.pageCache, url, opt);
    }
    async getCacheFromObj(obj, url) {
      const cache = obj && obj[url];
      return cache;
    }

    async setCacheObj(resp, obj, url) {
      obj[url] = {
        resp: resp,
        timestamp: new Date().getTime()
      };
    }

    clearLocalCache() {
      localStorage.setItem(this.LOCAL_STORAGE_CACHE_KEY, '{}');
    }
    clearSessionCache() {
      sessionStorage.setItem(this.SESSION_STORAGE_CACHE_KEY, '{}');
    }
    clearPageCache() {
      this.pageCache = {};
    }
    clearAllCache() {
      this.clearLocalCache();
      this.clearSessionCache();
      this.clearPageCache();
    }
  }

  return new API();
};

export default reqCache
