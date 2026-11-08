import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';

import { CreateCategoryDto } from './dto/create-category.dto';

import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findOne({
      where: [
        {
          name: createCategoryDto.name,
        },
        {
          slug: createCategoryDto.slug,
        },
      ],
    });

    if (existingCategory) {
      throw new ConflictException('Category name or slug already exists');
    }

    const category = this.categoriesRepository.create(createCategoryDto);

    return this.categoriesRepository.save(category);
  }

  async findAll() {
    return this.categoriesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoriesRepository.findOne({
        where: {
          name: updateCategoryDto.name,
        },
      });

      if (existing) {
        throw new ConflictException('Category name already exists');
      }
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoriesRepository.findOne({
        where: {
          slug: updateCategoryDto.slug,
        },
      });

      if (existing) {
        throw new ConflictException('Category slug already exists');
      }
    }

    Object.assign(category, updateCategoryDto);

    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);

    return {
      id,
      deleted: true,
    };
  }
}
