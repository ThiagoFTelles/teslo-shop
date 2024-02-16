import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';

import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ) {}

  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProducts( adminUser )
    return 'Seed executed'
  }

  private async deleteTables() {
    await this.productsService.deleteAllproducts()
    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
    .delete()
    .where({})
    .execute()
  }

  private async insertUsers() {
    const seedUsers = initialData.users
    const users: User[] = []

    seedUsers.forEach(user => {
      users.push( this.userRepository.create( user ) )      
    });

    const dbUsers = await this.userRepository.save( seedUsers )

    return dbUsers[0]
  }

  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllproducts()

    const products = initialData.products
    const insertPromisses = []

    products.forEach( product => {
      insertPromisses.push( this.productsService.create( product, user ) )
    } )

    await Promise.all( insertPromisses )

    return true
  }
}
