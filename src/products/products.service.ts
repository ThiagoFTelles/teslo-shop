import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save( product )
      return product
    } catch (error) {
      this.handleDBException( error )
    }
  }

  findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: relashionships
    })
  }

  async findOne(term: string) {
    const product = await this.productRepository.findOneBy({id: term})
    if(!product) 
      throw new NotFoundException(`Product with ID or slug "${term}" not found`)

    return product
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.productRepository.findOneBy({id})
    await this.productRepository.remove(product)
    return 'removed.'
  }

  private handleDBException( error: any ) {
    if( error.code === '23505' ) 
        throw new BadRequestException(error.detail)
      
      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error! Please check server logs.')
  }
}
