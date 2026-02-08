/**
 * @jest-environment node
 */
import { GET } from '@/app/api/admin/stats/route';
import { adminService } from '../../../services/AdminService';

// Mock the Service Layer to isolate the API Logic
jest.mock('../../../services/AdminService');

describe('Integration Test: GET /api/admin/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and the stats object on success', async () => {
    const mockStats = {
      totalItemsPurchased: 5,
      totalRevenue: 500,
      totalDiscountsGiven: 50,
      totalDiscountCodes: 2,
    };

    // Tell Jest: "When getStats is called, return this fake data"
    (adminService.getStats as jest.Mock).mockReturnValue(mockStats);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockStats);

    // Verify that the service was actually called
    expect(adminService.getStats).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if the service throws an error', async () => {
    (adminService.getStats as jest.Mock).mockImplementation(() => {
      throw new Error('Database Connection Failed');
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Internal Server Error');
  });
});
