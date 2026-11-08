import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();

    return {
      success: true,
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get(':id')
  async fineOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);

    return {
      success: true,
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      success: true,
      statusCode: 201,
      message: 'User created successfully',
      data: user,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);

    return {
      success: true,
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);

    return {
      success: true,
      statusCode: 200,
      message: 'User deleted successfully',
      data: null,
    };
  }
}
