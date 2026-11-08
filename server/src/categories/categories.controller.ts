import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';

import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);

    return {
      success: true,
      statusCode: 201,
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();

    return {
      success: true,
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);

    return {
      success: true,
      statusCode: 200,
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);

    return {
      success: true,
      statusCode: 200,
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.categoriesService.remove(id);

    return {
      success: true,
      statusCode: 200,
      message: 'Category deleted successfully',
      data: result,
    };
  }
}
