import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from "uuid";

import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
    ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image }) ),
        user,
      })
      await this.productRepository.save( product )
      return { ...product, images }
    } catch (error) {
      this.handleDBException( error )
    }
  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    })
    return products.map( ({ images, ...rest }) => ({
      ...rest, 
      images: images.map( image => image.url )
    }))
  }

  async findOne(term: string) {
    let product: Product
    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({id: term})
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod') // 'prod' = product table alias
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if(!product) 
      throw new NotFoundException(`Product with ID, name or slug "${term}" not found`)

    return product
  }

  async findOnePlain( term: string ) {
    const { images, ...rest } = await this.findOne( term )
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...rest } = updateProductDto
    const product = await this.productRepository.preload({ id, ...rest })
    if ( !product ) throw new NotFoundException(`Product with id ${ id } not found.`)
    
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } } )
        product.images = images.map(
          image => this.productImageRepository.create({url: image})
        )
      }
      product.user = user
      await queryRunner.manager.save( product )
      await queryRunner.commitTransaction()
      await queryRunner.release()
      return this.findOnePlain( id )  
    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleDBException(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
    return 'removed.'
  }

  private handleDBException( error: any ) {
    if( error.code === '23505' ) 
        throw new BadRequestException(error.detail)
      
      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error! Please check server logs.')
  }

  async deleteAllproducts() {
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error) {
      this.handleDBException(error)
    }
  }
}
