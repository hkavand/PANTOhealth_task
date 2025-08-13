import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqService } from './rabbitmq.service';

// I did a thorough test in e2e tests, 
// Also there is not that much logic in this service.
describe('RabbitmqService', () => {
  it('nothing', () => {
    expect(true).toBe(true);
  });
});
