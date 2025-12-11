import { CoolifyClient } from '../lib/coolify-client.js';

describe('CoolifyClient', () => {
  describe('constructor', () => {
    it('should throw error when baseUrl is missing', () => {
      expect(
        () =>
          new CoolifyClient({
            baseUrl: '',
            accessToken: 'test-token',
          }),
      ).toThrow('Coolify base URL is required');
    });

    it('should throw error when accessToken is missing', () => {
      expect(
        () =>
          new CoolifyClient({
            baseUrl: 'https://coolify.example.com',
            accessToken: '',
          }),
      ).toThrow('Coolify access token is required');
    });

    it('should create client with valid config', () => {
      const client = new CoolifyClient({
        baseUrl: 'https://coolify.example.com',
        accessToken: 'test-token',
      });
      expect(client).toBeInstanceOf(CoolifyClient);
    });

    it('should remove trailing slash from baseUrl', () => {
      const client = new CoolifyClient({
        baseUrl: 'https://coolify.example.com/',
        accessToken: 'test-token',
      });
      expect(client).toBeInstanceOf(CoolifyClient);
    });
  });
});
