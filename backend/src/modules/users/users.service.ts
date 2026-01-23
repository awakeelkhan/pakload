import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDataService } from '../mock-data/mock-data.service';

@Injectable()
export class UsersService {
  constructor(private mockDataService: MockDataService) {}

  findOne(id: string) {
    const user = this.mockDataService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  update(id: string, updateUserDto: any) {
    const updated = this.mockDataService.updateUser(id, updateUserDto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
}
